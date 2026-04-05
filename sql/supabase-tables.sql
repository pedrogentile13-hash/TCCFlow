-- ============================================
-- TCCFlow - Supabase SQL (tabelas de ferramentas)
-- ============================================
-- Tabelas existentes (criadas em supabase-schema.sql):
--   projects, users, subscriptions, saved_papers,
--   google_links, calendar_goals, calendar_sessions, ai_usage,
--   tasks, coupons, orientador_projects, orientador_comments
--
-- Este arquivo cria as tabelas de FERRAMENTAS que complementam
-- o schema principal. Os nomes e colunas aqui devem corresponder
-- exatamente ao que o db-service.js espera.
--
-- IMPORTANTE: Execute supabase-schema.sql PRIMEIRO para criar
-- a função get_my_project_id() e as tabelas base.
-- ============================================

-- ============================================
-- 1. CHAT DA EQUIPE (chat_messages)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    user_name TEXT NOT NULL DEFAULT 'Usuário',
    user_photo TEXT DEFAULT '',
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_project ON chat_messages(project_id, created_at DESC);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat messages by project members"
    ON chat_messages FOR ALL
    USING (
        project_id = get_my_project_id() AND get_my_project_id() IS NOT NULL
    );


-- ============================================
-- 2. ANOTAÇÕES & FICHAMENTOS (notes)
-- ============================================
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    color TEXT DEFAULT 'yellow',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_project ON notes(project_id, updated_at DESC);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notes by project members"
    ON notes FOR ALL
    USING (
        project_id = get_my_project_id() AND get_my_project_id() IS NOT NULL
    );


-- ============================================
-- 3. DIÁRIO DE PROGRESSO (diary_entries)
-- ============================================
CREATE TABLE IF NOT EXISTS diary_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL DEFAULT '',
    mood TEXT DEFAULT 'neutral',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_diary_entries_project ON diary_entries(project_id, created_at DESC);

ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Diary entries by project members"
    ON diary_entries FOR ALL
    USING (
        project_id = get_my_project_id() AND get_my_project_id() IS NOT NULL
    );


-- ============================================
-- 4. QUADRO DE IDEIAS (ideas)
-- ============================================
CREATE TABLE IF NOT EXISTS ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

CREATE POLICY "Ideas by project members"
    ON ideas FOR ALL
    USING (
        project_id = get_my_project_id() AND get_my_project_id() IS NOT NULL
    );


-- ============================================
-- 5. REFERÊNCIAS / BIBLIOGRAFIA (user_references)
-- ============================================
CREATE TABLE IF NOT EXISTS user_references (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

CREATE POLICY "References by project members"
    ON user_references FOR ALL
    USING (
        project_id = get_my_project_id() AND get_my_project_id() IS NOT NULL
    );


-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger de updated_at para notes
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
