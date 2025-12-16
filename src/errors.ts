// src/errors.ts

export class ThordataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ThordataError";
  }
}

export class ThordataAPIError extends ThordataError {
  statusCode?: number;
  code?: number;
  payload?: any;

  constructor(
    message: string,
    statusCode?: number,
    code?: number,
    payload?: any
  ) {
    super(message);
    this.name = "ThordataAPIError";
    this.statusCode = statusCode;
    this.code = code;
    this.payload = payload;
  }
}

export class ThordataAuthError extends ThordataAPIError {
  constructor(message: string, statusCode?: number, code?: number, payload?: any) {
    super(message, statusCode, code, payload);
    this.name = "ThordataAuthError";
  }
}

export class ThordataRateLimitError extends ThordataAPIError {
  retryAfter?: number;

  constructor(
    message: string,
    statusCode?: number,
    code?: number,
    payload?: any,
    retryAfter?: number
  ) {
    super(message, statusCode, code, payload);
    this.name = "ThordataRateLimitError";
    this.retryAfter = retryAfter;
  }
}

export class ThordataNetworkError extends ThordataError {
  originalError?: any;

  constructor(message: string, originalError?: any) {
    super(message);
    this.name = "ThordataNetworkError";
    this.originalError = originalError;
  }
}

export class ThordataTimeoutError extends ThordataNetworkError {
  constructor(message: string, originalError?: any) {
    super(message, originalError);
    this.name = "ThordataTimeoutError";
  }
}