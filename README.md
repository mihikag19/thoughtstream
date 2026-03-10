# thoughtstream

A minimal personal site for publishing raw thoughts daily with zero friction.

## Setup

### 1. Supabase

Create a free project at [supabase.com](https://supabase.com). Then run this SQL in the **SQL Editor**:

```sql
-- Enable pgvector
create extension if not exists vector;

create table thoughts (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  tag text,
  created_at timestamptz default now(),
  published boolean default true,
  user_id uuid,   -- unused in MVP, reserved for multi-user
  embedding vector(1536)  -- OpenAI text-embedding-3-small
);

-- IVFFlat index for fast similarity search
-- Note: index requires >=100 rows to be effective; Supabase will
-- use a sequential scan until enough data accumulates.
create index on thoughts
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Enable RLS
alter table thoughts enable row level security;

-- Allow public reads for published thoughts
create policy "Public can read published thoughts"
  on thoughts for select
  using (published = true);

-- Allow inserts via anon key (password check is in the API route)
create policy "Anon can insert thoughts"
  on thoughts for insert
  with check (true);

-- Allow service role to update embeddings
create policy "Service role can update thoughts"
  on thoughts for update
  using (true);
```

### Embedding Edge Function

The `embed-thought` Edge Function automatically generates embeddings for new thoughts using OpenAI. To set it up:

1. **Deploy the function:**
   ```bash
   supabase functions deploy embed-thought
   ```

2. **Set the function's secrets:**
   ```bash
   supabase secrets set OPENAI_API_KEY=sk-your-key
   ```

3. **Create a database webhook** in the Supabase Dashboard:
   - Go to **Database > Webhooks**
   - Create a new webhook
   - Table: `thoughts`, Events: `INSERT`
   - Type: Supabase Edge Function
   - Function: `embed-thought`

The function runs asynchronously after each insert and never blocks the capture UI.

### 2. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings > API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — same location
- `CAPTURE_PASSWORD` — any string you choose, used to protect `/capture`
- `OPENAI_API_KEY` — from [platform.openai.com/api-keys](https://platform.openai.com/api-keys) (set as a Supabase secret for the Edge Function, not needed in `.env.local`)

### 3. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Deploy to Vercel

1. Push this repo to GitHub
2. Import it at [vercel.com/new](https://vercel.com/new)
3. Add the three environment variables in Vercel's project settings
4. Deploy

## Customizing Content

### Your name and bio

Edit `src/app/page.tsx` — change the `<h1>` and the paragraph below it.

### Projects on /work

Edit the `projects` array in `src/app/work/page.tsx`. Each project has:

- `name` — project name
- `oneLiner` — one-sentence description
- `narrative` — 2-3 sentence story
- `status` — `"Active"`, `"Exploring"`, or `"Shipped"`

### Header branding

Edit `src/components/header.tsx` to change the "ts" logo text.

## Architecture

- `/api/thoughts/create` — standalone POST endpoint for creating thoughts (designed to be extractable into a multi-tenant API)
- `/api/thoughts` — GET endpoint for fetching all published thoughts
- Password protection on `/capture` is a simple env var check — replace with Supabase Auth when adding multi-user support
- `user_id` column exists in the schema but is unused in MVP
- Pages use ISR with 30-second revalidation for the homepage and stream
