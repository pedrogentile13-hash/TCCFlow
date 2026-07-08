// Netlify Function — Validate Coupon Code
// Env vars required: SUPABASE_URL, SUPABASE_SERVICE_KEY

const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { code } = JSON.parse(event.body);

        if (!code || typeof code !== 'string') {
            return { statusCode: 400, headers, body: JSON.stringify({ valid: false, error: 'Código inválido' }) };
        }

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code.toUpperCase().trim())
            .eq('active', true)
            .maybeSingle();

        if (error || !coupon) {
            return {
                statusCode: 200, headers,
                body: JSON.stringify({ valid: false, error: 'Cupom não encontrado ou inativo' })
            };
        }

        // Check expiration
        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return {
                statusCode: 200, headers,
                body: JSON.stringify({ valid: false, error: 'Cupom expirado' })
            };
        }

        // Check usage limit
        if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
            return {
                statusCode: 200, headers,
                body: JSON.stringify({ valid: false, error: 'Cupom esgotado' })
            };
        }

        return {
            statusCode: 200, headers,
            body: JSON.stringify({
                valid: true,
                code: coupon.code,
                discount_percent: coupon.discount_percent,
                coupon_type: coupon.coupon_type || 'discount',
                pro_duration_days: coupon.pro_duration_days || null
            })
        };

    } catch (err) {
        console.error('Validate coupon error:', err);
        return {
            statusCode: 500, headers,
            body: JSON.stringify({ valid: false, error: 'Erro interno' })
        };
    }
};
