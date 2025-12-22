// src/retry.ts

/**
 * Retry configuration options.
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Backoff multiplier (default: 1) */
  backoffFactor: number;
  /** Maximum delay between retries in seconds */
  maxBackoffSeconds: number;
  /** Whether to add random jitter to delays */
  jitter: boolean;
}

/**
 * Default retry configuration.
 */
export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  backoffFactor: 1,
  maxBackoffSeconds: 60,
  jitter: true,
};

/**
 * Sleep for a specified duration.
 *
 * @param ms - Duration in milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Compute delay for a retry attempt with exponential backoff.
 *
 * @param cfg - Retry configuration
 * @param attempt - Current attempt number (0-based)
 * @returns Delay in seconds
 */
export function computeDelaySeconds(cfg: RetryConfig, attempt: number): number {
  let delay = cfg.backoffFactor * Math.pow(2, attempt);
  delay = Math.min(delay, cfg.maxBackoffSeconds);

  if (cfg.jitter) {
    const jitter = delay * 0.1;
    delay = Math.max(0.1, delay + (Math.random() * 2 - 1) * jitter);
  }

  return delay;
}
