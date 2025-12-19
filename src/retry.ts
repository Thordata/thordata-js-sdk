export type RetryConfig = {
  maxRetries: number;
  backoffFactor: number;
  maxBackoffSeconds: number;
  jitter: boolean;
};

export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  backoffFactor: 1,
  maxBackoffSeconds: 60,
  jitter: true,
};

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function computeDelaySeconds(cfg: RetryConfig, attempt: number): number {
  let delay = cfg.backoffFactor * Math.pow(2, attempt);
  delay = Math.min(delay, cfg.maxBackoffSeconds);

  if (cfg.jitter) {
    const jitter = delay * 0.1;
    delay = Math.max(0.1, delay + (Math.random() * 2 - 1) * jitter);
  }
  return delay;
}
