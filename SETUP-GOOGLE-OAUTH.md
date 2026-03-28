# Configurar Google OAuth no Supabase

## Passo 1: Google Cloud Console
1. Acesse https://console.cloud.google.com/apis/credentials
2. No seu projeto, vá em **Credenciais OAuth 2.0**
3. Adicione a **URI de redirecionamento autorizada**:
   ```
   https://fpqvubixlsblanbyppkp.supabase.co/auth/v1/callback
   ```

## Passo 2: Supabase Dashboard
1. Acesse https://supabase.com/dashboard/project/fpqvubixlsblanbyppkp/auth/providers
2. Ative o provider **Google**
3. Cole seu **Client ID** e **Client Secret** (obtidos no Google Cloud Console)
4. Salve

## Passo 3: Testar
- Acesse a página de login e clique em "Entrar com Google"
- O fluxo deve redirecionar para o Google, autenticar e voltar ao dashboard
