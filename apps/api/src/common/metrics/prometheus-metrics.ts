import type { NextFunction, Request, Response } from "express";

const BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];

type MetricLabels = {
  method: string;
  route: string;
  statusCode: string;
};

type HistogramState = {
  count: number;
  sum: number;
  buckets: number[];
};

const httpRequestDuration = new Map<string, HistogramState>();
const startedAt = Date.now();

export function prometheusMetricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.path === "/metrics") {
    next();
    return;
  }

  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationSeconds =
      Number(process.hrtime.bigint() - start) / 1_000_000_000;
    observeHttpRequest(durationSeconds, {
      method: req.method,
      route: normalizeRoute(req.path),
      statusCode: String(res.statusCode),
    });
  });

  next();
}

export function prometheusMetricsHandler(req: Request, res: Response): void {
  console.info("Metrics request", {
    host: req.headers.host,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
    xForwardedFor: req.headers["x-forwarded-for"],
  });

  if (process.env.NODE_ENV === "production" && !isLocalMetricsRequest(req)) {
    res.status(404).send("Not Found");
    return;
  }

  res
    .status(200)
    .type("text/plain; version=0.0.4; charset=utf-8")
    .send(renderPrometheusMetrics());
}

function observeHttpRequest(durationSeconds: number, labels: MetricLabels): void {
  const key = JSON.stringify(labels);
  const state =
    httpRequestDuration.get(key) ??
    ({
      count: 0,
      sum: 0,
      buckets: BUCKETS.map(() => 0),
    } satisfies HistogramState);

  state.count += 1;
  state.sum += durationSeconds;

  for (let index = 0; index < BUCKETS.length; index += 1) {
    const bucket = BUCKETS[index];
    if (bucket !== undefined && durationSeconds <= bucket) {
      state.buckets[index] = (state.buckets[index] ?? 0) + 1;
    }
  }

  httpRequestDuration.set(key, state);
}

function renderPrometheusMetrics(): string {
  const memory = process.memoryUsage();
  const lines = [
    "# HELP cottonbro_api_up Whether the API process is running.",
    "# TYPE cottonbro_api_up gauge",
    "cottonbro_api_up 1",
    "# HELP cottonbro_api_uptime_seconds API process uptime in seconds.",
    "# TYPE cottonbro_api_uptime_seconds gauge",
    `cottonbro_api_uptime_seconds ${Math.floor((Date.now() - startedAt) / 1000)}`,
    "# HELP cottonbro_api_memory_bytes API process memory usage in bytes.",
    "# TYPE cottonbro_api_memory_bytes gauge",
    `cottonbro_api_memory_bytes{type="rss"} ${memory.rss}`,
    `cottonbro_api_memory_bytes{type="heap_total"} ${memory.heapTotal}`,
    `cottonbro_api_memory_bytes{type="heap_used"} ${memory.heapUsed}`,
    `cottonbro_api_memory_bytes{type="external"} ${memory.external}`,
    "# HELP cottonbro_api_http_request_duration_seconds HTTP request duration in seconds.",
    "# TYPE cottonbro_api_http_request_duration_seconds histogram",
  ];

  for (const [key, state] of httpRequestDuration.entries()) {
    const labels = JSON.parse(key) as MetricLabels;
    let cumulative = 0;

    for (let index = 0; index < BUCKETS.length; index += 1) {
      const bucket = BUCKETS[index];
      if (bucket === undefined) continue;

      cumulative = state.buckets[index] ?? 0;
      lines.push(
        `cottonbro_api_http_request_duration_seconds_bucket{${formatLabels({
          ...labels,
          le: String(bucket),
        })}} ${cumulative}`,
      );
    }

    lines.push(
      `cottonbro_api_http_request_duration_seconds_bucket{${formatLabels({
        ...labels,
        le: "+Inf",
      })}} ${state.count}`,
      `cottonbro_api_http_request_duration_seconds_sum{${formatLabels(labels)}} ${state.sum}`,
      `cottonbro_api_http_request_duration_seconds_count{${formatLabels(labels)}} ${state.count}`,
    );
  }

  return `${lines.join("\n")}\n`;
}

function normalizeRoute(path: string): string {
  return path
    .replace(/^\/v1(?=\/|$)/, "")
    .replace(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?=\/|$)/gi,
      "/:uuid",
    )
    .replace(/\/\d+(?=\/|$)/g, "/:id")
    .replace(/\/+/g, "/") || "/";
}

function formatLabels(labels: Record<string, string>): string {
  return Object.entries(labels)
    .map(([key, value]) => `${key}="${escapeLabel(value)}"`)
    .join(",");
}

function escapeLabel(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function isLocalMetricsRequest(req: Request): boolean {
  const host = req.headers.host?.split(":")[0]?.toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}
