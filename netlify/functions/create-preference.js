// Netlify Function — Create Mercado Pago Checkout Preference
// Env vars required: MERCADOPAGO_ACCESS_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_KEY

const { MercadoPagoConfig, Preference } = require('mercadopago');
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { seats, totalCents, userId, userEmail, userName, couponCode } = JSON.parse(event.body);

        if (!seats || !totalCents || !userId || !userEmail) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
        }

        let finalCents = totalCents;
        let discountPercent = 0;
        let validatedCoupon = null;

        // Validate and apply coupon if provided
        if (couponCode) {
            const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_KEY
            );

            const { data: coupon } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase().trim())
                .eq('active', true)
                .maybeSingle();

            if (coupon) {
                const notExpired = !coupon.expires_at || new Date(coupon.expires_at) >= new Date();
                const hasUses = coupon.max_uses === null || coupon.used_count < coupon.max_uses;

                if (notExpired && hasUses) {
                    discountPercent = coupon.discount_percent;
                    finalCents = Math.round(totalCents * (1 - discountPercent / 100));
                    validatedCoupon = coupon.code;

                    // Increment used_count
                    await supabase
                        .from('coupons')
                        .update({ used_count: coupon.used_count + 1 })
                        .eq('id', coupon.id);
                }
            }
        }

        // Prevent R$ 0 payments — minimum R$ 1,00
        if (finalCents < 100) finalCents = 100;

        const client = new MercadoPagoConfig({
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
        });

        const preference = new Preference(client);

        const siteUrl = process.env.URL || 'https://tccflow.com.br';

        const titleSuffix = discountPercent > 0 ? ` (${discountPercent}% OFF)` : '';

        const result = await preference.create({
            body: {
                items: [
                    {
                        id: 'tccflow-pro-annual',
                        title: `TCCFlow Pro — ${seats} ${seats > 1 ? 'membros' : 'membro'} (Anual)${titleSuffix}`,
                        description: `Plano Pro do TCCFlow com ${seats} assento${seats > 1 ? 's' : ''}. Acesso a todas as ferramentas PRO, 1.000 buscas I.A./mês, Google integrado e muito mais.`,
                        quantity: 1,
                        currency_id: 'BRL',
                        unit_price: finalCents / 100
                    }
                ],
                payer: {
                    name: userName,
                    email: userEmail
                },
                payment_methods: {
                    default_payment_method_id: 'pix',
                    excluded_payment_types: [],
                    installments: 1
                },
                metadata: {
                    user_id: userId,
                    user_email: userEmail,
                    user_name: userName,
                    seats: seats,
                    plan: 'pro',
                    coupon_code: validatedCoupon || '',
                    discount_percent: discountPercent,
                    original_amount: totalCents / 100,
                    paid_amount: finalCents / 100
                },
                back_urls: {
                    success: `${siteUrl}/pages/pagamento-sucesso.html`,
                    failure: `${siteUrl}/pages/planos.html?status=failure`,
                    pending: `${siteUrl}/pages/pagamento-sucesso.html?status=pending`
                },
                auto_return: 'approved',
                notification_url: `${siteUrl}/.netlify/functions/mp-webhook`,
                statement_descriptor: 'TCCFLOW PRO',
                external_reference: userId
            }
        });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: result.init_point,
                id: result.id,
                discount_percent: discountPercent,
                final_price: finalCents / 100
            })
        };

    } catch (err) {
        console.error('Mercado Pago error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message || 'Internal server error' })
        };
    }
};
