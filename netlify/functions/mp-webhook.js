// Netlify Function — Mercado Pago Webhook
// Receives payment notifications and activates PRO in Supabase
// Env vars required: MERCADOPAGO_ACCESS_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY

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

        console.log('Webhook received:', body.type || body.action);

        // Handle PreApproval (recurring subscription) notifications
        if (body.type === 'subscription_preapproval' || body.action === 'subscription_preapproval.created' || body.action === 'subscription_preapproval.updated') {
            console.log('Processing PreApproval:', body.data?.id);
            return await handlePreApproval(body, event);
        }

        // Handle Payment notifications (one-time checkout or recurring payments)
        if (body.type === 'payment' || body.action === 'payment.updated' || body.action === 'payment.created') {
            console.log('Processing Payment:', body.data?.id);
            return await handlePayment(body, event);
        }

        console.log('Ignoring notification type:', body.type, body.action);
        return { statusCode: 200, body: 'OK' };

    } catch (err) {
        console.error('Webhook error:', err);
        // Always return 200 to Mercado Pago to prevent retries on our errors
        return { statusCode: 200, body: 'OK' };
    }
};

// Handler para PreApproval (assinatura recorrente)
async function handlePreApproval(body, event) {
    try {
        const preapprovalId = body.data?.id;
        if (!preapprovalId) {
            console.log('No preapproval ID in webhook body');
            return { statusCode: 200, body: 'OK' };
        }

        // Fetch PreApproval details
        const client = new MercadoPagoConfig({
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
        });

        const preapprovalClient = new (require('mercadopago')).PreApproval(client);
        const preapproval = await preapprovalClient.get({ id: preapprovalId });

        console.log('PreApproval status:', preapproval.status);

        // Status: pending, authorized, paused, active, suspended, cancelled, expired
        if (preapproval.status === 'active' || preapproval.status === 'authorized') {
            const userId = preapproval.external_reference || preapproval.reference_id;
            if (!userId) {
                console.error('No user_id in preapproval');
                return { statusCode: 200, body: 'OK' };
            }

            const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_KEY
            );

            // Calcular próxima cobrança (12 meses a partir de agora)
            const nextBillingDate = new Date();
            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);

            // Atualizar assinatura para 'active'
            const { error } = await supabase
                .from('subscriptions')
                .update({
                    status: 'active',
                    plan: 'pro',
                    plan_type: 'pro_annual',
                    mercadopago_preapproval_id: preapprovalId,
                    current_period_start: new Date().toISOString(),
                    current_period_end: nextBillingDate.toISOString(),
                    next_billing_date: nextBillingDate.toISOString(),
                    activated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) {
                console.error('Supabase update error:', error);
                return { statusCode: 200, body: 'OK' };
            }

            console.log('Subscription activated for user:', userId);
        }

        return { statusCode: 200, body: 'OK' };
    } catch (err) {
        console.error('PreApproval handler error:', err);
        return { statusCode: 200, body: 'OK' };
    }
}

