import { useState, useEffect, useCallback } from "react";
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
  Copy,
  Check,
  Calendar,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { holdService } from "../services/holdService";
import { classService } from "../services/classService";
import { useStudentId } from "../hooks/useStudentId";
import { useCountdown } from "../hooks/useCountdown";
import { useToast } from "../hooks/useToast";
import { ConfirmationModal } from "../components/common";
import { SeatAvailability } from "../components/admission/SeatAvailability";
import { ApiError } from "../services/api";
import type { HoldResponse, CreateHoldResponse } from "../types/hold";
import type { ClassResponse } from "../types/class";

export const ApplicationDetailsPage = () => {
  const { holdId } = useParams<{ holdId: string }>();
  const location = useLocation();
  const { studentId: sessionStudentId } = useStudentId();
  const toast = useToast();

  // Initial data can come from navigation state if navigated right after POST /classes/{id}/holds
  const initialHold = (
    location.state as { hold?: CreateHoldResponse } | undefined
  )?.hold;

  const [hold, setHold] = useState<HoldResponse | CreateHoldResponse | null>(
    initialHold ?? null,
  );
  const [classInfo, setClassInfo] = useState<ClassResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialHold);
  const [error, setError] = useState<string | null>(null);

  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [isVerifyingWithBackend, setIsVerifyingWithBackend] =
    useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch hold details from backend (source of truth)
  const fetchHoldDetails = useCallback(() => {
    if (!holdId) return;

    holdService
      .getHoldById(holdId)
      .then((data) => {
        setHold(data);
        setIsLoading(false);
        setError(null);

        classService
          .getClassById(data.classId)
          .then((c) => {
            setClassInfo(c);
          })
          .catch(() => {
            // Non-blocking class fetch
          });
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to retrieve application details from the server.";
        setError(message);
        setIsLoading(false);
      })
      .finally(() => {
        setIsVerifyingWithBackend(false);
      });
  }, [holdId]);

  // Re-fetch from backend when the countdown timer hits 0 (do not trust frontend timer alone)
  const handleTimerExpired = useCallback(() => {
    setIsVerifyingWithBackend(true);
    fetchHoldDetails();
    toast.warning(
      "The temporary seat hold timer has elapsed. Re-verifying status with registry...",
    );
  }, [fetchHoldDetails, toast]);

  // Reusable countdown hook
  const { remainingSeconds, formattedTime, isExpired } = useCountdown({
    expiresAt: hold?.expiresAt,
    onExpire: handleTimerExpired,
    enabled: hold?.status === "HELD",
  });

  // Initial fetch on mount
  useEffect(() => {
    fetchHoldDetails();
  }, [fetchHoldDetails]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success("Application Reference ID copied to clipboard.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Confirm Admission handler
  const handleConfirmAdmission = async () => {
    if (!holdId || isConfirming || isCancelling || isBackendExpired) return;

    setIsConfirming(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      // Call actual confirm endpoint: POST /holds/{holdId}/confirm
      const result = await holdService.confirmHold(
        holdId,
        sessionStudentId ?? undefined,
      );

      // Show confirmed status after backend response
      setHold((prev) => (prev ? { ...prev, status: result.status } : null));
      const successMsg =
        "Admission successfully confirmed! Your seat reservation is finalized.";
      setActionSuccess(successMsg);
      toast.success(successMsg);

      // Requirement 3: Refresh class seat statistics from backend automatically
      if (hold?.classId) {
        classService
          .getClassById(hold.classId)
          .then((updated) => setClassInfo(updated))
          .catch(() => {});
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const msg = (err.message || "").toLowerCase();

        if (err.status === 409) {
          if (msg.includes("expired")) {
            setHold((prev) => (prev ? { ...prev, status: "EXPIRED" } : null));
            const expiredMsg =
              "This admission hold has expired and cannot be confirmed. The seat has been released.";
            setActionError(expiredMsg);
            toast.error(expiredMsg);
          } else if (
            msg.includes("already confirmed") ||
            msg.includes("confirmed")
          ) {
            setHold((prev) => (prev ? { ...prev, status: "CONFIRMED" } : null));
            const alreadyMsg = "This admission hold was already confirmed.";
            setActionSuccess(alreadyMsg);
            toast.info(alreadyMsg);
          } else {
            setActionError(err.message);
            toast.error(err.message);
          }
        } else if (err.status === 403) {
          const authMsg =
            "Unauthorized (403): You do not have permission to confirm this hold. Please ensure you are using the registered student ID.";
          setActionError(authMsg);
          toast.error(authMsg);
        } else if (err.status === 404) {
          const notFoundMsg = "Admission hold not found on the server (404).";
          setActionError(notFoundMsg);
          toast.error(notFoundMsg);
        } else {
          setActionError(err.message);
          toast.error(err.message);
        }
      } else {
        const netMsg =
          err instanceof Error
            ? err.message
            : "A network error occurred while confirming admission. Please try again.";
        setActionError(netMsg);
        toast.error(netMsg);
      }
    } finally {
      setIsConfirming(false);
    }
  };

  // Cancel Admission Hold handler
  const handleExecuteCancellation = async () => {
    if (!holdId || isCancelling || isConfirming) return;

    setIsCancelling(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      // Call actual DELETE endpoint: DELETE /holds/{holdId}
      await holdService.cancelHold(holdId, sessionStudentId ?? undefined);

      // Update the UI after successful response (204 No Content)
      setHold((prev) => (prev ? { ...prev, status: "CANCELLED" } : null));
      const cancelSuccessMsg =
        "Your seat hold has been successfully cancelled and released back to the general quota.";
      setActionSuccess(cancelSuccessMsg);
      toast.info(cancelSuccessMsg);
      setIsCancelModalOpen(false);

      // Requirement 3: Refresh class seat statistics from backend automatically
      if (hold?.classId) {
        classService
          .getClassById(hold.classId)
          .then((updated) => setClassInfo(updated))
          .catch(() => {});
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          const conflictMsg =
            "Conflict (409): This application has already been concluded or confirmed and cannot be cancelled.";
          setActionError(conflictMsg);
          toast.error(conflictMsg);
        } else if (err.status === 403) {
          const forbiddenMsg =
            "Forbidden (403): You are not authorized to cancel this reservation.";
          setActionError(forbiddenMsg);
          toast.error(forbiddenMsg);
        } else if (err.status === 404) {
          const missingMsg = "Reservation not found (404).";
          setActionError(missingMsg);
          toast.error(missingMsg);
        } else {
          setActionError(err.message);
          toast.error(err.message);
        }
      } else {
        const netMsg =
          err instanceof Error
            ? err.message
            : "Failed to cancel hold due to a network connection issue.";
        setActionError(netMsg);
        toast.error(netMsg);
      }
    } finally {
      setIsCancelling(false);
    }
  };

  // Authoritative statuses strictly derived from backend response (never from frontend time alone)
  const isBackendExpired = hold?.status === "EXPIRED";
  const isTimerElapsed = hold?.status === "HELD" && remainingSeconds <= 0;

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
    if (normalized === "EXPIRED") {
      return (
        <span className="badge badge-expired text-sm py-1 px-3">
          <XCircle className="w-4 h-4" />
          <span>Hold Expired</span>
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
    if (normalized === "HELD") {
      if (isTimerElapsed) {
        return (
          <span className="badge badge-held text-sm py-1 px-3">
            <Clock
              className={`w-4 h-4 ${
                isVerifyingWithBackend ? "animate-spin" : "animate-pulse"
              }`}
            />
            <span>
              {isVerifyingWithBackend
                ? "Verifying Status with Server..."
                : "Timer Elapsed (Verifying)"}
            </span>
          </span>
        );
      }
      return (
        <span className="badge badge-held text-sm py-1 px-3">
          <Clock className="w-4 h-4 animate-pulse" />
          <span>Temporary Seat Hold Active</span>
        </span>
      );
    }
    return (
      <span className="badge badge-expired text-sm py-1 px-3">
        <span>{status}</span>
      </span>
    );
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return { local: "—", utc: "—" };
    try {
      const date = new Date(isoString);
      return {
        local: `${date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
        })} at ${date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}`,
        utc: date.toUTCString(),
      };
    } catch {
      return { local: isoString, utc: isoString };
    }
  };

  const expirationDates = formatDateTime(hold?.expiresAt);

  return (
    <div className="portal-container-narrow py-6">
      {/* Top Breadcrumb Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/admission"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary-900 transition-colors focus-ring rounded-lg p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Available Classes</span>
        </Link>

        <Link
          to="/applications"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-600 hover:text-secondary-700 transition-colors focus-ring rounded-lg p-1"
        >
          <FileText className="w-4 h-4" />
          <span>My Applications</span>
        </Link>
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="card p-8 sm:p-12 text-center animate-pulse bg-white">
          <div className="h-8 bg-slate-200 rounded-md w-1/2 mx-auto mb-4" />
          <div className="h-4 bg-slate-100 rounded-md w-1/3 mx-auto mb-8" />
          <div className="h-24 bg-slate-50 rounded-lg w-full mb-6" />
          <div className="h-10 bg-slate-200 rounded-lg w-1/3 mx-auto" />
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="card p-8 sm:p-12 text-center border-red-200 bg-red-50/70 shadow-soft">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="heading-3 text-red-900 mb-2">Application Not Found</h2>
          <p className="body-default text-red-700 max-w-md mx-auto mb-6 leading-relaxed">
            {error}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={fetchHoldDetails}
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

      {/* Populated Hold Details Card */}
      {!isLoading && !error && hold && (
        <div className="card overflow-hidden shadow-soft bg-white">
          {/* Card Header: Class & Status */}
          <div className="card-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/80">
            <div>
              <span className="caption text-slate-500 font-semibold block mb-1">
                Seat Reservation Details
              </span>
              <h1 className="heading-2 text-primary-900">
                {classInfo?.name ?? "Admission Class"}
              </h1>
            </div>

            <div>{getStatusBadge(hold.status)}</div>
          </div>

          <div className="card-body flex flex-col gap-6">
            {/* Feedback Alerts */}
            {actionSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-sm font-medium">{actionSuccess}</div>
              </div>
            )}

            {actionError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-sm font-medium">{actionError}</div>
              </div>
            )}

            {/* Countdown Timer Display (When HELD and active) */}
            {hold.status === "HELD" && !isExpired && (
              <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-amber-700 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">
                      Temporary Reservation Timer
                    </h3>
                    <p className="text-xs text-amber-800 mt-1 max-w-sm leading-relaxed">
                      This seat is temporarily reserved for your student ID.
                      Complete confirmation before the timer expires to secure
                      the seat.
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right shrink-0">
                  <span className="text-[11px] text-amber-700 uppercase tracking-wider block font-bold mb-0.5">
                    Remaining Time
                  </span>
                  <span
                    className={`font-mono text-3xl sm:text-4xl font-extrabold tracking-wider ${
                      remainingSeconds <= 120
                        ? "text-red-600 animate-pulse"
                        : "text-amber-900"
                    }`}
                  >
                    {formattedTime}
                  </span>
                </div>
              </div>
            )}

            {/* Timer Elapsed Notification (Waiting for backend synchronization) */}
            {isTimerElapsed && hold.status === "HELD" && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-spin" />
                <div className="text-xs leading-relaxed">
                  <strong className="font-semibold text-amber-900">
                    Countdown reached zero:
                  </strong>{" "}
                  Verifying current seat hold status with the central admissions
                  registry... Authoritative admission validity is determined by
                  the server.
                </div>
              </div>
            )}

            {/* Authoritative Expired Callout */}
            {isBackendExpired && (
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong className="font-semibold text-slate-900">
                    Hold expired in registry:
                  </strong>{" "}
                  The admissions backend has confirmed that this seat hold has
                  expired. In accordance with the first-come-first-served
                  policy, the seat has been returned to the public quota.
                </div>
              </div>
            )}

            {/* Confirmed Banner */}
            {hold.status === "CONFIRMED" && (
              <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3.5">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-900">
                    Enrollment Confirmed
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                    The seat has been officially finalized in the student
                    registry. Please retain your Application Reference ID for
                    academic communications.
                  </p>
                </div>
              </div>
            )}

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Student Identification */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <IdCard className="w-5 h-5 text-secondary-600 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Student BRN
                  </span>
                  <span className="font-mono text-sm font-bold text-primary-900 mt-1 break-all">
                    {"studentId" in hold && hold.studentId
                      ? hold.studentId
                      : (sessionStudentId ?? "Session Student")}
                  </span>
                </div>
              </div>

              {/* Class Unit Identifier */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-accent-700 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Admission Unit
                  </span>
                  <span className="text-sm font-semibold text-slate-800 mt-1">
                    {classInfo?.name ?? "Designated Grade Unit"}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Class Seat Statistics (Requirement 3: Automatic Seat Availability) */}
            {classInfo && (
              <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Live Class Seat Statistics
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Updated automatically from registry
                  </span>
                </div>
                <SeatAvailability
                  totalSeats={classInfo.totalSeats}
                  heldSeats={classInfo.heldSeats}
                  confirmedSeats={classInfo.confirmedSeats}
                  availableSeats={classInfo.availableSeats}
                />
              </div>
            )}

            {/* Application Specification Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-sm">
              <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200 font-semibold text-xs text-slate-700 uppercase tracking-wider">
                Official Application Record
              </div>

              <div className="divide-y divide-slate-100">
                {/* Hold Reference ID with Copy Button */}
                <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 text-xs">Application ID</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-800 break-all">
                      {hold.holdId}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(hold.holdId)}
                      className="p-1 text-slate-400 hover:text-primary-900 rounded transition-colors focus-ring"
                      title="Copy Application ID"
                      aria-label="Copy Application ID"
                    >
                      {copiedId === hold.holdId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Local Expiration */}
                <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 text-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Expiration (Local)</span>
                  </span>
                  <span className="font-mono text-xs text-slate-800">
                    {expirationDates.local}
                  </span>
                </div>

                {/* UTC Expiration */}
                <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 text-xs">
                    Expiration (UTC)
                  </span>
                  <span className="font-mono text-xs text-slate-600">
                    {expirationDates.utc}
                  </span>
                </div>

                {/* Class ID Reference */}
                <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 text-xs">Class ID</span>
                  <span className="font-mono text-xs text-slate-600 break-all">
                    {hold.classId}
                  </span>
                </div>
              </div>
            </div>

            {/* Advisory Info Note */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-secondary-600 shrink-0 mt-0.5" />
              <span>
                Final seat verification and validation decisions are executed by
                the backend registry upon confirmation. Frontend countdown
                timers provide local estimation.
              </span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="card-footer flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80">
            {isBackendExpired ? (
              <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3">
                <Link
                  to="/admission"
                  className="btn btn-outline btn-md w-full sm:w-auto"
                >
                  Browse Available Classes
                </Link>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                  <Link
                    to="/applications"
                    className="btn btn-outline btn-md w-full sm:w-auto"
                  >
                    View All My Applications
                  </Link>

                  <button
                    type="button"
                    disabled
                    className="btn btn-secondary btn-md w-full sm:w-auto justify-center opacity-50 cursor-not-allowed"
                    aria-disabled="true"
                    title="The admissions registry has reported this hold as expired."
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Admission (Expired)</span>
                  </button>
                </div>
              </div>
            ) : hold.status === "HELD" ? (
              <>
                <button
                  type="button"
                  disabled={
                    isCancelling || isConfirming || isVerifyingWithBackend
                  }
                  onClick={() => setIsCancelModalOpen(true)}
                  className="btn btn-outline btn-md w-full sm:w-auto text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  {isCancelling ? "Cancelling..." : "বাতিল করুন (Cancel Hold)"}
                </button>

                <button
                  type="button"
                  disabled={
                    isConfirming || isCancelling || isVerifyingWithBackend
                  }
                  onClick={handleConfirmAdmission}
                  className="btn btn-secondary btn-md w-full sm:w-auto justify-center"
                >
                  {isConfirming ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Confirming Admission...</span>
                    </span>
                  ) : isVerifyingWithBackend ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying with Server...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ভর্তি ফি দিন</span>
                    </span>
                  )}
                </button>
              </>
            ) : (
              <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3">
                <Link
                  to="/admission"
                  className="btn btn-outline btn-md w-full sm:w-auto"
                >
                  Browse Available Classes
                </Link>

                <Link
                  to="/applications"
                  className="btn btn-secondary btn-md w-full sm:w-auto"
                >
                  View All My Applications
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Hold Cancellation */}
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        title="Cancel Seat Hold?"
        message="Are you sure you want to cancel this temporary seat hold? This action will immediately release the seat back to the public quota for other students. This action cannot be undone."
        confirmLabel="Yes, Cancel Seat Hold"
        cancelLabel="Keep Reservation"
        variant="danger"
        isLoading={isCancelling}
        onConfirm={handleExecuteCancellation}
        onCancel={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
};
