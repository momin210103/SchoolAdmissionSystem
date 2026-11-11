import type { AvailableClassesSectionProps } from "../../types/admission";
import { ClassList } from "./ClassList";
import { AlertCircle, X } from "lucide-react";

export const AvailableClassesSection = ({
  classes,
  isLoading = false,
  error = null,
  onSelectClass,
  onRefresh,
  submittingClassId = null,
  submissionError = null,
  onClearSubmissionError,
}: AvailableClassesSectionProps) => {
  return (
    <section
      id="available-classes"
      className="py-12 sm:py-16 scroll-mt-20 border-b border-slate-200/70"
    >
      <div className="portal-container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="caption text-secondary-600 mb-2 block font-semibold">
              Live Enrollment
            </span>
            <h2 className="heading-1">Available Admission Classes</h2>
            <p className="body-default text-slate-600 mt-2 max-w-2xl">
              Select an academic grade to check real-time seat availability and
              initiate a temporary seat reservation.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Seat availability refreshed in real time</span>
          </div>
        </div>

        {/* Clear Submission Error Notification Banner */}
        {submissionError && (
          <div
            className="mb-8 p-4 sm:p-5 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start justify-between gap-3 shadow-xs animate-in fade-in duration-200"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-900">
                  {submissionError.title}
                </h4>
                <p className="text-sm text-red-700 mt-0.5 leading-relaxed">
                  {submissionError.message}
                </p>
                {submissionError.action && (
                  <button
                    type="button"
                    onClick={submissionError.action.onClick}
                    className="btn btn-outline btn-sm mt-3 bg-white text-red-800 border-red-300 hover:bg-red-50"
                  >
                    {submissionError.action.label}
                  </button>
                )}
              </div>
            </div>

            {onClearSubmissionError && (
              <button
                type="button"
                onClick={onClearSubmissionError}
                className="p-1 text-red-400 hover:text-red-700 rounded-lg transition-colors"
                aria-label="Dismiss error notice"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Loading-Independent Presentation Component */}
        <ClassList
          classes={classes}
          isLoading={isLoading}
          error={error}
          onApply={onSelectClass}
          onRefresh={onRefresh}
          submittingClassId={submittingClassId}
          emptyTitle="Class Rosters Updating"
          emptyDescription="Admission class quotas and grade sessions for the upcoming intake are currently being configured by the academic board. Published classes will automatically appear here once admissions open."
        />
      </div>
    </section>
  );
};
