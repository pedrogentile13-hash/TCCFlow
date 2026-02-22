# PROMPT: Sistema de Boletim Escolar Completo

> **Como usar**: Copie todo o conteúdo abaixo e cole em qualquer conversa de IA para adicionar o sistema de Boletim ao seu site. Adapte o nome do app, as rotas de navegação e o prefixo das chaves localStorage conforme seu projeto.

---

## PROMPT INÍCIO

Crie um **Sistema de Boletim Escolar** completo para o meu site, composto por **3 páginas HTML** que funcionam como sub-abas:

1. **Visão Geral** (`boletim.html`) — Painel principal com tabela de notas, gerenciamento de anos/turmas, professores e atividades
2. **Detalhado** (`boletim-detalhado.html`) — Visualização detalhada de cada matéria com fórmulas, tabelas expandidas e breakdown completo
3. **Desempenho** (`desempenho.html`) — Dashboard analítico com gráficos (Chart.js), rankings, KPIs e infográficos de performance

---

## STACK TÉCNICA

Todas as páginas devem usar:
- **HTML5/CSS3/JavaScript vanilla** — tudo inline, sem frameworks
- **Tailwind CSS** via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- **Plus Jakarta Sans** (Google Fonts): `<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">`
- **FontAwesome 6.5.1**: `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">`
- **Chart.js** (apenas na página Desempenho): `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>`
- **Tailwind config**: `tailwind.config = { theme: { extend: { fontFamily: { jakarta: ['"Plus Jakarta Sans"', 'sans-serif'] } } } }`
- **localStorage** para persistência de dados (simula banco de dados)

---

## DESIGN VISUAL

### Tema Base
- **Background**: `bg-slate-950` (fundo escuro navy)
- **Texto**: `text-white`
- **Font**: `body { font-family: 'Plus Jakarta Sans', sans-serif; }`
- **Anti-aliasing**: `antialiased` no body

### Classes CSS Customizadas (incluir em todas as páginas)

```css
/* Glassmorphism */
.glass {
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.08);
}
.glass-strong {
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.12);
}

/* Texto gradiente (azul → verde) */
.gradient-text {
    background: linear-gradient(135deg, #3b82f6, #10b981);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* Sidebar */
.sidebar-link.active { background: rgba(59,130,246,0.15); color: #60a5fa; }
.sub-link.active { background: rgba(59,130,246,0.1); color: #60a5fa; }

/* Year Chips */
.year-chip { cursor: pointer; transition: all 0.15s; }
.year-chip.active { background: rgba(59,130,246,0.2); color: #60a5fa; border-color: rgba(59,130,246,0.4); }

/* Scrollbar customizado */
.table-scroll::-webkit-scrollbar { height: 6px; }
.table-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 3px; }
.table-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
```

### CSS adicional por página

**Visão Geral** (boletim.html):
```css
.subject-row { cursor: pointer; transition: background 0.15s; }
.subject-row:hover { background: rgba(255,255,255,0.04); }
.subject-row.selected { background: rgba(59,130,246,0.08); border-left: 3px solid #3b82f6; }
.bim-tab.active { background: rgba(59,130,246,0.2); color: #60a5fa; border-color: #3b82f6; }
.type-card { transition: transform 0.15s; }
.type-card:hover { transform: translateY(-2px); }
.activity-item { animation: slideIn 0.2s ease-out; }
@keyframes slideIn { from { opacity:0; transform: translateX(-8px); } to { opacity:1; transform: translateX(0); } }
.grade-cell { min-width: 70px; }
```

**Detalhado** (boletim-detalhado.html):
```css
.subject-item { cursor: pointer; transition: all 0.15s; }
.subject-item:hover { background: rgba(255,255,255,0.04); }
.subject-item.active { background: rgba(59,130,246,0.12); border-color: rgba(59,130,246,0.4); color: #60a5fa; }
.formula-box { font-family: 'Plus Jakarta Sans', monospace; }
.bimester-section { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
```

