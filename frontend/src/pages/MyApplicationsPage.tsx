import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCw,
  PlusCircle,
  IdCard,
} from "lucide-react";
import { holdService } from "../services/holdService";
import { useStudentId } from "../hooks/useStudentId";
import { StudentIdForm } from "../components/applications";
import type { MyHoldResponse } from "../types/hold";

export const MyApplicationsPage = () => {
  const { studentId, clearStudentId } = useStudentId();
  const [holds, setHolds] = useState<MyHoldResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(studentId));
  const [error, setError] = useState<string | null>(null);

  const fetchMyHolds = () => {
    if (!studentId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    holdService
      .getMyHolds(studentId)
      .then((data) => {
        setHolds(data);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to retrieve your admission holds.";
        setError(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!studentId) return;

    let isCancelled = false;

    holdService
      .getMyHolds(studentId)
      .then((data) => {
        if (!isCancelled) {
          setHolds(data);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to retrieve your admission holds.";
          setError(message);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [studentId]);

  const getStatusBadge = (status: string) => {
    const normalized = status.toUpperCase();
    if (normalized === "CONFIRMED") {
      return (
        <span className="badge badge-confirmed">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Confirmed</span>
        </span>
      );
    }
    if (normalized === "HELD") {
      return (
        <span className="badge badge-held">
          <Clock className="w-3.5 h-3.5" />
          <span>Seat Held</span>
        </span>
      );
    }
    if (normalized === "EXPIRED") {
      return (
        <span className="badge badge-expired">
          <XCircle className="w-3.5 h-3.5" />
          <span>Expired</span>
        </span>
      );
    }
    return (
      <span className="badge badge-cancelled">
        <span>{status}</span>
      </span>
    );
  };

  // If no student ID is configured in the browser, show StudentIdForm
  if (!studentId) {
    return (
      <div className="portal-container-narrow py-8">
        <StudentIdForm
          title="Find Your Applications"
          subtitle="Enter your 17-digit Birth Registration Number to retrieve active seat reservations and confirmed enrollments."
          showCancelButton={false}
          onSuccess={() => {
            fetchMyHolds();
          }}
        />
      </div>
    );
  }

  return (
    <div className="portal-container py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="caption text-secondary-600 font-semibold block mb-1">
            Student Dashboard
          </span>
          <h1 className="heading-1 text-primary-900">My Applications</h1>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
            <IdCard className="w-4 h-4 text-slate-400" />
            <span>Active Student BRN:</span>
            <span className="font-mono font-bold text-slate-700">
              {studentId}
            </span>
            <button
              type="button"
              onClick={clearStudentId}
              className="text-secondary-600 hover:underline ml-2"
            >
              Switch ID
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchMyHolds}
            className="btn btn-outline btn-sm inline-flex items-center gap-1.5"
            disabled={isLoading}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/admission"
            className="btn btn-secondary btn-sm inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Application</span>
          </Link>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((key) => (
            <div key={key} className="card p-6 animate-pulse flex flex-col gap-4">
              <div className="h-6 bg-slate-200 rounded w-2/3" />
              <div className="h-4 bg-slate-100 rounded w-1/3" />
              <div className="h-10 bg-slate-100 rounded w-full mt-4" />
            </div>
          ))}
        </div>
      )}

      {/* Error Notice */}
      {!isLoading && error && (
        <div className="card p-8 text-center max-w-xl mx-auto border-red-200 bg-red-50/70 shadow-soft">
          <h3 className="heading-3 text-red-900 mb-2">Unable to Load Applications</h3>
          <p className="body-small text-red-700 mb-4">{error}</p>
          <button
            type="button"
            onClick={fetchMyHolds}
            className="btn btn-outline btn-sm bg-white border-red-300 text-red-800"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && holds.length === 0 && (
        <div className="card p-8 sm:p-12 text-center max-w-2xl mx-auto bg-white shadow-soft">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-800 flex items-center justify-center mx-auto mb-4 border border-primary-100">
            <FileText className="w-7 h-7 text-secondary-600" />
          </div>
          <h2 className="heading-3 text-primary-900 mb-2">No Applications Found</h2>
          <p className="body-default text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
            There are currently no admission seat holds or applications associated with student ID{" "}
            <span className="font-mono font-semibold text-slate-800">{studentId}</span>.
          </p>
          <Link to="/admission" className="btn btn-secondary btn-md">
            Explore Available Classes
          </Link>
        </div>
      )}

      {/* Populated Holds Grid */}
      {!isLoading && !error && holds.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {holds.map((item) => (
            <div
              key={item.holdId}
              className="card card-interactive p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  {getStatusBadge(item.status)}
                  <span className="text-[11px] font-mono text-slate-400">
                    ID: {item.holdId.slice(0, 8)}…
                  </span>
                </div>

                <h3 className="heading-3 text-primary-900 mb-1">
                  {item.className}
                </h3>

                <div className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Expires: {new Date(item.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (
                    {new Date(item.expiresAt).toLocaleDateString()})
                  </span>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100">
                <Link
                  to={`/applications/${item.holdId}`}
                  className="btn btn-secondary btn-sm w-full justify-center group"
                >
                  <span>View Details & Confirm</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
