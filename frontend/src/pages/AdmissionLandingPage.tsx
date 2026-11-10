import { useState } from "react";
import {
  HeroSection,
  AdmissionInfoSection,
  AdmissionStepsSection,
  AvailableClassesSection,
  ContactHelpSection,
} from "../components/admission";
import { StudentIdForm } from "../components/applications";
import { useStudentId } from "../hooks/useStudentId";

export const AdmissionLandingPage = () => {
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);
  const { studentId } = useStudentId();

  const handleApplyClick = () => {
    if (!studentId) {
      setIsIdModalOpen(true);
      return;
    }

    const element = document.getElementById("available-classes");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectClass = () => {
    if (!studentId) {
      setIsIdModalOpen(true);
      return;
    }
  };

  return (
    <div className="flex flex-col -mx-4 sm:-mx-6 lg:-mx-8 -my-8 sm:-my-12">
      <HeroSection onApplyClick={handleApplyClick} />
      <AdmissionInfoSection />
      <AdmissionStepsSection />
      <AvailableClassesSection
        classes={[]}
        isLoading={false}
        onSelectClass={handleSelectClass}
      />
      <ContactHelpSection />

      {/* Identification Dialog Modal */}
      {isIdModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-label="Student Identification"
        >
          <div className="w-full max-w-xl relative">
            <StudentIdForm
              onSuccess={() => setIsIdModalOpen(false)}
              onCancel={() => setIsIdModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
