const { useState: useStateP } = React;

function Pricing() {
  const [annual, setAnnual] = useStateP(true);
  const plans = [
    {
      name: "Solo",
      sub: "Para quem está começando a organizar o próprio TCC.",
      priceM: 0, priceY: 0,
      cta: "Começar grátis",
      feats: [
        "1 grupo · até 2 pessoas",
        "Tarefas, calendário e anotações",
        "Integração Google Drive",
        { t: "IA com limite mensal", off: false },
        { t: "Orientador externo", off: true },
        { t: "Exportação ABNT", off: true },
      ],
    },
    {
      name: "Grupo",
      sub: "O plano mais usado por grupos de TCC.",
      priceM: 19, priceY: 14,
      cta: "Escolher Grupo",
      popular: true,
      highlight: true,
      feats: [
        "Grupos ilimitados · até 6 pessoas",
        "Tudo do Solo +",
        "Orientador com acesso total",
        "IA ilimitada · assistente dedicado",
        "Exportação ABNT / APA",
        "Histórico de versões",
      ],
    },
    {
      name: "Instituição",
      sub: "Para cursos e universidades que querem rodar em escala.",
      priceM: null, priceY: null,
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

        <Reveal>
          <div className="price-toggle">
            <div className="slider" style={{
              left: annual ? "50%" : "4px",
              right: annual ? "4px" : "50%",
            }}/>
            <button className={!annual ? "active" : ""} onClick={() => setAnnual(false)}>Mensal</button>
            <button className={annual ? "active" : ""} onClick={() => setAnnual(true)}>
              Anual <span className="savings">−25%</span>
            </button>
          </div>
        </Reveal>

        <div className="price-grid">
          {plans.map((p, i) => (
            <Reveal key={i} delay={i+1} className={`price-card ${p.highlight ? "highlight" : ""}`}>
              {p.popular && <div className="popular">Mais popular</div>}
              <div className="price-name">{p.name}</div>
              <div className="price-sub">{p.sub}</div>
              <div className="price-value">
                {p.priceM === null ? (
                  <span className="amount" style={{fontSize:"2.5rem"}}>sob medida</span>
                ) : p.priceM === 0 ? (
                  <><span className="amount">R$0</span><span className="period">/ para sempre</span></>
                ) : (
                  <>
                    <span className="currency">R$</span>
                    <span className="amount">{annual ? p.priceY : p.priceM}</span>
                    <span className="period">/ mês por grupo</span>
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

Object.assign(window, { Pricing });
