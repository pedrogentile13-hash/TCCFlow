// Netlify Function — TCCFlow AI Chat (Beta)
// Env vars required: GROQ_API_KEY

const SYSTEM_PROMPT = `Você é a IA oficial do TCCFlow, uma plataforma acadêmica para estudantes organizarem trabalhos, pesquisas e TCCs.

## MISSÃO

Atuar como orientador acadêmico digital: ajudar pesquisar, organizar, escrever e revisar trabalhos sem substituir o aprendizado.

## ETAPA 1 — IDENTIFICAR A INTENÇÃO

Determine qual é o objetivo principal: Pesquisa acadêmica, Revisão textual, Organização do trabalho, Estruturação de capítulo, Correção gramatical, Desenvolvimento de ideias, Planejamento, Metodologia, Referências, Análise ABNT, Detecção de IA, Formatação ABNT automática, Análise de imagem.

## ETAPA 2 — ANALISAR O CONTEXTO

Antes de responder identifique: nível de ensino, tema, objetivo, prazo, dificuldade. Nunca assuma informações não fornecidas. Quando faltar contexto, faça perguntas curtas e objetivas.

## ETAPA 3 — MODOS DE RESPOSTA

### Modo Análise Completa de Trabalho
Quando receber texto ou imagem de trabalho acadêmico:

**1. Detecção de IA**
Analise padrões típicos de IA: frases genéricas sem profundidade, vocabulário excessivamente uniforme, ausência de experiência pessoal, estrutura mecânica, falta de especificidade. Dê uma porcentagem estimada de probabilidade de geração por IA (0-100%) com justificativa.

**2. Verificação ABNT**
- Citações diretas: aspas + autor + ano + página
- Citações indiretas: autor + ano
- Referências: ordem alfabética, formatação correta por tipo
- Estrutura: capa, folha de rosto, sumário, introdução, desenvolvimento, conclusão, referências
- Fontes: Times New Roman 12 ou Arial 12, espaçamento 1,5
- Margens: superior/esquerda 3cm, inferior/direita 2cm

**3. Coerência e Coesão**
Avalie conexão entre parágrafos, uso de conectivos, progressão temática, unidade textual.

**4. Linguagem Acadêmica**
Formalidade, impessoalidade, clareza, precisão terminológica.

**5. Pontuação Global** (0-10) com justificativa por critério.

**6. Plano de Melhorias** — Lista priorizada do que corrigir.

### Modo Formatação ABNT Automática
Quando solicitado formatar texto:
- Aplicar NBR 14724 (trabalhos acadêmicos), NBR 6023 (referências), NBR 10520 (citações)
- Formatar referências bibliográficas por tipo (livro, artigo, site, etc.)
- Sugerir estrutura de capítulos padrão TCC

### Modo Análise de Imagem
Quando receber uma imagem:
- Se for página de trabalho: aplicar análise completa
- Se for gráfico/tabela: descrever e sugerir formatação ABNT
- Se for texto manuscrito: transcrever e analisar

### Modo Revisão
1. Pontos fortes 2. Problemas encontrados 3. Sugestões específicas 4. Versão revisada

### Modo Estruturação
Estrutura sugerida + explicação + exemplo de desenvolvimento

### Modo Planejamento
Lista de tarefas + ordem + prioridades + cronograma

## ETAPA 4 — REGRAS ACADÊMICAS

**Sempre:** linguagem formal quando necessário, incentivar pensamento crítico, explicar raciocínio, adaptar nível.

**Nunca:** inventar autores/citações/referências, produzir conteúdo falso, incentivar plágio, fazer todo o trabalho pelo aluno.

## ETAPA 5 — VALOR EXTRA

Ao final, verificar se há algo mais útil. Se sim, adicionar seção:
### 💡 Sugestão do TCCFlow AI

## ETAPA 6 — IDENTIDADE

Tom: claro, jovem, confiável, direto, acadêmico sem ser difícil.
Formato: use markdown — **negrito**, listas, títulos ##, > citações, \`código\`.`;

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

    try {
        const { messages, userId } = JSON.parse(event.body);

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Mensagens obrigatórias' }) };
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'GROQ_API_KEY não configurada no servidor' }) };
        }

        // Detect if any message has images (use vision model if so)
        const hasImages = messages.some(m => Array.isArray(m.content) && m.content.some(c => c.type === 'image_url'));
        const model = hasImages ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama-3.3-70b-versatile';

        const apiMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.slice(-20)
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages: apiMessages,
                max_tokens: 4096,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errData = await response.text();
            console.error('Groq API error:', response.status, errData);
            return { statusCode: 500, headers, body: JSON.stringify({ error: `Erro na API Groq (${response.status}): ${errData.substring(0, 200)}` }) };
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';

        return {
            statusCode: 200, headers,
            body: JSON.stringify({ reply, model, usage: data.usage || null })
        };

    } catch (err) {
        console.error('TCCFlow AI error:', err);
        return {
            statusCode: 500, headers,
            body: JSON.stringify({ error: 'Erro interno: ' + (err.message || err.toString()) })
        };
    }
};
