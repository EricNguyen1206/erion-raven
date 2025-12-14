/**
 * Authentication DTOs for frontend validation
 */

export interface SigninRequestDto {
  email: string;
  password: string;
}

export interface SignupRequestDto {
  username: string;
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  password?: string;
  currentPassword?: string;
}

/**
 * Password validation constants and utilities
 */
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
export const PASSWORD_ERROR_MESSAGE = "Password must be at least 6 characters and contain both letters and numbers";

/**
 * Validates password meets requirements:
 * - Minimum 6 characters
 * - Contains at least one letter
 * - Contains at least one number
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return { isValid: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return { isValid: false, error: PASSWORD_ERROR_MESSAGE };
  }

  return { isValid: true };
}

/**
 * Validates email format
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  return { isValid: true };
}
