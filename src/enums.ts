// src/enums.ts

export enum Engine {
  GOOGLE = "google",
  GOOGLE_NEWS = "google_news",
  GOOGLE_SHOPPING = "google_shopping",
  GOOGLE_IMAGES = "google_images",
  GOOGLE_VIDEOS = "google_videos",

  BING = "bing",
  BING_NEWS = "bing_news",

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