**Desempenho** (desempenho.html):
```css
.circular-progress {
    width: 100px; height: 100px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; position: relative;
}
.circular-progress::before {
    content: ''; position: absolute; inset: 6px; border-radius: 50%;
    background: rgba(15, 23, 42, 0.9);
}
.circular-progress span { position: relative; z-index: 1; }
.ranking-bar { transition: width 0.6s ease-out; }
.animate-in { animation: fadeInUp 0.4s ease-out; }
@keyframes fadeInUp { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
```

### Paleta de Cores para Notas
| Condição | Cor | Classe Tailwind | Hex |
|----------|-----|-----------------|-----|
| Nota ≥ 7 | Azul | `text-blue-400` / `bg-blue-600` | #3b82f6 |
| Nota ≥ 5 | Âmbar | `text-amber-400` / `bg-amber-600` | #f59e0b |
| Nota < 5 | Vermelho | `text-red-400` / `bg-red-600` | #ef4444 |
| Sem nota | Cinza | `text-slate-500` / `bg-slate-600` | #64748b |

---

## ESTRUTURA DE DADOS (localStorage)

### Chaves e Schemas

**1. Atividades/Notas** — chave: `gentile_boletim` (array JSON)
```javascript
{
    id: String,          // ID único: Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    userId: String,      // ID do usuário logado
    yearId: String,      // ID do ano/turma selecionado
    subject: String,     // Nome da matéria (ex: "Matemática")
    bimestre: Number,    // 1, 2, 3 ou 4
    type: String,        // "prova_bimestral", "qualitativa" ou "va"
    name: String,        // Nome da atividade (ex: "P1 - Equações")
    description: String, // Descrição opcional
    nota: Number,        // Nota obtida (ex: 8.5)
    notaMaxima: Number,  // Nota máxima possível (ex: 10)
    peso: Number,        // Peso da atividade (ex: 1)
    date: String         // Data no formato YYYY-MM-DD (opcional)
}
```

**2. Anos/Turmas** — chave: `gentile_years` (array JSON)
```javascript
{
    id: String,          // ID único: Date.now().toString()
    userId: String,      // ID do usuário logado
    year: Number,        // Ano letivo (ex: 2026)
    turma: String,       // Turma (ex: "9C")
    createdAt: String    // ISO date string
}
```

**3. Professores** — chave: `gentile_teachers` (array JSON)
```javascript
{
    userId: String,      // ID do usuário logado
    yearId: String,      // ID do ano/turma
    subject: String,     // Nome da matéria
    name: String         // Nome do professor
}
```

**4. Usuário logado** — chave: `gentile_current_user` (objeto JSON)
```javascript
{
    id: String,
    name: String,
    email: String
}
```

### Relações
- Todas as atividades são filtradas por `userId` + `yearId`
- Professores são filtrados por `userId` + `yearId` + `subject`
- Anos/turmas são filtrados por `userId`

---

## CONSTANTES (compartilhadas entre as 3 páginas)

```javascript
// 15 matérias do 9º ano Fundamental II
const DEFAULT_SUBJECTS = [
    'Artes', 'Biologia', 'Educação Financeira', 'Educação Física',
    'Educação Socioemocional', 'Física', 'Geografia', 'História',
    'Inglês', 'Iniciação Científica', 'Língua Portuguesa', 'Matemática',
    'Pensamento Computacional', 'Produção de Texto', 'Química'
];

// Pesos dos bimestres (total: 10)
const BIMESTER_WEIGHTS = { 1: 2, 2: 2, 3: 3, 4: 3 };

// Tipos de atividade com pesos (total: 100)
const ACTIVITY_TYPES = [
    { key: 'prova_bimestral', name: 'Prova Bimestral', weight: 35, color: 'blue' },
    { key: 'qualitativa',     name: 'Qualitativa',     weight: 30, color: 'amber' },
    { key: 'va',              name: 'VA',              weight: 35, color: 'emerald' }
];
```

---

## FÓRMULAS DE CÁLCULO

### 1. Normalização da Nota
Cada nota é normalizada para escala de 0 a 10:
```
nota_normalizada = (nota / notaMaxima) × 10
```
**Exemplo**: Nota 7 de máximo 8 → (7/8) × 10 = 8.75

