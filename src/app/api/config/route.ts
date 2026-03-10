import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("site_config")
    .select("key, value");

  if (error) {
    return NextResponse.json({ config: {} });
  }

  const config: Record<string, string> = {};
  for (const row of data || []) {
    config[row.key] = row.value;
  }

  return NextResponse.json({ config });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { key, value, password } = body;

  // Replace with Supabase Auth when multi-user
  if (!password || password !== process.env.CAPTURE_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!key || typeof value !== "string") {
    return NextResponse.json({ error: "Key and value required" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase
    .from("site_config")
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
