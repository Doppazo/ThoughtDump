-- ==============================================================================
-- Thought Dump: Supabase Database and Storage Setup
-- Paste this entire file into your Supabase SQL Editor and click "Run".
-- ==============================================================================

-- 1. Create the vault_files table (stores your Obsidian-style markdown notes)
create table if not exists public.vault_files (
  user_id uuid not null references auth.users(id) on delete cascade,
  path text not null,
  data text,
  modified bigint not null default (extract(epoch from now()) * 1000)::bigint,
  created_at timestamptz not null default now(),
  primary key (user_id, path)
);

-- Enable Row Level Security (RLS) so users can only access their own files
alter table public.vault_files enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Users can view their own vault files" on public.vault_files;
drop policy if exists "Users can insert their own vault files" on public.vault_files;
drop policy if exists "Users can update their own vault files" on public.vault_files;
drop policy if exists "Users can delete their own vault files" on public.vault_files;

-- Create user access policies
create policy "Users can view their own vault files"
  on public.vault_files for select
  using (auth.uid() = user_id);

create policy "Users can insert their own vault files"
  on public.vault_files for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own vault files"
  on public.vault_files for update
  using (auth.uid() = user_id);

create policy "Users can delete their own vault files"
  on public.vault_files for delete
  using (auth.uid() = user_id);

-- 2. Create the storage bucket for voice recordings
insert into storage.buckets (id, name, public)
values ('vault_audio', 'vault_audio', false)
on conflict (id) do nothing;

-- Storage policies for voice notes
drop policy if exists "Users can upload their own audio" on storage.objects;
drop policy if exists "Users can read their own audio" on storage.objects;
drop policy if exists "Users can delete their own audio" on storage.objects;

create policy "Users can upload their own audio"
  on storage.objects for insert
  with check (bucket_id = 'vault_audio' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can read their own audio"
  on storage.objects for select
  using (bucket_id = 'vault_audio' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own audio"
  on storage.objects for delete
  using (bucket_id = 'vault_audio' and (storage.foldername(name))[1] = auth.uid()::text);
