function Personas() {
  const ps = [
    {
      role: "O líder organizado",
      name: "Marina, 22",
      bio: "Estudante de Arquitetura. Boa com planejamento, mas cansou de ser a pessoa que cobra todo mundo no WhatsApp.",
      pains: ["Organizar reuniões é um ping-pong infinito", "Nunca sabe em que versão do doc o grupo está", "Passa mais tempo gerenciando do que escrevendo"],
      quote: "Quero escrever o TCC, não ser gerente de projeto improvisado.",
    },
    {
      role: "O pragmático",
      name: "Rafael, 24",
      bio: "Eng. de Produção. Gosta de tarefa bem definida e não gosta de reunião sem agenda.",
      pains: ["Não vê progresso do grupo com clareza", "Sofre com citação ABNT manual", "Drive do grupo virou um labirinto"],
      quote: "Se eu souber exatamente o que preciso fazer na semana, eu entrego.",
    },
    {
      role: "A criativa dispersa",
      name: "Júlia, 21",
      bio: "Publicidade. Cheia de ideias, péssima com prazos. Anota em 6 apps diferentes.",
      pains: ["Perde insights porque anota em qualquer canto", "Não curte plataformas frias e cheias de botão", "Esquece o que combinou na última reunião"],
      quote: "Me dá algo bonito de usar, que junte tudo sem me travar.",
    },
  ];
  return (
    <section className="personas">
      <div className="container">
        <Reveal className="section-head">
          <div>
            <div className="eyebrow">Para quem é</div>
            <h2 className="display">Feito para <em>grupos reais</em>.<br/>Com pessoas reais.</h2>
          </div>
          <p className="desc">
            Trabalhamos com 200+ grupos em beta para entender os perfis mais comuns. Você provavelmente é um deles — ou um mix.
          </p>
        </Reveal>

        <div className="persona-grid">
          {ps.map((p, i) => (
            <Reveal key={i} delay={i+1} className="persona-card">
              <div className="role">{p.role}</div>
              <h3 className="display">{p.name}</h3>
              <p className="bio">{p.bio}</p>
              <ul className="pains">
                {p.pains.map((pain, j) => <li key={j}>{pain}</li>)}
              </ul>
              <div className="persona-quote">{p.quote}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Personas });
