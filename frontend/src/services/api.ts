import axios, { AxiosError } from "axios";

const baseURL = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL !== "http://localhost:8080"
      ? import.meta.env.VITE_API_BASE_URL
      : "/api")
  : (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080");

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const studentId = localStorage.getItem("studentId");

  if (studentId && !config.headers["X-Student-Id"]) {
    config.headers["X-Student-Id"] = studentId;
  }

  return config;
});

export interface ApiErrorData {
  message?: string;
  title?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  public status?: number;
  public data?: ApiErrorData;

  constructor(message: string, status?: number, data?: ApiErrorData) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Normalizes Axios errors, extracting backend messages for 400, 403, 404, 409
 */
export function handleAxiosError(
  error: unknown,
  defaultMessage = "An unexpected error occurred."
): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorData>;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    let message = data?.message || data?.title;

    if (!status || axiosError.code === "ERR_NETWORK") {
      message =
        "Network Error: Unable to reach the admission server. Please check your internet connection or ensure the service is running.";
    } else if (!message) {
      switch (status) {
        case 400:
          message =
            "Bad Request: Invalid student ID or request parameters.";
          break;
        case 403:
          message =
            "Forbidden: You do not have permission to access or modify this reservation.";
          break;
        case 404:
          message = "Not Found: The requested class or hold was not found.";
          break;
        case 409:
          message =
            "Conflict: No seats available, hold has expired, or an active hold already exists.";
          break;
        case 500:
          message =
            "Server Error: The admissions server encountered an error. Please try again shortly.";
          break;
        default:
          message = axiosError.message || defaultMessage;
      }
    }

    throw new ApiError(message, status, data);
  }

  if (error instanceof Error) {
    throw new ApiError(error.message);
  }

  throw new ApiError(defaultMessage);
}

export default api;
