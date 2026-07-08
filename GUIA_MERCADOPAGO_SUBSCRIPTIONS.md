# Guia: Transformar Checkout PRO em Assinatura Recorrente (Mercado Pago)

> **Objetivo**: Migrar do modelo de pagamento único (R$ 97,90 anual) para Assinatura Recorrente no Mercado Pago, permitindo cobrança automática todo ano.

---

## 1. Preparação: Credenciais Mercado Pago

### 1.1 Obter Access Token
1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Você está em **Produção**? Se não, mude para **Produção**
3. Copie seu **Access Token** (algo como: `APP_USR-123456789...`)
4. Guarde com segurança

### 1.2 Obter Public Key (para frontend)
1. Na mesma página, copie **Public Key** (algo como: `APP_USR-abc123...`)
2. Essa chave é pública, pode ir no código frontend

### 1.3 Definir Variáveis de Ambiente

**No Supabase (para Cloud Functions):**
```
MERCADOPAGO_ACCESS_TOKEN = APP_USR-seu-token-aqui
MERCADOPAGO_PUBLIC_KEY = APP_USR-sua-public-key
```

**No seu servidor Node.js (.env):**
```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-seu-token
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key
FRONTEND_URL=https://seu-dominio.com
```

---

## 2. Setup Banco de Dados (Supabase)

### 2.1 Executar SQL de Extensão

1. Abra **Supabase Dashboard** → **SQL Editor**
2. Crie novo query
3. **Cole TODO o conteúdo** de `sql/004-mercadopago-subscriptions.sql`
4. Clique em **Execute**

O script vai:
- ✅ Adicionar campos à tabela `subscriptions` (mercadopago IDs, datas, etc)
- ✅ Criar tabela `subscription_payments` (histórico de transações)
- ✅ Criar tabela `subscription_history` (auditoria)
- ✅ Criar funções auxiliares (calcular datas, registrar pagamentos, etc)
- ✅ Configurar Row Level Security

### 2.2 Verificar se Funcionou

```sql
-- No SQL Editor, execute:
SELECT id, plan, status, mercadopago_subscription_id, next_billing_date
FROM subscriptions
LIMIT 5;
```

Resultado deve mostrar as novas colunas adicionadas.

---

## 3. Criar Plano de Assinatura no Mercado Pago

### 3.1 Método 1: Via Dashboard (Recomendado para começar)

1. Acesse: https://www.mercadopago.com.br/tools/subscription
2. Clique em **"Criar Novo Plano"**
3. Preencha:
   - **Nome**: "TCCFlow - Anual"
   - **Descrição**: "Assinatura anual do TCCFlow"
   - **Valor**: 97.90
   - **Moeda**: BRL
   - **Frequência**: 12 meses (ou 1 ano)
   - **Dia da Cobrança**: 1º do mês (ou seu preferido)

4. **Salve** e copie o **ID do Plano** (ex: `123456789`)

### 3.2 Método 2: Via API (Automático)

Se quiser criar programaticamente:

```bash
curl -X POST \
  https://api.mercadopago.com/v1/billing/plans \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "auto_recurring": {
      "frequency": 12,
      "frequency_type": "months",
      "transaction_amount": 97.90,
      "currency_id": "BRL",
      "start_date": "2025-01-01T00:00:00Z"
    },
    "back_url": "https://seu-dominio.com/subscriptions/success",
    "reason": "TCCFlow - Assinatura Anual"
  }'
```

Guarde o `id` retornado.

---

## 4. Integração Frontend

### 4.1 Criar Página de Checkout (`pages/checkout-pro.html`)

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Checkout PRO — TCCFlow</title>
  <link rel="stylesheet" href="../css/app.css"/>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="../js/supabase-init.js"></script>
  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"></script>
  <script src="../src/sidebar.jsx"></script>
  <script type="text/babel">
const { useState, useEffect } = React;

