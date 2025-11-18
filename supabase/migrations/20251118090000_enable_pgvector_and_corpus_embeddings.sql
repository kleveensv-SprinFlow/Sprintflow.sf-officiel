diff --git a/supabase/migrations/20251118090000_enable_pgvector_and_corpus_embeddings.sql b/supabase/migrations/20251118090000_enable_pgvector_and_corpus_embeddings.sql
new file mode 100644
index 0000000000000000000000000000000000000000..63fea0b7e765e0bb1c3b9efcbb0183eb0e4e9fab
--- /dev/null
+++ b/supabase/migrations/20251118090000_enable_pgvector_and_corpus_embeddings.sql
@@ -0,0 +1,41 @@
+create extension if not exists "pgcrypto";
+create extension if not exists vector;
+
+create table if not exists public.corpus_embeddings (
+  id uuid primary key default gen_random_uuid(),
+  content text not null,
+  embedding vector(768) not null,
+  created_at timestamptz not null default timezone('utc', now())
+);
+
+create index if not exists corpus_embeddings_embedding_idx
+  on public.corpus_embeddings
+  using ivfflat (embedding vector_l2_ops)
+  with (lists = 100);
+
+create or replace function public.match_corpus_embeddings(
+  query_embedding vector(768),
+  match_count integer default 5
+)
+returns table (
+  id uuid,
+  content text,
+  similarity double precision
+)
+language plpgsql
+as $$
+begin
+  if query_embedding is null then
+    raise exception 'query_embedding is required';
+  end if;
+
+  return query
+  select
+    ce.id,
+    ce.content,
+    1 - (ce.embedding <=> query_embedding) as similarity
+  from public.corpus_embeddings as ce
+  order by ce.embedding <=> query_embedding
+  limit greatest(1, least(coalesce(match_count, 5), 10));
+end;
+$$;
