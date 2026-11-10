export interface ClassListSkeletonProps {
  count?: number;
  className?: string;
}

export const ClassListSkeleton = ({
  count = 3,
  className = "",
}: ClassListSkeletonProps) => {
  const items = Array.from({ length: count }, (_, index) => index);

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
      role="status"
      aria-busy="true"
      aria-label="Loading available classes and seat availability"
    >
      {items.map((key) => (
        <div
          key={key}
          className="card p-6 flex flex-col justify-between animate-pulse bg-white border-slate-200"
        >
          <div>
            {/* Header Skeleton */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex flex-col gap-2 w-2/3">
                <div className="h-6 bg-slate-200 rounded-md w-3/4" />
                <div className="h-4 bg-slate-100 rounded-md w-1/2" />
              </div>
              <div className="h-5 bg-slate-200 rounded-full w-24" />
            </div>

            {/* Seat Availability Section Skeleton */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex justify-between">
                <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                <div className="h-3.5 bg-slate-200 rounded w-1/4" />
              </div>
              <div className="h-2.5 bg-slate-200 rounded-full w-full" />

              {/* 4-Box Metric Grid Skeleton */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="h-12 bg-slate-100 rounded-lg" />
                <div className="h-12 bg-slate-100 rounded-lg" />
                <div className="h-12 bg-slate-100 rounded-lg" />
                <div className="h-12 bg-slate-100 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Action Button Skeleton */}
          <div className="pt-6 mt-5 border-t border-slate-100">
            <div className="h-10 bg-slate-200 rounded-lg w-full" />
          </div>
        </div>
      ))}
    </div>
  );
};
