// Netlify Function — Activate PRO via instant_pro coupon
// Env vars required: SUPABASE_URL, SUPABASE_SERVICE_KEY
// Identity is derived from the verified Supabase JWT, NOT from the request body.

const { getUserFromEvent, serviceClient, jsonHeaders, unauthorized } = require('./_auth');

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

        const { code } = JSON.parse(event.body || '{}');
        if (!code) {
            return { statusCode: 400, headers: jsonHeaders, body: JSON.stringify({ error: 'Cupom obrigatório' }) };
        }

        const supabase = serviceClient();

        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code.toUpperCase().trim())
            .eq('active', true)
            .maybeSingle();

        if (error || !coupon) {
            return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify({ success: false, error: 'Cupom não encontrado' }) };
        }

        if (coupon.coupon_type !== 'instant_pro') {
            return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify({ success: false, error: 'Este cupom não é do tipo PRO Direto' }) };
        }

        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify({ success: false, error: 'Cupom expirado' }) };
        }

        // ── Atomically claim one use (respects max_uses, prevents races) ──
        const { data: claimed, error: claimError } = await supabase
            .rpc('increment_coupon_usage', { coupon_code: coupon.code });

        if (claimError) {
            console.error('Coupon claim error:', claimError);
            return { statusCode: 500, headers: jsonHeaders, body: JSON.stringify({ success: false, error: 'Erro ao validar cupom' }) };
        }
        if (claimed !== true) {
            return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify({ success: false, error: 'Cupom esgotado' }) };
        }

        const durationDays = coupon.pro_duration_days || 365;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

        // Create/refresh the subscription (service key → bypasses RLS)
        const { error: subError } = await supabase.from('subscriptions').upsert({
            id: userId,
            user_id: userId,
            user_email: userEmail,
            user_name: userName,
            plan: 'pro',
            status: 'active',
            payment_method: 'coupon',
            paid_amount: 0,
            coupon_code: coupon.code,
            activated_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
            seats: 5
        }, { onConflict: 'id' });

        if (subError) {
            console.error('Subscription creation error:', subError);
            return { statusCode: 500, headers: jsonHeaders, body: JSON.stringify({ success: false, error: 'Erro ao criar assinatura' }) };
        }

        return {
            statusCode: 200, headers: jsonHeaders,
            body: JSON.stringify({
                success: true,
                plan: 'pro',
                expires_at: expiresAt.toISOString(),
                duration_days: durationDays
            })
        };

    } catch (err) {
        console.error('Activate PRO coupon error:', err);
        return { statusCode: 500, headers: jsonHeaders, body: JSON.stringify({ success: false, error: 'Erro ao ativar PRO' }) };
    }
};
