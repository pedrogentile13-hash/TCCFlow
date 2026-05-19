-- ============================================================
-- TCCFlow - Tabelas do Trabalho Escrito + Fix Tarefas
-- ============================================================

-- ============================================================
-- 1. THESIS CHAPTERS (capítulos do trabalho)
-- ============================================================
CREATE TABLE IF NOT EXISTS thesis_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_thesis_chapters_project ON thesis_chapters(project_id, sort_order);

ALTER TABLE thesis_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Thesis chapters by project members" ON thesis_chapters FOR ALL
USING (
    project_id = get_my_project_id() AND get_my_project_id() IS NOT NULL
);

-- Orientador pode ler capítulos dos projetos que orienta
CREATE POLICY "Orientador can read thesis chapters" ON thesis_chapters FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM orientador_projects op
        WHERE op.project_id = thesis_chapters.project_id
          AND op.orientador_id = auth.uid()
          AND op.status = 'accepted'
    )
);

-- ============================================================
-- 2. THESIS SECTIONS (seções dentro dos capítulos)
-- ============================================================
CREATE TABLE IF NOT EXISTS thesis_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES thesis_chapters(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    content TEXT DEFAULT '',
    status TEXT DEFAULT 'draft', -- draft, review, approved, revision
    word_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_thesis_sections_chapter ON thesis_sections(chapter_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_thesis_sections_project ON thesis_sections(project_id);

ALTER TABLE thesis_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Thesis sections by project members" ON thesis_sections FOR ALL
USING (
    project_id = get_my_project_id() AND get_my_project_id() IS NOT NULL
);

-- Orientador pode ler seções dos projetos que orienta
CREATE POLICY "Orientador can read thesis sections" ON thesis_sections FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM orientador_projects op
        WHERE op.project_id = thesis_sections.project_id
          AND op.orientador_id = auth.uid()
          AND op.status = 'accepted'
    )
);

-- ============================================================
-- 3. THESIS FEEDBACK (feedback do orientador por seção)
-- ============================================================
CREATE TABLE IF NOT EXISTS thesis_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES thesis_sections(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    orientador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL DEFAULT '',
    grade NUMERIC(4,2),
    status TEXT DEFAULT 'revision', -- revision, approved
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_thesis_feedback_section ON thesis_feedback(section_id);
CREATE INDEX IF NOT EXISTS idx_thesis_feedback_project ON thesis_feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_thesis_feedback_orientador ON thesis_feedback(orientador_id);

ALTER TABLE thesis_feedback ENABLE ROW LEVEL SECURITY;

-- Membros do projeto podem ler feedback
CREATE POLICY "Project members can read thesis feedback" ON thesis_feedback FOR SELECT
USING (
    project_id = get_my_project_id() AND get_my_project_id() IS NOT NULL
);

-- Orientador pode ler e inserir feedback nos projetos que orienta
CREATE POLICY "Orientador can read thesis feedback" ON thesis_feedback FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM orientador_projects op
        WHERE op.project_id = thesis_feedback.project_id
          AND op.orientador_id = auth.uid()
          AND op.status = 'accepted'
    )
);

CREATE POLICY "Orientador can insert thesis feedback" ON thesis_feedback FOR INSERT
WITH CHECK (
    orientador_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM orientador_projects op
        WHERE op.project_id = thesis_feedback.project_id
          AND op.orientador_id = auth.uid()
          AND op.status = 'accepted'
    )
);

CREATE POLICY "Orientador can delete own feedback" ON thesis_feedback FOR DELETE
USING (orientador_id = auth.uid());

-- ============================================================
-- 4. FIX: Adicionar colunas faltando na tabela TASKS
-- ============================================================

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- ============================================================
-- 5. Trigger de updated_at para thesis tables
-- ============================================================

DROP TRIGGER IF EXISTS update_thesis_chapters_updated_at ON thesis_chapters;
CREATE TRIGGER update_thesis_chapters_updated_at
    BEFORE UPDATE ON thesis_chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_thesis_sections_updated_at ON thesis_sections;
CREATE TRIGGER update_thesis_sections_updated_at
    BEFORE UPDATE ON thesis_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
