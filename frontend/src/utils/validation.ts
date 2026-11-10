export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export const BIRTH_REGISTRATION_NUMBER_LENGTH = 17;

/**
 * Sanitizes input by keeping only numeric digits and clamping to max 17 digits.
 */
export const sanitizeBirthRegistrationNumber = (input: string): string => {
  return input.replace(/\D/g, "").slice(0, BIRTH_REGISTRATION_NUMBER_LENGTH);
};

/**
 * Formats a 17-digit string into visually readable groups without modifying the raw value.
 * e.g., "2008 1234 5678 90123"
 */
export const formatBirthRegistrationNumberForDisplay = (digits: string): string => {
  const clean = sanitizeBirthRegistrationNumber(digits);
  if (clean.length <= 4) return clean;
  if (clean.length <= 8) return `${clean.slice(0, 4)} ${clean.slice(4)}`;
  if (clean.length <= 12)
    return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8)}`;
  return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)} ${clean.slice(12)}`;
};

/**
 * Validates that the input strictly consists of 17 numeric digits.
 * Note: Validates syntax and format only. Ownership verification is the backend's responsibility.
 */
export const validateBirthRegistrationNumber = (
  input: string
): ValidationResult => {
  if (!input || input.trim().length === 0) {
    return {
      isValid: false,
      error: "Birth Registration Number is required.",
    };
  }

  const trimmed = input.trim();

  // Check for non-digit characters
  if (!/^\d+$/.test(trimmed)) {
    return {
      isValid: false,
      error: "Only numeric digits (0–9) are allowed.",
    };
  }

  if (trimmed.length < BIRTH_REGISTRATION_NUMBER_LENGTH) {
    const remaining = BIRTH_REGISTRATION_NUMBER_LENGTH - trimmed.length;
    return {
      isValid: false,
      error: `Incomplete number. Please enter ${remaining} more digit${
        remaining > 1 ? "s" : ""
      } (17 digits required).`,
    };
  }

  if (trimmed.length > BIRTH_REGISTRATION_NUMBER_LENGTH) {
    return {
      isValid: false,
      error: `Number exceeds the allowed limit of ${BIRTH_REGISTRATION_NUMBER_LENGTH} digits.`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
};
