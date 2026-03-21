// Netlify Function — Mercado Pago Webhook
// Receives payment notifications and activates PRO in Supabase
// Env vars required: MERCADOPAGO_ACCESS_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_KEY

const { MercadoPagoConfig, Payment } = require('mercadopago');
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
    // Mercado Pago sends GET for validation and POST for notifications
    if (event.httpMethod === 'GET') {
        return { statusCode: 200, body: 'OK' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method not allowed' };
    }

    try {
        const body = JSON.parse(event.body || '{}');

        // Mercado Pago sends different notification types
        // We only care about payment notifications
        if (body.type !== 'payment' && body.action !== 'payment.updated' && body.action !== 'payment.created') {
            console.log('Ignoring notification type:', body.type, body.action);
            return { statusCode: 200, body: 'OK' };
        }

        const paymentId = body.data?.id;
        if (!paymentId) {
            console.log('No payment ID in webhook body');
            return { statusCode: 200, body: 'OK' };
        }

        // Fetch payment details from Mercado Pago
        const client = new MercadoPagoConfig({
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
        });

        const paymentClient = new Payment(client);
        const payment = await paymentClient.get({ id: paymentId });

        console.log('Payment status:', payment.status, 'ID:', paymentId);

        // Only activate on approved payments
        if (payment.status !== 'approved') {
            console.log('Payment not approved, status:', payment.status);
            return { statusCode: 200, body: 'OK' };
        }

        // Extract metadata
        const metadata = payment.metadata || {};
        const userId = metadata.user_id || payment.external_reference;
        const userEmail = metadata.user_email || payment.payer?.email || '';
        const userName = metadata.user_name || '';
        const seats = metadata.seats || 1;
        const plan = metadata.plan || 'pro';

        if (!userId) {
            console.error('No user_id found in payment metadata or external_reference');
            return { statusCode: 200, body: 'OK' };
        }

        // Initialize Supabase with service key (bypasses RLS)
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        // Upsert subscription record
        const { error } = await supabase
            .from('subscriptions')
            .upsert({
                id: userId,
                status: 'active',
                plan: plan,
                seats: seats,
                payment_id: String(paymentId),
                payment_method: payment.payment_method_id || 'mercadopago',
                user_id: userId,
                user_email: userEmail,
                user_name: userName
            }, { onConflict: 'id' });

        if (error) {
            console.error('Supabase upsert error:', error);
            return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
        }

        console.log('PRO activated for user:', userId, 'seats:', seats);

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, userId, plan, seats })
        };

    } catch (err) {
        console.error('Webhook error:', err);
        // Always return 200 to Mercado Pago to prevent retries on our errors
        return { statusCode: 200, body: 'OK' };
    }
};
