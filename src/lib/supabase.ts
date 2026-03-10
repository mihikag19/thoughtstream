import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ThoughtType = "seedling" | "budding" | "evergreen";

export type Thought = {
  id: string;
  content: string;
  title: string | null;
  type: ThoughtType;
  tag: string | null;
  project_tag: string | null;
  published: boolean;
  planted_at: string;
  tended_at: string;
  user_id: string | null;
  embedding: number[] | null;
};

export type SiteConfig = {
  key: string;
  value: string;
  updated_at: string;
};

export type EntryLink = {
  id: string;
  from_entry: string;
  to_entry: string;
  created_at: string;
};
