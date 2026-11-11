export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export const LoadingSpinner = ({
  size = "md",
  className = "",
  label = "Loading content...",
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
  };

  return (
    <div
      className={`inline-flex items-center justify-center gap-2 ${className}`}
      role="status"
      aria-label={label}
    >
      <div
        className={`${sizeClasses[size]} border-slate-200 border-t-secondary-600 rounded-full animate-spin`}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};
