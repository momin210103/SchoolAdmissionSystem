import type { AvailableClassesSectionProps } from "../../types/admission";
import { ClassList } from "./ClassList";

export const AvailableClassesSection = ({
  classes,
  isLoading = false,
  error = null,
  onSelectClass,
}: AvailableClassesSectionProps) => {
  return (
    <section
      id="available-classes"
      className="py-12 sm:py-16 scroll-mt-20 border-b border-slate-200/70"
    >
      <div className="portal-container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
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

        {/* Loading-Independent Presentation Component */}
        <ClassList
          classes={classes}
          isLoading={isLoading}
          error={error}
          onApply={onSelectClass}
          emptyTitle="Class Rosters Updating"
          emptyDescription="Admission class quotas and grade sessions for the upcoming intake are currently being configured by the academic board. Published classes will automatically appear here once admissions open."
        />
      </div>
    </section>
  );
};