// Handler para Payment (pagamentos únicos e cobranças recorrentes)
async function handlePayment(body, event) {
    try {
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
        const couponCode = metadata.coupon_code || null;
        const discountPercent = metadata.discount_percent || 0;
        const originalAmount = metadata.original_amount || null;
        const paidAmount = metadata.paid_amount || payment.transaction_amount || null;

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
                plan_type: 'pro_annual',
                seats: seats,
                payment_id: String(paymentId),
                payment_method: payment.payment_method_id || 'mercadopago',
                user_id: userId,
                user_email: userEmail,
                user_name: userName,
                coupon_code: couponCode,
                discount_percent: discountPercent,
                original_amount: originalAmount,
                paid_amount: paidAmount,
                activated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (error) {
            console.error('Supabase upsert error:', error);
            return { statusCode: 200, body: 'OK' };
        }

        console.log('PRO activated for user:', userId, 'seats:', seats);

        // Send confirmation email via Resend (if configured)
        if (userEmail && process.env.RESEND_API_KEY) {
            try {
                const amount = (payment.transaction_amount || 0).toFixed(2).replace('.', ',');
                const seatsPlural = seats > 1 ? 's' : '';

                const emailHtml = `
<table width="100%" style="background:#f1f5f9;padding:32px 0;font-family:Arial,sans-serif;">
<tr><td align="center">
<table width="480" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
<tr><td style="background:linear-gradient(135deg,#7c3aed,#06b6d4);padding:28px 32px;text-align:center;">
<h1 style="color:#fff;font-size:22px;margin:0;">🎉 Assinatura Confirmada!</h1>
<p style="color:rgba(255,255,255,0.85);font-size:13px;margin:8px 0 0;">Seu plano TCCFlow Pro está ativo</p>
</td></tr>
<tr><td style="padding:28px 32px;">
<p style="color:#334155;font-size:15px;margin:0 0 20px;">Olá, <strong>${userName || 'estudante'}</strong>!</p>
<p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 20px;">Seu pagamento foi aprovado e seu plano <strong style="color:#7c3aed;">TCCFlow Pro</strong> já está ativo. Agora você tem acesso completo a todos os recursos da plataforma.</p>
<table width="100%" style="background:#f8fafc;border-radius:12px;padding:4px;margin:0 0 24px;">
<tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
<span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Detalhes da assinatura</span>
</td></tr>
<tr><td style="padding:12px 20px;">
<table width="100%" style="font-size:14px;color:#334155;">
<tr><td style="padding:6px 0;color:#64748b;">Plano</td><td style="padding:6px 0;text-align:right;font-weight:600;">Pro (Anual)</td></tr>
<tr><td style="padding:6px 0;color:#64748b;">Assentos</td><td style="padding:6px 0;text-align:right;font-weight:600;">${seats} membro${seatsPlural}</td></tr>
<tr><td style="padding:6px 0;color:#64748b;">Valor</td><td style="padding:6px 0;text-align:right;font-weight:600;">R$ ${amount}</td></tr>
<tr><td style="padding:6px 0;color:#64748b;">ID do pagamento</td><td style="padding:6px 0;text-align:right;font-weight:600;font-size:12px;color:#94a3b8;">${paymentId}</td></tr>
</table>
</td></tr>
</table>
<p style="color:#334155;font-size:14px;font-weight:700;margin:0 0 12px;">✨ O que você desbloqueou:</p>
<table style="font-size:13px;color:#475569;line-height:2;margin:0 0 24px;">
<tr><td>✅ 1.000 buscas I.A. por mês</td></tr>
<tr><td>✅ Google Drive, Docs e Calendar integrados</td></tr>
<tr><td>✅ Tarefas ilimitadas</td></tr>
<tr><td>✅ Chat em tempo real com a equipe</td></tr>
<tr><td>✅ Todas as ferramentas PRO</td></tr>
<tr><td>✅ Todos os templates disponíveis</td></tr>
<tr><td>✅ Suporte prioritário</td></tr>
</table>
<div style="text-align:center;margin:0 0 8px;">
<a href="https://tccflow.com.br/pages/dashboard.html" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:12px;">🚀 Acessar meu Dashboard</a>
</div>
</td></tr>
<tr><td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
<p style="color:#94a3b8;font-size:11px;margin:0 0 4px;">Dúvidas? Responda este e-mail ou acesse nosso suporte.</p>
<p style="color:#cbd5e1;font-size:11px;margin:0;">© TCCFlow — Seu TCC mais simples, do início ao fim.</p>
</td></tr>
</table>
</td></tr>
</table>`;

                console.log('Sending confirmation email to:', userEmail);

                await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'TCCFlow <noreply@tccflow.com.br>',
                        to: [userEmail],
                        subject: '🎉 Seu plano TCCFlow Pro foi ativado!',
                        html: emailHtml
                    })
                }).catch(emailError => console.error('Email error:', emailError));
            } catch (emailError) {
                console.error('Email sending error:', emailError);
            }
        }

        return { statusCode: 200, body: 'OK' };

    } catch (err) {
        console.error('Payment handler error:', err);
        return { statusCode: 200, body: 'OK' };
    }
}
