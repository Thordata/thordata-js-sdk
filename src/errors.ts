// src/errors.ts

/**
 * Base error class for all Thordata SDK errors.
 */
export class ThordataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ThordataError";
  }
}

/**
 * Configuration error (e.g., missing required options).
 */
export class ThordataConfigError extends ThordataError {
  constructor(message: string) {
    super(message);
    this.name = "ThordataConfigError";
  }
}

/**
 * Network-level error (connection issues, DNS failures, etc.).
 */
export class ThordataNetworkError extends ThordataError {
  constructor(
    message: string,
    public readonly original?: unknown,
  ) {
    super(message);
    this.name = "ThordataNetworkError";
  }
}

/**
 * Request timeout error.
 */
export class ThordataTimeoutError extends ThordataNetworkError {
  constructor(message: string, original?: unknown) {
    super(message, original);
    this.name = "ThordataTimeoutError";
  }
}

/**
 * API-level error (non-2xx responses or error codes in response body).
 */
export class ThordataApiError extends ThordataError {
  constructor(
    message: string,
    public readonly code?: number,
    public readonly status?: number,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = "ThordataApiError";
  }
}

/**
 * Authentication/authorization error (401/403).
 */
export class ThordataAuthError extends ThordataApiError {
  constructor(message: string, code?: number, status?: number, payload?: unknown) {
    super(message, code, status, payload);
    this.name = "ThordataAuthError";
  }
}

/**
 * Rate limit or quota exceeded error (402/429).
 */
export class ThordataRateLimitError extends ThordataApiError {
  constructor(
    message: string,
    code?: number,
    status?: number,
    payload?: unknown,
    public readonly retryAfter?: number,
  ) {
    super(message, code, status, payload);
    this.name = "ThordataRateLimitError";
  }
}

/**
 * Server-side error (5xx).
 */
export class ThordataServerError extends ThordataApiError {
  constructor(message: string, code?: number, status?: number, payload?: unknown) {
    super(message, code, status, payload);
    this.name = "ThordataServerError";
  }
}

/**
 * Validation error (400/422).
 */
export class ThordataValidationError extends ThordataApiError {
  constructor(message: string, code?: number, status?: number, payload?: unknown) {
    super(message, code, status, payload);
    this.name = "ThordataValidationError";
  }
}

/**
 * Data not collected error (code 300).
 */
export class ThordataNotCollectedError extends ThordataApiError {
  constructor(message: string, code?: number, status?: number, payload?: unknown) {
    super(message, code, status, payload);
    this.name = "ThordataNotCollectedError";
  }
}
