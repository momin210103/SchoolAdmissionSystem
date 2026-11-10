import { useSyncExternalStore, useCallback } from "react";
import {
  sanitizeBirthRegistrationNumber,
  validateBirthRegistrationNumber,
  formatBirthRegistrationNumberForDisplay,
} from "../utils/validation";

export const STUDENT_ID_STORAGE_KEY = "studentId";

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getStoredStudentIdSnapshot(): string | null {
  try {
    return localStorage.getItem(STUDENT_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

export const useStudentId = () => {
  const studentId = useSyncExternalStore(
    subscribeToStorage,
    getStoredStudentIdSnapshot,
    getServerSnapshot
  );

  const saveStudentId = useCallback((id: string): boolean => {
    const sanitized = sanitizeBirthRegistrationNumber(id);
    const validation = validateBirthRegistrationNumber(sanitized);

    if (!validation.isValid) {
      return false;
    }

    try {
      localStorage.setItem(STUDENT_ID_STORAGE_KEY, sanitized);
      window.dispatchEvent(new Event("storage"));
      return true;
    } catch {
      return false;
    }
  }, []);

  const clearStudentId = useCallback(() => {
    try {
      localStorage.removeItem(STUDENT_ID_STORAGE_KEY);
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Storage unavailable or disabled
    }
  }, []);

  return {
    studentId,
    hasStudentId: Boolean(studentId),
    formattedStudentId: studentId
      ? formatBirthRegistrationNumberForDisplay(studentId)
      : "",
    saveStudentId,
    clearStudentId,
  };
};
