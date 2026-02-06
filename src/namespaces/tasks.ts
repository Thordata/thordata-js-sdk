import type { ThordataClient } from "../client.js";
import type { RunTaskConfig, ScraperTaskOptions, WaitForTaskOptions } from "../models.js";

export class ScraperTasksNamespace {
  constructor(private client: ThordataClient) {}

  create(options: ScraperTaskOptions): Promise<string> {
    return this.client.createScraperTask(options);
  }

  status(taskId: string): Promise<string> {
    return this.client.getTaskStatus(taskId);
  }

  result(taskId: string, fileType: "json" | "csv" | "xlsx" = "json"): Promise<string> {
    return this.client.getTaskResult(taskId, fileType);
  }

  wait(taskId: string, options: WaitForTaskOptions = {}): Promise<string> {
    return this.client.waitForTask(taskId, options);
  }

  run(options: ScraperTaskOptions, config: RunTaskConfig = {}): Promise<string> {
    return this.client.runTask(options, config);
  }

  list(page = 1, size = 20): Promise<{ count: number; list: any[] }> {
    return this.client.listTasks(page, size);
  }
}
