// How it works + Features
function HowItWorks() {
  const steps = [
    ["01","Crie seu grupo","Convide parceiros e orientador. O TCCFlow conecta automaticamente ao seu Google Drive e Calendar."],
    ["02","Planeje juntos","Defina fases, prazos e quem faz o quê no cronograma visual. A IA sugere marcos baseado no tipo de trabalho."],
    ["03","Execute no flow","Chat por fase, tarefas com checklist, anotações compartilhadas e rascunho no Docs — tudo sincronizado."],
    ["04","Entregue tranquilo","Exportação ABNT automática, controle de versões e feedback do orientador em contexto."],
  ];
  return (
    <section id="como" className="how">
      <div className="container">
        <Reveal className="section-head">
          <div>
            <div className="eyebrow">Como funciona</div>
            <h2 className="display">Quatro passos.<br/>Do <em>grupo criado</em> à defesa.</h2>
          </div>
          <p className="desc">
            Pensado para times de 2 a 6 pessoas, com ou sem orientador ativo.
            Você pode começar em qualquer fase do TCC — o TCCFlow se adapta.
          </p>
        </Reveal>

        <div className="trail">
          {steps.map(([n, title, desc], i) => (
            <Reveal key={i} delay={i+1} className="step">
              <div className="step-num">{n}</div>
              <h3 className="display">{title}</h3>
              <p>{desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { HowItWorks });
