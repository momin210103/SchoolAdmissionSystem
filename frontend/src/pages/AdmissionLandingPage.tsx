import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HeroSection,
  AdmissionInfoSection,
  AdmissionStepsSection,
  AvailableClassesSection,
  ContactHelpSection,
} from "../components/admission";
import { StudentIdForm } from "../components/applications";
import { useStudentId } from "../hooks/useStudentId";
import { useToast } from "../hooks/useToast";
import { classService } from "../services/classService";
import { holdService } from "../services/holdService";
import { ApiError } from "../services/api";
import type { ClassResponse } from "../types/class";
import type { SubmissionErrorDetail } from "../types/admission";

export const AdmissionLandingPage = () => {
  const navigate = useNavigate();
  const { studentId } = useStudentId();
  const toast = useToast();

  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState<boolean>(true);
  const [classError, setClassError] = useState<string | null>(null);

  // Workflow states
  const [submittingClassId, setSubmittingClassId] = useState<string | null>(null);
  const [pendingClassId, setPendingClassId] = useState<string | null>(null);
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);
  const [submissionError, setSubmissionError] = useState<SubmissionErrorDetail | null>(null);

  const fetchClasses = () => {
    setIsLoadingClasses(true);
    setClassError(null);
    classService
      .getClasses()
      .then((data) => {
        setClasses(data);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to connect to the admission service. Please verify server connectivity.";
        setClassError(message);
      })
      .finally(() => {
        setIsLoadingClasses(false);
      });
  };

  useEffect(() => {
    let isCancelled = false;

    classService
      .getClasses()
      .then((data) => {
        if (!isCancelled) {
          setClasses(data);
          setIsLoadingClasses(false);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to connect to the admission service. Please verify server connectivity.";
          setClassError(message);
          setIsLoadingClasses(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Core hold submission workflow communicating directly with the backend
  const executeHoldSubmission = async (targetClassId: string, targetStudentId: string) => {
    if (submittingClassId) return;

    setSubmittingClassId(targetClassId);
    setSubmissionError(null);

    try {
      // Backend is the source of truth - POST /classes/{classId}/holds
      const holdResult = await holdService.createHold(targetClassId, targetStudentId);

      // Automatically refresh the corresponding class data and update heldSeats/availableSeats immediately
      try {
        const updatedClass = await classService.getClassById(targetClassId);
        setClasses((prev) =>
          prev.map((c) => (c.id === targetClassId ? updatedClass : c))
        );
      } catch {
        // Fallback update in state if getClassById encountered network hiccup
        setClasses((prev) =>
          prev.map((c) =>
            c.id === targetClassId
              ? {
                  ...c,
                  heldSeats: c.heldSeats + 1,
                  availableSeats: Math.max(0, c.availableSeats - 1),
                }
              : c
          )
        );
      }

      // On successful hold creation: navigate to application details page
      navigate(`/applications/${holdResult.holdId}`, {
        state: { hold: holdResult },
      });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        toast.error(err.message || "Failed to create admission hold.");
        const status = err.status;
        const msg = (err.message || "").toLowerCase();

        if (status === 409) {
          if (msg.includes("active application") || msg.includes("already have")) {
            setSubmissionError({
              title: "Existing Active Application",
              message:
                "You already have an active seat hold or confirmed application for this class.",
              action: {
                label: "View My Applications",
                onClick: () => navigate("/applications"),
              },
            });
          } else if (msg.includes("no seats") || msg.includes("seat")) {
            setSubmissionError({
              title: "No Available Seats",
              message:
                "All seats for this class have been reserved or confirmed. Please select another grade.",
            });
            fetchClasses();
          } else {
            setSubmissionError({
              title: "Reservation Conflict",
              message: err.message,
            });
            fetchClasses();
          }
        } else if (status === 400) {
          setSubmissionError({
            title: "Invalid Student Identification",
            message:
              err.message ||
              "X-Student-Id must contain exactly 17 digits. Please update your registration number.",
            action: {
              label: "Update Student ID",
              onClick: () => {
                setPendingClassId(targetClassId);
                setIsIdModalOpen(true);
              },
            },
          });
        } else if (status === 404) {
          setSubmissionError({
            title: "Class Not Found",
            message:
              "The requested admission class was not found on the server. The class list has been updated.",
          });
          fetchClasses();
        } else {
          setSubmissionError({
            title: "Application Error",
            message: err.message,
          });
        }
      } else {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Unable to connect to the admission server. Please check your internet connection.";
        toast.error(errorMsg);
        setSubmissionError({
          title: "Network / Connection Error",
          message: errorMsg,
        });
      }
    } finally {
      setSubmittingClassId(null);
      setPendingClassId(null);
    }
  };

  // Step 1 & 2: Student selects a class -> Check if Student ID exists
  const handleSelectClass = (classId: string) => {
    // Prevent duplicate button submissions
    if (submittingClassId) return;

    setSubmissionError(null);

    // If Student ID is missing or not 17 digits, open StudentIdForm
    if (!studentId || studentId.trim().length !== 17) {
      setPendingClassId(classId);
      setIsIdModalOpen(true);
      return;
    }

    // Step 4 & 5: Student ID exists -> Submit POST /classes/{classId}/holds
    executeHoldSubmission(classId, studentId);
  };

  // Called when student enters their ID through StudentIdForm
  const handleStudentIdSuccess = (confirmedId: string) => {
    setIsIdModalOpen(false);

    // If a class selection was pending, resume hold creation automatically
    if (pendingClassId) {
      executeHoldSubmission(pendingClassId, confirmedId);
    }
  };

  // Close identification modal on Escape key press
  useEffect(() => {
    if (!isIdModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsIdModalOpen(false);
        setPendingClassId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isIdModalOpen]);

  const handleApplyHeroClick = () => {
    const element = document.getElementById("available-classes");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col">
      <HeroSection onApplyClick={handleApplyHeroClick} />
      <AdmissionInfoSection />
      <AdmissionStepsSection />
      <AvailableClassesSection
        classes={classes}
        isLoading={isLoadingClasses}
        error={classError}
        onSelectClass={handleSelectClass}
        onRefresh={fetchClasses}
        submittingClassId={submittingClassId}
        submissionError={submissionError}
        onClearSubmissionError={() => setSubmissionError(null)}
      />
      <ContactHelpSection />

      {/* Identification Dialog Modal */}
      {isIdModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-label="Student Identification"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsIdModalOpen(false);
              setPendingClassId(null);
            }
          }}
        >
          <div className="w-full max-w-xl relative">
            <StudentIdForm
              onSuccess={handleStudentIdSuccess}
              onCancel={() => {
                setIsIdModalOpen(false);
                setPendingClassId(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
