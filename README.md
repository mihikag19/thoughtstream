# Thoughtstream

A personal site that functions as a living identity layer. The stream is the thinking. The work page is the building. The writing is what survives.

**Domain:** mihikagupta.com

## Setup

### 1. Supabase

Create a project at [supabase.com](https://supabase.com). Run each step in the **SQL Editor** in order:

```sql
-- STEP 1: Enable pgvector
create extension if not exists vector;

-- STEP 2: Main thoughts table
create table if not exists thoughts (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  title text,
  type text default 'seedling'
    check (type in ('seedling', 'budding', 'evergreen')),
  tag text,
  project_tag text,
  published boolean default true,
  planted_at timestamp default now(),
  tended_at timestamp default now(),
  user_id uuid,
  -- embedding column: foundation for Phase 2 graph visualization. Do not remove.
  embedding vector(1536)
);

-- STEP 3: pgvector index (store from day one)
create index if not exists thoughts_embedding_idx
  on thoughts using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- STEP 4: Entry links table (for backlinks and graph edges)
create table if not exists entry_links (
  id uuid primary key default gen_random_uuid(),
  from_entry uuid references thoughts(id) on delete cascade,
  to_entry uuid references thoughts(id) on delete cascade,
  created_at timestamp default now()
);

-- STEP 5: Site config table (editable copy without redeploy)
create table if not exists site_config (
  key text primary key,
  value text not null,
  updated_at timestamp default now()
);

-- STEP 6: Seed site config
insert into site_config (key, value) values
  ('name', 'Mihika Gupta'),
  ('tagline', 'I build things and write about what it costs.'),
  ('now', 'Trying to figure out if Latch is real. Building Signal past the demo. Writing an essay I keep not finishing.')
on conflict (key) do nothing;

-- STEP 7: Enable RLS
alter table thoughts enable row level security;
alter table site_config enable row level security;
alter table entry_links enable row level security;

-- STEP 8: RLS policies
create policy "Public can read published thoughts"
  on thoughts for select using (published = true);

create policy "Anon can insert thoughts"
  on thoughts for insert with check (true);

create policy "Service role can update thoughts"
  on thoughts for update using (true);

create policy "Public can read site config"
  on site_config for select using (true);

create policy "Anon can upsert site config"
  on site_config for all using (true);

create policy "Public can read entry links"
  on entry_links for select using (true);
```

### 2. Environment Variables

```bash
cp .env.local.example .env.local
```

| Variable | Where | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` + Vercel | Supabase anon/public key |
| `CAPTURE_PASSWORD` | `.env.local` + Vercel | Protects `/capture` and `/admin` |
| `OPENAI_API_KEY` | Supabase secrets only | For embedding Edge Function |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secrets only | Used by Edge Function to write embeddings |

### 3. Deploy Embedding Edge Function

```bash
supabase functions deploy embed-thought
supabase secrets set OPENAI_API_KEY=sk-your-key
```

The function is called asynchronously from `/api/thoughts/create` after each insert. It never blocks the capture UI.

### 4. Run Locally

```bash
npm install
npm run dev
```

### 5. Deploy to Vercel

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `CAPTURE_PASSWORD` as environment variables
4. Deploy

## Pages

| Route | Description |
|---|---|
| `/` | Homepage — name, tagline (from site_config), latest thought |
| `/stream` | Reverse-chronological feed with growth stages, thermal map, memory sidebar |
| `/capture` | Password-protected thought input — Quick, Note, and Essay modes |
| `/work` | Three project narratives (Signal, Latch, Canvas) with live stream entries |
| `/writing` | Essay listing — links to full reading views |
| `/writing/[slug]` | Clean essay reading view, markdown from `content/essays/` |
| `/admin` | Password-protected — edit site identity, manage thoughts, promote stubs |
| `/colophon` | How and why the site is built |
| `/graph` | Placeholder — Phase 2 thought graph (needs 30 entries) |

## Customizing Content

### Site identity (name, tagline)
Use `/admin` to edit without touching code. Or update the `site_config` table directly.

### Projects on /work
Edit the `projects` array in `src/app/work/page.tsx`.

### Essays
Add markdown files to `content/essays/[slug].md` and update the `essayMeta` object in `src/app/writing/[slug]/page.tsx` and the `essays` array in `src/app/writing/page.tsx`.

### Header
Edit `src/components/header.tsx` to change the name in the nav.

## Architecture

- **Growth stages**: seedling → budding → evergreen. The "tend" mechanic promotes one stage per click.
- **Embeddings**: Every thought gets a 1536-dim vector via OpenAI text-embedding-3-small, stored in pgvector. Foundation for the Phase 2 thought graph.
- **site_config table**: Name, tagline, and "now" text are editable via `/admin` without redeploying.
- **entry_links table**: Stores explicit edges between entries for the future graph.
- **Standalone API**: `/api/thoughts/create` is designed to be extractable into a multi-tenant API.
- **Password protection**: Simple env var check on `/capture` and `/admin`. Replace with Supabase Auth when multi-user.

## Design System

- **Fonts**: Lora (serif, body/essay) + IBM Plex Mono (metadata/tags/labels)
- **Colors**: #0a0a0a bg, #e2e2e2 text, #c9a96e amber accent, #7ba7c4 blue for projects
- **Spacing**: 8px base unit, multiples only
- **Grain overlay**: SVG noise filter at 32% opacity over the entire page
- **Animations**: Framer Motion — staggered fade-in on stream, pulse dot, tend button, toast, memory modal. Nothing else moves.
