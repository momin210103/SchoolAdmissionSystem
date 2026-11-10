export interface AdmissionClassUnit {
  id: string;
  name: string;
  shift?: string;
  totalSeats: number;
  heldSeats: number;
  confirmedSeats: number;
  availableSeats: number;
  isActive: boolean;
}

export type AdmissionClassItem = AdmissionClassUnit;

export interface AvailableClassesSectionProps {
  classes?: AdmissionClassUnit[];
  isLoading?: boolean;
  error?: string | null;
  onSelectClass?: (classId: string) => void;
}
