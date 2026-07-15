import { CircleCheck as CheckCircle2, Circle, ChevronRight } from 'lucide-react';

interface Step {
  label: string;
  status: 'completed' | 'active' | 'pending';
}

interface Props {
  steps: Step[];
  compact?: boolean;
}

export function StepBar({ steps, compact = false }: Props) {
  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const progressPct = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <div className="w-full">
      {/* Scrollable step row */}
      <div className="overflow-x-auto pb-1">
        <div className="flex items-center min-w-max gap-0">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-0">
              {/* Step node */}
              <div
                className={`flex flex-col items-center gap-1 ${compact ? 'px-2' : 'px-3'}`}
              >
                {/* Icon */}
                {step.status === 'completed' ? (
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900/40">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                ) : step.status === 'active' ? (
                  <div className="relative flex items-center justify-center w-7 h-7">
                    {/* Pulsing ring */}
                    <span className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping" />
                    <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/40">
                      <Circle className="w-3 h-3 fill-white" strokeWidth={0} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-500 border border-slate-200 dark:bg-[#0f1629] dark:text-slate-400 dark:border-white/8">
                    <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-semibold leading-none`}>
                      {index + 1}
                    </span>
                  </div>
                )}

                {/* Label */}
                <span
                  className={`
                    whitespace-nowrap font-medium leading-tight text-center
                    ${compact ? 'text-[9px]' : 'text-[10px]'}
                    ${
                      step.status === 'completed'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : step.status === 'active'
                        ? 'text-emerald-600 dark:text-blue-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector chevron (not after last step) */}
              {index < steps.length - 1 && (
                <ChevronRight
                  className={`w-4 h-4 flex-shrink-0 ${
                    steps[index + 1].status === 'pending' && step.status !== 'completed'
                      ? 'text-slate-300 dark:text-slate-600'
                      : step.status === 'completed'
                      ? 'text-emerald-400 dark:text-emerald-600'
                      : 'text-blue-300 dark:text-emerald-700'
                  }`}
                  strokeWidth={2}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar + percentage */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-[#0f1629] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums w-9 text-right">
          {progressPct}%
        </span>
      </div>
    </div>
  );
}
