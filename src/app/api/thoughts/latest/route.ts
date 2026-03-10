import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("thoughts")
    .select("*")
    .eq("published", true)
    .order("planted_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ thought: null });
  }

  return NextResponse.json({ thought: data });
}
