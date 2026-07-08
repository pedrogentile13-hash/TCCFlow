-- SQL para adicionar suporte a cupons PRO Direto
-- Execute isso no Supabase SQL Editor

-- Adicionar coluna coupon_type (tipo do cupom: 'discount' ou 'instant_pro')
ALTER TABLE coupons
ADD COLUMN coupon_type TEXT DEFAULT 'discount';

-- Adicionar coluna pro_duration_days (duração em dias para cupons PRO)
ALTER TABLE coupons
ADD COLUMN pro_duration_days INTEGER;

-- Criar índice para melhor performance ao buscar por tipo
CREATE INDEX idx_coupons_type ON coupons(coupon_type);

-- Atualizar cupons existentes para tipo 'discount'
UPDATE coupons
SET coupon_type = 'discount'
WHERE coupon_type IS NULL;

-- Constraint para garantir que coupon_type seja válido
ALTER TABLE coupons
ADD CONSTRAINT coupon_type_check
CHECK (coupon_type IN ('discount', 'instant_pro'));
