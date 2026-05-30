-- ============================================================
-- Acalma App — Schema inicial
-- Execute no Supabase: SQL Editor → New query → Run
-- ============================================================

-- 1. PROFILES — dados do onboarding por usuária
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  idade      TEXT,
  desafio    TEXT,
  reacao     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EPISODIOS — entradas do Diário de Padrões
CREATE TABLE IF NOT EXISTS public.episodios (
  id            UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID    REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  source_id     TEXT,                          -- ISO timestamp do localStorage (dedup)
  data_episodio DATE    NOT NULL,
  emocao_id     TEXT,
  acoes         TEXT[]  DEFAULT '{}',
  antes         TEXT    DEFAULT '',
  reacao        TEXT    DEFAULT '',
  terminou      TEXT    DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- índice para deduplicação no upsert
CREATE UNIQUE INDEX IF NOT EXISTS episodios_user_source
  ON public.episodios (user_id, source_id)
  WHERE source_id IS NOT NULL;

-- 3. CHECKLIST_SEMANAS — estado do checklist semanal
CREATE TABLE IF NOT EXISTS public.checklist_semanas (
  id         UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID      REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  semana     DATE      NOT NULL,   -- segunda-feira da semana
  marcados   INTEGER[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, semana)
);

-- ============================================================
-- ÍNDICES — otimizam consultas por data e usuária
-- ============================================================
CREATE INDEX IF NOT EXISTS episodios_user_data
  ON public.episodios (user_id, data_episodio DESC);

CREATE INDEX IF NOT EXISTS checklist_user_semana
  ON public.checklist_semanas (user_id, semana DESC);

-- ============================================================
-- ROW LEVEL SECURITY — cada usuária só acessa seus próprios dados
-- ============================================================
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodios         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_semanas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: acesso próprio"
  ON public.profiles FOR ALL
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "episodios: acesso próprio"
  ON public.episodios FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "checklist: acesso próprio"
  ON public.checklist_semanas FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
