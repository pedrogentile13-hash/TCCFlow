// HERO — 3 variants: editorial | product | manifesto
const { useState: useStateH, useEffect: useEffectH, useRef: useRefH } = React;

function HeroEditorial() {
  const words = ["organizado", "colaborativo", "inteligente", "no ritmo certo"];
  const [idx, setIdx] = useStateH(0);
  useEffectH(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % words.length), 2800);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="hero">
      <div className="hero-grid-bg" />
      <div className="container hero-editorial">
        <Reveal className="hero-eyebrow-row">
          <div className="eyebrow">Manifesto · 2026</div>
          <div className="mono" style={{color:"var(--muted)"}}>
            v3.0 · <span style={{color:"var(--violet)"}}>●</span> ao vivo agora
          </div>
        </Reveal>

        <Reveal delay={1}>
          <h1 className="display hero-title">
            O TCC em grupo, <br/>
            <span className="swap" key={idx}>{words[idx]}</span>.
          </h1>
        </Reveal>

        <div className="hero-sub-row">
          <Reveal delay={2}>
            <p className="hero-sub">
              <strong>TCCFlow é a primeira plataforma pensada para TCCs em equipe.</strong>{" "}
              Tarefas, calendário, chat, anotações e uma IA que conhece o seu trabalho —
              integrados com Google Drive, Docs e Calendar. Tudo em um só lugar.
            </p>
          </Reveal>
          <Reveal delay={3}>
            <div className="hero-meta">
              <div>Desde <span>2026</span></div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={3} className="hero-ctas">
          <a href="/pages/cadastro.html" className="btn btn-primary">
            Criar grupo grátis <Arrow/>
          </a>
          <a href="/pages/demo.html" className="btn btn-ghost">Ver demo interativa →</a>
          <span className="trust">▸ Sem cartão · Cancele quando quiser</span>
        </Reveal>

        <Reveal delay={4}>
          <HeroPreview />
        </Reveal>
      </div>
    </section>
  );
}

function HeroManifesto() {
  return (
    <section className="hero">
      <div className="hero-grid-bg" />
      <div className="container hero-manifesto">
        <Reveal><div className="eyebrow" style={{justifyContent:"center"}}>Para quem faz TCC em grupo</div></Reveal>
        <Reveal delay={1}>
          <h1 className="display manifest-title">
            TCC não devia ser <em>caos</em>.<br/>
            Devia ser um <em>flow</em>.
          </h1>
        </Reveal>
        <Reveal delay={2}>
          <p className="hero-sub" style={{margin:"0 auto 36px", maxWidth:"58ch", textAlign:"center"}}>
            Planilhas se perdem. WhatsApp vira ruído. Drive vira labirinto.
            O TCCFlow junta tudo que seu grupo precisa em um lugar só — e usa IA
            para acelerar as partes chatas.
          </p>
        </Reveal>
        <Reveal delay={3} className="hero-ctas" style={{justifyContent:"center"}}>
          <a href="/pages/cadastro.html" className="btn btn-primary">Começar grátis <Arrow/></a>
          <a href="/pages/demo.html" className="btn btn-glass">Ver por dentro</a>
        </Reveal>
        <Reveal delay={4}>
          <HeroPreview />
        </Reveal>
      </div>
    </section>
  );
}

function HeroProduct() {
  return (
    <section className="hero">
      <div className="hero-grid-bg" />
      <div className="container hero-product">
        <Reveal><div className="eyebrow" style={{justifyContent:"center"}}>● TCCFlow · feito para grupos</div></Reveal>
        <Reveal delay={1}>
          <h1 className="display prod-title">
            Do <em style={{fontStyle:"italic",color:"var(--violet)"}}>brainstorm</em> à <em style={{fontStyle:"italic",color:"var(--cyan)"}}>defesa</em>,<br/>
            sem perder ninguém no caminho.
          </h1>
        </Reveal>
        <Reveal delay={2}>
          <p className="prod-sub">
            Planeje, escreva, se reúna e peça ajuda da IA — tudo na mesma plataforma.
            Integrado com Google Drive, Docs e Calendar.
          </p>
        </Reveal>
        <Reveal delay={3} className="hero-ctas" style={{justifyContent:"center"}}>
          <a href="/pages/cadastro.html" className="btn btn-primary">Começar grátis <Arrow/></a>
          <a href="/pages/demo.html" className="btn btn-ghost">Explorar recursos →</a>
        </Reveal>
        <Reveal delay={4}>
          <HeroPreview />
        </Reveal>
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="hero-preview">
      <div className="preview-chrome">
        <div className="dots"><span/><span/><span/></div>
        <div className="url">app.tccflow.com.br / grupo-sustentabilidade-urbana</div>
      </div>
      <PreviewDashboard />
    </div>
  );
}

