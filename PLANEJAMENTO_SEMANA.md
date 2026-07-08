# 📋 PLANEJAMENTO TCCFlow - Semana Crítica (5 dias)

## 🎯 Objetivo Final
Ativar o site completamente funcional em **5 dias** com todos os bugs corrigidos e features funcionando.

---

## 📊 CRONOGRAMA GANTT (Semana)

```
SEGUNDA (Dia 1)
├─ [████████░░░░░░░░░░] Gantt Chart + Notificações customizáveis
├─ [░░░░░░░░░░░░░░░░░░] Bug Tasks (status em revisão)
└─ [░░░░░░░░░░░░░░░░░░] Search Bar + Notif Bell

TERÇA (Dia 2)
├─ [████████████░░░░░░] Gantt Chart (conclusão)
├─ [████████░░░░░░░░░░] Bug Tasks (testes)
└─ [████░░░░░░░░░░░░░░] Validações Design

QUARTA (Dia 3)
├─ [████████████████░░] Bug Tasks (conclusão)
├─ [████████████░░░░░░] Search Bar funcional
└─ [████████░░░░░░░░░░] Notif Bell + Sistema

QUINTA (Dia 4)
├─ [████████████████░░] Notif Bell (testes)
├─ [████████████████░░] Search funcional (testes)
└─ [████████░░░░░░░░░░] Validações Design (aplicação)

SEXTA (Dia 5)
├─ [████████████████░░] QA & Testes Finais
├─ [████████████████░░] Correções emergenciais
└─ [████████████████░░] Deploy & Go Live
```

---

## 📝 DETALHAMENTO POR TAREFA

### **TAREFA 1: Gantt Chart Personalizado (30 horas)**

**Status**: ❌ Não funciona corretamente

**Problemas Identificados**:
- Gantt chart não exibe tarefas corretamente
- Não há sistema de eventos/marcos
- Falta notificações de prazos

**O que fazer**:

1. **Criar/Editar Eventos Gantt**
   - Adicionar modal para criar novo evento
   - Modal para editar evento existente
   - Campos: Título, Data início, Data fim, Responsável, Prioridade
   - Cores por status (todo, progress, done)

2. **Notificações de Eventos**
   - Quando evento se aproxima (3 dias antes)
   - Notificação no bell do site
   - Push notification (mobile)
   - Email (opcional)

3. **Personalização**
   - Drag & drop para ajustar datas
   - Filtrar por responsável
   - Filtrar por status
   - Visualização: semana/mês/trimestre
   - Export para PDF

**Estimativa**: 
- Segunda: 16h (estrutura + backend)
- Terça: 14h (testes + refinamento)

**Responsável**: Você (dev)

---

### **TAREFA 2: Bug - Tasks em Revisão (20 horas)**

**Status**: 🐛 CRÍTICO

**Problema**:
```
Quando você move uma tarefa para "Em Revisão" (status = 'progress'),
ela não fica lá — volta para o status anterior automaticamente.
Possível causa: trigger do Supabase ou RLS policy bloqueando a atualização.
```

**Investigação**:
1. Verificar RLS policies da tabela `tasks`
2. Verificar se há trigger atualizando automaticamente
3. Verificar lógica do front-end (React state vs DB sync)
4. Testar atualização direta no Supabase

**Solução**:
- Adicionar validação no front-end antes de enviar
- Adicionar console.log para rastrear estado
- Testar com diferentes statuses

**Estimativa**:
- Segunda: 6h (investigação + debug)
- Terça: 14h (correção + testes)

**Responsável**: Você (dev)

---

### **TAREFA 3: Botão Notificações (15 horas)**

**Status**: 🔔 Não funciona

**Problema**:
- Bell icon não abre painel de notificações
- Sem histórico de notificações
- Sem sistema de leitura/não-lida

**O que fazer**:

1. **Interface Notificações**
   - Bell icon (top-right navbar)
   - Badge com contador (vermelho)
   - Click abre painel flutuante
   - Painel: lista de 10 notificações recentes
   - Cada notificação: ícone, texto, data, ação "Marcar como lida"

2. **Banco de Dados**
   - Tabela: `notifications` (id, user_id, type, title, message, read, created_at)
   - Triggers que criam notificações automáticas:
     - Quando alguém comenta seu projeto
     - Quando tarefa é atribuída a você
     - Quando orientador aceita convite
     - Quando tarefa vence em 1 dia
     - Quando membro entra no projeto

3. **Funcionalidades**
   - Marcar como lida/não-lida
   - Deletar notificação
   - Notificação em tempo real (WebSocket/Realtime do Supabase)
   - Som/toast ao receber nova

**Estimativa**:
- Quarta: 15h (estrutura + testes)

**Responsável**: Você (dev)

---

### **TAREFA 4: Search Bar Funcional (18 horas)**

**Status**: 🔍 Existe mas não funciona

**Problema**:
- Search bar no navbar não retorna resultados
- Sem filtros
- Sem navegação para resultado