### 2. Média por Tipo de Atividade
Média ponderada de todas as atividades de um mesmo tipo, numa mesma matéria e bimestre:
```
M_tipo = Σ(nota_normalizada_i × peso_i) / Σ(peso_i)
```
**Exemplo**: Duas provas bimestrais em Matemática no 1º bimestre:
- P1: normalizada=8.0, peso=1 → 8.0×1 = 8.0
- P2: normalizada=9.0, peso=2 → 9.0×2 = 18.0
- M_prova = (8.0 + 18.0) / (1 + 2) = 8.67

### 3. Média do Bimestre
Média ponderada dos 3 tipos de atividade:
```
M_bimestre = Σ(M_tipo × peso_tipo) / Σ(peso_tipo)
```
Onde:
- Prova Bimestral: peso 35
- Qualitativa: peso 30
- VA: peso 35

**Exemplo**: Bim1 de Matemática:
- M_prova=8.67, M_qualitativa=7.5, M_va=9.0
- M_bim = (8.67×35 + 7.5×30 + 9.0×35) / (35+30+35)
- M_bim = (303.45 + 225 + 315) / 100 = 8.43

### 4. Média Final (Anual)
Média ponderada dos 4 bimestres:
```
M_final = Σ(M_bimestre_i × peso_bimestre_i) / Σ(peso_bimestre_i)
```
Onde: Bim1(×2) + Bim2(×2) + Bim3(×3) + Bim4(×3) / 10

**Exemplo**:
- Bim1=8.43, Bim2=7.2, Bim3=9.1, Bim4=8.5
- M_final = (8.43×2 + 7.2×2 + 9.1×3 + 8.5×3) / 10
- M_final = (16.86 + 14.4 + 27.3 + 25.5) / 10 = 8.41

### 5. Médias Globais (para Desempenho)

**Média global por tipo de atividade** (ex: média de todas as Provas Bimestrais):
```
M_global_tipo = Σ(M_tipo de cada matéria e bimestre) / quantidade
```

**Média global por bimestre** (ex: média do 1º bimestre):
```
M_global_bimestre = Σ(M_bimestre de cada matéria) / quantidade_matérias_com_dados
```

### 6. Classificação / Status

