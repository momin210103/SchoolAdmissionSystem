import { useState, useId, type FormEvent, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import {
  School,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Users,
  Check,
  Copy,
} from "lucide-react";
import { classService } from "../services/classService";
import { ApiError } from "../services/api";
import { useToast } from "../hooks/useToast";
import type { ClassResponse } from "../types/class";

interface FormState {
  name: string;
  totalSeats: string;
}

interface FormErrors {
  name?: string;
  totalSeats?: string;
}

export const CreateClassPage = () => {
  const toast = useToast();

  const nameInputId = useId();
  const seatsInputId = useId();
  const nameErrorId = useId();
  const seatsErrorId = useId();

  const [formState, setFormState] = useState<FormState>({
    name: "",
    totalSeats: "",
  });

  const [touched, setTouched] = useState<{ name: boolean; totalSeats: boolean }>({
    name: false,
    totalSeats: false,
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [createdClass, setCreatedClass] = useState<ClassResponse | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Client-side validation logic
  const validate = (state: FormState): FormErrors => {
    const errors: FormErrors = {};
    const trimmedName = state.name.trim();

    if (!trimmedName) {
      errors.name = "Class name is required.";
    } else if (trimmedName.length < 3) {
      errors.name = "Class name must be at least 3 characters long.";
    } else if (trimmedName.length > 100) {
      errors.name = "Class name cannot exceed 100 characters.";
    }

    const seatsStr = state.totalSeats.trim();
    if (!seatsStr) {
      errors.totalSeats = "Total seat capacity is required.";
    } else if (seatsStr.includes(".")) {
      errors.totalSeats = "Total seats must be a whole integer (decimals not allowed).";
    } else {
      const seatsNum = Number(seatsStr);
      if (Number.isNaN(seatsNum) || !Number.isInteger(seatsNum) || seatsNum < 1) {
        errors.totalSeats = "Total seats must be a positive integer of at least 1.";
      } else if (seatsNum > 10000) {
        errors.totalSeats = "Total seats cannot exceed 10,000 for a single intake unit.";
      }
    }

    return errors;
  };

  const errors = validate(formState);
  const isFormValid = Object.keys(errors).length === 0;

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, name: e.target.value }));
    if (!touched.name) setTouched((prev) => ({ ...prev, name: true }));
    setSubmissionError(null);
  };

  const handleSeatsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, totalSeats: e.target.value }));
    if (!touched.totalSeats) setTouched((prev) => ({ ...prev, totalSeats: true }));
    setSubmissionError(null);
  };

  const handleReset = () => {
    setFormState({ name: "", totalSeats: "" });
    setTouched({ name: false, totalSeats: false });
    setSubmissionError(null);
    setCreatedClass(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, totalSeats: true });

    if (!isFormValid || isSubmitting) {
      return;
    }

    const trimmedName = formState.name.trim();
    const parsedSeats = parseInt(formState.totalSeats.trim(), 10);

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // POST /classes
      const result = await classService.createClass({
        name: trimmedName,
        totalSeats: parsedSeats,
      });

      setCreatedClass(result);
      toast.success(`Class "${result.name}" was successfully created!`);

      // Clear the form fields upon successful creation
      setFormState({ name: "", totalSeats: "" });
      setTouched({ name: false, totalSeats: false });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const status = err.status;
        const msg = (err.message || "").toLowerCase();

        if (status === 409 || msg.includes("already exists") || msg.includes("duplicate")) {
          const conflictMsg =
            "A class with this name already exists. Please choose a distinct name or specify a unique session/shift.";
          setSubmissionError(conflictMsg);
          toast.error(conflictMsg);
        } else if (status === 400) {
          const validationMsg =
            err.message || "Invalid class parameters. Please check the name and seat capacity.";
          setSubmissionError(validationMsg);
          toast.error(validationMsg);
        } else if (status === 500) {
          const serverMsg =
            "The admissions server encountered an internal error. Please try again shortly.";
          setSubmissionError(serverMsg);
          toast.error(serverMsg);
        } else {
          setSubmissionError(err.message);
          toast.error(err.message);
        }
      } else {
        const netMsg =
          err instanceof Error
            ? err.message
            : "Network Error: Unable to reach the admission server. Please check your connection.";
        setSubmissionError(netMsg);
        toast.error(netMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyClassId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success("Class ID copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="portal-container-narrow py-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-8">
        <span className="caption text-secondary-600 font-semibold block mb-1">
          Academic Administration
        </span>
        <h1 className="heading-1 text-primary-900">Create New Class</h1>
        <p className="body-default text-slate-600 mt-2 max-w-2xl">
          Create a new class or shift and configure its admission seat capacity.
        </p>
      </div>

      {/* Success Summary Banner (When a class has just been created) */}
      {createdClass && (
        <div
          className="card p-6 sm:p-8 bg-emerald-50/60 border-emerald-200 mb-8 shadow-soft animate-in fade-in slide-in-from-top-3 duration-200"
          role="region"
          aria-label="Created Class Summary"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <span className="caption text-emerald-800 font-bold block mb-0.5">
                  Class Created Successfully
                </span>
                <h2 className="heading-3 text-emerald-950 font-bold">
                  {createdClass.name}
                </h2>
                <p className="text-xs text-emerald-700 mt-1">
                  This academic intake unit has been configured and is now ready for admissions.
                </p>
              </div>
            </div>

            <span className="badge badge-confirmed shrink-0">
              Live in System
            </span>
          </div>

          {/* Seat Capacity Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-200/80">
            <div className="bg-white/90 p-3.5 rounded-lg border border-emerald-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Seats
              </span>
              <span className="font-mono text-lg font-bold text-primary-900">
                {createdClass.totalSeats}
              </span>
            </div>

            <div className="bg-white/90 p-3.5 rounded-lg border border-emerald-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Available
              </span>
              <span className="font-mono text-lg font-bold text-emerald-700">
                {createdClass.availableSeats ?? createdClass.totalSeats}
              </span>
            </div>

            <div className="bg-white/90 p-3.5 rounded-lg border border-emerald-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Held Seats
              </span>
              <span className="font-mono text-lg font-bold text-amber-700">
                {createdClass.heldSeats ?? 0}
              </span>
            </div>

            <div className="bg-white/90 p-3.5 rounded-lg border border-emerald-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Confirmed
              </span>
              <span className="font-mono text-lg font-bold text-primary-800">
                {createdClass.confirmedSeats ?? 0}
              </span>
            </div>
          </div>

          {/* Class ID Reference Row */}
          <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <span className="text-emerald-700 font-medium">Class Identifier:</span>
              <span className="font-mono font-semibold">{createdClass.id}</span>
            </div>

            <button
              type="button"
              onClick={() => copyClassId(createdClass.id)}
              className="inline-flex items-center gap-1 font-medium text-emerald-800 hover:text-emerald-950 transition-colors p-1 rounded"
              title="Copy Class ID"
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Action Navigation */}
          <div className="mt-6 pt-4 border-t border-emerald-200/80 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCreatedClass(null)}
              className="btn btn-outline btn-sm bg-white border-emerald-300 text-emerald-900 hover:bg-emerald-50"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1" />
              <span>Create Another Class</span>
            </button>

            <Link
              to="/admission"
              className="btn btn-secondary btn-sm inline-flex items-center gap-1.5"
            >
              <span>View on Admission Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="card p-6 sm:p-8 bg-white border-slate-200/90 shadow-soft">
        <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center border border-primary-100 shrink-0">
            <School className="w-5 h-5 text-secondary-600" />
          </div>
          <div>
            <h2 className="heading-3 text-primary-900">Class Specification Form</h2>
            <p className="body-small text-slate-500">
              Provide the grade designation and maximum student quota.
            </p>
          </div>
        </div>

        {/* Server / Network Error Banner */}
        {submissionError && (
          <div
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 shadow-xs animate-in fade-in duration-150"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-900">Class Creation Failed</h3>
              <p className="text-sm text-red-700 mt-0.5 leading-relaxed">
                {submissionError}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Field 1: Class Name */}
          <div className="form-group mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor={nameInputId}
                className="form-label form-label-required"
              >
                Class Name
              </label>

              <span className="text-xs text-slate-400 font-mono">
                {formState.name.trim().length} / 100
              </span>
            </div>

            <div className="relative">
              <input
                id={nameInputId}
                type="text"
                autoComplete="off"
                value={formState.name}
                onChange={handleNameChange}
                onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                placeholder="e.g. Class 6 - Morning Shift"
                className={`input-field ${
                  touched.name && errors.name
                    ? "input-error"
                    : touched.name && !errors.name && formState.name.trim()
                      ? "border-emerald-500 focus:border-emerald-600"
                      : ""
                }`}
                aria-invalid={Boolean(touched.name && errors.name)}
                aria-describedby={touched.name && errors.name ? nameErrorId : undefined}
                disabled={isSubmitting}
                maxLength={100}
              />

              {touched.name && !errors.name && formState.name.trim() && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            {touched.name && errors.name ? (
              <div
                id={nameErrorId}
                className="flex items-center gap-1.5 form-error mt-1.5"
                role="alert"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.name}</span>
              </div>
            ) : (
              <span className="form-helper mt-1 text-slate-500">
                Include grade level and shift or session (e.g. "Class 8 - Day Shift").
              </span>
            )}
          </div>

          {/* Field 2: Total Seats */}
          <div className="form-group mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor={seatsInputId}
                className="form-label form-label-required"
              >
                Total Seats
              </label>

              <span className="text-xs text-slate-400">
                Min: 1 seat
              </span>
            </div>

            <div className="relative">
              <input
                id={seatsInputId}
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={formState.totalSeats}
                onChange={handleSeatsChange}
                onBlur={() => setTouched((prev) => ({ ...prev, totalSeats: true }))}
                placeholder="e.g. 120"
                className={`input-field font-mono ${
                  touched.totalSeats && errors.totalSeats
                    ? "input-error"
                    : touched.totalSeats && !errors.totalSeats && formState.totalSeats.trim()
                      ? "border-emerald-500 focus:border-emerald-600"
                      : ""
                }`}
                aria-invalid={Boolean(touched.totalSeats && errors.totalSeats)}
                aria-describedby={touched.totalSeats && errors.totalSeats ? seatsErrorId : undefined}
                disabled={isSubmitting}
              />

              {touched.totalSeats && !errors.totalSeats && formState.totalSeats.trim() && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            {touched.totalSeats && errors.totalSeats ? (
              <div
                id={seatsErrorId}
                className="flex items-center gap-1.5 form-error mt-1.5"
                role="alert"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.totalSeats}</span>
              </div>
            ) : (
              <span className="form-helper mt-1 text-slate-500">
                Total admission seats designated for this class session.
              </span>
            )}
          </div>

          {/* Capacity Advisory Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-6 flex items-start gap-3 text-xs text-slate-600">
            <Users className="w-4 h-4 text-secondary-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-primary-900 block mb-0.5">
                Admission Allocation Notice
              </strong>
              <span>
                Once published, available seats will be locked temporarily when students initiate holds, and finalized upon confirmation.
              </span>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting || (!formState.name && !formState.totalSeats)}
              className="btn btn-outline btn-md w-full sm:w-auto inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Form</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting || (Boolean(touched.name || touched.totalSeats) && !isFormValid)}
              className="btn btn-secondary btn-md w-full sm:w-auto justify-center inline-flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Class...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Class</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Helpful Guidelines Card */}
      <div className="mt-8 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-secondary-600" />
          <span>Class Setup Guidelines</span>
        </h3>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
          <li>
            Class names should be descriptive and include both the academic grade and the specific section or shift (e.g. <em>Class 9 - Science - Morning</em>).
          </li>
          <li>
            Total seat count must reflect the certified intake quota approved by the academic governing body.
          </li>
          <li>
            After creation, the class is immediately visible to prospective students on the <Link to="/admission" className="text-secondary-600 hover:underline font-medium">Admission Portal</Link>.
          </li>
        </ul>
      </div>
    </div>
  );
};