function PreviewDashboard() {
  return (
    <div className="preview-dashboard" style={{display:"grid", gridTemplateColumns:"220px 1fr", minHeight:"440px"}}>
      <aside style={{padding:"24px 16px", borderRight:"1px solid var(--line)", background:"var(--bg-2)"}}>
        <div className="mono" style={{fontSize:"0.625rem", color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.12em", margin:"0 8px 10px"}}>Meu TCC</div>
        <div style={{display:"flex",flexDirection:"column",gap:"2px"}}>
          {[
            ["◆","Visão geral", true],
            ["≡","Tarefas", false],
            ["☰","Cronograma", false],
            ["✦","Anotações", false],
            ["◑","Chat", false],
            ["✧","IA Assistente", false],
          ].map(([ic, lbl, active], i) => (
            <div key={i} style={{
              padding:"8px 10px", borderRadius:"8px", fontSize:"0.8125rem",
              background: active ? "var(--grad)" : "transparent",
              color: active ? "white" : "var(--ink-2)",
              fontWeight: active ? 500 : 400,
              display:"flex", alignItems:"center", gap:"10px",
            }}>
              <span style={{opacity:.8}}>{ic}</span>{lbl}
            </div>
          ))}
        </div>
        <div style={{marginTop:"20px", padding:"0 8px"}}>
          <div className="mono" style={{fontSize:"0.625rem", color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:"10px"}}>Grupo · 4</div>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",fontSize:"0.75rem",color:"var(--ink-2)"}}>
            <div className="avatar c1" style={{width:22,height:22,fontSize:"0.625rem",marginLeft:0,border:"none"}}>M</div> Marina (líder)
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",fontSize:"0.75rem",color:"var(--ink-2)"}}>
            <div className="avatar c2" style={{width:22,height:22,fontSize:"0.625rem",marginLeft:0,border:"none"}}>R</div> Rafael
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",fontSize:"0.75rem",color:"var(--ink-2)"}}>
            <div className="avatar c3" style={{width:22,height:22,fontSize:"0.625rem",marginLeft:0,border:"none"}}>J</div> Júlia
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"0.75rem",color:"var(--ink-2)"}}>
            <div className="avatar c4" style={{width:22,height:22,fontSize:"0.625rem",marginLeft:0,border:"none"}}>L</div> Lucas
          </div>
        </div>
      </aside>

      <div style={{padding:"24px 28px"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"22px"}}>
          <div>
            <div className="mono" style={{fontSize:"0.6875rem", color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.12em"}}>Fase 2 · Metodologia</div>
            <h3 style={{fontFamily:"var(--font-display)", fontSize:"1.75rem", margin:"4px 0 0", letterSpacing:"-0.01em", fontWeight:400}}>Sustentabilidade urbana em capitais do sul</h3>
          </div>
          <div style={{display:"flex", gap:"6px"}}>
            <div className="avatar c1" style={{width:28,height:28,fontSize:"0.6875rem"}}>M</div>
            <div className="avatar c2" style={{width:28,height:28,fontSize:"0.6875rem"}}>R</div>
            <div className="avatar c3" style={{width:28,height:28,fontSize:"0.6875rem"}}>J</div>
            <div className="avatar c4" style={{width:28,height:28,fontSize:"0.6875rem"}}>L</div>
          </div>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px", marginBottom:"20px"}}>
          {[
            ["Progresso geral", "62%", "var(--violet)"],
            ["Próx. entrega", "18/05", "var(--amber)"],
            ["Tarefas abertas", "11", "var(--cyan)"],
          ].map(([l,v,c],i)=>(
            <div key={i} style={{padding:"14px", background:"var(--bg-2)", borderRadius:"10px", border:"1px solid var(--line)"}}>
              <div className="mono" style={{fontSize:"0.625rem", color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"6px"}}>{l}</div>
              <div style={{fontFamily:"var(--font-display)", fontSize:"1.5rem", color: c, letterSpacing:"-0.01em"}}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{background:"var(--bg-2)", borderRadius:"10px", padding:"16px", border:"1px solid var(--line)"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"12px"}}>
            <div className="mono" style={{fontSize:"0.6875rem", color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.12em"}}>Cronograma</div>
            <div className="mono" style={{fontSize:"0.6875rem", color:"var(--muted)"}}>ABR · MAI · JUN</div>
          </div>
          <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
            {[
              ["Revisão bibliográfica", 10, 40, "linear-gradient(90deg, #7c3aed, #06b6d4)"],
              ["Coleta de dados", 30, 55, "linear-gradient(90deg, #06b6d4, #14b8a6)"],
              ["Análise", 55, 30, "linear-gradient(90deg, #f59e0b, #f43f5e)"],
              ["Redação capítulos 3-4", 70, 25, "linear-gradient(90deg, #10b981, #06b6d4)"],
            ].map(([n,s,w,c],i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:"12px",alignItems:"center"}}>
                <div style={{fontSize:"0.75rem", color:"var(--ink-2)"}}>{n}</div>
                <div style={{height:"18px", background:"var(--line)", borderRadius:"4px", position:"relative", overflow:"hidden"}}>
                  <div style={{position:"absolute", top:0, bottom:0, left:`${s}%`, width:`${w}%`, background:c, borderRadius:"4px"}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Ticker() {
  const items = [
    "Brainstorm", "Pesquisa", "Metodologia", "Entrevistas",
    "Revisão", "Coleta", "Análise", "Escrita colaborativa",
    "Citações ABNT", "Orientação", "Pré-banca", "Defesa",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="ticker">
      <div className="ticker-track">
        {doubled.map((t, i) => (
          <div className="ticker-item" key={i}>
            <span className="pin"/>{t}
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { HeroEditorial, HeroManifesto, HeroProduct, HeroPreview, Ticker });
