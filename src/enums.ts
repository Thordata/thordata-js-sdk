// src/enums.ts

export enum Engine {
  GOOGLE = "google",
  BING = "bing",
  YANDEX = "yandex",
  DUCKDUCKGO = "duckduckgo",
}

export enum TaskStatus {
  PENDING = "pending",
  RUNNING = "running",
  READY = "ready",
  SUCCESS = "success",
  FINISHED = "finished",
  FAILED = "failed",
  ERROR = "error",
  CANCELLED = "cancelled",
  UNKNOWN = "unknown",
}