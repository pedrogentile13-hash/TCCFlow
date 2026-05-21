// Netlify Function — Create Mercado Pago PreApproval (Recurring Subscription)
// Env vars required: MERCADOPAGO_ACCESS_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_KEY

const { MercadoPagoConfig, PreApproval } = require('mercadopago');
const { createClient } = require('@supabase/supabase-js');

// IDs dos planos criados no Mercado Pago (preço fixo, sem cupom)
const PLAN_IDS = {
    'pro_annual': '31264e2dd96b4c71b3658272d76f4d6d',
    'pro_monthly': '5f5af10e145c4c9d8686bb1856cd3311'
};

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { userId, userEmail, userName, planType, couponCode, discountPercent, originalAmount, paidAmount } = JSON.parse(event.body);

        if (!userId || !userEmail) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields: userId, userEmail' }) };
        }

        const planId = PLAN_IDS[planType];
        if (!planId) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid planType' }) };
        }

        const siteUrl = process.env.URL || 'https://tccflow.com.br';
        const isAnnual = planType === 'pro_annual';
        let checkoutUrl;

        if (couponCode && discountPercent > 0 && paidAmount) {
            // Com cupom: criar assinatura avulsa via API com valor descontado
            const client = new MercadoPagoConfig({
                accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
            });
            const preApproval = new PreApproval(client);

            const trialDays = isAnnual ? 14 : 7;

            const body = {
                reason: `TCCFlow Pro - ${isAnnual ? 'Anual' : 'Mensal'} (cupom ${couponCode})`,
                external_reference: userId,
                payer_email: userEmail,
                auto_recurring: {
                    frequency: isAnnual ? 12 : 1,
                    frequency_type: 'months',
                    transaction_amount: parseFloat(paidAmount.toFixed(2)),
                    currency_id: 'BRL',
                    free_trial: {
                        frequency: trialDays,
                        frequency_type: 'days'
                    }
                },
                back_url: `${siteUrl}/pages/pagamento-sucesso.html`,
                status: 'pending'
            };

            console.log('Creating custom PreApproval with coupon:', JSON.stringify(body));

            const result = await preApproval.create({ body });

            checkoutUrl = result.init_point;

            if (!checkoutUrl) {
                console.error('No init_point in PreApproval response:', JSON.stringify(result));
                return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao criar assinatura com desconto' }) };
            }

            console.log('Custom PreApproval created:', result.id, 'URL:', checkoutUrl);

            // Incrementar used_count do cupom
            const supabaseForCoupon = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_KEY
            );
            await supabaseForCoupon.rpc('increment_coupon_usage', { coupon_code: couponCode }).catch(e => {
                // Fallback: incrementar manualmente
                supabaseForCoupon.from('coupons')
                    .select('used_count')
                    .eq('code', couponCode)
                    .maybeSingle()
                    .then(({ data }) => {
                        if (data) {
                            supabaseForCoupon.from('coupons')
                                .update({ used_count: (data.used_count || 0) + 1 })
                                .eq('code', couponCode);
                        }
                    });
            });
        } else {
            // Sem cupom: usar plano fixo do Mercado Pago
            checkoutUrl = `https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=${planId}&payer_email=${encodeURIComponent(userEmail)}`;
        }

        console.log('PreApproval checkout URL:', checkoutUrl);

        // Salvar no Supabase com status 'pending' até confirmação
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

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
                coupon_code: couponCode || null,
                discount_percent: discountPercent || 0,
                original_amount: originalAmount || null,
                paid_amount: paidAmount || null
            }, { onConflict: 'id' });

        if (upsertError) {
            console.error('Supabase upsert error:', upsertError);
            return { statusCode: 500, body: JSON.stringify({ error: 'Failed to save subscription' }) };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: checkoutUrl,
                message: 'Redirecionando para Mercado Pago'
            })
        };

    } catch (err) {
        console.error('PreApproval error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message || 'Internal server error' })
        };
    }
};
