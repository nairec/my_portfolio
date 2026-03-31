import type { APIRoute } from "astro";
import { Groq } from "groq-sdk";
import { SYSTEM_PROMPT } from "../../lib/prompts";
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
  const { messages } = await request.json();
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
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      model: "openai/gpt-oss-20b",
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: true,
      reasoning_effort: "medium",
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
    return new Response(
      JSON.stringify({ error: "Error while inferencing the model" }),
      {
        status: 500,
      },
    );
  }
};
