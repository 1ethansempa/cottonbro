import Fastify, {
  type FastifyInstance,
  type FastifyBaseLogger,
  type RawServerDefault,
} from "fastify";
import cors from "@fastify/cors";
import type { IncomingMessage, ServerResponse } from "http";

export function buildApp(): FastifyInstance<
  RawServerDefault,
  IncomingMessage,
  ServerResponse<IncomingMessage>,
  FastifyBaseLogger
> {
  const app = Fastify({ logger: true }) as FastifyInstance<
    RawServerDefault,
    IncomingMessage,
    ServerResponse<IncomingMessage>,
    FastifyBaseLogger
  >;

  app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  app.get("/health", async () => ({ ok: true, ts: new Date().toISOString() }));

  return app;
}
