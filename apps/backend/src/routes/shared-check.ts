import { Hono } from "hono";
import { AI_MODEL_CONFIGS } from "@resume-lab/shared/ai/config";
import { resumeOptimization } from "@resume-lab/shared/prompts/resume";

export const sharedCheckRoute = new Hono().get("/shared-check", (c) => {
  const providers = Object.keys(AI_MODEL_CONFIGS);
  const prompt = resumeOptimization();

  return c.json({
    ok: true,
    providers,
    hasPrompt: prompt.length > 0,
  });
});
