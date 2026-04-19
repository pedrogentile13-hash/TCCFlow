const { useState: useStateF } = React;

function FAQ() {
  const qs = [
    ["O TCCFlow funciona para TCC individual também?", "Sim. O plano Solo é pensado para TCCs individuais e te dá tarefas, calendário, anotações e IA com limite mensal — grátis para sempre."],
    ["Meu orientador precisa pagar ou criar conta?", "Não. No plano Grupo, o orientador entra como convidado sem custo adicional. Ele pode comentar, aprovar entregas e acompanhar o cronograma sem precisar criar outra conta se já usa Google."],
    ["Como funciona a integração com Google Drive, Docs e Calendar?", "Você autoriza o acesso uma vez e o TCCFlow cria (ou conecta) uma pasta do grupo no seu Drive. Rascunhos abrem no Docs com histórico preservado, e prazos viram eventos no seu Calendar automaticamente."],
    ["A IA lê os meus documentos? É seguro?", "A IA é treinada sob demanda nos documentos que o grupo autoriza. Tudo é criptografado, nunca usamos seus dados para treinar modelos externos, e você pode desligar o assistente a qualquer momento."],
    ["E se o grupo se desfizer no meio do semestre?", "Os dados pertencem ao grupo. Se alguém sair, pode exportar sua parte em PDF/Markdown. O líder pode transferir a titularidade em dois cliques."],
    ["Posso começar gratuitamente e trocar depois?", "Sim. Dá para começar no Solo, convidar o grupo no plano Grupo quando quiser, e voltar atrás se mudar de ideia. Cobramos proporcional ao tempo usado."],
    ["Vocês exportam no formato ABNT?", "Sim, ABNT e APA nativamente. A IA também formata citações avulsas e gera referências a partir de DOI ou link do artigo."],
  ];
  const [open, setOpen] = useStateF(0);
  return (
    <section id="faq" className="faq-section">
      <div className="container">
        <Reveal className="section-head">
          <div>
            <div className="eyebrow">FAQ</div>
            <h2 className="display">Ainda na dúvida?</h2>
          </div>
          <p className="desc">
            As perguntas que a gente mais ouve. Se a sua não estiver aqui, é só chamar no chat — respondemos em até 1h útil.
          </p>
        </Reveal>

        <div className="faq-list">
          {qs.map(([q, a], i) => (
            <Reveal key={i} delay={Math.min(i+1, 4)} className={`faq-item ${open === i ? "open" : ""}`}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{q}</span>
                <span className="plus">+</span>
              </button>
              <div className="faq-a">
                <div className="faq-a-inner">{a}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTAFinal() {
  return (
    <section className="cta-final">
      <div className="container">
        <Reveal>
          <div className="eyebrow" style={{justifyContent:"center", marginBottom:"32px"}}>Pronto para entrar no flow?</div>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="display">Comece <em>agora</em>,<br/>defenda <em>tranquilo</em>.</h2>
        </Reveal>
        <Reveal delay={2}>
          <div className="ctas">
            <a href="#signup" className="btn btn-primary" style={{padding:"16px 28px", fontSize:"1rem"}}>
              Criar grupo grátis <Arrow size={16}/>
            </a>
            <a href="#demo" className="btn btn-glass" style={{padding:"16px 28px", fontSize:"1rem"}}>Agendar demo guiada</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Brand/>
            <h4 className="display">O TCC em grupo, no flow.</h4>
            <p>Plataforma colaborativa que junta tarefas, cronograma, chat, anotações e IA para grupos de TCC no Brasil.</p>
          </div>
          <div className="footer-col">
            <h5>Produto</h5>
            <ul>
              <li><a href="#recursos">Recursos</a></li>
              <li><a href="#demo">Demo</a></li>
              <li><a href="#precos">Preços</a></li>
              <li><a href="#">Novidades</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Empresa</h5>
            <ul>
              <li><a href="#">Sobre</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Para universidades</a></li>
              <li><a href="#">Contato</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <ul>
              <li><a href="#">Termos</a></li>
              <li><a href="#">Privacidade</a></li>
              <li><a href="#">LGPD</a></li>
              <li><a href="#">Status</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bot">
          <div>© 2026 TCCFlow · Feito com café em São Paulo ☕</div>
          <div>tccflow.com.br</div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { FAQ, CTAFinal, Footer });
