import { Link } from 'react-router-dom';
import { Lock, Settings } from 'lucide-react';
import type { FeatureKey } from '@/types/project';
import { getFeatureDefinition } from '@/data/feature-definitions';
import { useProject } from '@/contexts/ProjectContext';

interface FeatureDisabledPageProps {
  featureKey: FeatureKey;
}

export default function FeatureDisabledPage({ featureKey }: FeatureDisabledPageProps) {
  const def = getFeatureDefinition(featureKey);
  const { activeProject, updateFeatureFlags } = useProject();

  const handleEnable = () => {
    updateFeatureFlags({ [featureKey]: true });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Lock className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">
        {def?.labelKo ?? '기능'} 비활성화됨
      </h2>
      <p className="text-muted-foreground max-w-md mb-1">
        이 기능은 현재 프로젝트에서 비활성화되어 있습니다.
      </p>
      {def && (
        <p className="text-sm text-muted-foreground/70 max-w-md mb-6">
          {def.description}
        </p>
      )}
      <div className="flex gap-3">
        <button
          onClick={handleEnable}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          이 기능 활성화
        </button>
        <Link
          to="/settings/features"
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          <Settings className="h-4 w-4" />
          기능 관리
        </Link>
      </div>
      {activeProject && (
        <p className="mt-4 text-xs text-muted-foreground/50">
          현재 프리셋: {activeProject.featurePreset.toUpperCase()} — {activeProject.name}
        </p>
      )}
    </div>
  );
}
