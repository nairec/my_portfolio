import type { APIRoute } from "astro";
import { Groq } from "groq-sdk";
import { getSystemPrompt } from "../../lib/prompts";
import { isLocale, defaultLocale } from "../../i18n";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const groq = new Groq({
  apiKey: import.meta.env.GROQ_API_KEY,
});

const redis = new Redis({
  url: import.meta.env.UPSTASH_REDIS_REST_URL,
  token: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  analytics: true,
});

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const { messages, locale: rawLocale } = await request.json();
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const systemPrompt = getSystemPrompt(locale);
  const identifier = clientAddress || "anonymous";

  const { success, limit, reset, remaining } =
    await ratelimit.limit(identifier);

  if (!success) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      },
    });
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      model: "llama-3.3-70b-versatile",
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: true,
      stop: null,
    });

    const stream = completion.toReadableStream();

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error detectado en el servidor:", error);
    return new Response(
      JSON.stringify({
        error: "Error while inferencing the model",
        details: error instanceof Error ? error.message : error,
      }),
      { status: 500 },
    );
  }
};
