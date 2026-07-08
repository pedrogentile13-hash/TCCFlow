-- Correção das colunas faltantes na tabela subscriptions
-- Execute APENAS os comandos que falharem no Supabase SQL Editor

-- Se a coluna expires_at não existir, execute isto:
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Índices (se ainda não existirem):
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
