import { Check, ChevronRight } from "lucide-react";
import { getModeTheme } from "../utils/modeTheme";
import {
  DEFAULT_STEPS,
  getDefaultActiveStep,
} from "../constants/listingWorkflow";

export default function WorkflowBar({
  mode,
  hasImage,
  hasResult,
  loading,
  queueCount,
  batchProgress,
  steps = DEFAULT_STEPS,
  getActiveStep = getDefaultActiveStep,
  extraBadge = null,
}) {
  const theme = getModeTheme(mode);
  const active = getActiveStep({ hasImage, hasResult, loading });
  const activeIndex = steps.findIndex((s) => s.id === active);

  return (
    <div
      className={`shrink-0 border-b bg-gradient-to-r from-panel via-panel px-4 py-3 to-transparent lg:px-6 ${theme.barBorder} ${theme.workflowGradientEnd}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          {steps.map((step, index) => {
            const done = index < activeIndex;
            const current = step.id === active;

            return (
              <div key={step.id} className="flex items-center gap-1 sm:gap-2">
                {index > 0 && (
                  <ChevronRight className="hidden h-3.5 w-3.5 text-fg-subtle sm:block" />
                )}
                <div
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition sm:px-3 sm:py-1.5 sm:text-sm ${
                    current
                      ? `${theme.bg} text-white ${theme.shadowLg}`
                      : done
                        ? `${theme.bgSubtle} ${theme.text} ring-1 ${theme.border}`
                        : "bg-elevated/80 text-fg-muted"
                  }`}
                >
                  {done ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        current ? "bg-white/20" : "bg-elevated"
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.label.slice(0, 4)}.</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {extraBadge}
          {batchProgress ? (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${theme.bgSubtle} ${theme.text} ${theme.border}`}
            >
              Lot {batchProgress.current}/{batchProgress.total}
            </span>
          ) : (
            queueCount > 0 && (
              <span className="animate-pulse rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 ring-1 ring-amber-500/40">
                {queueCount} photo{queueCount > 1 ? "s" : ""} en file
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
