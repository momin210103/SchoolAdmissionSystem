/**
 * Exact HoldStatus enum matching backend SchoolAdmission.Domain.HoldStatus
 */
export type HoldStatus = "HELD" | "CONFIRMED" | "EXPIRED" | "CANCELLED";

/**
 * Exact data contract matching backend SchoolAdmission.Application.DTOs.Holds.CreateHoldResponse
 */
export interface CreateHoldResponse {
  holdId: string;
  classId: string;
  studentId: string;
  status: HoldStatus | string;
  expiresAt: string; // ISO 8601 UTC timestamp
}

/**
 * Exact data contract matching backend SchoolAdmission.Application.DTOs.Holds.HoldResponse
 */
export interface HoldResponse {
  holdId: string;
  classId: string;
  status: HoldStatus | string;
  expiresAt: string;
}

/**
 * Exact data contract matching backend SchoolAdmission.Application.DTOs.Holds.HoldConfirmResponse
 */
export interface HoldConfirmResponse {
  holdId: string;
  status: HoldStatus | string;
}

/**
 * Exact data contract matching backend SchoolAdmission.Application.DTOs.Holds.MyHoldResponse
 */
export interface MyHoldResponse {
  holdId: string;
  classId: string;
  className: string;
  status: HoldStatus | string;
  expiresAt: string;
}
