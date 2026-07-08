// Netlify Function — Create Mercado Pago PreApproval (Recurring Subscription)
// Env vars required: MERCADOPAGO_ACCESS_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_KEY

const { MercadoPagoConfig, PreApproval } = require('mercadopago');
const { getUserFromEvent, serviceClient, jsonHeaders, unauthorized } = require('./_auth');

// IDs dos planos criados no Mercado Pago (preço fixo, sem cupom)
const PLAN_IDS = {
    'pro_annual': '31264e2dd96b4c71b3658272d76f4d6d',
    'pro_monthly': '5f5af10e145c4c9d8686bb1856cd3311'
};

// Preços-base permitidos por plano (fonte da verdade no servidor).
// O valor cobrado NUNCA vem do cliente — é sempre calculado aqui.
const PLAN_BASE_PRICES = {
    'pro_annual':  [124.90, 334.90],  // promo, cheio
    'pro_monthly': [14.90, 39.90]
};

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: jsonHeaders, body: '' };
    }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: jsonHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        // ── Identidade confiável via JWT ──────────────────────────
        const user = await getUserFromEvent(event);
        if (!user) return unauthorized();
        const userId = user.id;
        const userEmail = user.email;

        const { userName, planType, couponCode, originalAmount } = JSON.parse(event.body || '{}');

        const planId = PLAN_IDS[planType];
        if (!planId) {
            return { statusCode: 400, headers: jsonHeaders, body: JSON.stringify({ error: 'Invalid planType' }) };
        }

        // O preço-base precisa ser um valor conhecido (bloqueia manipulação)
        const allowedBases = PLAN_BASE_PRICES[planType];
        const basePrice = allowedBases.includes(Number(originalAmount))
            ? Number(originalAmount)
            : allowedBases[0];

        const siteUrl = process.env.URL || 'https://tccflow.com.br';
        const isAnnual = planType === 'pro_annual';
        let checkoutUrl;
        let effectiveDiscount = 0;
        let effectivePaid = null;
        let validatedCoupon = null;

        const supabase = serviceClient();

        // ── Validar cupom no servidor e calcular o valor final aqui ──
        let coupon = null;
        if (couponCode) {
            const { data } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase().trim())
                .eq('active', true)
                .maybeSingle();
            const notExpired = data && (!data.expires_at || new Date(data.expires_at) >= new Date());
            const hasUses = data && (data.max_uses === null || data.used_count < data.max_uses);
            const isDiscount = data && (data.coupon_type || 'discount') === 'discount' && data.discount_percent > 0;
            if (data && notExpired && hasUses && isDiscount) coupon = data;
        }

        if (coupon) {
            // Desconto e valor SEMPRE derivados do servidor
            effectiveDiscount = coupon.discount_percent;
            effectivePaid = Math.max(1, Math.round(basePrice * (1 - effectiveDiscount / 100) * 100) / 100);
            validatedCoupon = coupon.code;

            const client = new MercadoPagoConfig({
                accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
            });
            const preApproval = new PreApproval(client);

            const trialDays = isAnnual ? 14 : 7;

            const body = {
                reason: `TCCFlow Pro - ${isAnnual ? 'Anual' : 'Mensal'} (cupom ${validatedCoupon})`,
                external_reference: userId,
                payer_email: userEmail,
                auto_recurring: {
                    frequency: isAnnual ? 12 : 1,
                    frequency_type: 'months',
                    transaction_amount: effectivePaid,
                    currency_id: 'BRL',
                    free_trial: {
                        frequency: trialDays,
                        frequency_type: 'days'
                    }
                },
                back_url: `${siteUrl}/pages/pagamento-sucesso.html`,
                status: 'pending'
            };

            const result = await preApproval.create({ body });
            checkoutUrl = result.init_point;

            if (!checkoutUrl) {
                console.error('No init_point in PreApproval response');
                return { statusCode: 500, headers: jsonHeaders, body: JSON.stringify({ error: 'Erro ao criar assinatura com desconto' }) };
            }

            // Incremento atômico (respeita max_uses / expiração)
            await supabase.rpc('increment_coupon_usage', { coupon_code: validatedCoupon });
        } else {
            // Sem cupom: usar plano fixo do Mercado Pago
            checkoutUrl = `https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=${planId}&payer_email=${encodeURIComponent(userEmail)}`;
        }

        console.log('PreApproval checkout URL:', checkoutUrl);

        // Salvar no Supabase com status 'pending' até confirmação
        const { error: upsertError } = await supabase
            .from('subscriptions')
            .upsert({
                id: userId,
                user_id: userId,
                user_email: userEmail,
                user_name: userName || '',
                status: 'pending',
                plan: 'free',
                plan_type: planType,
                seats: 1,
                payment_method: 'mercadopago',
                coupon_code: validatedCoupon,
                discount_percent: effectiveDiscount,
                original_amount: basePrice,
                paid_amount: effectivePaid
            }, { onConflict: 'id' });

        if (upsertError) {
            console.error('Supabase upsert error:', upsertError);
            return { statusCode: 500, headers: jsonHeaders, body: JSON.stringify({ error: 'Failed to save subscription' }) };
        }

        return {
            statusCode: 200,
            headers: jsonHeaders,
            body: JSON.stringify({
                url: checkoutUrl,
                message: 'Redirecionando para Mercado Pago'
            })
        };

    } catch (err) {
        console.error('PreApproval error:', err);
        return {
            statusCode: 500,
            headers: jsonHeaders,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