**O que fazer**:

1. **O que buscar**:
   - Projetos (por nome, código)
   - Tarefas (por título, descrição)
   - Pessoas (por nome, email)
   - Documentos (Google Drive links)
   - Referências (por autor, título)

2. **Interface**:
   - Input com placeholder "Buscar projetos, tarefas, pessoas..."
   - Dropdown com 5 resultados mais relevantes
   - Cada resultado com ícone + tipo + preview
   - Botão "Ver mais resultados"
   - Página de resultados completa

3. **Funcionalidades**:
   - Busca em tempo real (debounce 300ms)
   - Highlight de matches no texto
   - Recentes (últimas 5 buscas)
   - Favoritos (pin de resultado)

**Estimativa**:
- Quarta: 18h (implementação + testes)

**Responsável**: Você (dev)

---

### **TAREFA 5: Validações Design (15 horas)**

**Status**: ⚠️ Faltam validações

**O que fazer**:

1. **Form Validations**:
   - Email: regex válido, único
   - Passwords: mínimo 8 chars, força
   - Nomes: 2-50 caracteres
   - Datas: data futura para tarefas
   - Números: positivos onde necessário

2. **Visual Feedback**:
   - Campo em erro: borda vermelha
   - Mensagem de erro clara
   - Checkmark verde em válido
   - Disabled state para submit enquanto invalida

3. **Estados**:
   - Loading: spinner + texto "Salvando..."
   - Success: toast verde "Salvo com sucesso"
   - Error: toast vermelho com mensagem
   - Confirmação: modal para ações destrutivas (delete)

**Estimativa**:
- Quinta: 15h (implementação em todos forms)

**Responsável**: Você (design/dev)

---

## 📈 RESUMO DE HORAS

| Tarefa | Horas | Dia | Status |
|--------|-------|-----|--------|
| Gantt Chart | 30h | Seg-Ter | ❌ |
| Bug Tasks | 20h | Seg-Ter | 🐛 |
| Notificações | 15h | Qua | 🔔 |
| Search Bar | 18h | Qua | 🔍 |
| Validações | 15h | Qui | ⚠️ |
| **TOTAL** | **98h** | **5 dias** | |

**Tempo disponível**: 5 dias × 8h/dia = 40h (INSUFICIENTE!)
**Déficit**: 58h — precisa reduzir escopo ou estender prazo

---

## ⚡ PRIORIZAÇÃO (MVP)

**Prioridade 1 (CRÍTICO - Dia 1-2)**:
1. ✅ Bug Tasks em Revisão (impede uso da app)
2. ✅ Gantt Chart básico (sem notificações, sem drag-drop)
3. ✅ Bell Notificações (mínimo viável)

**Prioridade 2 (IMPORTANTE - Dia 3-4)**:
4. ⚠️ Search Bar (apenas tarefas + projetos)
5. ⚠️ Validações básicas (emails, senhas)

**Prioridade 3 (NICE-TO-HAVE - Se sobrar tempo)**:
6. 💎 Gantt avançado (drag-drop, export)
7. 💎 Notificações em tempo real
8. 💎 Validações completas

---

## 🔴 RISCOS

| Risco | Impacto | Mitigation |
|-------|---------|-----------|
| Bug tasks requer mudança de schema | ALTO | Investigar hoje mesmo |
| Notificações em RT pode ser lento | MÉDIO | Usar polling se Realtime cair |
| Search em 10k documentos é lento | MÉDIO | Adicionar índices no Supabase |
| 98h em 40h disponível | CRÍTICO | **Reduzir escopo ou aceitar overtime** |

---

## ✅ CHECKLIST GO-LIVE (Sexta)

- [ ] Gantt chart criando e editando eventos
- [ ] Tasks em "revisão" permanecem lá após salvar
- [ ] Bell notificações abrindo e mostrando lista
- [ ] Search retornando pelo menos tarefas
- [ ] Forms com validação básica
- [ ] Sem console errors críticos
- [ ] Mobile responsivo (mínimo)
- [ ] 3 usuários testando 1h cada
- [ ] Backup do BD feito
- [ ] Deploy em produção

---

## 🎯 DECISÃO NECESSÁRIA

**Pergunta para você**:

> Qual é o escopo REAL que você quer entregar em 5 dias?
>
> A) **MVP MÍNIMO** (40h): Bug tasks + Gantt simples + Bell notif
> B) **ROBUSTO** (60h): Tudo acima + Search + Validações
> C) **COMPLETO** (98h): Tudo + notif em RT + drag-drop gantt
>
> Responda com **A**, **B** ou **C** para eu reajustar o planejamento.

---

## 📍 Próximos Passos

1. **Aprove este planejamento** (ou peça ajustes)
2. **Escolha o escopo** (A/B/C)
3. **Eu começo imediatamente** os bugs críticos
4. **Daily standup** (5 min/dia para sincronizar)

**Tá bom assim? Quer ajustar algo no planejamento?**