function CheckoutPro() {
  const { user } = useTCCData();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) loadSubscription();
  }, [user]);

  async function loadSubscription() {
    try {
      const { data } = await _supa
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      setSubscription(data);
    } catch(e) {
      console.error('Erro ao carregar assinatura:', e);
    }
  }

  async function startSubscription() {
    if (loading || !user) return;
    setLoading(true);
    setError(null);

    try {
      // Chamada para backend criar assinatura
      const response = await fetch('/api/create-subscription-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
          planId: process.env.REACT_APP_MP_PLAN_ID || 'plan-pro-annual'
        })
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.initUrl) {
        // Redirecionar para Mercado Pago
        window.location.href = data.initUrl;
      }
    } catch(e) {
      console.error('Erro:', e);
      setError('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const isPro = subscription?.status === 'active' && 
                subscription?.plan_type === 'pro_annual';
  const isExpiringSoon = subscription?.next_billing_date && 
                         new Date(subscription.next_billing_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="app-layout">
      <Sidebar active="pricing" userData={{}} project={null} subscription={subscription}/>
      <div className="main-area">
        <Topbar page="Upgrade para PRO" user={user}/>
        <div className="page-content">
          
          <div style={{ maxWidth: 600, margin: '0 auto', paddingTop: 40 }}>
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <h1 style={{ margin: '0 0 16px', fontSize: '2rem' }}>TCCFlow PRO</h1>
              <p style={{ color: 'var(--muted)', marginBottom: 32 }}>
                Assinatura anual com renovação automática
              </p>

              <div style={{
                background: 'linear-gradient(135deg, var(--violet), var(--blue))',
                color: 'white',
                padding: '40px 20px',
                borderRadius: 16,
                marginBottom: 32
              }}>
                <div style={{ fontSize: '3rem', fontWeight: 700 }}>R$ 97,90</div>
                <div style={{ fontSize: '1rem', opacity: 0.9, marginTop: 8 }}>por ano</div>
              </div>

              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#dc2626',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 20,
                  fontSize: '0.875rem'
                }}>
                  {error}
                </div>
              )}

              {isPro ? (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: 'var(--emerald)',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 20
                }}>
                  ✅ Você é assinante PRO!
                  {isExpiringSoon && ` Renova em ${new Date(subscription.next_billing_date).toLocaleDateString('pt-BR')}`}
                </div>
              ) : (
                <button 
                  onClick={startSubscription}
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
                >
                  {loading ? '⏳ Processando...' : '💳 Assinar Agora'}
                </button>
              )}

              <ul style={{
                textAlign: 'left',
                marginTop: 32,
                listStyle: 'none',
                padding: 0
              }}>
                <li style={{ padding: '8px 0' }}>✅ Projetos ilimitados</li>
                <li style={{ padding: '8px 0' }}>✅ Até 10 membros por projeto</li>
                <li style={{ padding: '8px 0' }}>✅ Integração com Orientador</li>
                <li style={{ padding: '8px 0' }}>✅ Feedback em tempo real</li>
                <li style={{ padding: '8px 0' }}>✅ Suporte por email</li>
              </ul>

              <p style={{
                marginTop: 40,
                fontSize: '0.875rem',
                color: 'var(--muted)'
              }}>
                Renovação automática todo ano. Cancele a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<CheckoutPro/>);
  </script>
</head>
<body>
<div id="root"></div>
</body>
</html>
```

### 4.2 Adicionar Link na Sidebar

No seu `src/sidebar.jsx`, adicione um botão:

```javascript
// Em Sidebar, dentro do menu:
{!isPro && (
  <a href="checkout-pro.html" className="btn btn-primary" style={{ width: '100%', marginTop: 12 }}>
    Upgrade para PRO
  </a>
)}
```

---

## 5. Backend API (Node.js)

### 5.1 Arquivo `api/subscriptions.js`

```javascript
const express = require('express');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const MP_PLAN_ID = process.env.MERCADOPAGO_PLAN_ID; // ID do plano criado no MP

// ============================================================
// POST /api/create-subscription-pro
// ============================================================

