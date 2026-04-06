import { Hono } from "hono";
import { resumeParse } from "@resume-lab/shared/prompts/resume";
import {
  formatGeminiErrorMessage,
  getGeminiModelInstance,
} from "../../services/ai/gemini.js";

interface ResumeImportRequestBody {
  apiKey?: string;
  model?: string;
  content?: string;
  images?: string[];
  locale?: string;
}

const parseJsonPayload = (content: string) => {
  const text = content.trim();
  try {
    return JSON.parse(text);
  } catch {}

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {}
  }

  const objectBlock = text.match(/\{[\s\S]*\}/);
  if (objectBlock?.[0]) {
    try {
      return JSON.parse(objectBlock[0]);
    } catch {}
  }

  return null;
};

const extractBase64Payload = (value: string) => {
  const matched = value.match(/^data:(.*?);base64,(.*)$/);
  if (matched) {
    return {
      mimeType: matched[1] || "image/jpeg",
      data: matched[2] || "",
    };
  }

  return {
    mimeType: "image/jpeg",
    data: value,
  };
};

export const importRoute = new Hono().post("/import", async (c) => {
  try {
    const body = (await c.req.json()) as ResumeImportRequestBody;
    const { apiKey, model, content, images, locale } = body;

    if (!apiKey || (!content && (!images || images.length === 0))) {
      return c.json({ error: "Missing API key or resume content/images" }, 400);
    }

    const language = locale === "en" ? "English" : "Chinese";
    const geminiModel = model || "gemini-flash-latest";
    const imageParts = Array.isArray(images)
      ? images.map((image) => {
          const payload = extractBase64Payload(image);
          return {
            inlineData: {
              mimeType: payload.mimeType,
              data: payload.data,
            },
          };
        })
      : [];

    const modelInstance = getGeminiModelInstance({
      apiKey,
      model: geminiModel,
      systemInstruction: resumeParse(language),
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });

    const inputParts = [
      {
        text: content || "请识别以下简历页面图片中的信息，并严格按 JSON 结构输出。",
      },
      ...imageParts,
    ];

    const result = await modelInstance.generateContent(inputParts);
    const aiContent = result.response.text();

    if (!aiContent || typeof aiContent !== "string") {
      return c.json({ error: "AI did not return structured content" }, 500);
    }

    const parsedResume = parseJsonPayload(aiContent);
    if (!parsedResume) {
      return c.json({ error: "Failed to parse AI JSON output" }, 500);
    }

    return c.json({ resume: parsedResume });
  } catch (error) {
    console.error("Error in resume import:", error);
    const status = typeof (error as any)?.status === "number" ? (error as any).status : 500;
    return c.json({ error: formatGeminiErrorMessage(error) }, status);
  }
});
