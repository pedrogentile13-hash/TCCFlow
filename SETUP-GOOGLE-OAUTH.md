# Configurar Google OAuth no Supabase

## Passo 1: Google Cloud Console
1. Acesse https://console.cloud.google.com/apis/credentials
2. No seu projeto, vá em **Credenciais OAuth 2.0**
3. Adicione a **URI de redirecionamento autorizada**:
   ```
   https://fpqvubixlsblanbyppkp.supabase.co/auth/v1/callback
   ```

## Passo 2: Configurar Origens JavaScript Autorizadas (OBRIGATÓRIO para Drive/Calendar)
No mesmo Client ID OAuth 2.0 no Google Cloud Console:
1. Em **Origens JavaScript autorizadas**, adicione:
   ```
   https://tccflow.com.br
   https://tccflow.com
   ```
   E se usa ambiente local:
   ```
   http://localhost
   http://localhost:8080
   ```
2. Em **URIs de redirecionamento autorizadas**, adicione TAMBÉM:
   ```
   https://tccflow.com.br
   https://tccflow.com
   https://fpqvubixlsblanbyppkp.supabase.co/auth/v1/callback
   ```
   E se usa ambiente local:
   ```
   http://localhost
   http://localhost:8080
   ```

> **IMPORTANTE:** Sem as origens JavaScript autorizadas configuradas corretamente, os botões "Conectar Google Drive" e "Conectar Google Calendar" vão exibir o erro `redirect_uri_mismatch` (Error 400).

## Passo 3: Habilitar APIs necessárias
No Google Cloud Console, ative as seguintes APIs:
1. **Google Drive API** - para a funcionalidade de Pasta Compartilhada
2. **Google Calendar API** - para sincronização de calendário

## Passo 4: Supabase Dashboard
1. Acesse https://supabase.com/dashboard/project/fpqvubixlsblanbyppkp/auth/providers
2. Ative o provider **Google**
3. Cole seu **Client ID** e **Client Secret** (obtidos no Google Cloud Console)
4. Salve
5. Em **URL Configuration** (Authentication > URL Configuration), adicione `https://tccflow.com.br` na lista de **Redirect URLs**

## Passo 5: Testar
- Acesse a página de login e clique em "Entrar com Google"
- O fluxo deve redirecionar para o Google, autenticar e voltar ao dashboard
- Teste também os botões "Conectar Google Drive" e "Conectar Google Calendar"
