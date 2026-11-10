import { GraduationCap, RotateCw } from "lucide-react";

export interface EmptyClassStateProps {
  title?: string;
  description?: string;
  onRefresh?: () => void;
  className?: string;
}

export const EmptyClassState = ({
  title = "No Admission Classes Available",
  description = "There are currently no active admission classes or grade shifts open for registration. Please check back shortly or contact the admissions office for the enrollment calendar.",
  onRefresh,
  className = "",
}: EmptyClassStateProps) => {
  return (
    <div
      className={`card p-8 sm:p-12 text-center max-w-2xl mx-auto bg-white border-slate-200/90 shadow-soft ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-800 flex items-center justify-center mx-auto mb-4 border border-primary-100">
        <GraduationCap className="w-7 h-7 text-secondary-600" />
      </div>

      <h3 className="heading-3 mb-2 text-primary-900">{title}</h3>

      <p className="body-default text-slate-600 max-w-lg mx-auto mb-6 leading-relaxed">
        {description}
      </p>

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          className="btn btn-outline btn-sm inline-flex items-center gap-2 mx-auto"
        >
          <RotateCw className="w-4 h-4 text-slate-500" />
          <span>Refresh Availability</span>
        </button>
      )}
    </div>
  );
};
