import api, { handleAxiosError } from "./api";
import type { ClassResponse, CreateClassRequest } from "../types/class";

export const classService = {
  /**
   * Creates a new admission class with the specified seat capacity.
   * POST /classes
   */
  async createClass(request: CreateClassRequest): Promise<ClassResponse> {
    try {
      const response = await api.post<ClassResponse>("/classes", {
        name: request.name.trim(),
        totalSeats: request.totalSeats,
      });
      return response.data;
    } catch (error) {
      return handleAxiosError(error, "Failed to create class.");
    }
  },

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