router.post('/create-subscription-pro', async (req, res) => {
  try {
    const { userId, email, planId } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'userId e email são obrigatórios' });
    }

    // 1. Verificar se já tem assinatura ativa
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (existing) {
      return res.json({
        message: 'Você já tem uma assinatura ativa',
        subscription: existing
      });
    }

    // 2. Criar preferência de pagamento no Mercado Pago
    // Modelo de Assinatura: Preapproval

    const preapproval = {
      payer_email: email,
      back_url: `${FRONTEND_URL}/dashboard?subscription=success`,
      failure_url: `${FRONTEND_URL}/checkout-pro.html?error=payment_failed`,
      external_reference: userId, // Para identificar o usuário depois
      reason: 'TCCFlow - Assinatura Anual PRO',
      auto_recurring: {
        frequency: 12, // a cada 12 meses
        frequency_type: 'months',
        transaction_amount: 97.90,
        currency_id: 'BRL',
        start_date: new Date().toISOString().split('T')[0] + 'T00:00:00Z'
      }
    };

    const response = await axios.post(
      'https://api.mercadopago.com/preapproval',
      preapproval,
      {
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const mpData = response.data;

    // 3. Salvar no banco com status 'pending'
    const { data: subscription, error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        user_email: email,
        status: 'pending',
        plan: 'pro',
        plan_type: 'pro_annual',
        monthly_price: 97.90,
        mercadopago_preapproval_id: mpData.id, // Preapproval ID
        payment_method: 'mercadopago'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao salvar assinatura:', insertError);
      return res.status(500).json({ error: 'Erro ao criar assinatura' });
    }

    // 4. Registrar no histórico
    await supabase.from('subscription_history').insert({
      subscription_id: subscription.id,
      event: 'created',
      new_values: {
        status: 'pending',
        plan_type: 'pro_annual',
        mercadopago_preapproval_id: mpData.id
      },
      metadata: { mp_response: mpData }
    });

    // 5. Retornar URL de inicialização
    res.json({
      initUrl: mpData.init_point // URL para o usuário fazer login e autorizar
    });

  } catch (error) {
    console.error('Erro ao criar assinatura:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erro ao processar assinatura',
      details: error.message
    });
  }
});

// ============================================================
// POST /webhooks/mercadopago
// Webhook que Mercado Pago chama quando pagamento acontece
// ============================================================

