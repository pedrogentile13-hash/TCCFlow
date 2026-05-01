# TCCFlow - Guia Completo de Funcionalidades

## 1. 🌓 Modo Escuro (Dark Mode)

### Como Usar:
- Acesse **Configurações** (ícone de engrenagem na navbar)
- Clique no toggle **"Modo Escuro"** na seção Aparência
- O tema escuro será aplicado instantaneamente em TODAS as páginas

### Características:
- ✅ Persiste automaticamente em localStorage
- ✅ Carrega antes de renderizar a página (sem flash)
- ✅ Suporta todos os componentes (cards, botões, inputs, navbars, etc.)
- ✅ Cores otimizadas para reduzir cansaço visual
- ✅ Sincroniza entre abas abertas

## 2. ⚡ Animações

### Como Usar:
- Acesse **Configurações**
- Na seção **Aparência**, ative ou desative o toggle **"Animações"**
- As animações serão removidas instantaneamente se desativadas

### Características:
- ✅ Melhora performance em dispositivos antigos
- ✅ Persiste a preferência automaticamente
- ✅ Desativa:
  - Animações CSS (drift dos blobs, fade-in, etc.)
  - Transições de hover
  - Animações de pulse
  - Durações de animação

## 3. 📸 Foto de Perfil

### Como Usar:
1. Acesse **Configurações**
2. Na seção **Perfil**, clique em **"Upload Foto"**
3. Selecione uma imagem (JPEG, PNG ou WebP)
4. Tamanho máximo: 5MB
5. A foto será comprimida e otimizada automaticamente

### Características:
- ✅ Compressão automática de imagens (redimensiona para 300x300px)
- ✅ Suporta JPEG, PNG e WebP
- ✅ Armazena em localStorage e Firebase (quando disponível)
- ✅ Exibe em várias partes do app
- ✅ Botão de remover foto disponível quando uma foto estiver definida
- ✅ Validações automáticas (tipo, tamanho)

### Limitações Atuais:
- A foto é armazenada localmente (para usar Firebase Storage, será necessário integração adicional)

## 4. 🔔 Notificações Push

### Como Usar:
1. Acesse **Configurações**
2. Na seção **Segurança**, ative **"Notificações Push"**
3. Será solicitada permissão do navegador
4. Aceite para receber notificações

### Tipos de Notificações Automáticas:
- **Tarefas Próximas do Prazo**: Quando uma tarefa está a 1 dia do vencimento
- **Tarefas Atrasadas**: Quando uma tarefa ultrapassou o prazo
- **Prazos Aproximando**: Quando há 3 dias ou menos para um prazo importante
- **Atualizações da Equipe**: Quando membros fazem ações na equipe
- **Alertas de Login**: Quando a conta é acessada de um novo dispositivo
- **Alertas de Segurança**: Notificações críticas de segurança

### Características:
- ✅ Service Worker para notificações offline
- ✅ Som de notificação opcional (controlável)
- ✅ Sincronização automática quando voltar online
- ✅ Verificação periódica de prazos (a cada 1 hora)
- ✅ Requer permissão do navegador

## 5. 🔐 Segurança Avançada

### 5.1 Alterar Senha
**Localização**: Configurações > Segurança > Alterar Senha

**Como Usar**:
1. Insira a senha atual
2. Digite a nova senha (mínimo 6 caracteres)
3. Confirme a nova senha
4. Clique em "Alterar Senha"

**Validações**:
- Senha atual deve estar correta
- Nova senha deve ter pelo menos 6 caracteres
- Senhas devem coincidir

### 5.2 Alertas de Login
**Localização**: Configurações > Segurança > Alertas de Login

**Como Usar**:
- Ative o toggle para receber notificações quando:
  - Sua conta é acessada de um novo dispositivo
  - Há um login de um local desconhecido
  - Há uma tentativa suspeita de acesso

### 5.3 Timeout de Sessão
**Localização**: Configurações > Segurança > Timeout de Sessão

**Como Usar**:
1. Selecione o tempo desejado:
   - 15 minutos
   - 30 minutos (padrão)
   - 1 hora
   - 2 horas
   - 8 horas

2. Você será desconectado automaticamente após inatividade

**Benefício**: Protege sua conta se você esquecer de fazer logout em um computador compartilhado

### 5.4 Notificações Push (Segurança)
**Localização**: Configurações > Segurança > Notificações Push

Ative para receber:
- Alertas de tarefas atrasadas
- Notificações de prazos importantes
- Atualizações da equipe

## 📊 Arquitetura de Preferências

O sistema usa uma classe `PreferencesManager` centralizada que gerencia todas as preferências do usuário:

```javascript
// Acessar preferences
const darkMode = preferences.prefs.darkMode;
const animEnabled = preferences.prefs.animationsEnabled;
const profilePhoto = preferences.getProfilePhoto();

// Modificar preferences
preferences.setDarkMode(true);
preferences.setAnimationsEnabled(false);
preferences.setProfilePhoto(photoData);

// Ouvir mudanças
window.addEventListener('preferences:darkModeChanged', (e) => {
    console.log('Dark mode:', e.detail);
});
```

## 📁 Arquivos Adicionados/Modificados

### Novos Arquivos:
- `js/preferences.js` - Gerenciador centralizado de preferências
- `js/profile-photo.js` - Gerenciador de foto de perfil
- `js/notifications.js` - Sistema de notificações
- `sw.js` - Service Worker para notificações offline
- `FEATURES_GUIDE.md` - Este guia

### Modificados:
- `css/dark.css` - Expandido com mais estilos dark mode
- `js/darkmode.js` - Integrado com PreferencesManager
- `pages/admin.html` - Expandido com novas seções
- Todas as páginas HTML - Adicionado preferen.js e notifications.js

## 🔧 Configuração Técnica

### Persistência de Dados:
- localStorage com prefixo `tccflow_prefs_`
- Firebase Storage quando configurado (para fotos)
- Service Worker para cache estratégico

### Suporte de Navegador:
- Dark Mode: Chrome 25+, Firefox 65+, Safari 12.1+
- Notificações Push: Chrome 39+, Firefox 48+, Safari 16+
- Service Worker: Chrome 40+, Firefox 44+

## 🐛 Troubleshooting

### Dark Mode não salva:
- Verifique se localStorage está habilitado
- Limpe cookies/cache
- Tente em uma aba anônima

### Notificações não funcionam:
- Verifique permissões do navegador
- Chrome: Permitir notificações para o site
- Firefox: Permitir notificações nas preferências
- Verifique se Service Worker foi registrado (DevTools > Application)

### Foto de perfil não aparece:
- Verifique se o arquivo é menor que 5MB
- Tente formatos: JPEG, PNG ou WebP
- Limpe localStorage (última opção)

## 🚀 Próximas Melhorias Sugeridas

1. **Autenticação 2FA com TOTP/SMS**
2. **Histórico de logins e atividades**
3. **Gerenciamento de dispositivos confiáveis**
4. **Backup automático de preferências**
5. **Sincronização de fotos com Firebase Storage**
6. **Notificações com Deep Links**
7. **Agendamento de notificações**
8. **Preferências por dispositivo**

---

**Versão**: 1.0.0  
**Data**: Maio 2026  
**Compatibilidade**: Todos os navegadores modernos
