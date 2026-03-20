-- ============================================
-- TCCFlow - Supabase SQL (todas as tabelas)
-- ============================================
-- Tabelas existentes: projects, users, subscriptions, saved_papers,
-- google_links, calendar_goals, calendar_sessions, ai_usage
--
-- Este arquivo cria TODAS as tabelas novas necessárias para
-- as ferramentas que hoje usam localStorage.
-- ============================================

-- ============================================
-- 1. CHAT DA EQUIPE (chat_messages)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL DEFAULT 'Usuário',
    user_photo TEXT DEFAULT '',
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chat_messages_project ON chat_messages(project_id, created_at DESC);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chat messages of their project"
    ON chat_messages FOR SELECT
    USING (project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
        UNION
        SELECT project_id FROM team_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert chat messages in their project"
    ON chat_messages FOR INSERT
    WITH CHECK (project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
        UNION
        SELECT project_id FROM team_members WHERE user_id = auth.uid()
    ));


-- ============================================
-- 2. ANOTAÇÕES & FICHAMENTOS (anotacoes)
-- ============================================
CREATE TABLE IF NOT EXISTS anotacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    content TEXT DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    linked_paper_id UUID REFERENCES saved_papers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_anotacoes_project ON anotacoes(project_id, updated_at DESC);

ALTER TABLE anotacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notes"
    ON anotacoes FOR ALL
    USING (project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
        UNION
        SELECT project_id FROM team_members WHERE user_id = auth.uid()
    ));


-- ============================================
-- 3. DIÁRIO DE PROGRESSO (diario_entries)
-- ============================================
CREATE TABLE IF NOT EXISTS diario_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL DEFAULT 'geral',
    description TEXT NOT NULL DEFAULT '',
    hours NUMERIC(4,1) DEFAULT 0,
    mood TEXT DEFAULT 'neutro',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_diario_project ON diario_entries(project_id, entry_date DESC);

ALTER TABLE diario_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their diary entries"
    ON diario_entries FOR ALL
    USING (project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
        UNION
        SELECT project_id FROM team_members WHERE user_id = auth.uid()
    ));


-- ============================================
-- 4. QUADRO DE IDEIAS (ideias)
-- ============================================
CREATE TABLE IF NOT EXISTS ideias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    text TEXT NOT NULL DEFAULT '',
    color TEXT DEFAULT 'yellow',
    category TEXT DEFAULT '',
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ideias_project ON ideias(project_id);

ALTER TABLE ideias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage ideas in their project"
    ON ideias FOR ALL
    USING (project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
        UNION
        SELECT project_id FROM team_members WHERE user_id = auth.uid()
    ));


-- ============================================
-- 5. REFERÊNCIAS / BIBLIOGRAFIA (referencias)
-- ============================================
CREATE TABLE IF NOT EXISTS referencias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'artigo',
    autores TEXT DEFAULT '',
    titulo TEXT NOT NULL DEFAULT '',
    ano TEXT DEFAULT '',
    editora TEXT DEFAULT '',
    cidade TEXT DEFAULT '',
    volume TEXT DEFAULT '',
    edicao TEXT DEFAULT '',
    paginas TEXT DEFAULT '',
    doi TEXT DEFAULT '',
    url TEXT DEFAULT '',
    revista TEXT DEFAULT '',
    imported_from_paper_id UUID REFERENCES saved_papers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_referencias_project ON referencias(project_id);

ALTER TABLE referencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage references in their project"
    ON referencias FOR ALL
    USING (project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
        UNION
        SELECT project_id FROM team_members WHERE user_id = auth.uid()
    ));


-- ============================================
-- 6. VALIDAÇÃO SMART (smart_validations)
-- ============================================
CREATE TABLE IF NOT EXISTS smart_validations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    theme TEXT DEFAULT '',
    description TEXT DEFAULT '',
    scores JSONB DEFAULT '{}',
    overall_rating TEXT DEFAULT '',
    suggestions JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_smart_project ON smart_validations(project_id, created_at DESC);

ALTER TABLE smart_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage smart validations in their project"
    ON smart_validations FOR ALL
    USING (project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
        UNION
        SELECT project_id FROM team_members WHERE user_id = auth.uid()
    ));


-- ============================================
-- 7. VERIFICADOR DE PLÁGIO (plagio_checks)
-- ============================================
CREATE TABLE IF NOT EXISTS plagio_checks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    input_text TEXT DEFAULT '',
    similarity_score NUMERIC(5,2) DEFAULT 0,
    results JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_plagio_project ON plagio_checks(project_id, created_at DESC);

ALTER TABLE plagio_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage plagiarism checks in their project"
    ON plagio_checks FOR ALL
    USING (project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
        UNION
        SELECT project_id FROM team_members WHERE user_id = auth.uid()
    ));


-- ============================================
-- 8. DETECTOR DE I.A. (detector_ia_results)
-- ============================================
CREATE TABLE IF NOT EXISTS detector_ia_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    input_text TEXT DEFAULT '',
    ai_probability NUMERIC(5,2) DEFAULT 0,
    analysis JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_detector_ia_project ON detector_ia_results(project_id, created_at DESC);

ALTER TABLE detector_ia_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage AI detection results in their project"
    ON detector_ia_results FOR ALL
    USING (project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
        UNION
        SELECT project_id FROM team_members WHERE user_id = auth.uid()
    ));


-- ============================================
-- 9. TEMPLATES SALVOS PELO USUÁRIO (user_templates)
-- ============================================
CREATE TABLE IF NOT EXISTS user_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    template_slug TEXT NOT NULL,
    custom_content TEXT DEFAULT '',
    is_favorited BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_templates_project ON user_templates(project_id);

ALTER TABLE user_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their saved templates"
    ON user_templates FOR ALL
    USING (project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
        UNION
        SELECT project_id FROM team_members WHERE user_id = auth.uid()
    ));


-- ============================================
-- 10. TEAM MEMBERS (se ainda não existir)
-- Necessário para as RLS policies acima
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    invited_by TEXT,
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_members_project ON team_members(project_id);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners can manage team members"
    ON team_members FOR ALL
    USING (project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Team members can view their own membership"
    ON team_members FOR SELECT
    USING (user_id = auth.uid()::text);


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

-- Triggers de updated_at
CREATE TRIGGER update_anotacoes_updated_at
    BEFORE UPDATE ON anotacoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ideias_updated_at
    BEFORE UPDATE ON ideias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referencias_updated_at
    BEFORE UPDATE ON referencias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
