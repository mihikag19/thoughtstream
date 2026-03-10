// CRITICAL: This is the foundation for the thought graph, UMAP layout,
// and semantic similarity features. Do not remove even if unused.
// Every entry without an embedding is data that must be backfilled later.

// Triggered via HTTP from /api/thoughts/create after insert.
// Receives { id, content }. Calls OpenAI text-embedding-3-small.
// Stores 1536-dim vector back to thoughts.embedding via service role key.
// Runs asynchronously — the capture page response is not blocked.
// On error: log silently. Never surface to user. Never block capture.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record;

    if (!record?.id || !record?.content) {
      return new Response("OK", { status: 200 });
    }

    // Call OpenAI embeddings API
    const embeddingRes = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: record.content,
        model: "text-embedding-3-small",
      }),
    });

    if (!embeddingRes.ok) {
      const err = await embeddingRes.text();
      console.error("OpenAI embedding error:", err);
      return new Response("OK", { status: 200 });
    }

    const embeddingData = await embeddingRes.json();
    const embedding = embeddingData.data[0].embedding;

    // Store vector back to thoughts table using service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error } = await supabase
      .from("thoughts")
      .update({ embedding })
      .eq("id", record.id);

    if (error) {
      console.error("Supabase update error:", error);
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    // Log errors silently — never block the UI
    console.error("embed-thought error:", err);
    return new Response("OK", { status: 200 });
  }
});
