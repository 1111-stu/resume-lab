import { Hono } from "hono";
import { AI_MODEL_CONFIGS, type AIModelType } from "@/services/ai/config.js";
import { formatGeminiErrorMessage, getGeminiModelInstance } from "@/services/ai/gemini.js";
import { resumeOptimization } from "@/prompts/resume.js";

interface PolishRequestBody {
  apiKey?: string;
  model?: string;
  content?: string;
  modelType?: AIModelType;
  apiEndpoint?: string;
  customInstructions?: string;
}

const STREAM_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
} as const;

export const polishRoute = new Hono().post("/polish", async c => {
  try {
    const body = (await c.req.json()) as PolishRequestBody;
    const { apiKey, model, content, modelType, apiEndpoint, customInstructions } = body;

    if (!apiKey || !content || !modelType) {
      return c.json(
        {
          error: "Missing required fields: apiKey, content, modelType",
        },
        400,
      );
    }

    const modelConfig = AI_MODEL_CONFIGS[modelType];
    if (!modelConfig) {
      return c.json({ error: "Invalid model type" }, 400);
    }

    const systemPrompt = resumeOptimization(customInstructions);

    if (modelType === "gemini") {
      const geminiModel = model || "gemini-flash-latest";
      const modelInstance = getGeminiModelInstance({
        apiKey,
        model: geminiModel,
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature: 0.4,
        },
      });

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const result = await modelInstance.generateContentStream(content);
            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              if (chunkText) {
                controller.enqueue(encoder.encode(chunkText));
              }
            }
          } catch (error) {
            controller.error(error);
            return;
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: STREAM_HEADERS,
      });
    }

    const upstreamResponse = await fetch(modelConfig.url(apiEndpoint), {
      method: "POST",
      headers: modelConfig.headers(apiKey),
      body: JSON.stringify({
        model: modelConfig.requiresModelId ? model : modelConfig.defaultModel,
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
        stream: true,
      }),
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        if (!upstreamResponse.body) {
          controller.close();
          return;
        }

        const reader = upstreamResponse.body.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter(line => line.trim() !== "");

            for (const line of lines) {
              if (line.includes("[DONE]")) continue;
              if (!line.startsWith("data:")) continue;

              try {
                const data = JSON.parse(line.slice(5));
                const deltaContent = data.choices[0]?.delta?.content;
                if (deltaContent) {
                  controller.enqueue(encoder.encode(deltaContent));
                }
              } catch (error) {
                console.error("Error parsing JSON:", error);
              }
            }
          }
        } catch (error) {
          console.error("Stream reading error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: STREAM_HEADERS,
    });
  } catch (error) {
    console.error("Polish error:", error);
    return c.json({ error: formatGeminiErrorMessage(error) }, 500);
  }
});
