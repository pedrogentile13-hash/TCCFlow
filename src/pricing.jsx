const { useState: useStateP, useEffect: useEffectP } = React;

function useCountdown() {
  const OFFER_KEY = "tccflow_offer_start";
  const OFFER_DAYS = 7;
  function getEnd() {
    let start = localStorage.getItem(OFFER_KEY);
    if (!start) { start = Date.now().toString(); localStorage.setItem(OFFER_KEY, start); }
    return parseInt(start) + OFFER_DAYS * 86400000;
  }
  const [timeLeft, setTimeLeft] = useStateP(() => Math.max(0, getEnd() - Date.now()));
  useEffectP(() => {
    const id = setInterval(() => setTimeLeft(Math.max(0, getEnd() - Date.now())), 1000);
    return () => clearInterval(id);
  }, []);
  const d = Math.floor(timeLeft / 86400000);
  const h = Math.floor((timeLeft % 86400000) / 3600000);
  const m = Math.floor((timeLeft % 3600000) / 60000);
  const s = Math.floor((timeLeft % 60000) / 1000);
  return { d, h, m, s, expired: timeLeft <= 0 };
}

function CountdownTimer({ compact }) {
  const { d, h, m, s, expired } = useCountdown();
  if (expired) return null;
  if (compact) return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:6,background:"rgba(244,63,94,.1)",padding:"4px 10px",borderRadius:8,fontSize:".75rem",fontWeight:600,color:"#f43f5e" }}>
      <span>{"⏱"}</span>
      <span style={{ fontVariantNumeric:"tabular-nums" }}>{d}d {String(h).padStart(2,"0")}:{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}</span>
    </span>
  );
  return (
    <div style={{ display:"flex",justifyContent:"center",gap:10,margin:"12px 0" }}>
      {[[d,"dias"],[h,"horas"],[m,"min"],[s,"seg"]].map(([v,l],i) => (
        <div key={i} style={{ display:"flex",flexDirection:"column",alignItems:"center",background:"rgba(255,255,255,.2)",borderRadius:10,padding:"8px 14px",minWidth:56 }}>
          <span style={{ fontSize:"1.5rem",fontWeight:700,color:"white",fontVariantNumeric:"tabular-nums" }}>{String(v).padStart(2,"0")}</span>
          <span style={{ fontSize:".6rem",textTransform:"uppercase",letterSpacing:".08em",color:"rgba(255,255,255,.8)" }}>{l}</span>
        </div>
      ))}
    </div>
  );
}

