import { useProject } from '@/contexts/ProjectContext';
import { featureDefinitions, featurePresets } from '@/data/feature-definitions';
import type { FeatureKey, FeaturePreset } from '@/types/project';
import { cn } from '@/lib/utils';
import { Shield, Zap, Crown, ToggleLeft, ToggleRight } from 'lucide-react';

const presetConfig: Array<{
  key: FeaturePreset;
  label: string;
  labelKo: string;
  description: string;
  icon: React.ElementType;
  color: string;
  activeColor: string;
  count: number;
}> = [
  {
    key: 'basic',
    label: 'Basic',
    labelKo: '기본',
    description: '필수 기능만 - 처음 사용자 및 POC용',
    icon: Shield,
    color: 'border-blue-500/30 hover:border-blue-500/60',
    activeColor: 'border-blue-500 bg-blue-500/10',
    count: Object.values(featurePresets.basic).filter(Boolean).length,
  },
  {
    key: 'standard',
    label: 'Standard',
    labelKo: '표준 (권장)',
    description: '기본 + 디버깅 도구 - 일반 마이그레이션',
    icon: Zap,
    color: 'border-green-500/30 hover:border-green-500/60',
    activeColor: 'border-green-500 bg-green-500/10',
    count: Object.values(featurePresets.standard).filter(Boolean).length,
  },
  {
    key: 'advanced',
    label: 'Advanced',
    labelKo: '고급',
    description: '모든 기능 - 전문가용',
    icon: Crown,
    color: 'border-purple-500/30 hover:border-purple-500/60',
    activeColor: 'border-purple-500 bg-purple-500/10',
    count: Object.values(featurePresets.advanced).filter(Boolean).length,
  },
];

const categoryLabels: Record<string, string> = {
  'db-migration': '데이터베이스 마이그레이션',
  'app-migration': '애플리케이션 마이그레이션',
  'data-migration': '데이터 마이그레이션',
  tools: '도구',
  settings: '설정 (내부 섹션)',
};

export default function FeatureManagementPage() {
  const { activeProject, setFeaturePreset, updateFeatureFlags } = useProject();

  if (!activeProject) {
    return (
      <div className="text-center text-muted-foreground py-20">
        프로젝트를 선택해주세요.
      </div>
    );
  }

  const { featurePreset, featureFlags } = activeProject;

  // Check if current flags match any preset exactly
  const isCustom = !(['basic', 'standard', 'advanced'] as FeaturePreset[]).some(
    (p) =>
      JSON.stringify(featurePresets[p]) === JSON.stringify(featureFlags)
  );

  const handleToggle = (key: FeatureKey) => {
    updateFeatureFlags({ [key]: !featureFlags[key] });
  };

  const categories = Object.entries(categoryLabels);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-semibold">기능 관리</h2>
        <p className="text-sm text-muted-foreground mt-1">
          프로젝트에서 사용할 기능을 선택합니다. 프리셋을 선택하거나 개별적으로 토글할 수 있습니다.
        </p>
      </div>

      {/* Preset Cards */}
      <div>
        <h3 className="text-sm font-medium mb-3">프리셋 선택</h3>
        <div className="grid grid-cols-3 gap-3">
          {presetConfig.map((preset) => {
            const Icon = preset.icon;
            const isActive = featurePreset === preset.key && !isCustom;
            return (
              <button
                key={preset.key}
                onClick={() => setFeaturePreset(preset.key)}
                className={cn(
                  'flex flex-col items-start rounded-lg border-2 p-4 text-left transition-all',
                  isActive ? preset.activeColor : preset.color
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-5 w-5" />
                  <span className="font-semibold">{preset.label}</span>
                  <span className="text-xs text-muted-foreground">
                    ({preset.count}개)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{preset.labelKo}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
        {isCustom && (
          <p className="mt-2 text-xs text-amber-500">
            사용자 정의 설정이 적용되어 있습니다.
          </p>
        )}
      </div>

      {/* Individual Toggles by Category */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">개별 기능 토글</h3>
        {categories.map(([catKey, catLabel]) => {
          const features = featureDefinitions.filter(
            (f) => f.category === catKey
          );
          if (features.length === 0) return null;

          return (
            <div
              key={catKey}
              className="rounded-lg border border-border overflow-hidden"
            >
              <div className="bg-muted/50 px-4 py-2.5 text-sm font-medium">
                {catLabel}
              </div>
              <div className="divide-y divide-border">
                {features.map((feat) => {
                  const enabled = featureFlags[feat.key] ?? true;
                  return (
                    <div
                      key={feat.key}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {feat.labelKo}
                          </span>
                          <span className="text-xs text-muted-foreground/50">
                            {feat.labelEn}
                          </span>
                          {feat.isCore && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              필수
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {feat.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggle(feat.key)}
                        className={cn(
                          'shrink-0 ml-4 transition-colors',
                          enabled
                            ? 'text-primary'
                            : 'text-muted-foreground/40'
                        )}
                      >
                        {enabled ? (
                          <ToggleRight className="h-6 w-6" />
                        ) : (
                          <ToggleLeft className="h-6 w-6" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
