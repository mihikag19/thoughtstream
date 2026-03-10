import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const project_tag = searchParams.get("project_tag");
  const limit = parseInt(searchParams.get("limit") || "100");
  const before = searchParams.get("before");
  const after = searchParams.get("after");

  let query = supabase
    .from("thoughts")
    .select("*")
    .eq("published", true)
    .order("planted_at", { ascending: false })
    .limit(limit);

  if (type) query = query.eq("type", type);
  if (project_tag) query = query.eq("project_tag", project_tag);
  if (before) query = query.lt("planted_at", before);
  if (after) query = query.gt("planted_at", after);

  const { data, error } = await query;

  if (error) {
    console.error("Supabase fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch thoughts" }, { status: 500 });
  }

  return NextResponse.json({ thoughts: data });
}