router.post('/webhooks/mercadopago', async (req, res) => {
  try {
    const { action, data: mpData } = req.body;

    console.log('Webhook Mercado Pago recebido:', action, mpData?.id);

    // Tipos de eventos
    if (action === 'payment.created') {
      await handlePayment(mpData);
    } else if (action === 'payment.updated') {
      await handlePaymentUpdate(mpData);
    } else if (action === 'preapproval.created') {
      // Assinatura foi criada
      await handlePreapprovalCreated(mpData);
    } else if (action === 'preapproval.updated') {
      // Status da assinatura mudou
      await handlePreapprovalUpdated(mpData);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

// ============================================================
// Handlers para Webhooks
// ============================================================

async function handlePayment(mpData) {
  try {
    const paymentId = mpData.id;
    const status = mpData.status;
    const externalReference = mpData.external_reference; // userId
    const amount = mpData.transaction_amount;
    const paymentMethod = mpData.payment_method?.type;

    // Obter assinatura pelo external_reference (userId)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', externalReference)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscription) {
      console.error('Assinatura não encontrada para:', externalReference);
      return;
    }

    // Registrar pagamento
    const { data: payment } = await supabase
      .from('subscription_payments')
      .insert({
        subscription_id: subscription.id,
        mercadopago_payment_id: paymentId,
        amount: amount,
        status: status === 'approved' ? 'approved' : status === 'pending' ? 'pending' : 'declined',
        payment_method: paymentMethod,
        paid_at: status === 'approved' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (status === 'approved') {
      // Calcular próxima cobrança (em 12 meses)
      const nextBillingDate = new Date();
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);

      // Atualizar assinatura
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: nextBillingDate.toISOString(),
          next_billing_date: nextBillingDate.toISOString(),
          activated_at: new Date().toISOString(),
          paid_amount: amount
        })
        .eq('id', subscription.id);

      // Registrar no histórico
      await supabase.from('subscription_history').insert({
        subscription_id: subscription.id,
        event: 'payment_received',
        new_values: { status: 'active', next_billing_date: nextBillingDate },
        metadata: { amount, paymentId }
      });

      console.log(`✅ Assinatura ${subscription.id} ativada!`);
    }
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
  }
}

async function handlePaymentUpdate(mpData) {
  // Similar a handlePayment mas para atualizações
  await handlePayment(mpData);
}

async function handlePreapprovalCreated(mpData) {
  const preapprovalId = mpData.id;
  const externalReference = mpData.external_reference;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', externalReference)
    .maybeSingle();

  if (subscription) {
    await supabase
      .from('subscriptions')
      .update({
        mercadopago_subscription_id: preapprovalId,
        status: 'pending'
      })
      .eq('id', subscription.id);
  }
}

async function handlePreapprovalUpdated(mpData) {
  const preapprovalId = mpData.id;
  const status = mpData.status; // 'active', 'paused', 'cancelled'

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('mercadopago_subscription_id', preapprovalId)
    .maybeSingle();

  if (!subscription) return;

  let dbStatus = status === 'active' ? 'active' : status === 'paused' ? 'paused' : 'cancelled';

  if (status === 'cancelled') {
    await supabase
      .from('subscriptions')
      .update({
        status: dbStatus,
        cancelled_at: new Date().toISOString()
      })
      .eq('id', subscription.id);
  } else {
    await supabase
      .from('subscriptions')
      .update({ status: dbStatus })
      .eq('id', subscription.id);
  }

  await supabase.from('subscription_history').insert({
    subscription_id: subscription.id,
    event: 'updated',
    new_values: { status: dbStatus },
    metadata: { preapprovalId }
  });
}

module.exports = router;
```

### 5.2 Registrar no `server.js`

```javascript
const express = require('express');
const subscriptionsRouter = require('./api/subscriptions');

const app = express();
app.use(express.json());

// Rotas de assinatura
app.use('/api', subscriptionsRouter);
app.post('/webhooks/mercadopago', subscriptionsRouter);

// ... resto do código
```

---

## 6. Configurar Webhooks no Mercado Pago

### 6.1 Adicionar URL de Webhook

1. Acesse: https://www.mercadopago.com.br/developers/panel/webhooks
2. Adicione nova URL:
   - **URL**: `https://seu-dominio.com/webhooks/mercadopago`
   - **Eventos**: 
     - `payment.created`
     - `payment.updated`
     - `preapproval.created`
     - `preapproval.updated`

3. Salve

### 6.2 Testar Webhook (opcional)

No painel de webhooks, clique em "Enviar webhook de teste" para verificar se está funcionando.

---

## 7. Integração com Supabase Edge Functions (Alternativa)

Se preferir não usar Node.js externo, pode usar **Supabase Edge Functions**:

### 7.1 Criar Função

```bash
supabase functions new create-subscription-pro
```

### 7.2 Arquivo `supabase/functions/create-subscription-pro/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { userId, email } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  );

  const MP_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");

  const preapproval = {
    payer_email: email,
    back_url: `${Deno.env.get("FRONTEND_URL")}/dashboard?subscription=success`,
    external_reference: userId,
    reason: "TCCFlow - Assinatura Anual PRO",
    auto_recurring: {
      frequency: 12,
      frequency_type: "months",
      transaction_amount: 97.90,
      currency_id: "BRL",
      start_date: new Date().toISOString(),
    },
  };

  const mpResponse = await fetch("https://api.mercadopago.com/preapproval", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preapproval),
  });

  const mpData = await mpResponse.json();

  // Salvar no banco
  await supabase.from("subscriptions").insert({
    user_id: userId,
    user_email: email,
    status: "pending",
    plan: "pro",
    plan_type: "pro_annual",
    monthly_price: 97.90,
    mercadopago_preapproval_id: mpData.id,
  });

  return new Response(JSON.stringify({ initUrl: mpData.init_point }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

### 7.3 Deploy

```bash
supabase functions deploy create-subscription-pro
```

---

## 8. Fluxo Completo de Pagamento

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário clica "Assinar Agora"                             │
│    (em checkout-pro.html)                                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend chama POST /api/create-subscription-pro         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend:                                                  │
│    - Cria Preapproval no Mercado Pago                       │
│    - Salva com status 'pending'                             │
│    - Retorna init_point (URL de redirecionamento)           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Frontend redireciona para Mercado Pago                   │
│    window.location.href = initUrl                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Usuário entra em conta MP (ou cria)                      │
│    e autoriza o pagamento recorrente                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Mercado Pago:                                             │
│    - Cobra R$ 97,90 (primeiro pagamento)                    │
│    - Envia POST webhook para /webhooks/mercadopago          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Backend recebe webhook:                                   │
│    - Se status = 'approved'                                 │
│      * Marca assinatura como 'active'                       │
│      * Calcula próximo pagamento (+ 12 meses)              │
│      * Registra transação em subscription_payments          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Usuário é redirecionado para /dashboard                  │
│    e vê que é PRO!                                          │
│    (Próximo pagamento: em 12 meses)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Validar Limite de Plano

No seu `db-service.js` ou onde validar limites:

```javascript
async checkSubscriptionLimits(userId) {
  const { data } = await _supa
    .from('subscriptions')
    .select('plan, plan_type, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  return {
    isPro: data?.plan === 'pro' && data?.plan_type === 'pro_annual',
    maxProjects: data?.plan === 'pro' ? Infinity : 1,
    maxMembers: data?.plan === 'pro' ? 10 : 3,
    maxOrientadores: data?.plan === 'pro' ? Infinity : 1
  };
}
```

No `sidebar.jsx`, mostre o status:

```javascript
const limits = await DB.checkSubscriptionLimits(user.uid);

{!limits.isPro && (
  <div style={{ background: 'var(--bg-2)', padding: 12, borderRadius: 8, marginTop: 12 }}>
    <p style={{ margin: 0, fontSize: '0.875rem' }}>Plano Gratuito</p>
    <a href="checkout-pro.html" className="btn btn-primary btn-sm" style={{ marginTop: 8, width: '100%' }}>
      Upgrade PRO
    </a>
  </div>
)}

{limits.isPro && (
  <div style={{ background: 'var(--emerald)', color: 'white', padding: 12, borderRadius: 8, marginTop: 12, textAlign: 'center' }}>
    ✨ PRO Ativo
  </div>
)}
```

---

## 10. Migração de Clientes Existentes

Se já tem clientes que pagaram com Checkout único:

### 10.1 Manter Dados Históricos

```sql
-- Update assinaturas antigas que pagaram
UPDATE subscriptions
SET 
  plan_type = 'pro_annual',
  status = 'active',
  activated_at = COALESCE(activated_at, created_at),
  current_period_start = COALESCE(current_period_start, created_at),
  current_period_end = (created_at + INTERVAL '1 year'),
  next_billing_date = (created_at + INTERVAL '1 year'),
  monthly_price = 97.90
WHERE plan = 'pro' AND payment_id IS NOT NULL AND status != 'inactive';
```

### 10.2 Enviar Email para Ativar Renovação

Para clientes que querem continuar, peça para "autorizar renovação automática" e siga o fluxo normal.

---

## 11. Testes

### 11.1 Teste de Cartão (Sandbox)

Se estiver em **Sandbox** (modo teste):

- **Número**: 4111 1111 1111 1111
- **CVV**: 123
- **Data**: 12/25

### 11.2 Teste de Webhook

```bash
curl -X POST http://localhost:3000/webhooks/mercadopago \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "payment.created",
    "data": {
      "id": "123456789",
      "status": "approved",
      "transaction_amount": 97.90,
      "external_reference": "user-id-here",
      "payment_method": {
        "type": "credit_card"
      }
    }
  }'
```

---

## 12. Checklist Final

- [ ] Credenciais Mercado Pago obtidas
- [ ] SQL `004-mercadopago-subscriptions.sql` executado no Supabase
- [ ] Plano "TCCFlow - Anual" criado no MP (ID anotado)
- [ ] Arquivo `pages/checkout-pro.html` criado
- [ ] Arquivo `api/subscriptions.js` criado
- [ ] Backend Node.js/Edge Functions configurado
- [ ] Variáveis de ambiente definidas
- [ ] Webhook adicionado no painel MP
- [ ] Teste de pagamento realizado (Sandbox)
- [ ] Limite de plano validado no frontend
- [ ] Clientes antigos migrados (se aplicável)

---

## 13. Perguntas Frequentes

**P: Quanto tempo leva para o webhook ser chamado?**
R: Geralmente 2-5 minutos. Mercado Pago envia com retry automático.

**P: E se o usuário cancelar a assinatura?**
R: Mercado Pago enviará webhook `preapproval.updated` com status `cancelled`. Seu handler vai atualizar `subscriptions.status = 'cancelled'` e `cancelled_at`.

**P: Como o usuário cancela?**
R: Pode ser via:
1. Painel do Mercado Pago (gerenciar assinatura)
2. Você cria um botão "Cancelar Assinatura" que chama `/api/cancel-subscription`

**P: Posso mudar o valor (de 97,90)?**
R: Sim! Crie novo plano no MP com valor diferente. Mas assinaturas existentes mantêm o preço original até renovação.

---

## 14. Proximos Passos

1. **Executar SQL** em Supabase SQL Editor
2. **Criar Plano MP** e anotar ID
3. **Implementar Frontend** (checkout-pro.html)
4. **Configurar Backend** (api/subscriptions.js)
5. **Testar Fluxo Completo**
6. **Fazer Deploy** em produção

Dúvidas? Avise!
