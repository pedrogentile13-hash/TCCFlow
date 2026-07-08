-- SQL para adicionar colunas faltantes na tabela subscriptions
-- Execute isso no Supabase SQL Editor

-- Adicionar coluna expires_at (data de expiração da assinatura PRO)
ALTER TABLE subscriptions
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

-- Adicionar coluna activated_at (data de ativação)
ALTER TABLE subscriptions
ADD COLUMN activated_at TIMESTAMP WITH TIME ZONE;

-- Criar índice para melhor performance
CREATE INDEX idx_subscriptions_expires_at ON subscriptions(expires_at);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
