/**
 * Exact data contract matching backend SchoolAdmission.Application.DTOs.Classes.ClassResponse
 */
export interface ClassResponse {
  id: string; // Guid
  name: string;
  totalSeats: number;
  heldSeats: number;
  confirmedSeats: number;
  availableSeats: number;
  isActive?: boolean;
}

export interface CreateClassRequest {
  name: string;
  totalSeats: number;
}
