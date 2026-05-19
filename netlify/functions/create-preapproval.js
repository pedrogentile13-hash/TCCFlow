// Netlify Function — Create Mercado Pago PreApproval (Recurring Subscription)
// Env vars required: MERCADOPAGO_ACCESS_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_KEY

const { MercadoPagoConfig, PreApproval } = require('mercadopago');
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { userId, userEmail, userName, seats, planType } = JSON.parse(event.body);

        if (!userId || !userEmail) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields: userId, userEmail' }) };
        }

        const client = new MercadoPagoConfig({
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
        });

        const siteUrl = process.env.URL || 'https://tccflow.com.br';

        // Criar PreApproval (assinatura recorrente)
        const preapprovalClient = new PreApproval(client);

        const result = await preapprovalClient.create({
            body: {
                reason: 'TCCFlow - Assinatura Anual PRO',
                reference_id: userId,
                external_reference: userId,
                payer_email: userEmail,
                back_url: `${siteUrl}/pages/pagamento-sucesso.html`,
                auto_recurring: {
                    frequency: 12, // a cada 12 meses
                    frequency_type: 'months',
                    transaction_amount: 97.90,
                    currency_id: 'BRL',
                    start_date: new Date().toISOString(),
                    end_date: null // sem data de término
                },
                notification_url: `${siteUrl}/.netlify/functions/mp-webhook`,
                payment_method_id: 'pix'
            }
        });

        console.log('PreApproval criado:', result.id);

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
                plan: 'pro',
                plan_type: planType || 'pro_annual',
                seats: seats || 1,
                mercadopago_preapproval_id: result.id,
                payment_method: 'mercadopago'
            }, { onConflict: 'id' });

        if (upsertError) {
            console.error('Supabase upsert error:', upsertError);
            return { statusCode: 500, body: JSON.stringify({ error: 'Failed to save subscription' }) };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: result.init_point,
                preapprovalId: result.id,
                message: 'PreApproval criado com sucesso'
            })
        };

    } catch (err) {
        console.error('Mercado Pago PreApproval error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message || 'Internal server error' })
        };
    }
};
