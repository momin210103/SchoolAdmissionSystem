import api, { handleAxiosError } from "./api";
import type { ClassResponse } from "../types/class";

export const classService = {
  /**
   * Fetches all available admission classes and seat quotas.
   * GET /classes
   */
  async getClasses(): Promise<ClassResponse[]> {
    try {
      const response = await api.get<ClassResponse[]>("/classes");
      return response.data;
    } catch (error) {
      return handleAxiosError(error, "Failed to fetch admission classes.");
    }
  },

  /**
   * Fetches an individual class by its unique identifier.
   * GET /classes/{classId}
   */
  async getClassById(classId: string): Promise<ClassResponse> {
    try {
      const response = await api.get<ClassResponse>(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      return handleAxiosError(
        error,
        `Failed to fetch details for class ${classId}.`
      );
    }
  },
};

export default classService;
