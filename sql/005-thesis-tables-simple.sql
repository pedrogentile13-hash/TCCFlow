-- ============================================================
-- Criar tabelas de Trabalho Escrito (Thesis)
-- ============================================================

-- 1. THESIS CHAPTERS
CREATE TABLE IF NOT EXISTS thesis_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_thesis_chapters_project ON thesis_chapters(project_id, sort_order);

-- 2. THESIS SECTIONS
CREATE TABLE IF NOT EXISTS thesis_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES thesis_chapters(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    content TEXT DEFAULT '',
    status TEXT DEFAULT 'draft',
    word_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_thesis_sections_chapter ON thesis_sections(chapter_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_thesis_sections_project ON thesis_sections(project_id);

-- 3. THESIS FEEDBACK
CREATE TABLE IF NOT EXISTS thesis_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES thesis_sections(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    orientador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL DEFAULT '',
    grade NUMERIC(4,2),
    status TEXT DEFAULT 'revision',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_thesis_feedback_section ON thesis_feedback(section_id);
CREATE INDEX IF NOT EXISTS idx_thesis_feedback_project ON thesis_feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_thesis_feedback_orientador ON thesis_feedback(orientador_id);

-- ============================================================
-- Fix: Adicionar colunas faltando na tabela TASKS
-- ============================================================

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- ============================================================
-- Trigger de updated_at
-- ============================================================

DROP TRIGGER IF EXISTS update_thesis_chapters_updated_at ON thesis_chapters;
CREATE TRIGGER update_thesis_chapters_updated_at
    BEFORE UPDATE ON thesis_chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_thesis_sections_updated_at ON thesis_sections;
CREATE TRIGGER update_thesis_sections_updated_at
    BEFORE UPDATE ON thesis_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Enable RLS (sem policies complexas por enquanto)
-- ============================================================

ALTER TABLE thesis_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_feedback ENABLE ROW LEVEL SECURITY;

-- Permitir acesso básico (vamos refinar depois)
CREATE POLICY "thesis_chapters_all" ON thesis_chapters FOR ALL USING (true);
CREATE POLICY "thesis_sections_all" ON thesis_sections FOR ALL USING (true);
CREATE POLICY "thesis_feedback_all" ON thesis_feedback FOR ALL USING (true);
