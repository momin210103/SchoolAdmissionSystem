import api, { handleAxiosError } from "./api";
import type {
  CreateHoldResponse,
  HoldResponse,
  HoldConfirmResponse,
  MyHoldResponse,
} from "../types/hold";

export const holdService = {
  /**
   * Reserves a temporary seat hold for a student in a specific admission class.
   * POST /classes/{classId}/holds
   * Header: X-Student-Id
   */
  async createHold(
    classId: string,
    studentId?: string
  ): Promise<CreateHoldResponse> {
    try {
      const headers = studentId ? { "X-Student-Id": studentId } : undefined;
      const response = await api.post<CreateHoldResponse>(
        `/classes/${classId}/holds`,
        {},
        { headers }
      );
      return response.data;
    } catch (error) {
      return handleAxiosError(
        error,
        "Failed to place a temporary seat reservation."
      );
    }
  },

  /**
   * Retrieves current status and expiration countdown for a specific hold.
   * GET /holds/{holdId}
   */
  async getHoldById(holdId: string): Promise<HoldResponse> {
    try {
      const response = await api.get<HoldResponse>(`/holds/${holdId}`);
      return response.data;
    } catch (error) {
      return handleAxiosError(
        error,
        `Failed to retrieve hold details for ${holdId}.`
      );
    }
  },

  /**
   * Confirms and finalizes an active, unexpired seat hold.
   * POST /holds/{holdId}/confirm
   * Header: X-Student-Id
   */
  async confirmHold(
    holdId: string,
    studentId?: string
  ): Promise<HoldConfirmResponse> {
    try {
      const headers = studentId ? { "X-Student-Id": studentId } : undefined;
      const response = await api.post<HoldConfirmResponse>(
        `/holds/${holdId}/confirm`,
        {},
        { headers }
      );
      return response.data;
    } catch (error) {
      return handleAxiosError(
        error,
        "Failed to confirm admission hold."
      );
    }
  },

  /**
   * Cancels a currently held seat and releases it back to the general quota.
   * DELETE /holds/{holdId}
   * Header: X-Student-Id
   */
  async cancelHold(holdId: string, studentId?: string): Promise<void> {
    try {
      const headers = studentId ? { "X-Student-Id": studentId } : undefined;
      await api.delete(`/holds/${holdId}`, { headers });
    } catch (error) {
      return handleAxiosError(
        error,
        "Failed to cancel seat hold."
      );
    }
  },

  /**
   * Fetches all admission holds associated with the active student ID.
   * GET /me/holds
   * Header: X-Student-Id
   */
  async getMyHolds(studentId?: string): Promise<MyHoldResponse[]> {
    try {
      const headers = studentId ? { "X-Student-Id": studentId } : undefined;
      const response = await api.get<MyHoldResponse[]>("/me/holds", {
        headers,
      });
      return response.data;
    } catch (error) {
      return handleAxiosError(
        error,
        "Failed to retrieve your admission holds."
      );
    }
  },
};

export default holdService;
