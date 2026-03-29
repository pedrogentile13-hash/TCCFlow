// Netlify Function — Create Mercado Pago Checkout Preference
// Env vars required: MERCADOPAGO_ACCESS_TOKEN

const { MercadoPagoConfig, Preference } = require('mercadopago');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { seats, totalCents, userId, userEmail, userName } = JSON.parse(event.body);

        if (!seats || !totalCents || !userId || !userEmail) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
        }

        const client = new MercadoPagoConfig({
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
        });

        const preference = new Preference(client);

        const siteUrl = process.env.URL || 'https://tccflow.com';

        const result = await preference.create({
            body: {
                items: [
                    {
                        id: 'tccflow-pro-annual',
                        title: `TCCFlow Pro — ${seats} ${seats > 1 ? 'membros' : 'membro'} (Anual)`,
                        description: `Plano Pro do TCCFlow com ${seats} assento${seats > 1 ? 's' : ''}. Acesso a todas as ferramentas PRO, 1.000 buscas I.A./mês, Google integrado e muito mais.`,
                        quantity: 1,
                        currency_id: 'BRL',
                        unit_price: totalCents / 100
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
                    plan: 'pro'
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
            body: JSON.stringify({ url: result.init_point, id: result.id })
        };

    } catch (err) {
        console.error('Mercado Pago error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message || 'Internal server error' })
        };
    }
};
