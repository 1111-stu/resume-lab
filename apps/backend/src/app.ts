import { Hono } from "hono";
import { cors } from "hono/cors";
import { healthRoute } from "./routes/health.js";
import { imageProxyRoute } from "./routes/media/image-proxy.js";
import { grammarRoute } from "./routes/resume/grammar.js";
import { importRoute } from "./routes/resume/import.js";
import { polishRoute } from "./routes/resume/polish.js";
import { sharedCheckRoute } from "./routes/shared-check.js";

export const app = new Hono();

const corsMiddleware = cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5137",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "OPTIONS"],
});

app.use("*", corsMiddleware);
app.options("*", corsMiddleware);

app.route("/", healthRoute);
app.route("/", sharedCheckRoute);
app.route("/v1/media", imageProxyRoute);
app.route("/v1/resume", grammarRoute);
app.route("/v1/resume", importRoute);
app.route("/v1/resume", polishRoute);
