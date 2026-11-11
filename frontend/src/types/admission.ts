import type { ClassResponse } from "./class";

export interface AdmissionClassUnit extends ClassResponse {
  shift?: string;
  isActive?: boolean;
}

export type AdmissionClassItem = AdmissionClassUnit;

export interface SubmissionErrorDetail {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface AvailableClassesSectionProps {
  classes?: ClassResponse[];
  isLoading?: boolean;
  error?: string | null;
  onSelectClass?: (classId: string) => void;
  onRefresh?: () => void;
  submittingClassId?: string | null;
  submissionError?: SubmissionErrorDetail | null;
  onClearSubmissionError?: () => void;
}
