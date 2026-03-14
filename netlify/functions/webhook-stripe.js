// ============================================================
// TCCFlow - Stripe Webhook Handler
// ============================================================
// Environment variables needed in Netlify:
//   STRIPE_SECRET_KEY      - Stripe secret key
//   STRIPE_WEBHOOK_SECRET  - Webhook signing secret (whsec_...)
//   FIREBASE_PROJECT_ID    - Firebase project ID (tccflow-94be6)
//   FIREBASE_CLIENT_EMAIL  - Service account email
//   FIREBASE_PRIVATE_KEY   - Service account private key (with \n)
// ============================================================
// Setup in Stripe Dashboard:
//   1. Go to Developers > Webhooks
//   2. Add endpoint: https://tccflow.com.br/.netlify/functions/webhook-stripe
//   3. Listen for: checkout.session.completed, customer.subscription.updated,
//      customer.subscription.deleted
// ============================================================

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Firebase Admin SDK (lightweight REST approach to avoid heavy dependency)
async function updateFirestore(collection, docId, data) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'tccflow-94be6';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;

    // Convert data to Firestore format
    const fields = {};
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            fields[key] = { stringValue: value };
        } else if (typeof value === 'number') {
            fields[key] = { integerValue: String(value) };
        } else if (typeof value === 'boolean') {
            fields[key] = { booleanValue: value };
        }
    }

    const response = await fetch(url + '?updateMask.fieldPaths=' + Object.keys(data).join('&updateMask.fieldPaths='), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
    });

    if (!response.ok) {
        const err = await response.text();
        console.error('Firestore update failed:', err);
        throw new Error('Firestore update failed');
    }
}

async function setFirestoreDoc(collection, docId, data) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'tccflow-94be6';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;

    const fields = {};
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            fields[key] = { stringValue: value };
        } else if (typeof value === 'number') {
            fields[key] = { integerValue: String(value) };
        } else if (typeof value === 'boolean') {
            fields[key] = { booleanValue: value };
        }
    }

    const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
    });

    if (!response.ok) {
        const err = await response.text();
        console.error('Firestore set failed:', err);
        throw new Error('Firestore set failed');
    }
}

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const sig = event.headers['stripe-signature'];
    let stripeEvent;

    try {
        stripeEvent = stripe.webhooks.constructEvent(
            event.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid signature' }) };
    }

    try {
        switch (stripeEvent.type) {
            case 'checkout.session.completed': {
                const session = stripeEvent.data.object;
                const userId = session.metadata.userId;
                const seats = parseInt(session.metadata.seats) || 1;
                const subscriptionId = session.subscription;

                // Create/update subscription document keyed by userId
                await setFirestoreDoc('subscriptions', userId, {
                    status: 'active',
                    plan: 'pro',
                    seats: seats,
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: subscriptionId,
                    userId: userId,
                    userEmail: session.customer_email || '',
                    userName: session.metadata.userName || ''
                });

                console.log(`Subscription activated for user ${userId} with ${seats} seats`);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = stripeEvent.data.object;
                const customerId = subscription.customer;

                // We need to find the user by stripeCustomerId
                // For simplicity, we store subscription by userId from checkout
                // The subscription update will be handled by status check on client
                console.log(`Subscription updated for customer ${customerId}: ${subscription.status}`);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = stripeEvent.data.object;
                console.log(`Subscription canceled for customer ${subscription.customer}`);
                // Client-side will check status and handle accordingly
                break;
            }

            default:
                console.log(`Unhandled event type: ${stripeEvent.type}`);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ received: true })
        };
    } catch (error) {
        console.error('Webhook handler error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Webhook handler failed' })
        };
    }
};
