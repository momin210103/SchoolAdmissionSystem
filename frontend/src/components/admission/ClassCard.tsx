import type { AdmissionClassUnit } from "../../types/admission";
import { SeatAvailability } from "./SeatAvailability";
import { ArrowRight, Lock, Sun, Moon, Clock } from "lucide-react";

export interface ClassCardProps {
  admissionClass: AdmissionClassUnit;
  onApply?: (classId: string) => void;
  isApplying?: boolean;
  isDisabled?: boolean;
}

export const ClassCard = ({
  admissionClass,
  onApply,
  isApplying = false,
  isDisabled = false,
}: ClassCardProps) => {
  const { id, name, shift, totalSeats, heldSeats, confirmedSeats, availableSeats, isActive } =
    admissionClass;

  const isFull = availableSeats <= 0;
  const isClassActive = isActive ?? true;
  const isAvailable = isClassActive && !isFull && !isDisabled;

  const getShiftIcon = (shiftName?: string) => {
    if (!shiftName) return null;
    const lower = shiftName.toLowerCase();
    if (lower.includes("morning")) return <Sun className="w-3.5 h-3.5 text-amber-500" />;
    if (lower.includes("evening") || lower.includes("night"))
      return <Moon className="w-3.5 h-3.5 text-indigo-500" />;
    return <Clock className="w-3.5 h-3.5 text-slate-500" />;
  };

  return (
    <div
      className={`card flex flex-col justify-between p-6 transition-all duration-200 ${
        isAvailable ? "card-interactive hover:border-secondary-300" : "opacity-95"
      }`}
    >
      <div>
        {/* Header: Class Name, Shift & Status Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-col gap-1">
            <h3 className="heading-3 text-primary-900 leading-snug">{name}</h3>

            {shift && (
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100/80 px-2.5 py-0.5 rounded-md w-fit">
                {getShiftIcon(shift)}
                <span>{shift} Shift</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {!isClassActive ? (
              <span className="badge badge-expired">Admissions Closed</span>
            ) : isFull ? (
              <span className="badge badge-cancelled">Capacity Reached</span>
            ) : (
              <span className="badge badge-confirmed">Admissions Open</span>
            )}
          </div>
        </div>

        {/* Seat Availability Metrics & Progress */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <SeatAvailability
            totalSeats={totalSeats}
            heldSeats={heldSeats}
            confirmedSeats={confirmedSeats}
            availableSeats={availableSeats}
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-6 mt-5 border-t border-slate-100">
        <button
          type="button"
          disabled={!isAvailable || isApplying}
          onClick={() => onApply?.(id)}
          className={`btn btn-md w-full justify-center transition-all ${
            isAvailable
              ? "btn-secondary group shadow-xs"
              : "btn-outline opacity-60 cursor-not-allowed text-slate-400 border-slate-200"
          }`}
          aria-disabled={!isAvailable || isApplying}
        >
          {isApplying ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Securing Seat...</span>
            </span>
          ) : !isClassActive ? (
            <span>Admissions Closed</span>
          ) : isFull ? (
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Full Capacity (No Seats)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span>Apply for Admission</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
