-- ============================================================
-- TCCFlow - RESET das tabelas de ferramentas
-- ============================================================
-- Este script remove as tabelas antigas (com nomes/colunas errados)
-- e recria todas as tabelas corretas para as ferramentas.
--
-- IMPORTANTE: Execute no Supabase Dashboard > SQL Editor
-- ATENÇÃO: Isso apaga TODOS os dados das tabelas de ferramentas!
-- ============================================================

-- ============================================================
-- PASSO 1: Remover tabelas antigas (nomes errados)
-- ============================================================
DROP TABLE IF EXISTS anotacoes CASCADE;
DROP TABLE IF EXISTS ideias CASCADE;
DROP TABLE IF EXISTS referencias CASCADE;
DROP TABLE IF EXISTS smart_validations CASCADE;
DROP TABLE IF EXISTS plagio_checks CASCADE;
DROP TABLE IF EXISTS detector_ia_results CASCADE;
DROP TABLE IF EXISTS user_templates CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;

-- ============================================================
-- PASSO 2: Remover tabelas atuais para recriar do zero
-- ============================================================
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS diary_entries CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS ideas CASCADE;
DROP TABLE IF EXISTS user_references CASCADE;

-- ============================================================
-- PASSO 3: Recriar a função auxiliar (caso não exista)
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_project_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT project_id FROM users WHERE id = auth.uid();
$$;

-- ============================================================
-- PASSO 4: Recriar todas as tabelas de ferramentas
-- ============================================================

-- 1. DIÁRIO DE PROGRESSO (diary_entries)
CREATE TABLE IF NOT EXISTS diary_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL DEFAULT '',
    mood TEXT DEFAULT 'neutral',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_diary_entries_project ON diary_entries(project_id);

ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Diary entries by project members" ON diary_entries FOR ALL USING (
    project_id = get_my_project_id() AND get_my_project_id() IS NOT NULL
);

-- 2. ANOTAÇÕES (notes)
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    color TEXT DEFAULT 'yellow',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_project ON notes(project_id);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notes by project members" ON notes FOR ALL USING (
    project_id = get_my_project_id() AND get_my_project_id() IS NOT NULL
);

-- 3. QUADRO DE IDEIAS (ideas)
CREATE TABLE IF NOT EXISTS ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'geral',
    votes INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ideas_project ON ideas(project_id);

ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ideas by project members" ON ideas FOR ALL USING (
    project_id = get_my_project_id() AND get_my_project_id() IS NOT NULL
);

-- 4. REFERÊNCIAS / BIBLIOGRAFIA (user_references)
CREATE TABLE IF NOT EXISTS user_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'article',
    title TEXT NOT NULL DEFAULT '',
    authors TEXT DEFAULT '',
    year TEXT DEFAULT '',
    source TEXT DEFAULT '',
    url TEXT DEFAULT '',
    formatted TEXT DEFAULT '',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_references_project ON user_references(project_id);

ALTER TABLE user_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "References by project members" ON user_references FOR ALL USING (
    project_id = get_my_project_id() AND get_my_project_id() IS NOT NULL
);

-- 5. CHAT DA EQUIPE (chat_messages)
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    user_name TEXT NOT NULL DEFAULT 'Usuário',
    user_photo TEXT DEFAULT '',
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_project ON chat_messages(project_id, created_at DESC);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat messages by project members" ON chat_messages FOR ALL USING (
    project_id = get_my_project_id() AND get_my_project_id() IS NOT NULL
);

-- ============================================================
-- PASSO 5: Trigger para updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- PRONTO! Todas as tabelas de ferramentas foram recriadas.
-- ============================================================
