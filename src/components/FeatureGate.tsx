import type { ReactNode } from 'react';
import type { FeatureKey } from '@/types/project';
import { useProject } from '@/contexts/ProjectContext';
import FeatureDisabledPage from '@/pages/FeatureDisabledPage';

interface FeatureGateProps {
  featureKey: FeatureKey;
  children: ReactNode;
}

export default function FeatureGate({ featureKey, children }: FeatureGateProps) {
  const { isFeatureEnabled } = useProject();

  if (!isFeatureEnabled(featureKey)) {
    return <FeatureDisabledPage featureKey={featureKey} />;
  }

  return <>{children}</>;
}
