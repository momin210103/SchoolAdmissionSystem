import { useState, useId, type ChangeEvent, type FormEvent } from "react";
import {
  IdCard,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  X,
  Edit2,
} from "lucide-react";
import {
  BIRTH_REGISTRATION_NUMBER_LENGTH,
  sanitizeBirthRegistrationNumber,
  validateBirthRegistrationNumber,
} from "../../utils/validation";
import { useStudentId } from "../../hooks/useStudentId";

export interface StudentIdFormProps {
  initialValue?: string;
  onSuccess?: (studentId: string) => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
  showCancelButton?: boolean;
  className?: string;
}

export const StudentIdForm = ({
  initialValue,
  onSuccess,
  onCancel,
  title = "Student Identification",
  subtitle = "Enter the student's 17-digit national Birth Registration Number to begin or resume your admission session.",
  showCancelButton = true,
  className = "",
}: StudentIdFormProps) => {
  const inputId = useId();
  const errorId = useId();
  const helpId = useId();

  const { studentId: storedId, saveStudentId, clearStudentId } = useStudentId();

  // Initialize input from initialValue, or storedId, or empty
  const [value, setValue] = useState<string>(() => {
    return initialValue ?? storedId ?? "";
  });

  const [isTouched, setIsTouched] = useState<boolean>(false);
  const [isEditingExisting, setIsEditingExisting] = useState<boolean>(
    !storedId || Boolean(initialValue)
  );

  const validation = validateBirthRegistrationNumber(value);
  const hasError = isTouched && !validation.isValid;
  const isComplete = value.length === BIRTH_REGISTRATION_NUMBER_LENGTH && validation.isValid;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Only accept numeric digits, clamp to max 17 digits
    const cleanDigits = sanitizeBirthRegistrationNumber(e.target.value);
    setValue(cleanDigits);
    if (!isTouched) setIsTouched(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsTouched(true);

    if (!validation.isValid) {
      return;
    }

    const saved = saveStudentId(value);
    if (saved) {
      setIsEditingExisting(false);
      onSuccess?.(value);
    }
  };

  const handleStartEditing = () => {
    setIsEditingExisting(true);
    setIsTouched(false);
  };

  const handleClearId = () => {
    clearStudentId();
    setValue("");
    setIsTouched(false);
    setIsEditingExisting(true);
  };

  return (
    <div
      className={`card p-6 sm:p-8 bg-white border-slate-200/90 shadow-soft max-w-xl mx-auto ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3.5 mb-6">
        <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center border border-primary-100 shrink-0">
          <IdCard className="w-6 h-6 text-secondary-600" />
        </div>
        <div>
          <h2 className="heading-3 text-primary-900">{title}</h2>
          <p className="body-small text-slate-600 mt-1 leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Active Session Card (When ID is already saved and not in edit mode) */}
      {!isEditingExisting && storedId && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="caption text-slate-500 font-semibold">
              Active Student Session
            </span>
            <span className="badge badge-confirmed">Recorded in Session</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-base font-bold text-primary-900 tracking-wider">
              {storedId}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartEditing}
                className="btn btn-outline btn-sm inline-flex items-center gap-1.5"
                title="Change Birth Registration Number"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Change ID</span>
              </button>

              <button
                type="button"
                onClick={handleClearId}
                className="btn btn-ghost btn-sm text-slate-500 hover:text-red-600"
                title="Remove ID from this browser"
              >
                Clear
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-normal">
            This registration number is attached to your temporary seat holds
            and admission requests for this browser session.
          </p>

          <div className="pt-2 border-t border-slate-200/60 flex justify-end">
            <button
              type="button"
              onClick={() => onSuccess?.(storedId)}
              className="btn btn-secondary btn-md inline-flex items-center gap-2"
            >
              <span>Continue with this ID</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input Form (When entering new ID or modifying existing) */}
      {isEditingExisting && (
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor={inputId}
                className="form-label form-label-required"
              >
                17-Digit Birth Registration Number
              </label>

              {/* Real-time Digit Counter */}
              <span
                className={`text-xs font-mono font-medium ${
                  value.length === BIRTH_REGISTRATION_NUMBER_LENGTH
                    ? "text-emerald-600 font-bold"
                    : "text-slate-500"
                }`}
                aria-live="polite"
              >
                {value.length} / {BIRTH_REGISTRATION_NUMBER_LENGTH} digits
              </span>
            </div>

            <div className="relative">
              <input
                id={inputId}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                pattern="[0-9]*"
                maxLength={BIRTH_REGISTRATION_NUMBER_LENGTH}
                value={value}
                onChange={handleInputChange}
                onBlur={() => setIsTouched(true)}
                placeholder="e.g. 20081234567890123"
                className={`input-field font-mono tracking-wider text-base sm:text-lg ${
                  hasError ? "input-error" : isComplete ? "border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500/15" : ""
                }`}
                aria-invalid={hasError}
                aria-describedby={`${errorId} ${helpId}`}
              />

              {isComplete && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Inline Error Message */}
            {hasError && (
              <div
                id={errorId}
                className="flex items-center gap-1.5 form-error mt-1.5 text-xs"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{validation.error}</span>
              </div>
            )}

            {/* Inline Format Notice (Format check only, not backend claim) */}
            {isComplete && !hasError && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium mt-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Format valid (17 digits). Official eligibility will be verified by the registry upon submission.</span>
              </div>
            )}
          </div>

          {/* Instructions Box */}
          <div
            id={helpId}
            className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 mb-6 flex flex-col gap-2.5 text-xs text-slate-600"
          >
            <div className="flex items-center gap-2 font-semibold text-primary-900">
              <HelpCircle className="w-4 h-4 text-secondary-600 shrink-0" />
              <span>Instructions for Registration Number</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 leading-relaxed">
              <li>
                Located on the student's official national Birth Registration Certificate.
              </li>
              <li>
                Must consist strictly of 17 numeric digits (numbers 0–9 only).
              </li>
              <li>
                Do not include hyphens, spaces, or letters.
              </li>
            </ul>
          </div>

          {/* Security & Verification Disclaimer */}
          <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200/70 mb-6 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Security & Ownership Note:</strong>{" "}
              Entering this number registers your local admission session. The school admissions backend remains solely responsible for validating official student identity and quota eligibility upon application submission.
            </div>
          </div>

          {/* Form Actions: Continue and Cancel */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
            {showCancelButton && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-outline btn-md w-full sm:w-auto"
              >
                <X className="w-4 h-4 mr-1" />
                <span>Cancel</span>
              </button>
            )}

            <button
              type="submit"
              disabled={!validation.isValid}
              className="btn btn-secondary btn-md w-full sm:w-auto justify-center"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
