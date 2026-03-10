import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 32);
  const to = new Date(now);
  to.setDate(to.getDate() - 28);

  const { data, error } = await supabase
    .from("thoughts")
    .select("*")
    .eq("published", true)
    .gte("planted_at", from.toISOString())
    .lte("planted_at", to.toISOString())
    .order("planted_at", { ascending: false })
    .limit(3);

  if (error) {
    return NextResponse.json({ thoughts: [] });
  }

  return NextResponse.json({ thoughts: data || [] });
}
