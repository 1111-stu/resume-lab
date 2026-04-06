import { Hono } from "hono";
import { AI_MODEL_CONFIGS, type AIModelType } from "@resume-lab/shared/ai/config";
import { resumeGrammarCheck } from "@resume-lab/shared/prompts/resume";
import {
  formatGeminiErrorMessage,
  getGeminiModelInstance,
} from "../../services/ai/gemini.js";

interface GrammarRequestBody {
  apiKey?: string;
  model?: string;
  content?: string;
  modelType?: AIModelType;
  apiEndpoint?: string;
}

export const grammarRoute = new Hono().post("/grammar", async (c) => {
  try {
    const body = (await c.req.json()) as GrammarRequestBody;
    const { apiKey, model, content, modelType, apiEndpoint } = body;

    if (!apiKey || !content || !modelType) {
      return c.json(
        {
          error: "Missing required fields: apiKey, content, modelType",
        },
        400
      );
    }

    const modelConfig = AI_MODEL_CONFIGS[modelType];
    if (!modelConfig) {
      return c.json({ error: "Invalid model type" }, 400);
    }

    const systemPrompt = resumeGrammarCheck();

    if (modelType === "gemini") {
      const geminiModel = model || "gemini-flash-latest";
      const modelInstance = getGeminiModelInstance({
        apiKey,
        model: geminiModel,
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
        },
      });

      const result = await modelInstance.generateContent(content);
      const text = result.response.text() || "";

      return c.json({
        choices: [
          {
            message: {
              content: text,
            },
          },
        ],
      });
    }

    const response = await fetch(modelConfig.url(apiEndpoint), {
      method: "POST",
      headers: modelConfig.headers(apiKey),
      body: JSON.stringify({
        model: modelConfig.requiresModelId ? model : modelConfig.defaultModel,
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content,
          },
        ],
      }),
    });

    const data = await response.json();
    return c.json(data, response.status as 200);
  } catch (error) {
    console.error("Error in grammar check:", error);
    return c.json({ error: formatGeminiErrorMessage(error) }, 500);
  }
});
