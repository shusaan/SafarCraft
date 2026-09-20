/**
 * Shared validation helpers for the wizard steps. Validation is intentionally
 * minimal — we want the wizard to feel friendly, not nag.
 */

export const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRe = /^[\d\s+()\-]{7,}$/;
export const urlRe = /^https?:\/\/\S+$/i;

export type FieldError = string | null;

export function validateRequired(value: string, label = "This field"): FieldError {
  return value.trim().length === 0 ? `${label} is required` : null;
}

export function validateEmail(value: string): FieldError {
  if (value.length === 0) return null;
  return emailRe.test(value) ? null : "Enter a valid email (e.g. you@example.com)";
}

export function validatePhone(value: string): FieldError {
  if (value.length === 0) return null;
  return phoneRe.test(value) ? null : "Enter a valid phone (digits, +, spaces)";
}

export function validateUrl(value: string): FieldError {
  if (value.length === 0) return null;
  return urlRe.test(value) ? null : "Use a full URL starting with https://";
}

export function isYYYYMM(v: string): boolean {
  return /^\d{4}-\d{2}$/.test(v);
}

export function isYear(v: string): boolean {
  return /^\d{4}$/.test(v);
}

/** A 1-line inline error label. */
export function FieldError({ message }: { message: FieldError }) {
  if (!message) return null;
  return <p className="text-xs text-destructive" role="alert">{message}</p>;
}