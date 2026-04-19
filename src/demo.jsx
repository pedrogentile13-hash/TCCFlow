// Demo — interactive tabs: Cronograma / Kanban / Chat / IA
const { useState: useStateD, useEffect: useEffectD, useRef: useRefD } = React;

function Demo() {
  const [tab, setTab] = useStateD("cronograma");
  const tabs = [
    ["cronograma", "▤ Cronograma"],
    ["kanban", "▦ Tarefas"],
    ["chat", "◉ Chat"],
    ["ai", "✦ IA"],
  ];
  return (
    <section id="demo" className="demo">
      <div className="container">
        <Reveal className="section-head">
          <div>
            <div className="eyebrow">Demo · clique e experimente</div>
            <h2 className="display">Explore por dentro.</h2>
          </div>
          <p className="desc">
            Um recorte real da interface. Arraste cards, clique em mensagens e peça algo para a IA.
          </p>
        </Reveal>

        <Reveal>
          <div className="demo-shell">
            <div className="demo-tabs">
              {tabs.map(([k, l]) => (
                <button key={k} className={`demo-tab ${tab===k?"active":""}`} onClick={()=>setTab(k)}>{l}</button>
              ))}
            </div>
            <div className="demo-body">
              {tab === "cronograma" && <DemoTimeline/>}
              {tab === "kanban" && <DemoKanban/>}
              {tab === "chat" && <DemoChat/>}
              {tab === "ai" && <DemoAI/>}
            </div>
          </div>
          <div className="demo-note">▸ Protótipo funcional · dados fictícios</div>
        </Reveal>
      </div>
    </section>
  );
}

