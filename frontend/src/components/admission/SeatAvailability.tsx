export interface SeatAvailabilityProps {
  totalSeats: number;
  heldSeats: number;
  confirmedSeats: number;
  availableSeats: number;
  className?: string;
  showLegend?: boolean;
}

export const SeatAvailability = ({
  totalSeats,
  heldSeats,
  confirmedSeats,
  availableSeats,
  className = "",
  showLegend = true,
}: SeatAvailabilityProps) => {
  // Safe math calculations
  const safeTotal = Math.max(0, totalSeats);
  const safeConfirmed = Math.max(0, confirmedSeats);
  const safeHeld = Math.max(0, heldSeats);
  const safeAvailable = Math.max(0, availableSeats);

  const confirmedPct =
    safeTotal > 0
      ? Math.min(100, Math.round((safeConfirmed / safeTotal) * 100))
      : 0;

  const heldPct =
    safeTotal > 0
      ? Math.min(100 - confirmedPct, Math.round((safeHeld / safeTotal) * 100))
      : 0;

  const allocatedTotal = safeConfirmed + safeHeld;
  const overallAllocatedPct =
    safeTotal > 0
      ? Math.min(100, Math.round((allocatedTotal / safeTotal) * 100))
      : 100;

  const isFull = safeAvailable <= 0;
  const isLowAvailability = !isFull && safeAvailable <= 5;

  return (
    <div className={`flex flex-col gap-3.5 ${className}`}>
      {/* Progress Bar Header: Status summary */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-500">Seat Allocation</span>
        <span className="font-semibold text-slate-700">
          {allocatedTotal} / {safeTotal} Seats Taken ({overallAllocatedPct}%)
        </span>
      </div>

      {/* Multi-segment Progress Bar */}
      <div
        className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex"
        role="progressbar"
        aria-valuenow={allocatedTotal}
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-label={`Seat availability: ${safeAvailable} of ${safeTotal} seats remaining`}
      >
        {/* Confirmed Seats Segment */}
        {confirmedPct > 0 && (
          <div
            style={{ width: `${confirmedPct}%` }}
            className="h-full bg-secondary-600 transition-all duration-300"
            title={`Confirmed: ${safeConfirmed} seats (${confirmedPct}%)`}
          />
        )}

        {/* Held Seats Segment */}
        {heldPct > 0 && (
          <div
            style={{ width: `${heldPct}%` }}
            className="h-full bg-amber-500 transition-all duration-300"
            title={`Temporarily Held: ${safeHeld} seats (${heldPct}%)`}
          />
        )}
      </div>

      {/* Breakdown Grid: Total, Held, Confirmed, Available */}
      <div className="grid grid-cols-4 gap-2 text-center pt-1">
        {/* Total Seats */}
        <div className="flex flex-col p-2 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Total
          </span>
          <span className="text-sm font-bold text-primary-900 mt-0.5">
            {safeTotal}
          </span>
        </div>

        {/* Confirmed Seats */}
        <div className="flex flex-col p-2 rounded-lg bg-secondary-50/60 border border-secondary-100/70">
          <span className="text-[11px] font-medium text-secondary-700 uppercase tracking-wider">
            Confirmed
          </span>
          <span className="text-sm font-bold text-secondary-700 mt-0.5">
            {safeConfirmed}
          </span>
        </div>

        {/* Held Seats */}
        <div className="flex flex-col p-2 rounded-lg bg-amber-50/60 border border-amber-100/70">
          <span className="text-[11px] font-medium text-amber-700 uppercase tracking-wider">
            Held
          </span>
          <span className="text-sm font-bold text-amber-700 mt-0.5">
            {safeHeld}
          </span>
        </div>

        {/* Available Seats */}
        <div
          className={`flex flex-col p-2 rounded-lg border ${
            isFull
              ? "bg-red-50/70 border-red-200/80 text-red-700"
              : isLowAvailability
                ? "bg-amber-50/70 border-amber-200/80 text-amber-800"
                : "bg-emerald-50/70 border-emerald-200/80 text-emerald-800"
          }`}
        >
          <span className="text-[11px] font-medium uppercase tracking-wider">
            Available
          </span>
          <span className="text-sm font-bold mt-0.5">{safeAvailable}</span>
        </div>
      </div>

      {/* Micro Legend */}
      {showLegend && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-0.5 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary-600 inline-block" />
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span>Held (Timed)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />
            <span>Available</span>
          </div>
        </div>
      )}
    </div>
  );
};
