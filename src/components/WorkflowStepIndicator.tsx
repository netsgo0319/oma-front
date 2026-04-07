import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { workflowSteps, getPhaseLabel } from '@/data/workflow';

/** Strip /project/:id prefix to get the sub-path for matching */
function subPath(pathname: string): string {
  const m = pathname.match(/^\/project\/[^/]+(\/.*)?$/);
  return m ? (m[1] ?? '/') : pathname;
}

export default function WorkflowStepIndicator() {
  const location = useLocation();
  const navigate = useNavigate();

  const sub = subPath(location.pathname);
  const currentStep = workflowSteps.find((s) => s.route === sub);
  if (!currentStep) return null;

  return (
    <div className="mb-4 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {getPhaseLabel(currentStep.phase)}
          </span>
          <span className="text-xs text-muted-foreground/50">/</span>
          <span className="text-sm font-semibold">
            Step {currentStep.id}/{workflowSteps.length}: {currentStep.name}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {Math.round((currentStep.id / workflowSteps.length) * 100)}%
        </span>
      </div>

      {/* Step dots — navigate to relative paths (strips leading /) */}
      <div className="flex items-center gap-1">
        {workflowSteps.map((step) => (
          <button
            key={step.id}
            onClick={() => navigate(`..${step.route}`, { relative: 'path' })}
            title={`Step ${step.id}: ${step.name}`}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all cursor-pointer',
              step.id < currentStep.id
                ? 'bg-success'
                : step.id === currentStep.id
                  ? 'bg-primary'
                  : 'bg-muted-foreground/20 hover:bg-muted-foreground/40'
            )}
          />
        ))}
      </div>
    </div>
  );
}
