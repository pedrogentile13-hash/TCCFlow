// Netlify Function — Activate PRO via instant_pro coupon
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
        const { code, userId, userEmail, userName } = JSON.parse(event.body);

        if (!code || !userId || !userEmail) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Campos obrigatórios faltando' }) };
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
            return { statusCode: 200, headers, body: JSON.stringify({ success: false, error: 'Cupom não encontrado' }) };
        }

        if (coupon.coupon_type !== 'instant_pro') {
            return { statusCode: 200, headers, body: JSON.stringify({ success: false, error: 'Este cupom não é do tipo PRO Direto' }) };
        }

        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return { statusCode: 200, headers, body: JSON.stringify({ success: false, error: 'Cupom expirado' }) };
        }

        if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
            return { statusCode: 200, headers, body: JSON.stringify({ success: false, error: 'Cupom esgotado' }) };
        }

        const durationDays = coupon.pro_duration_days || 365;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

        // Generate UUID for subscription
        const generateUUID = () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };

        const subscriptionId = generateUUID();

        // Create subscription
        const { data: subData, error: subError } = await supabase.from('subscriptions').insert({
            id: subscriptionId,
            user_id: userId,
            user_email: userEmail,
            user_name: userName || 'Usuário',
            plan: 'pro',
            status: 'active',
            payment_method: 'coupon',
            paid_amount: 0,
            coupon_code: coupon.code,
            activated_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
            seats: 5
        }).select();

        if (subError) {
            console.error('Subscription creation error:', subError);
            return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: 'Erro ao criar assinatura: ' + subError.message }) };
        }

        // Update user plan
        const { error: userError } = await supabase.from('users')
            .update({ plan: 'pro' })
            .eq('id', userId);

        if (userError) {
            console.error('User update error:', userError);
            return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: 'Erro ao atualizar plano: ' + userError.message }) };
        }

        // Increment coupon usage
        const { error: couponError } = await supabase.from('coupons')
            .update({ used_count: coupon.used_count + 1 })
            .eq('id', coupon.id);

        if (couponError) {
            console.error('Coupon update error:', couponError);
        }

        return {
            statusCode: 200, headers,
            body: JSON.stringify({
                success: true,
                plan: 'pro',
                expires_at: expiresAt.toISOString(),
                duration_days: durationDays
            })
        };

    } catch (err) {
        console.error('Activate PRO coupon error:', err);
        return {
            statusCode: 500, headers,
            body: JSON.stringify({
                success: false,
                error: 'Erro ao ativar PRO: ' + (err.message || err.toString()),
                details: err.toString()
            })
        };
    }
};