function DemoTimeline() {
  const tasks = [
    { name: "Revisão bibliográfica", who: "Marina", start: 0, len: 3, color: "linear-gradient(90deg, #7c3aed, #8b5cf6)" },
    { name: "Definição metodologia", who: "Grupo", start: 2, len: 3, color: "linear-gradient(90deg, #06b6d4, #14b8a6)" },
    { name: "Entrevistas piloto", who: "Rafael", start: 4, len: 3, color: "linear-gradient(90deg, #10b981, #14b8a6)" },
    { name: "Coleta de dados", who: "Júlia + Lucas", start: 5, len: 5, color: "linear-gradient(90deg, #f59e0b, #f97316)" },
    { name: "Análise + gráficos", who: "Lucas", start: 8, len: 3, color: "linear-gradient(90deg, #f43f5e, #ec4899)" },
    { name: "Redação final", who: "Grupo", start: 9, len: 3, color: "linear-gradient(90deg, #7c3aed, #06b6d4)" },
  ];
  return (
    <div className="timeline">
      <div className="timeline-grid head">
        <div>Tarefa · Responsável</div>
        {Array.from({length:12}).map((_,i)=><div key={i} className="wk">S{i+1}</div>)}
      </div>
      {tasks.map((t, i) => (
        <div key={i} className="timeline-grid timeline-row">
          <div className="task-name">
            {t.name}
            <small>{t.who}</small>
          </div>
          {Array.from({length:12}).map((_,w)=>(
            <div key={w} className="timeline-cell">
              {w === t.start && (
                <div className="timeline-bar" style={{
                  left: 0,
                  width: `calc(${t.len * 100}% + ${(t.len - 1) * 2}px)`,
                  background: t.color,
                }}>
                  {t.len >= 2 && (w === t.start) && `${t.len}sem`}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function DemoKanban() {
  const initial = {
    todo: [
      { id: "t1", tag: "pesquisa", title: "Buscar 10 artigos sobre ciclomobilidade", who: "M" },
      { id: "t2", tag: "reuniao", title: "Agendar reunião de orientação semanal", who: "R" },
    ],
    doing: [
      { id: "t3", tag: "escrita", title: "Redigir introdução do cap. 2", who: "M" },
      { id: "t4", tag: "pesquisa", title: "Transcrever entrevista #3", who: "J" },
      { id: "t5", tag: "urgente", title: "Aprovar questionário no CEP", who: "R" },
    ],
    review: [
      { id: "t6", tag: "escrita", title: "Revisão do capítulo 1 (metodologia)", who: "L" },
    ],
    done: [
      { id: "t7", tag: "pesquisa", title: "Definição do problema de pesquisa", who: "M" },
      { id: "t8", tag: "reuniao", title: "Kick-off com orientador", who: "R" },
    ],
  };
  const [cols, setCols] = useStateD(initial);
  const [dragging, setDragging] = useStateD(null);

  const moveCard = (id, toCol) => {
    setCols(prev => {
      const next = { todo: [...prev.todo], doing: [...prev.doing], review: [...prev.review], done: [...prev.done] };
      let moved = null;
      for (const k of Object.keys(next)) {
        const idx = next[k].findIndex(c => c.id === id);
        if (idx >= 0) { moved = next[k][idx]; next[k].splice(idx, 1); break; }
      }
      if (moved) next[toCol].push(moved);
      return next;
    });
  };

  const labels = { todo: "A Fazer", doing: "Em Andamento", review: "Em Revisão", done: "Concluído" };
  const avatarClass = { M: "c1", R: "c2", J: "c3", L: "c4" };

  return (
    <div className="kanban">
      {Object.keys(cols).map(col => (
        <div
          key={col}
          className="kanban-col"
          data-col={col}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => { if (dragging) moveCard(dragging, col); setDragging(null); }}
        >
          <div className="kanban-col-head">
            <span className="title"><span className="dot"/>{labels[col]}</span>
            <span className="count">{cols[col].length}</span>
          </div>
          {cols[col].map(card => (
            <div
              key={card.id}
              className="kanban-card"
              draggable
              onDragStart={() => setDragging(card.id)}
              onDragEnd={() => setDragging(null)}
            >
              <span className={`tag tag-${card.tag}`}>{card.tag}</span>
              <div className="title">{card.title}</div>
              <div className="meta">
                <span>#{card.id.toUpperCase()}</span>
                <div className="avatars">
                  <div className={`avatar ${avatarClass[card.who]}`}>{card.who}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function DemoChat() {
  const channels = [
    { name: "geral", unread: 0, active: false },
    { name: "metodologia", unread: 3, active: true },
    { name: "coleta-dados", unread: 0, active: false },
    { name: "escrita", unread: 1, active: false },
    { name: "orientacao", unread: 0, active: false },
    { name: "entregas", unread: 0, active: false },
  ];
  const [active, setActive] = useStateD("metodologia");
  const [messages, setMessages] = useStateD([
    { who: "Marina", avatar: "M", c: "c1", time: "10:14", text: "Pessoal, revisei a metodologia e acho que devíamos usar entrevistas semi-estruturadas em vez de questionário fechado." },
    { who: "Rafael", avatar: "R", c: "c2", time: "10:16", text: "Concordo! Dá mais profundidade. @Júlia você tem experiência com roteiro?" },
    { who: "Júlia", avatar: "J", c: "c3", time: "10:18", text: "Tenho sim. Subo um rascunho hoje à tarde ↗" },
    { who: "TCCFlow AI", avatar: "✦", c: "ai", time: "10:18", text: "Baseado nas suas referências, identifiquei 3 roteiros clássicos para entrevistas semi-estruturadas em pesquisa qualitativa urbana. Quer que eu crie um template?", ai: true },
  ]);
  const [input, setInput] = useStateD("");
  const boxRef = useRefD(null);
  useEffectD(() => { if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    setMessages([...messages, { who: "Você", avatar: "V", c: "c5", time: "agora", text: input }]);
    setInput("");
  };

  return (
    <div className="chat-demo">
      <aside className="chat-sidebar">
        <div className="mono" style={{fontSize:"0.6875rem", color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.12em", margin:"0 10px 10px"}}>Canais</div>
        {channels.map(ch => (
          <div key={ch.name} className={`chat-channel ${active === ch.name ? "active" : ""}`} onClick={() => setActive(ch.name)}>
            <span><span className="hash">#</span>{ch.name}</span>
            {ch.unread > 0 && <span className="unread">{ch.unread}</span>}
          </div>
        ))}
      </aside>
      <div className="chat-main">
        <div className="chat-head">
          <span className="hash" style={{color:"var(--muted)"}}>#</span>{active}
          <small>4 pessoas · tópico da fase 2</small>
        </div>
        <div className="chat-messages" ref={boxRef}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.ai ? "ai" : ""}`}>
              <div className={`avatar ${m.c}`} style={{margin:0, border: "none"}}>{m.avatar}</div>
              <div className="body">
                <div><span className="who">{m.who}</span><span className="time">{m.time}</span></div>
                <div className="text">{m.text}</div>
              </div>
            </div>
          ))}
        </div>
        <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder={`Mensagem para #${active}`}/>
          <button type="submit" className="send" aria-label="Enviar">→</button>
        </form>
      </div>
    </div>
  );
}

function DemoAI() {
  const actions = [
    ["🔎", "Resumir referência", "summary"],
    ["✍", "Reescrever parágrafo", "rewrite"],
    ["❡", "Citação ABNT", "cite"],
    ["⚑", "Identificar lacunas", "gaps"],
    ["⌘", "Gerar roteiro entrevista", "script"],
  ];
  const [active, setActive] = useStateD("summary");
  const [output, setOutput] = useStateD("");
  const [typing, setTyping] = useStateD(false);

  const responses = {
    summary: "Este artigo analisa 12 capitais brasileiras entre 2018–2024, concluindo que apenas 3 apresentam infraestrutura cicloviária contínua. Três fatores explicam a estagnação: (1) fragmentação orçamentária, (2) ausência de plano diretor integrado e (3) resistência política local.",
    rewrite: "A pesquisa investiga como políticas públicas de mobilidade ativa impactam a qualidade de vida em grandes centros urbanos, comparando indicadores antes e depois de intervenções cicloviárias em três capitais brasileiras.",
    cite: "SILVA, M. A.; PEREIRA, J. C. Mobilidade ativa em capitais brasileiras: o paradoxo da infraestrutura fragmentada. Revista de Planejamento Urbano, São Paulo, v. 18, n. 2, p. 45–67, 2024.",
    gaps: "Identifiquei 2 lacunas no seu capítulo 3:\n• Metodologia não detalha critério de inclusão das cidades\n• Falta justificativa para recorte temporal 2018–2024\n\nSugiro acrescentar um parágrafo em cada ponto.",
    script: "Roteiro sugerido (8 perguntas):\n1. Como você descreve sua experiência com mobilidade urbana hoje?\n2. Quais trajetos você faz regularmente de bicicleta?\n3. Em que trechos você se sente mais inseguro(a)?\n…",
  };

  useEffectD(() => {
    setTyping(true);
    setOutput("");
    const full = responses[active];
    let i = 0;
    const t = setInterval(() => {
      i += 2;
      setOutput(full.slice(0, i));
      if (i >= full.length) { clearInterval(t); setTyping(false); }
    }, 18);
    return () => clearInterval(t);
  }, [active]);

  return (
    <div className="ai-demo">
      <div className="ai-side">
        <h4>Seu documento</h4>
        <div className="ai-doc">
          <h5>3. Metodologia</h5>
          <p>
            A pesquisa adota abordagem <span className="highlight">quali-quantitativa</span>, com
            coleta de dados primários e secundários em três capitais do Sul do Brasil. O recorte
            temporal compreende o período entre 2018 e 2024, marcado pela implementação de novos
            planos diretores cicloviários.
          </p>
          <p>
            As entrevistas serão semi-estruturadas, aplicadas a 15 participantes selecionados por
            amostragem por conveniência. A análise seguirá o protocolo de <span className="highlight">análise de conteúdo</span> proposto por Bardin (2011).
          </p>
        </div>
      </div>
      <div className="ai-side output">
        <h4>TCCFlow AI · assistente</h4>
        <div className="ai-actions">
          {actions.map(([ic, l, k]) => (
            <button key={k} className={`ai-btn ${active === k ? "active" : ""}`} onClick={() => setActive(k)}>
              <span className="emoji">{ic}</span>{l}
            </button>
          ))}
        </div>
        <div className="ai-output-box">
          <span style={{whiteSpace:"pre-wrap"}} className={typing ? "typing" : ""}>{output}</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Demo, DemoTimeline, DemoKanban, DemoChat, DemoAI });
