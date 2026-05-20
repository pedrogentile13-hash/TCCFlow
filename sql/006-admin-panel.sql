-- ============================================
-- TCCFlow - Admin Panel Tables
-- ============================================

-- ============================================
-- 1. ADMIN LOGS (Rastreamento de atividades)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    old_value JSONB,
    new_value JSONB,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs"
    ON admin_logs FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM admin_emails WHERE active = true));

-- ============================================
-- 2. ADMIN SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
    ('platform.name', '"TCCFlow"', 'Nome da plataforma'),
    ('platform.version', '"1.0.0"', 'Versão da plataforma'),
    ('billing.currency', '"BRL"', 'Moeda padrão'),
    ('support.email', '"support@tccflow.com"', 'Email de suporte'),
    ('features.maintenance', 'false', 'Modo manutenção')
ON CONFLICT (setting_key) DO NOTHING;

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view settings"
    ON admin_settings FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM admin_emails WHERE active = true));

-- ============================================
-- 3. REFUNDS (Devoluções)
-- ============================================
CREATE TABLE IF NOT EXISTS refunds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID REFERENCES subscriptions(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    payment_id TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, processed, rejected
    requested_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refunds_user_id ON refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_created_at ON refunds(created_at DESC);

ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage refunds"
    ON refunds FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM admin_emails WHERE active = true));

-- ============================================
-- 4. CHURN ANALYSIS
-- ============================================
CREATE TABLE IF NOT EXISTS churn_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    email TEXT,
    name TEXT,
    subscription_status TEXT,
    days_since_signup INTEGER,
    days_since_last_activity INTEGER,
    login_count INTEGER DEFAULT 0,
    project_count INTEGER DEFAULT 0,
    task_completion_rate DECIMAL(3, 2),
    ai_search_count INTEGER DEFAULT 0,
    churn_risk_score DECIMAL(3, 2),
    churn_risk_level TEXT, -- low, medium, high, critical
    reason_predicted TEXT,
    analysis_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_churn_user_id ON churn_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_churn_risk_level ON churn_analysis(churn_risk_level);
CREATE INDEX IF NOT EXISTS idx_churn_analysis_date ON churn_analysis(analysis_date DESC);

ALTER TABLE churn_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view churn analysis"
    ON churn_analysis FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM admin_emails WHERE active = true));

-- ============================================
-- 5. EMAIL CAMPAIGNS
-- ============================================
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_name TEXT NOT NULL,
    campaign_type TEXT, -- announcement, promotional, educational, feedback
    subject TEXT NOT NULL,
    content_html TEXT NOT NULL,
    target_segment TEXT, -- all, free, pro, churn_risk
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft', -- draft, scheduled, sending, sent, failed
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON email_campaigns(created_at DESC);

ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage campaigns"
    ON email_campaigns FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM admin_emails WHERE active = true));

-- ============================================
-- 6. EMAIL CAMPAIGN TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS email_campaign_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    email TEXT,
    status TEXT DEFAULT 'pending', -- pending, sent, opened, clicked, bounced, failed
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    clicked_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaign_tracking_campaign ON email_campaign_tracking(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_tracking_user ON email_campaign_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_tracking_status ON email_campaign_tracking(status);

ALTER TABLE email_campaign_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view campaign tracking"
    ON email_campaign_tracking FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM admin_emails WHERE active = true));

-- ============================================
-- 7. FEATURES & FEATURE FLAGS
-- ============================================
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feature_name TEXT UNIQUE NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT false,
    enabled_for_free BOOLEAN DEFAULT false,
    enabled_for_pro BOOLEAN DEFAULT true,
    rollout_percentage INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO feature_flags (feature_name, description, enabled, enabled_for_pro) VALUES
    ('google_integration', 'Integração com Google Drive, Docs e Calendar', true, true),
    ('ai_search', 'Buscas com inteligência artificial', true, true),
    ('team_collaboration', 'Colaboração em equipe', true, true),
    ('orientador_panel', 'Painel do orientador', true, true),
    ('advanced_analytics', 'Análise avançada de TCC', false, true),
    ('api_access', 'Acesso via API', false, false)
ON CONFLICT (feature_name) DO NOTHING;

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage features"
    ON feature_flags FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM admin_emails WHERE active = true));

-- ============================================
-- 8. ADMIN EMAILS (Controle de acesso)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin', -- admin, super_admin, moderator
    active BOOLEAN DEFAULT true,
    added_by UUID REFERENCES auth.users(id),
    added_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_emails_user_id ON admin_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_emails_active ON admin_emails(active);

-- Insert default admin if not exists
INSERT INTO admin_emails (user_id, email, role, active)
SELECT id, email, 'super_admin', true
FROM auth.users
WHERE email IN ('pedro@tccflow.com.br', 'admin@tccflow.com.br')
ON CONFLICT (email) DO NOTHING;

ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view other admins"
    ON admin_emails FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM admin_emails WHERE active = true));

-- ============================================
-- HELPER VIEWS
-- ============================================

-- Vista para estatísticas de assinatura
CREATE OR REPLACE VIEW subscription_stats AS
SELECT
    COUNT(DISTINCT id) as total_subscriptions,
    COUNT(DISTINCT CASE WHEN status = 'active' THEN id END) as active_count,
    COUNT(DISTINCT CASE WHEN status = 'cancelled' THEN id END) as cancelled_count,
    COUNT(DISTINCT CASE WHEN plan = 'pro' AND status = 'active' THEN id END) as pro_count,
    COALESCE(SUM(CASE WHEN status = 'active' THEN paid_amount ELSE 0 END), 0)::DECIMAL as total_revenue,
    COALESCE(AVG(CASE WHEN status = 'active' THEN paid_amount ELSE NULL END), 0)::DECIMAL as avg_mrr
FROM subscriptions;

-- Vista para estatísticas de usuários
CREATE OR REPLACE VIEW user_stats AS
SELECT
    COUNT(DISTINCT id) as total_users,
    COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN id END) as new_users_week,
    COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN id END) as new_users_month,
    COUNT(DISTINCT project_id) as total_projects
FROM users;

-- Vista para estatísticas de cupons
CREATE OR REPLACE VIEW coupon_stats AS
SELECT
    COUNT(DISTINCT id) as total_coupons,
    COUNT(DISTINCT CASE WHEN active = true THEN id END) as active_coupons,
    COALESCE(SUM(CASE WHEN active = true THEN used_count ELSE 0 END), 0)::INTEGER as total_uses,
    COALESCE(SUM(CASE WHEN active = true THEN discount_percent * used_count ELSE 0 END), 0)::DECIMAL as estimated_discount_given
FROM coupons;
