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
  AlertTriangle,
  Copy,
  Check,
  Calendar,
  Layers,
} from "lucide-react";
import { holdService } from "../services/holdService";
import { useStudentId } from "../hooks/useStudentId";
import { useToast } from "../hooks/useToast";
import { StudentIdForm } from "../components/applications";
import type { MyHoldResponse } from "../types/hold";

type ApplicationFilter = "all" | "active" | "completed";

export const MyApplicationsPage = () => {
  const { studentId, clearStudentId } = useStudentId();
  const toast = useToast();

  const [holds, setHolds] = useState<MyHoldResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(studentId));
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ApplicationFilter>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Manual refresh handler
  const handleRefresh = (showSuccessToast = true) => {
    if (!studentId) return;

    setIsLoading(true);
    setError(null);

    holdService
      .getMyHolds(studentId)
      .then((data) => {
        setHolds(data);
        if (showSuccessToast) {
          toast.info("Applications list refreshed.");
        }
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to retrieve your admission holds.";
        setError(message);
        toast.error(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Initial load from backend (GET /me/holds)
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success("Application Reference ID copied to clipboard.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Separate Active and Completed/Historical Applications
  const activeHolds = holds.filter((h) => {
    const status = h.status.toUpperCase();
    return status === "HELD";
  });

  const completedHolds = holds.filter((h) => {
    const status = h.status.toUpperCase();
    return status === "CONFIRMED" || status === "EXPIRED" || status === "CANCELLED";
  });

  const displayedHolds =
    activeTab === "active"
      ? activeHolds
      : activeTab === "completed"
        ? completedHolds
        : holds;

  const getStatusBadge = (status: string) => {
    const normalized = status.toUpperCase();

    if (normalized === "CONFIRMED") {
      return (
        <span className="badge badge-confirmed">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Confirmed</span>
        </span>
      );
    }
    if (normalized === "HELD") {
      return (
        <span className="badge badge-held">
          <Clock className="w-3.5 h-3.5 shrink-0 animate-pulse" />
          <span>Seat Held</span>
        </span>
      );
    }
    if (normalized === "EXPIRED") {
      return (
        <span className="badge badge-expired">
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Hold Expired</span>
        </span>
      );
    }
    if (normalized === "CANCELLED") {
      return (
        <span className="badge badge-cancelled">
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Cancelled</span>
        </span>
      );
    }
    return (
      <span className="badge badge-expired">
        <span>{status}</span>
      </span>
    );
  };

  const formatExpiration = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return {
        dateStr: date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        timeStr: date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch {
      return { dateStr: isoString, timeStr: "" };
    }
  };

  // If no student ID is found in the session, prompt with StudentIdForm
  if (!studentId) {
    return (
      <div className="portal-container-narrow py-12">
        <StudentIdForm
          title="Find Your Applications"
          subtitle="Enter the 17-digit Birth Registration Number used during application to view your seat holds and admission records."
          showCancelButton={false}
          onSuccess={() => {
            handleRefresh();
          }}
        />
      </div>
    );
  }

  return (
    <div className="portal-container py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="caption text-secondary-600 font-semibold block mb-1">
            Student Portal
          </span>
          <h1 className="heading-1 text-primary-900">My Applications</h1>

          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5 font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
              <IdCard className="w-3.5 h-3.5 text-secondary-600" />
              <span>Student BRN:</span>
              <span className="font-mono font-bold text-primary-900">
                {studentId}
              </span>
            </span>

            <button
              type="button"
              onClick={clearStudentId}
              className="text-secondary-600 hover:text-secondary-800 hover:underline font-medium ml-1 transition-colors"
            >
              Change ID
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleRefresh(true)}
            className="btn btn-outline btn-sm inline-flex items-center gap-1.5 bg-white shadow-xs"
            disabled={isLoading}
            title="Refresh applications list"
          >
            <RotateCw
              className={`w-3.5 h-3.5 text-slate-600 ${
                isLoading ? "animate-spin" : ""
              }`}
            />
            <span>Refresh</span>
          </button>

          <Link
            to="/admission"
            className="btn btn-secondary btn-sm inline-flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Apply for Class</span>
          </Link>
        </div>
      </div>

      {/* Tabs / Filter Controls */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "all"
              ? "bg-primary-900 text-white font-semibold shadow-xs"
              : "text-slate-600 hover:text-primary-900 hover:bg-slate-100"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Applications</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === "all"
                ? "bg-primary-800 text-white"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {holds.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "active"
              ? "bg-amber-600 text-white font-semibold shadow-xs"
              : "text-slate-600 hover:text-primary-900 hover:bg-slate-100"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Active Reservations</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === "active"
                ? "bg-amber-700 text-white"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {activeHolds.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "completed"
              ? "bg-secondary-600 text-white font-semibold shadow-xs"
              : "text-slate-600 hover:text-primary-900 hover:bg-slate-100"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed & History</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === "completed"
                ? "bg-secondary-700 text-white"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {completedHolds.length}
          </span>
        </button>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((key) => (
            <div
              key={key}
              className="card p-6 animate-pulse flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white"
            >
              <div className="space-y-2 w-full md:w-1/3">
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
              <div className="h-6 bg-slate-200 rounded w-28" />
              <div className="h-4 bg-slate-100 rounded w-36" />
              <div className="h-9 bg-slate-200 rounded w-32" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="card p-8 sm:p-10 text-center max-w-xl mx-auto border-red-200 bg-red-50/70 shadow-soft">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="heading-3 text-red-900 mb-2">
            Unable to Retrieve Applications
          </h3>
          <p className="body-small text-red-700 mb-5 leading-relaxed">{error}</p>
          <button
            type="button"
            onClick={() => handleRefresh(true)}
            className="btn btn-outline btn-sm bg-white border-red-300 text-red-800 hover:bg-red-50"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State: No applications at all for student ID */}
      {!isLoading && !error && holds.length === 0 && (
        <div className="card p-8 sm:p-12 text-center max-w-2xl mx-auto bg-white shadow-soft">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-800 flex items-center justify-center mx-auto mb-4 border border-primary-100">
            <FileText className="w-7 h-7 text-secondary-600" />
          </div>
          <h2 className="heading-3 text-primary-900 mb-2">
            No Applications Found
          </h2>
          <p className="body-default text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
            There are currently no active seat reservations or confirmed
            enrollments registered under student ID{" "}
            <span className="font-mono font-bold text-primary-900">
              {studentId}
            </span>
            .
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/admission" className="btn btn-secondary btn-md">
              <span>Explore Available Classes</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      )}

      {/* Empty State: Tab filter has 0 records */}
      {!isLoading && !error && holds.length > 0 && displayedHolds.length === 0 && (
        <div className="card p-8 text-center max-w-md mx-auto bg-white border-slate-200">
          <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="heading-4 text-primary-900 mb-1">
            {activeTab === "active"
              ? "No Active Reservations"
              : "No Completed Records"}
          </h3>
          <p className="body-small text-slate-500 mb-4">
            {activeTab === "active"
              ? "You do not have any temporary seat holds currently pending confirmation."
              : "You do not have any past or confirmed admission records."}
          </p>
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className="btn btn-outline btn-sm"
          >
            View All Applications
          </button>
        </div>
      )}

      {/* Populated Applications View: Responsive Desktop Table & Mobile Cards */}
      {!isLoading && !error && displayedHolds.length > 0 && (
        <div className="flex flex-col gap-4">
          {/* Desktop Table View (md and up) */}
          <div className="hidden md:block card overflow-hidden shadow-soft">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Class Name</th>
                  <th className="py-3.5 px-6">Application ID</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Expiration Window</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {displayedHolds.map((item) => {
                  const exp = formatExpiration(item.expiresAt);
                  const isHeld = item.status.toUpperCase() === "HELD";

                  return (
                    <tr
                      key={item.holdId}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Class Name */}
                      <td className="py-4 px-6 font-semibold text-primary-900">
                        {item.className}
                      </td>

                      {/* Application ID with Copy Helper */}
                      <td className="py-4 px-6 font-mono text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <span>{item.holdId.slice(0, 8)}…</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(item.holdId)}
                            className="p-1 text-slate-400 hover:text-primary-900 rounded transition-colors"
                            title="Copy full Hold ID"
                            aria-label="Copy full Hold ID"
                          >
                            {copiedId === item.holdId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Expiration Date/Time */}
                      <td className="py-4 px-6 text-xs text-slate-600">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">
                            {exp.dateStr}
                          </span>
                          <span className="text-slate-500">{exp.timeStr}</span>
                        </div>
                      </td>

                      {/* View Details Action */}
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/applications/${item.holdId}`}
                          className={`btn btn-sm inline-flex items-center gap-1.5 ${
                            isHeld
                              ? "btn-secondary"
                              : "btn-outline text-primary-800"
                          }`}
                        >
                          <span>{isHeld ? "Confirm Seat" : "View Details"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (< md) */}
          <div className="md:hidden flex flex-col gap-4">
            {displayedHolds.map((item) => {
              const exp = formatExpiration(item.expiresAt);
              const isHeld = item.status.toUpperCase() === "HELD";

              return (
                <div
                  key={item.holdId}
                  className="card p-5 flex flex-col gap-3 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="heading-4 text-primary-900">
                      {item.className}
                    </h3>
                    <div>{getStatusBadge(item.status)}</div>
                  </div>

                  <div className="text-xs text-slate-500 flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span>Application ID:</span>
                      <span className="font-mono text-slate-800 font-medium">
                        {item.holdId.slice(0, 12)}…
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Expiration:</span>
                      </span>
                      <span className="font-medium text-slate-800">
                        {exp.dateStr} {exp.timeStr}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <Link
                      to={`/applications/${item.holdId}`}
                      className={`btn btn-sm w-full justify-center inline-flex items-center gap-1.5 ${
                        isHeld ? "btn-secondary" : "btn-outline"
                      }`}
                    >
                      <span>{isHeld ? "Confirm Seat" : "View Details"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
