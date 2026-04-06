import { Hono } from "hono";
import { AI_MODEL_CONFIGS } from "@/services/ai/config.js";
import { resumeOptimization } from "@/prompts/resume.js";

export const sharedCheckRoute = new Hono().get("/shared-check", c => {
  const providers = Object.keys(AI_MODEL_CONFIGS);
  const prompt = resumeOptimization();

  return c.json({
    ok: true,
    providers,
    hasPrompt: prompt.length > 0,
  });
});
