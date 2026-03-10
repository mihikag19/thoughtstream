import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Standalone API route for thought capture.
// Designed to be extractable into a multi-tenant API later.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, title, type, tag, project_tag, password } = body;

    // Replace with Supabase Auth when multi-user
    const capturePassword = process.env.CAPTURE_PASSWORD;
    if (!capturePassword || password !== capturePassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const validTypes = ["seedling", "budding", "evergreen"];
    const thoughtType = validTypes.includes(type) ? type : "seedling";

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("thoughts")
      .insert({
        content: content.trim(),
        title: title && title.trim() ? title.trim() : null,
        type: thoughtType,
        tag: tag && tag.trim() ? tag.trim() : null,
        project_tag: project_tag && project_tag.trim() ? project_tag.trim() : null,
        published: true,
        // user_id is null for MVP — will be set when multi-user is added
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save thought" }, { status: 500 });
    }

    // Fire embedding Edge Function asynchronously — never blocks UI
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    try {
      fetch(`${supabaseUrl}/functions/v1/embed-thought`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ record: { id: data.id, content: data.content } }),
      }).catch(() => {
        // Silent — embedding is non-blocking
      });
    } catch {
      // Silent — embedding is non-blocking
    }

    return NextResponse.json({ thought: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