function Pricing() {
  const [annual, setAnnual] = useStateP(true);
  const { expired } = useCountdown();
  const ORIGINAL_M = 39.90;
  const OFFER_M = 14.90;
  const ORIGINAL_Y = 334.90;
  const OFFER_Y = 124.90;

  const plans = [
    {
      name: "Solo",
      sub: "Para quem está começando a organizar o próprio TCC.",
      priceM: 0, priceY: 0,
      originalM: 0, originalY: 0,
      cta: "Começar grátis",
      feats: [
        "1 grupo · até 2 pessoas",
        "Tarefas, calendário e anotações",
        "Integração Google Drive",
        { t: "IA com limite mensal", off: false },
        { t: "Painel do Orientador", off: true },
        { t: "Trabalho Escrito com revisão", off: true },
        { t: "Exportação ABNT", off: true },
      ],
    },
    {
      name: "Grupo",
      sub: "O plano mais usado por grupos de TCC.",
      priceM: expired ? ORIGINAL_M : OFFER_M,
      priceY: expired ? 27.9 : 10.9,
      originalM: expired ? null : ORIGINAL_M,
      originalY: expired ? null : 27.9,
      cta: "Escolher Grupo",
      popular: true,
      highlight: true,
      feats: [
        "Até 5 projetos · até 8 pessoas",
        "Tudo do Solo +",
        "Painel do Orientador completo",
        "Trabalho Escrito com revisão",
        "IA ilimitada · assistente dedicado",
        "Exportação ABNT / APA",
        "1.000 buscas I.A./mês",
        "Histórico de versões",
      ],
    },
    {
      name: "Instituição",
      sub: "Para cursos e universidades que querem rodar em escala.",
      priceM: null, priceY: null,
      originalM: null, originalY: null,
      cta: "Falar com vendas",
      feats: [
        "Tudo do Grupo +",
        "Painel institucional",
        "SSO e autenticação institucional",
        "Relatórios de engajamento",
        "Onboarding dedicado",
        "Suporte prioritário 24h",
      ],
    },
  ];

  return (
    <section id="precos" className="pricing">
      <div className="container">
        <Reveal className="section-head">
          <div>
            <div className="eyebrow">Preços</div>
            <h2 className="display">Preço de estudante.<br/>Ferramenta de <em>profissional</em>.</h2>
          </div>
          <p className="desc">
            Comece grátis. Pague só quando o grupo decidir que quer mais. Sem pegadinhas — cancelamento em 1 clique.
          </p>
        </Reveal>

        {!expired && (
          <Reveal>
            <div style={{
              background:"linear-gradient(135deg,#f43f5e 0%,#e11d48 100%)",
              borderRadius:16,padding:"20px 28px",marginBottom:28,textAlign:"center",color:"white",
              boxShadow:"0 8px 32px rgba(244,63,94,.3)"
            }}>
              <div style={{fontSize:".75rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".12em",marginBottom:6,opacity:.9}}>
                {"🔥"} Oferta Limitada {"🔥"}
              </div>
              <div style={{fontSize:"1.25rem",fontWeight:600,marginBottom:4}}>
                De <span style={{textDecoration:"line-through",opacity:.7}}>R$ {ORIGINAL_M.toFixed(2).replace(".",",")}/mês</span> por apenas <span style={{fontSize:"1.5rem"}}>R$ {OFFER_M.toFixed(2).replace(".",",")}/mês</span>
              </div>
              <div style={{fontSize:".875rem",opacity:.85,marginBottom:12}}>Economize mais de 60%! A oferta acaba em:</div>
              <CountdownTimer />
            </div>
          </Reveal>
        )}

        <Reveal>
          <div className="price-toggle">
            <div className="slider" style={{
              left: annual ? "50%" : "4px",
              right: annual ? "4px" : "50%",
            }}/>
            <button className={!annual ? "active" : ""} onClick={() => setAnnual(false)}>Mensal</button>
            <button className={annual ? "active" : ""} onClick={() => setAnnual(true)}>
              Anual <span className="savings">−30%</span>
            </button>
          </div>
        </Reveal>

        <div className="price-grid">
          {plans.map((p, i) => (
            <Reveal key={i} delay={i+1} className={`price-card ${p.highlight ? "highlight" : ""}`}>
              {p.popular && !expired && <div className="popular" style={{background:"linear-gradient(135deg,#f43f5e,#e11d48)"}}>Oferta Limitada</div>}
              {p.popular && expired && <div className="popular">Mais popular</div>}
              <div className="price-name">{p.name}</div>
              <div className="price-sub">{p.sub}</div>
              <div className="price-value">
                {p.priceM === null ? (
                  <span className="amount" style={{fontSize:"2.5rem"}}>sob medida</span>
                ) : p.priceM === 0 ? (
                  <><span className="amount">R$0</span><span className="period">/ para sempre</span></>
                ) : (
                  <>
                    {(annual ? p.originalY : p.originalM) && (
                      <div style={{fontSize:".875rem",color:"#f43f5e",textDecoration:"line-through",opacity:.7,marginBottom:2}}>
                        R$ {(annual ? p.originalY : p.originalM).toFixed(annual ? 1 : 2).replace(".",",")}
                      </div>
                    )}
                    <span className="currency">R$</span>
                    <span className="amount">{(annual ? p.priceY : p.priceM).toFixed(annual ? 1 : 2).replace(".",",")}</span>
                    <span className="period">/ mês por grupo</span>
                    {!expired && p.popular && <CountdownTimer compact />}
                  </>
                )}
              </div>
              <ul className="price-feat">
                {p.feats.map((f, j) => {
                  const isObj = typeof f === "object";
                  return <li key={j} className={isObj && f.off ? "off" : ""}>{isObj ? f.t : f}</li>;
                })}
              </ul>
              <button className="btn btn-primary" style={{justifyContent:"center", width:"100%"}}>{p.cta} <Arrow/></button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Pricing, CountdownTimer, useCountdown });
