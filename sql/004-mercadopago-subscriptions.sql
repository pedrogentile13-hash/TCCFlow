-- ============================================================
-- Mercado Pago Subscriptions (Assinatura Recorrente)
-- Transforma Checkout PRO único em Assinatura Recorrente
-- ============================================================

-- ============================================================
-- EXTEND: Subscriptions table (adiciona campos para MP)
-- ============================================================

-- Adicionar coluna de identificação Mercado Pago
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS mercadopago_subscription_id TEXT UNIQUE;
-- ID da assinatura no Mercado Pago (ex: 123456789-abcde)

-- Adicionar coluna de preaprovação
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS mercadopago_preapproval_id TEXT UNIQUE;
-- ID do preapproval (primeiro pagamento autorizado)

-- Tipo de plano: 'free' ou 'pro_annual' (ou 'pro_monthly' no futuro)
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free';

-- Valor atual da assinatura
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS monthly_price NUMERIC(10,2) DEFAULT 97.90;

-- Data de início do período atual
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ;

-- Data de término do período atual
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- Data do próximo pagamento agendado
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ;

-- Data em que a assinatura foi cancelada
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Motivo do cancelamento (opcional)
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_mp_subscription_id ON subscriptions(mercadopago_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_mp_preapproval_id ON subscriptions(mercadopago_preapproval_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(next_billing_date);

-- ============================================================
-- Tabela de Transações/Pagamentos (rastreabilidade)
-- ============================================================

CREATE TABLE IF NOT EXISTS subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    mercadopago_payment_id TEXT UNIQUE,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, declined, refunded, cancelled
    payment_method TEXT, -- credit_card, debit_card, boleto
    payment_type TEXT, -- regular, trial (pagamento de teste)
    failure_reason TEXT, -- motivo da falha, se houver
    created_at TIMESTAMPTZ DEFAULT now(),
    paid_at TIMESTAMPTZ,
    next_retry_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription ON subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON subscription_payments(status);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_mp_id ON subscription_payments(mercadopago_payment_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_created ON subscription_payments(created_at DESC);

-- ============================================================
-- Tabela de Histórico (auditoria)
-- ============================================================

CREATE TABLE IF NOT EXISTS subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    event TEXT NOT NULL, -- 'created', 'activated', 'payment_received', 'payment_failed', 'cancelled', 'updated'
    old_values JSONB, -- estado anterior
    new_values JSONB, -- estado novo
    metadata JSONB, -- dados adicionais (ex: resposta MP, erro, etc)
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_history_subscription ON subscription_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_event ON subscription_history(event);

-- ============================================================
-- Função auxiliar: Calcular próxima data de cobrança
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_next_billing_date(
    start_date TIMESTAMPTZ,
    interval_months INTEGER DEFAULT 12
)
RETURNS TIMESTAMPTZ AS $$
BEGIN
    RETURN start_date + (interval_months || ' months')::INTERVAL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- Função auxiliar: Atualizar status de assinatura
-- ============================================================

CREATE OR REPLACE FUNCTION update_subscription_status(
    p_subscription_id UUID,
    p_new_status TEXT,
    p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_old_status TEXT;
    v_subscription subscriptions%ROWTYPE;
BEGIN
    -- Validar status
    IF p_new_status NOT IN ('active', 'inactive', 'paused', 'cancelled', 'expired') THEN
        RAISE EXCEPTION 'Invalid status: %', p_new_status;
    END IF;

    -- Obter dados antigos
    SELECT * INTO v_subscription FROM subscriptions WHERE id = p_subscription_id;
    v_old_status := v_subscription.status;

    -- Atualizar status
    UPDATE subscriptions
    SET status = p_new_status,
        cancelled_at = CASE WHEN p_new_status = 'cancelled' THEN now() ELSE cancelled_at END
    WHERE id = p_subscription_id;

    -- Registrar no histórico
    INSERT INTO subscription_history (subscription_id, event, old_values, new_values, metadata)
    VALUES (
        p_subscription_id,
        'updated',
        jsonb_build_object('status', v_old_status),
        jsonb_build_object('status', p_new_status),
        p_metadata
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Função: Registrar pagamento de assinatura
-- ============================================================

CREATE OR REPLACE FUNCTION record_subscription_payment(
    p_subscription_id UUID,
    p_mercadopago_payment_id TEXT,
    p_amount NUMERIC,
    p_status TEXT,
    p_payment_method TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_payment_id UUID;
    v_next_billing_date TIMESTAMPTZ;
BEGIN
    -- Gerar ID de pagamento
    v_payment_id := gen_random_uuid();

    -- Inserir pagamento
    INSERT INTO subscription_payments (
        id,
        subscription_id,
        mercadopago_payment_id,
        amount,
        status,
        payment_method,
        paid_at
    ) VALUES (
        v_payment_id,
        p_subscription_id,
        p_mercadopago_payment_id,
        p_amount,
        p_status,
        p_payment_method,
        CASE WHEN p_status = 'approved' THEN now() ELSE NULL END
    );

    -- Se aprovado, atualizar próxima data de cobrança
    IF p_status = 'approved' THEN
        v_next_billing_date := calculate_next_billing_date(now(), 12);

        UPDATE subscriptions
        SET status = 'active',
            next_billing_date = v_next_billing_date,
            current_period_start = now(),
            current_period_end = v_next_billing_date
        WHERE id = p_subscription_id;

        INSERT INTO subscription_history (subscription_id, event, new_values, metadata)
        VALUES (
            p_subscription_id,
            'payment_received',
            jsonb_build_object('amount', p_amount, 'status', p_status),
            jsonb_build_object('next_billing_date', v_next_billing_date)
        );
    END IF;

    RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Usuário pode ver seus próprios pagamentos
CREATE POLICY "Users can read own subscription payments" ON subscription_payments
FOR SELECT USING (
    subscription_id IN (
        SELECT id FROM subscriptions WHERE user_id = auth.uid()
    )
);

-- Usuário pode ver seu próprio histórico
CREATE POLICY "Users can read own subscription history" ON subscription_history
FOR SELECT USING (
    subscription_id IN (
        SELECT id FROM subscriptions WHERE user_id = auth.uid()
    )
);

-- ============================================================
-- Grant permissions to system (não necessário se usando service role)
-- ============================================================

GRANT EXECUTE ON FUNCTION calculate_next_billing_date TO authenticated;
GRANT EXECUTE ON FUNCTION update_subscription_status TO authenticated;
GRANT EXECUTE ON FUNCTION record_subscription_payment TO authenticated;
