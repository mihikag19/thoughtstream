import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Standalone API route for thought capture.
// Designed to be extractable into a multi-tenant API later.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, tag, password } = body;

    // Replace with Supabase Auth when multi-user
    const capturePassword = process.env.CAPTURE_PASSWORD;
    if (!capturePassword || password !== capturePassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("thoughts")
      .insert({
        content: content.trim(),
        tag: tag && tag.trim() ? tag.trim() : null,
        published: true,
        // user_id is null for MVP — will be set when multi-user is added
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save thought" }, { status: 500 });
    }

    return NextResponse.json({ thought: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
