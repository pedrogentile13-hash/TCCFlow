// ============================================================
// TCCFlow - Stripe Checkout Session Creator
// ============================================================
// Environment variables needed in Netlify:
//   STRIPE_SECRET_KEY - Stripe secret key (sk_live_... or sk_test_...)
//   SITE_URL          - Your site URL (e.g. https://tccflow.netlify.app)
// ============================================================

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { seats, totalCents, userId, userEmail, userName } = JSON.parse(event.body);

        if (!seats || !totalCents || !userId || !userEmail) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Validate price server-side
        const BASE_PRICE = 9700; // R$97 in cents
        const SEAT_PRICE = 3000; // R$30 in cents
        const expectedTotal = BASE_PRICE + (seats - 1) * SEAT_PRICE;

        if (totalCents !== expectedTotal) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid price calculation' })
            };
        }

        if (seats < 1 || seats > 8) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Seats must be between 1 and 8' })
            };
        }

        const siteUrl = process.env.SITE_URL || 'https://tccflow.netlify.app';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer_email: userEmail,
            metadata: {
                userId,
                userName,
                seats: String(seats)
            },
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        recurring: { interval: 'month' },
                        product_data: {
                            name: `TCCFlow Pro — ${seats} assento${seats > 1 ? 's' : ''}`,
                            description: `Plano mensal com ${seats} assento${seats > 1 ? 's' : ''} para seu grupo de TCC`
                        },
                        unit_amount: totalCents
                    },
                    quantity: 1
                }
            ],
            success_url: `${siteUrl}/pages/planos.html?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${siteUrl}/pages/planos.html?canceled=true`
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ url: session.url })
        };
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to create checkout session' })
        };
    }
};
