// Netlify Function — Create Mercado Pago Checkout Preference
// Env vars required: MERCADOPAGO_ACCESS_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_KEY
// Price is ALWAYS computed server-side from seats. Identity comes from the JWT.

const { MercadoPagoConfig, Preference } = require('mercadopago');
const { getUserFromEvent, serviceClient, jsonHeaders, unauthorized } = require('./_auth');

// Server-side pricing (mirrors js/pricing-config.js)
const BASE_PRICE = 97;   // annual, 1 seat (BRL)
const SEAT_PRICE = 30;   // per extra seat/year
const MAX_SEATS = 8;

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: jsonHeaders, body: '' };
    }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: jsonHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        // ── Trusted identity from JWT ─────────────────────────────
        const user = await getUserFromEvent(event);
        if (!user) return unauthorized();
        const userId = user.id;
        const userEmail = user.email;
        const userName = user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário';

        const { seats: rawSeats, couponCode } = JSON.parse(event.body || '{}');

        // Clamp seats to a valid range and compute the price ourselves
        const seats = Math.max(1, Math.min(MAX_SEATS, parseInt(rawSeats, 10) || 1));
        const basePriceReais = BASE_PRICE + (seats - 1) * SEAT_PRICE;
        let totalCents = Math.round(basePriceReais * 100);

        let finalCents = totalCents;
        let discountPercent = 0;
        let validatedCoupon = null;

        const supabase = serviceClient();

        // Validate coupon server-side; use the coupon's real discount only
        if (couponCode) {
            const { data: coupon } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase().trim())
                .eq('active', true)
                .maybeSingle();

            const notExpired = coupon && (!coupon.expires_at || new Date(coupon.expires_at) >= new Date());
            const hasUses = coupon && (coupon.max_uses === null || coupon.used_count < coupon.max_uses);
            const isDiscount = coupon && (coupon.coupon_type || 'discount') === 'discount' && coupon.discount_percent > 0;

            if (coupon && notExpired && hasUses && isDiscount) {
                discountPercent = coupon.discount_percent;
                finalCents = Math.round(totalCents * (1 - discountPercent / 100));
                validatedCoupon = coupon.code;
                await supabase.rpc('increment_coupon_usage', { coupon_code: coupon.code });
            }
        }

        // Minimum R$ 1,00
        if (finalCents < 100) finalCents = 100;

        const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
        const preference = new Preference(client);
        const siteUrl = process.env.URL || 'https://tccflow.com.br';
        const titleSuffix = discountPercent > 0 ? ` (${discountPercent}% OFF)` : '';

        const result = await preference.create({
            body: {
                items: [
                    {
                        id: 'tccflow-pro-annual',
                        title: `TCCFlow Pro — ${seats} ${seats > 1 ? 'membros' : 'membro'} (Anual)${titleSuffix}`,
                        description: `Plano Pro do TCCFlow com ${seats} assento${seats > 1 ? 's' : ''}.`,
                        quantity: 1,
                        currency_id: 'BRL',
                        unit_price: finalCents / 100
                    }
                ],
                payer: { name: userName, email: userEmail },
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
            headers: jsonHeaders,
            body: JSON.stringify({
                url: result.init_point,
                id: result.id,
                discount_percent: discountPercent,
                final_price: finalCents / 100
            })
        };

    } catch (err) {
        console.error('Mercado Pago error:', err);
        return { statusCode: 500, headers: jsonHeaders, body: JSON.stringify({ error: 'Internal server error' }) };
    }
};
