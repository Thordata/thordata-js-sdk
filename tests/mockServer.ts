import http from "node:http";
import { AddressInfo } from "node:net";

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
}

export async function startMockServer(): Promise<{
  baseUrl: string;
  close: () => Promise<void>;
}> {
  const server = http.createServer(async (req, res) => {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return;
    }

    const url = req.url || "";
    const body = await readBody(req);
    const form = new URLSearchParams(body);

    res.setHeader("Content-Type", "application/json");

    // scraperapi: /request (SERP) or universalapi: /request (Universal)
    if (url === "/request") {
      const engine = form.get("engine");
      const type = form.get("type"); // universal uses type=html/png

      // SERP request
      if (engine) {
        if (engine === "google_news") {
          res.end(
            JSON.stringify({
              code: 200,
              news_results: [{ title: "Example News", link: "https://example.com", snippet: "x" }],
            }),
          );
          return;
        }
        if (engine === "google_shopping") {
          res.end(
            JSON.stringify({
              code: 200,
              shopping_results: [{ title: "Example Product", price: "$1" }],
            }),
          );
          return;
        }

        res.end(
          JSON.stringify({
            code: 200,
            organic: [{ title: "Example", link: "https://example.com" }],
          }),
        );
        return;
      }

      // Universal request
      if (type) {
        res.end(
          JSON.stringify({
            code: 200,
            html: "<html><body>" + "Hello ".repeat(60) + "</body></html>",
          }),
        );
        return;
      }

      res.end(JSON.stringify({ code: 400, msg: "Bad request" }));
      return;
    }

    // builder/tasks-status/tasks-download (Web Scraper API demo)
    if (url === "/builder") {
      res.end(JSON.stringify({ code: 200, data: { task_id: "t_demo_1" } }));
      return;
    }

    if (url === "/tasks-status") {
      res.end(JSON.stringify({ code: 200, data: [{ task_id: "t_demo_1", status: "ready" }] }));
      return;
    }

    if (url === "/tasks-download") {
      res.end(JSON.stringify({ code: 200, data: { download: "https://example.com/result.json" } }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ code: 404, msg: "Not Found" }));
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as AddressInfo).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  return {
    baseUrl,
    close: () =>
      new Promise<void>((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve())),
      ),
  };
}
