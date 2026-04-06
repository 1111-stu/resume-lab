import { Hono } from "hono";

export const imageProxyRoute = new Hono().get("/image-proxy", async (c) => {
  try {
    const imageUrl = c.req.query("url");

    if (!imageUrl) {
      console.error("Missing image URL parameter");
      return c.json({ error: "Missing image URL parameter" }, 400);
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(imageUrl);
    } catch {
      console.error(`Invalid image URL: ${imageUrl}`);
      return c.json({ error: "Invalid image URL" }, 400);
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      console.error(`Unsupported protocol: ${parsedUrl.protocol}`);
      return c.json({ error: "Only HTTP and HTTPS protocols are supported" }, 400);
    }

    let response: Response;
    try {
      response = await fetch(imageUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
          Referer: parsedUrl.origin,
        },
      });
    } catch (error: any) {
      console.error(`Failed to fetch image: ${error.message || "Unknown error"}`);
      return c.json(
        { error: `Failed to fetch image: ${error.message || "Unknown error"}` },
        500
      );
    }

    if (!response.ok) {
      console.error(`Image server error: ${response.status} ${response.statusText}`);
      return c.json(
        { error: `Failed to fetch image: ${response.status} ${response.statusText}` },
        response.status as 400
      );
    }

    let imageBuffer: ArrayBuffer;
    try {
      imageBuffer = await response.arrayBuffer();
    } catch (error: any) {
      console.error(`Failed to read image content: ${error.message || "Unknown error"}`);
      return c.json(
        { error: `Failed to read image content: ${error.message || "Unknown error"}` },
        500
      );
    }

    if (imageBuffer.byteLength === 0) {
      console.error("Image content is empty");
      return c.json({ error: "Image content is empty" }, 400);
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS, HEAD",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error: any) {
    console.error("Unhandled image proxy error:", error);
    return c.json(
      { error: `Failed to process image request: ${error.message || "Unknown error"}` },
      500
    );
  }
});