| Média Final | Status | Cor |
|-------------|--------|-----|
| ≥ 9 | Excelente | Azul (#3b82f6) |
| ≥ 7 | Bom / Acima da média | Esmeralda (#10b981) |
| ≥ 6 | Aprovado | Esmeralda |
| ≥ 5 | Atenção / Regular | Âmbar (#f59e0b) |
| < 5 | Crítico / Reprovado | Vermelho (#ef4444) |
| Sem dados | Em andamento | Cinza (#64748b) |

**Situação geral do aluno**:
- "Aprovado" (badge verde) — todas as matérias com final ≥ 6
- "Reprovado" (badge vermelho) — alguma matéria com final < 6
- "Em andamento" (badge amarelo) — nem todas as matérias têm dados completos

---

## FUNÇÕES JAVASCRIPT COMPARTILHADAS

Todas as 3 páginas devem implementar estas funções:

```javascript
// === AUTENTICAÇÃO ===
// Verifica se há usuário logado, redireciona para login.html se não houver
const currentUser = JSON.parse(localStorage.getItem('gentile_current_user'));
if (!currentUser) window.location.href = 'login.html';

// === FUNÇÕES DE DADOS ===
function getYears() {
    return JSON.parse(localStorage.getItem(YEARS_KEY) || '[]')
        .filter(y => y.userId === currentUser.id);
}

function getActivities() {
    return JSON.parse(localStorage.getItem(BOLETIM_KEY) || '[]')
        .filter(a => a.userId === currentUser.id && a.yearId === activeYear);
}

function getTeachers() {
    return JSON.parse(localStorage.getItem(TEACHERS_KEY) || '[]');
}

function getTeacher(subject) {
    const teachers = getTeachers();
    const t = teachers.find(t => t.userId === currentUser.id && t.yearId === activeYear && t.subject === subject);
    return t ? t.name : '';
}

// === FUNÇÕES DE CÁLCULO ===
function calcTypeAverage(subject, bimestre, typeKey) {
    const acts = getActivities().filter(a => a.subject === subject && a.bimestre === bimestre && a.type === typeKey);
    if (acts.length === 0) return null;
    let sw = 0, sws = 0;
    acts.forEach(a => {
        const norm = (a.nota / a.notaMaxima) * 10;
        sw += norm * a.peso;
        sws += a.peso;
    });
    return sws > 0 ? sw / sws : null;
}

function calcBimestreAverage(subject, bimestre) {
    let sw = 0, sws = 0;
    ACTIVITY_TYPES.forEach(t => {
        const avg = calcTypeAverage(subject, bimestre, t.key);
        if (avg !== null) { sw += avg * t.weight; sws += t.weight; }
    });
    return sws > 0 ? sw / sws : null;
}

function calcFinalAverage(subject) {
    let sw = 0, sws = 0;
    for (let b = 1; b <= 4; b++) {
        const avg = calcBimestreAverage(subject, b);
        if (avg !== null) { sw += avg * BIMESTER_WEIGHTS[b]; sws += BIMESTER_WEIGHTS[b]; }
    }
    return sws > 0 ? sw / sws : null;
}

// === FORMATAÇÃO ===
function formatGrade(v) { return v !== null && v !== undefined ? v.toFixed(1) : '—'; }

function gradeColorClass(v) {
    if (v === null || v === undefined) return 'text-slate-500';
    if (v >= 7) return 'text-blue-400';
    if (v >= 5) return 'text-amber-400';
    return 'text-red-400';
}

function gradeColor(v) {
    if (v === null || v === undefined) return '#64748b';
    if (v >= 7) return '#3b82f6';
    if (v >= 5) return '#f59e0b';
    return '#ef4444';
}

function escapeHtml(t) {
    const d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
}
```

---

## PÁGINA 1: VISÃO GERAL (boletim.html)

### Layout
- **Header mobile** (lg:hidden): Logo + botão hamburger para abrir sidebar
- **Sidebar** (fixed left, w-64, glass-strong): Navegação com sub-menu do Boletim
- **Main content** (lg:ml-64): Todo o conteúdo principal

### Componentes

#### 1.1 Título da Página
- Título "Boletim Escolar" com classe `gradient-text` (h1, text-3xl, font-extrabold)
- Badge de situação geral ao lado do título (Aprovado/Reprovado/Em andamento)

#### 1.2 Seletor de Ano/Turma
- Chips horizontais (`year-chip`) mostrando "2026 - 9C" etc.
- Botão "+" para adicionar novo ano (abre formulário inline)
- Formulário: campo Ano (number) + campo Turma (text) + botões Salvar/Cancelar
- Primeiro ano é selecionado automaticamente (variável `activeYear`)

#### 1.3 Cards KPI (4 cards em grid)
- **Disciplinas**: Total de matérias (15) — ícone `fa-book`
- **Média Geral**: Média de todas as médias finais — ícone `fa-chart-line`
- **Maior Nota**: Maior média final — ícone `fa-arrow-up`
- **Menor Nota**: Menor média final — ícone `fa-arrow-down`
- Layout: `grid grid-cols-2 lg:grid-cols-4 gap-3`
- Card: `glass rounded-2xl p-4`

#### 1.4 Tabela de Notas
- Container: `glass rounded-2xl overflow-hidden`
- Scroll horizontal: `table-scroll overflow-x-auto`
- **Colunas**: Matéria | Professor | 1º Bim | 2º Bim | 3º Bim | 4º Bim | Final
- **Linhas**: Uma para cada DEFAULT_SUBJECT (15 linhas)
- Cada linha é clicável (`subject-row`), abre o painel de detalhes
- Nome do professor é clicável (abre modal de atribuição)
- Células de nota mostram a média bimestral colorida ou "—" se sem dados
- Coluna Final mostra a média final com fundo colorido (badge pill)

#### 1.5 Painel de Detalhes (expande ao clicar numa matéria)
- `glass rounded-2xl p-6` — aparece abaixo da tabela
- **Header**: Nome da matéria + nome do professor + botão fechar
- **Tabs de bimestre**: 4 tabs (1º, 2º, 3º, 4º) com classe `bim-tab`
- **3 Type Cards** (grid cols-3): Um para cada tipo de atividade
  - Header colorido: Nome do tipo + peso
  - Lista de atividades: Nome, nota normalizada, peso
  - Botão "+" para adicionar atividade desse tipo
- **Composição**: Resumo mostrando média de cada tipo e média do bimestre
- **Botão excluir**: Em cada atividade, ícone de lixeira para remover

#### 1.6 Modal de Adicionar Atividade
- Overlay: `fixed inset-0 z-50 bg-black/60 backdrop-blur-sm`
- Card: `glass-strong rounded-2xl max-w-md w-full mx-auto p-6`
- **Campos**:
  - Nome da atividade (text, obrigatório)
  - Descrição (text, opcional)
  - Nota obtida (number, step=0.01, obrigatório)
  - Nota máxima (number, step=0.01, obrigatório)
  - Peso (number, step=0.1, default=1, obrigatório)
  - Data (date, opcional)
- **Validação**: nota ≤ notaMaxima
- **Ao salvar**: Gera ID único, salva no localStorage com userId, yearId, subject, bimestre, type

#### 1.7 Modal de Professor
- Modal simples com campo de texto para nome do professor
- Salva/atualiza no array `gentile_teachers`
- Vinculado a: userId + yearId + subject

### Interações
- Clicar em matéria → toggle seleção, mostra/esconde painel de detalhes
- Clicar em tab bimestre → muda `selectedBimestre`, re-renderiza detalhe
- Clicar "+" em type card → abre modal com subject, bimestre e type pré-preenchidos
- Clicar lixeira → confirm() → remove atividade → re-renderiza
- Clicar nome do professor → abre modal de atribuição
- Mudar ano → `setActiveYear(id)` → re-renderiza tabela e detalhes

---

## PÁGINA 2: DETALHADO (boletim-detalhado.html)

### Layout
Mesmo layout base (header mobile + sidebar + main com lg:ml-64).
Sidebar com "Detalhado" como sub-link ativo.

### Componentes

#### 2.1 Seletor de Ano/Turma
- Mesmo sistema de chips do Visão Geral
- Se não há anos: mostra mensagem "Crie um ano na página Visão Geral" com link

#### 2.2 Seletor de Matérias
- Grid de chips/pills para cada matéria (`subject-item`)
- Cada chip mostra:
  - Nome da matéria
  - Badge com nota final (se existir), colorida por faixa
  - Ponto azul indicador se tem atividades mas sem nota final completa
- Layout: `flex flex-wrap gap-2`
- Chip: `glass rounded-xl px-4 py-2.5 border border-white/5`

#### 2.3 Info do Professor
- Card glass com ícone `fa-chalkboard-teacher` + nome do professor
- Mostrado condicionalmente se há professor atribuído

#### 2.4 Seção dos 4 Bimestres
Para cada bimestre (1 a 4):

- **Header do Bimestre**:
  - Número do bimestre (ex: "1º Bimestre")
  - Peso: "(Peso: 2)"
  - Média do bimestre (badge colorida ou "—")

- **3 Cards de Tipo** (grid): Para cada ACTIVITY_TYPE:
  - Header: Ícone + Nome do tipo + "Peso: X"
  - Cores: `bg-{color}-600/20`, `text-{color}-400`, `border-{color}-500/30`
    - Prova Bimestral = blue
    - Qualitativa = amber
    - VA = emerald
  - **Tabela detalhada** (se há atividades):
    - Colunas: Nome | Descrição | Data | Nota | Máx | Peso | Norm.
    - Nota normalizada = `(nota/notaMaxima × 10).toFixed(2)`
  - **Fórmula renderizada**: `M = Σ(nota_norm × peso) / Σ(peso)` com valores reais
  - **Resultado**: Média do tipo em destaque
  - Se sem atividades: "Nenhuma atividade registrada"

- **Fórmula de composição do bimestre**:
  - Mostra: `M_bim = (M_prova×35 + M_qualitativa×30 + M_va×35) / (35+30+35)`
  - Com valores reais preenchidos

#### 2.5 Seção Média Final
- Card glass grande com:
  - 4 mini-cards mostrando cada bimestre (valor + peso)
  - Badge de status (Acima da média/Aprovado/Atenção/Abaixo)
  - Fórmula final: `M_final = (B1×2 + B2×2 + B3×3 + B4×3) / 10`
  - Nota final em destaque (`text-5xl font-extrabold`)

#### 2.6 Estado vazio
- Se nenhuma matéria selecionada: "Selecione uma disciplina para ver o detalhamento"
- Se nenhum ano: "Crie um ano/turma na página Visão Geral"

---

## PÁGINA 3: DESEMPENHO (desempenho.html)

### Layout
Mesmo layout base. Sidebar com "Desempenho" como sub-link ativo.
Header com botões de acesso rápido para "Visão Geral" e "Detalhado".

### Chart.js Config
```javascript
Chart.defaults.color = '#94a3b8';        // slate-400
Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
```
Manter referência a todas as instâncias de gráficos em `let chartInstances = {}` e destruir antes de recriar para evitar memory leaks.

### Componentes

#### 3.1 Seletor de Ano/Turma
- Mesmo sistema de chips

#### 3.2 Cards KPI (4 cards em grid)
- **Média Geral**: Média de todas as médias finais — ícone `fa-chart-line`, cor blue
- **Acima de 7**: Quantidade de matérias com final ≥ 7 — ícone `fa-check-circle`, cor emerald
- **Em Risco (< 6)**: Quantidade de matérias com final < 6 — ícone `fa-exclamation-triangle`, cor red
- **Total Atividades**: Total de atividades cadastradas — ícone `fa-list-check`, cor amber
- Layout: `grid grid-cols-2 lg:grid-cols-4 gap-4`
- Card: `glass rounded-2xl p-5` com ícone em div colorida `w-10 h-10 rounded-xl`

#### 3.3 Gráfico Radar (metade esquerda)
- Título: "Desempenho por Disciplina"
- Labels: Nomes das matérias truncados (max 10 chars)
- Dados: Média final de cada matéria (0 se null)
- Escala: 0 a 10, step 2
- Fill com opacidade 0.2, border com opacidade 0.8
- Cor: Blue (#3b82f6)
- pointBackgroundColor: '#3b82f6'

#### 3.4 Gráfico Barra Horizontal (metade direita)
- Título: "Notas por Disciplina"
- Dados: Matérias ordenadas por média final (maior → menor)
- Cores das barras: Baseadas na faixa da nota (azul ≥7, âmbar ≥5, vermelho <5)
- Background com 25% opacidade (hex + '40')
- indexAxis: 'y'

#### 3.5 Gráfico Linha (metade esquerda, segunda linha)
- Título: "Evolução por Bimestre"
- X: ["1º Bim", "2º Bim", "3º Bim", "4º Bim"]
- Y: Média global de cada bimestre (média de todas as matérias naquele bimestre)
- Gradient fill: Azul 30% → transparente
- tension: 0.4 (curvas suaves)
- Pontos: r=6, hoverRadius=8

#### 3.6 Gráfico Doughnut (metade direita, segunda linha)
- Título: "Composição por Tipo"
- Dados estáticos: [35, 30, 35] (pesos dos tipos)
- Cores: Blue (#3b82f6), Amber (#f59e0b), Emerald (#10b981)
- Cutout: '65%'
- Labels: Nomes dos tipos de atividade

#### 3.7 Cards de Progresso Circular (por tipo de atividade)
- 3 cards em grid (um para cada ACTIVITY_TYPE)
- Card: `glass rounded-2xl p-6`
- **Progresso circular CSS** (conic-gradient):
  - `background: conic-gradient({cor} 0% {pct}%, rgba(255,255,255,0.05) {pct}% 100%)`
  - Nota dentro do círculo em destaque
- Média global do tipo: `calcGlobalTypeAverage(typeKey)`
- Status badge: Excelente/Bom/Regular/Crítico baseado na média
- Layout responsivo: `grid grid-cols-1 md:grid-cols-3 gap-4`

#### 3.8 Tabela Ranking
- Título: "Ranking de Disciplinas"
- Container: `glass rounded-2xl overflow-hidden`
- Matérias ordenadas por média final (maior → menor, null por último)
- **Colunas**:
  - # (posição no ranking)
  - Disciplina (nome)
  - Professor (nome ou "—")
  - Progresso (barra horizontal colorida, largura proporcional à nota/10)
  - Média (valor numérico)
  - Status (badge: Excelente ≥9 blue, Bom ≥7 emerald, Regular ≥5 amber, Crítico <5 red, Sem Dados null slate)

#### 3.9 Comparação entre Bimestres
- 4 cards (um por bimestre)
- Cada card mostra:
  - Número do bimestre + peso
  - Média global daquele bimestre
  - Barra de progresso horizontal
  - Badge "MELHOR" no bimestre com maior média
  - Porcentagem (média/10 × 100)

---

## NAVEGAÇÃO / SIDEBAR

### Estrutura do Sub-menu na Sidebar

O Boletim deve ter um item pai com 3 sub-itens. Adapte as URLs conforme a estrutura do seu projeto:

```html
<!-- Boletim com sub-itens -->
<div>
    <a href="boletim.html" class="sidebar-link active flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition hover:bg-white/5">
        <i class="fa-solid fa-clipboard-list w-5 text-center"></i> Boletim
    </a>
    <div class="ml-9 mt-1 space-y-0.5">
        <a href="boletim.html" class="sub-link active block text-xs font-medium px-3 py-1.5 rounded-lg transition hover:bg-white/5">
            <i class="fa-solid fa-table w-4 text-center mr-1.5"></i>Visão Geral
        </a>
        <a href="boletim-detalhado.html" class="sub-link block text-xs font-medium text-slate-500 px-3 py-1.5 rounded-lg transition hover:bg-white/5 hover:text-slate-300">
            <i class="fa-solid fa-magnifying-glass-chart w-4 text-center mr-1.5"></i>Detalhado
        </a>
        <a href="desempenho.html" class="sub-link block text-xs font-medium text-slate-500 px-3 py-1.5 rounded-lg transition hover:bg-white/5 hover:text-slate-300">
            <i class="fa-solid fa-chart-pie w-4 text-center mr-1.5"></i>Desempenho
        </a>
    </div>
</div>
```

### Estados Ativos
- Na página Visão Geral: `sidebar-link active` no pai + `sub-link active` no "Visão Geral"
- Na página Detalhado: `sidebar-link active` no pai + `sub-link active` no "Detalhado"
- Na página Desempenho: `sidebar-link active` no pai + `sub-link active` no "Desempenho"
- Em outras páginas do site: sem classe `active`, sub-links com `text-slate-500`

### Sidebar Responsiva
- **Mobile** (< lg): Sidebar começa com `transform -translate-x-full`, toggle com botão hamburger
- **Desktop** (≥ lg): Sidebar visível com `lg:translate-x-0`
- Overlay escuro no mobile quando sidebar aberta
- Main content com `lg:ml-64` para não ficar atrás da sidebar

```javascript
// Toggle sidebar (mobile)
document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
});
```

---

## INSTRUÇÕES DE INTEGRAÇÃO

1. **Adapte o prefixo das chaves localStorage** — troque `gentile_` pelo prefixo do seu projeto
2. **Adapte as URLs da sidebar** — ajuste os hrefs conforme a estrutura de pastas do seu site
3. **Adapte o nome do app** — troque "GentileOrganization" pelo nome do seu projeto
4. **Adapte a autenticação** — ajuste a chave `gentile_current_user` para a que seu site usa
5. **As matérias podem ser customizadas** — altere o array `DEFAULT_SUBJECTS`
6. **Os pesos podem ser customizados** — altere `BIMESTER_WEIGHTS` e `ACTIVITY_TYPES`
7. **Cada página deve ser um arquivo HTML independente** com todo o CSS e JS inline

---

## PROMPT FIM
