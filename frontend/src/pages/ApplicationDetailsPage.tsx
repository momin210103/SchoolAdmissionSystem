import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  GraduationCap,
  IdCard,
  XCircle,
  FileText,
  RotateCw,
  ShieldAlert,
} from "lucide-react";
import { holdService } from "../services/holdService";
import { classService } from "../services/classService";
import { useStudentId } from "../hooks/useStudentId";
import type { HoldResponse, CreateHoldResponse } from "../types/hold";
import type { ClassResponse } from "../types/class";

export const ApplicationDetailsPage = () => {
  const { holdId } = useParams<{ holdId: string }>();
  const location = useLocation();
  const { studentId: sessionStudentId } = useStudentId();

  // Initial data can come from navigation state if navigated right after POST /holds
  const initialHold = (location.state as { hold?: CreateHoldResponse } | undefined)
    ?.hold;

  const [hold, setHold] = useState<HoldResponse | CreateHoldResponse | null>(
    initialHold ?? null
  );
  const [classInfo, setClassInfo] = useState<ClassResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialHold);
  const [error, setError] = useState<string | null>(null);

  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Time remaining in seconds
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (!initialHold?.expiresAt) return 0;
    const diff = Math.floor(
      (new Date(initialHold.expiresAt).getTime() - Date.now()) / 1000
    );
    return Math.max(0, diff);
  });

  // Manual refresh handler
  const handleRefresh = () => {
    if (!holdId) return;

    setIsLoading(true);
    setError(null);

    holdService
      .getHoldById(holdId)
      .then((data) => {
        setHold(data);
        return classService.getClassById(data.classId).then((c) => {
          setClassInfo(c);
        });
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to retrieve application details from the server.";
        setError(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Fetch hold details from backend on mount (source of truth)
  useEffect(() => {
    if (!holdId) return;

    let isCancelled = false;

    holdService
      .getHoldById(holdId)
      .then((data) => {
        if (!isCancelled) {
          setHold(data);
          setIsLoading(false);

          classService
            .getClassById(data.classId)
            .then((c) => {
              if (!isCancelled) setClassInfo(c);
            })
            .catch(() => {
              // Non-blocking class metadata fetch
            });
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to retrieve application details from the server.";
          setError(message);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [holdId]);

  // Live countdown timer effect
  useEffect(() => {
    if (!hold?.expiresAt || hold.status !== "HELD") return;

    const timer = setInterval(() => {
      const diff = Math.floor(
        (new Date(hold.expiresAt).getTime() - Date.now()) / 1000
      );
      const sec = Math.max(0, diff);
      setRemainingSeconds(sec);
      if (sec <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [hold?.expiresAt, hold?.status]);

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleConfirmAdmission = async () => {
    if (!holdId) return;

    setIsConfirming(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const result = await holdService.confirmHold(
        holdId,
        sessionStudentId ?? undefined
      );
      setHold((prev) => (prev ? { ...prev, status: result.status } : null));
      setActionSuccess("Admission successfully confirmed! Your seat is secured.");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to confirm admission hold. The hold may have expired.";
      setActionError(message);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelHold = async () => {
    if (!holdId) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this admission seat hold? The seat will be released back to the general quota immediately."
    );
    if (!confirmed) return;

    setIsCancelling(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await holdService.cancelHold(holdId, sessionStudentId ?? undefined);
      setHold((prev) => (prev ? { ...prev, status: "CANCELLED" } : null));
      setActionSuccess("Seat hold has been cancelled and returned to the pool.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to cancel hold.";
      setActionError(message);
    } finally {
      setIsCancelling(false);
    }
  };

  const isHoldExpired =
    hold?.status === "EXPIRED" ||
    (hold?.status === "HELD" && remainingSeconds <= 0);

  const getStatusBadge = (status?: string) => {
    const normalized = (status ?? "").toUpperCase();
    if (normalized === "CONFIRMED") {
      return (
        <span className="badge badge-confirmed text-sm py-1 px-3">
          <CheckCircle2 className="w-4 h-4" />
          <span>Admission Confirmed</span>
        </span>
      );
    }
    if (normalized === "HELD") {
      if (isHoldExpired) {
        return (
          <span className="badge badge-expired text-sm py-1 px-3">
            <XCircle className="w-4 h-4" />
            <span>Hold Expired</span>
          </span>
        );
      }
      return (
        <span className="badge badge-held text-sm py-1 px-3">
          <Clock className="w-4 h-4" />
          <span>Temporary Seat Hold Active</span>
        </span>
      );
    }
    if (normalized === "CANCELLED") {
      return (
        <span className="badge badge-cancelled text-sm py-1 px-3">
          <XCircle className="w-4 h-4" />
          <span>Hold Cancelled</span>
        </span>
      );
    }
    return (
      <span className="badge badge-expired text-sm py-1 px-3">
        <span>{status}</span>
      </span>
    );
  };

  return (
    <div className="portal-container-narrow py-6">
      {/* Top Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/admission"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Available Classes</span>
        </Link>

        <Link
          to="/applications"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-600 hover:text-secondary-700 transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span>My Applications</span>
        </Link>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card p-8 sm:p-12 text-center animate-pulse">
          <div className="h-8 bg-slate-200 rounded-md w-1/2 mx-auto mb-4" />
          <div className="h-4 bg-slate-100 rounded-md w-1/3 mx-auto mb-8" />
          <div className="h-24 bg-slate-50 rounded-lg w-full mb-6" />
          <div className="h-10 bg-slate-200 rounded-lg w-1/3 mx-auto" />
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="card p-8 sm:p-12 text-center border-red-200 bg-red-50/60 shadow-soft">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="heading-3 text-red-900 mb-2">Application Not Found</h2>
          <p className="body-default text-red-700 max-w-md mx-auto mb-6 leading-relaxed">
            {error}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              className="btn btn-outline btn-md inline-flex items-center gap-2 bg-white"
            >
              <RotateCw className="w-4 h-4 text-slate-600" />
              <span>Retry</span>
            </button>
            <Link to="/admission" className="btn btn-secondary btn-md">
              Browse Classes
            </Link>
          </div>
        </div>
      )}

      {/* Populated Application Card */}
      {!isLoading && !error && hold && (
        <div className="card overflow-hidden shadow-soft">
          {/* Card Header */}
          <div className="card-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70">
            <div>
              <span className="caption text-slate-500 font-semibold block mb-1">
                Seat Reservation Token
              </span>
              <h1 className="heading-2 text-primary-900">
                {classInfo?.name ?? "Admission Class"}
              </h1>
            </div>

            <div>{getStatusBadge(hold.status)}</div>
          </div>

          <div className="card-body flex flex-col gap-6">
            {/* Action Feedback Alerts */}
            {actionSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-sm font-medium">{actionSuccess}</div>
              </div>
            )}

            {actionError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-sm font-medium">{actionError}</div>
              </div>
            )}

            {/* Countdown Timer Display (For Active HELD status) */}
            {hold.status === "HELD" && !isHoldExpired && (
              <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-amber-700 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">
                      Temporary Reservation Active
                    </h3>
                    <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                      Confirm your admission before the timer lapses. Upon expiration, the seat is released back to the general quota.
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right shrink-0">
                  <span className="text-xs text-amber-700 uppercase tracking-wider block font-semibold mb-0.5">
                    Time Remaining
                  </span>
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold text-amber-900 tracking-wider">
                    {formatCountdown(remainingSeconds)}
                  </span>
                </div>
              </div>
            )}

            {/* Hold Expired Advisory Banner */}
            {isHoldExpired && hold.status !== "CONFIRMED" && (
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong className="font-semibold text-slate-900">
                    Hold window lapsed:
                  </strong>{" "}
                  This temporary seat hold has expired. The reserved seat has been returned to the public pool. You may return to the classes directory to initiate a new reservation if seats remain.
                </div>
              </div>
            )}

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <IdCard className="w-5 h-5 text-secondary-600 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Student BRN
                  </span>
                  <span className="font-mono text-sm font-bold text-primary-900 mt-0.5 break-all">
                    {"studentId" in hold && hold.studentId
                      ? hold.studentId
                      : sessionStudentId ?? "Registered Student"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-accent-700 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Admission Unit ID
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-700 mt-1 break-all">
                    {hold.classId}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-sm">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700 uppercase tracking-wider">
                Reservation Record
              </div>
              <div className="divide-y divide-slate-100">
                <div className="px-4 py-3 flex justify-between items-center">
                  <span className="text-slate-500">Hold Reference ID</span>
                  <span className="font-mono text-xs text-slate-800 break-all">
                    {hold.holdId}
                  </span>
                </div>
                <div className="px-4 py-3 flex justify-between items-center">
                  <span className="text-slate-500">Expires At (UTC)</span>
                  <span className="font-mono text-xs text-slate-800">
                    {new Date(hold.expiresAt).toUTCString()}
                  </span>
                </div>
                <div className="px-4 py-3 flex justify-between items-center">
                  <span className="text-slate-500">Local Expiration</span>
                  <span className="font-mono text-xs text-slate-800">
                    {new Date(hold.expiresAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="card-footer flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50">
            {hold.status === "HELD" && !isHoldExpired ? (
              <>
                <button
                  type="button"
                  disabled={isCancelling || isConfirming}
                  onClick={handleCancelHold}
                  className="btn btn-outline btn-md w-full sm:w-auto text-red-700 border-red-200 hover:bg-red-50"
                >
                  {isCancelling ? "Cancelling..." : "Cancel Hold"}
                </button>

                <button
                  type="button"
                  disabled={isConfirming || isCancelling}
                  onClick={handleConfirmAdmission}
                  className="btn btn-secondary btn-md w-full sm:w-auto justify-center"
                >
                  {isConfirming ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Confirming Admission...</span>
                    </span>
                  ) : (
                    <span>Confirm Admission</span>
                  )}
                </button>
              </>
            ) : (
              <div className="w-full flex justify-between items-center">
                <Link to="/admission" className="btn btn-outline btn-md">
                  Browse Available Classes
                </Link>

                <Link to="/applications" className="btn btn-secondary btn-md">
                  View My Applications
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
