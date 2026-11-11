import type { AdmissionClassUnit } from "../../types/admission";
import { ClassCard } from "./ClassCard";
import { ClassListSkeleton } from "./ClassListSkeleton";
import { EmptyClassState } from "./EmptyClassState";
import { AlertTriangle, RotateCw } from "lucide-react";

export interface ClassListProps {
  classes?: AdmissionClassUnit[];
  isLoading?: boolean;
  error?: string | null;
  onApply?: (classId: string) => void;
  onRefresh?: () => void;
  submittingClassId?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export const ClassList = ({
  classes,
  isLoading = false,
  error = null,
  onApply,
  onRefresh,
  submittingClassId = null,
  emptyTitle,
  emptyDescription,
  className = "",
}: ClassListProps) => {
  if (isLoading) {
    return <ClassListSkeleton className={className} count={3} />;
  }

  if (error) {
    return (
      <div className="card p-8 text-center max-w-xl mx-auto border-red-200 bg-red-50/60 shadow-soft">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="heading-3 text-red-900 mb-2">
          Unable to Load Admission Classes
        </h3>
        <p className="body-small text-red-700 mb-5 leading-relaxed">{error}</p>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="btn btn-outline btn-sm inline-flex items-center gap-2 mx-auto bg-white border-red-300 text-red-800 hover:bg-red-50"
          >
            <RotateCw className="w-4 h-4 text-red-600" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <EmptyClassState
        title={emptyTitle}
        description={emptyDescription}
        onRefresh={onRefresh}
        className={className}
      />
    );
  }

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {classes.map((item) => (
        <ClassCard
          key={item.id}
          admissionClass={item}
          onApply={onApply}
          isApplying={submittingClassId === item.id}
          isDisabled={Boolean(submittingClassId && submittingClassId !== item.id)}
        />
      ))}
    </div>
  );
};
