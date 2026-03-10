import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const promotionMap: Record<string, string> = {
  seedling: "budding",
  budding: "evergreen",
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch current thought
  const { data: thought, error: fetchError } = await supabase
    .from("thoughts")
    .select("id, type")
    .eq("id", params.id)
    .single();

  if (fetchError || !thought) {
    return NextResponse.json({ error: "Thought not found" }, { status: 404 });
  }

  const nextType = promotionMap[thought.type];
  if (!nextType) {
    return NextResponse.json({ error: "Already evergreen" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("thoughts")
    .update({ type: nextType, tended_at: new Date().toISOString() })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    console.error("Tend error:", error);
    return NextResponse.json({ error: "Failed to tend" }, { status: 500 });
  }

  return NextResponse.json({ thought: data });
}
