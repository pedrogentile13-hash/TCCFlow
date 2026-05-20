// Netlify Function — Create Mercado Pago PreApproval (Recurring Subscription)
// Env vars required: MERCADOPAGO_ACCESS_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_KEY

const { MercadoPagoConfig, PreApproval } = require('mercadopago');
const { createClient } = require('@supabase/supabase-js');

// IDs dos planos criados no Mercado Pago
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

        // Gerar URL de checkout direto com o plano
        const checkoutUrl = `https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=${planId}&payer_email=${encodeURIComponent(userEmail)}`;

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
