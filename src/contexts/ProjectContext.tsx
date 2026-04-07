import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Project, FeatureKey, FeaturePreset, FeatureFlags, MigrationScope } from '@/types/project';
import { featurePresets } from '@/data/feature-definitions';
import { seedProjects, generateProjectId } from '@/data/projects';
import { projectSettings, agentSettings, testSettings } from '@/data/settings';

const STORAGE_KEY_PROJECTS = 'oma-projects';
const STORAGE_KEY_ACTIVE = 'oma-active-project';

interface ProjectContextValue {
  projects: Project[];
  activeProject: Project | null;
  activeProjectId: string | null;
  switchProject: (id: string) => void;
  createProject: (name: string, preset: FeaturePreset, scope?: MigrationScope) => Project;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Project | null;
  renameProject: (id: string, name: string) => void;
  updateFeatureFlags: (flags: Partial<FeatureFlags>) => void;
  setFeaturePreset: (preset: FeaturePreset) => void;
  updateProjectSettings: (path: 'project' | 'agent' | 'test', value: unknown) => void;
  updateMigrationScope: (scope: MigrationScope) => void;
  isFeatureEnabled: (key: FeatureKey) => boolean;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

function loadProjects(): Project[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (stored) return JSON.parse(stored);
  } catch { /* use seed data */ }
  return seedProjects;
}

function loadActiveId(projects: Project[]): string | null {
  const stored = localStorage.getItem(STORAGE_KEY_ACTIVE);
  if (stored && projects.some((p) => p.id === stored)) return stored;
  return projects[0]?.id ?? null;
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() =>
    loadActiveId(loadProjects())
  );

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem(STORAGE_KEY_ACTIVE, activeProjectId);
    }
  }, [activeProjectId]);

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;

  const switchProject = useCallback((id: string) => {
    setActiveProjectId(id);
  }, []);

  const createProject = useCallback(
    (name: string, preset: FeaturePreset, scope?: MigrationScope): Project => {
      const newProject: Project = {
        id: generateProjectId(),
        name,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        featurePreset: preset,
        featureFlags: { ...featurePresets[preset] },
        migrationScope: scope ?? {
          mode: 'all',
          selectedSchemas: [],
          selectedTables: [],
          description: '전체 테이블',
        },
        settings: {
          project: {
            ...projectSettings,
            projectName: name,
            sourceDb: { host: '', port: 1521, sid: '', user: '', password: '' },
            targetDb: { host: '', port: 5432, database: '', user: '', password: '' },
            dmsConfig: { projectArn: '', s3Bucket: '' },
          },
          agent: { ...agentSettings },
          test: { ...testSettings, bindVariables: [] },
        },
        migrationProgress: {
          dbMigration: { completed: 0, total: 0, percentage: 0 },
          appMigration: { completed: 0, total: 0, percentage: 0 },
          dataMigration: { completed: 0, total: 0, percentage: 0 },
        },
      };
      setProjects((prev) => [...prev, newProject]);
      setActiveProjectId(newProject.id);
      return newProject;
    },
    []
  );

  const deleteProject = useCallback(
    (id: string) => {
      setProjects((prev) => {
        const next = prev.filter((p) => p.id !== id);
        if (activeProjectId === id) {
          setActiveProjectId(next[0]?.id ?? null);
        }
        return next;
      });
    },
    [activeProjectId]
  );

  const duplicateProject = useCallback(
    (id: string): Project | null => {
      const source = projects.find((p) => p.id === id);
      if (!source) return null;
      const dup: Project = {
        ...structuredClone(source),
        id: generateProjectId(),
        name: `${source.name} (복사본)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProjects((prev) => [...prev, dup]);
      setActiveProjectId(dup.id);
      return dup;
    },
    [projects]
  );

  const renameProject = useCallback((id: string, name: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p
      )
    );
  }, []);

  const updateFeatureFlags = useCallback(
    (flags: Partial<FeatureFlags>) => {
      if (!activeProjectId) return;
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProjectId
            ? {
                ...p,
                featureFlags: { ...p.featureFlags, ...flags },
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
    },
    [activeProjectId]
  );

  const setFeaturePreset = useCallback(
    (preset: FeaturePreset) => {
      if (!activeProjectId) return;
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProjectId
            ? {
                ...p,
                featurePreset: preset,
                featureFlags: { ...featurePresets[preset] },
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
    },
    [activeProjectId]
  );

  const updateProjectSettings = useCallback(
    (path: 'project' | 'agent' | 'test', value: unknown) => {
      if (!activeProjectId) return;
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProjectId
            ? {
                ...p,
                settings: { ...p.settings, [path]: value },
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
    },
    [activeProjectId]
  );

  const updateMigrationScope = useCallback(
    (scope: MigrationScope) => {
      if (!activeProjectId) return;
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProjectId
            ? { ...p, migrationScope: scope, updatedAt: new Date().toISOString() }
            : p
        )
      );
    },
    [activeProjectId]
  );

  const isFeatureEnabled = useCallback(
    (key: FeatureKey): boolean => {
      if (!activeProject) return true;
      return activeProject.featureFlags[key] ?? true;
    },
    [activeProject]
  );

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        activeProjectId,
        switchProject,
        createProject,
        deleteProject,
        duplicateProject,
        renameProject,
        updateFeatureFlags,
        setFeaturePreset,
        updateProjectSettings,
        updateMigrationScope,
        isFeatureEnabled,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}
