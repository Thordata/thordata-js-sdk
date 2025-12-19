// src/errors.ts

export class ThordataError extends Error {}

export class ThordataConfigError extends ThordataError {}

export class ThordataNetworkError extends ThordataError {
  constructor(
    message: string,
    public readonly original?: unknown,
  ) {
    super(message);
  }
}

export class ThordataTimeoutError extends ThordataNetworkError {}

export class ThordataApiError extends ThordataError {
  constructor(
    message: string,
    public readonly code?: number,
    public readonly status?: number,
    public readonly payload?: unknown,
  ) {
    super(message);
  }
}

export class ThordataAuthError extends ThordataApiError {}
export class ThordataRateLimitError extends ThordataApiError {
  constructor(
    message: string,
    code?: number,
    status?: number,
    payload?: unknown,
    public readonly retryAfter?: number,
  ) {
    super(message, code, status, payload);
  }
}
export class ThordataServerError extends ThordataApiError {}
export class ThordataValidationError extends ThordataApiError {}
export class ThordataNotCollectedError extends ThordataApiError {}

export function raiseForCode(
  message: string,
  opts: { code?: number; status?: number; payload?: any },
): never {
  const { code, status, payload } = opts;
  const effective = status ?? code;

  if (effective === 300) throw new ThordataNotCollectedError(message, code, status, payload);
  if (effective === 401 || effective === 403)
    throw new ThordataAuthError(message, code, status, payload);
  if (effective === 402 || effective === 429) {
    const retryAfter = typeof payload?.retry_after === "number" ? payload.retry_after : undefined;
    throw new ThordataRateLimitError(message, code, status, payload, retryAfter);
  }
  if (effective && effective >= 500) throw new ThordataServerError(message, code, status, payload);
  if (effective === 400 || effective === 422)
    throw new ThordataValidationError(message, code, status, payload);

  throw new ThordataApiError(message, code, status, payload);
}
