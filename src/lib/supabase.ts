import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Thought = {
  id: string;
  content: string;
  tag: string | null;
  created_at: string;
  published: boolean;
  user_id: string | null;
  embedding: number[] | null;
};
