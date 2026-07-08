// Features — bento grid
function Features() {
  return (
    <section id="recursos" className="features">
      <div className="container">
        <Reveal className="section-head">
          <div>
            <div className="eyebrow">Recursos</div>
            <h2 className="display">Tudo que seu grupo precisa, <em>nada</em> que não precisa.</h2>
          </div>
          <p className="desc">
            Nove ferramentas que costumavam ser nove abas diferentes. Agora conversam entre si — e com o Google.
          </p>
        </Reveal>

        <div className="feat-grid">
          <Reveal delay={1} className="feat feat-big">
            <div className="feat-label">01 · Cronograma visual</div>
            <h3>Gantt que se entende sozinho.</h3>
            <p>Arraste tarefas, ajuste dependências e visualize o caminho crítico. A IA avisa quando o prazo está apertado.</p>
            <div className="feat-illus gantt-mini">
              <div className="gantt-row r1"><div className="lbl">Pesquisa</div><div className="bar"/></div>
              <div className="gantt-row r2"><div className="lbl">Metodol.</div><div className="bar"/></div>
              <div className="gantt-row r3"><div className="lbl">Coleta</div><div className="bar"/></div>
              <div className="gantt-row r4"><div className="lbl">Análise</div><div className="bar"/></div>
              <div className="gantt-row r5"><div className="lbl">Escrita</div><div className="bar"/></div>
            </div>
          </Reveal>

          <Reveal delay={2} className="feat feat-tall">
            <div className="feat-label">02 · Grupo</div>
            <h3>Todo mundo no mesmo compasso.</h3>
            <p>Papéis, permissões e presença ao vivo.</p>
            <div className="feat-illus" style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
              <div className="avatars">
                <div className="avatar c1">M</div>
                <div className="avatar c2">R</div>
                <div className="avatar c3">J</div>
                <div className="avatar c4">L</div>
                <div className="avatar c5">+</div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={3} className="feat feat-sm">
            <div className="feat-label">03 · Chat por fase</div>
            <h3>Sem ruído.</h3>
            <div className="feat-illus chat-bubbles">
              <div className="bubble them"><span className="who">Rafael</span>Mandei o link da planilha no #coleta</div>
              <div className="bubble me">Fechei, vou revisar ⚡</div>
            </div>
          </Reveal>

          <Reveal delay={4} className="feat feat-sm">
            <div className="feat-label">04 · Calendar</div>
            <h3>Sincroniza com o seu.</h3>
            <div className="feat-illus cal-mini">
              {["S","T","Q","Q","S","S","D"].map((d,i)=><div key={"h"+i} className="cal-day head">{d}</div>)}
              {Array.from({length: 21}).map((_,i) => {
                const events = [5, 12, 15, 18];
                const active = i === 15;
                const hasEvent = events.includes(i);
                return (
                  <div key={i} className={`cal-day ${active ? "active" : ""} ${hasEvent ? "has-event" : ""}`}>{i+1}</div>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={1} className="feat feat-wide">
            <div className="feat-label">05 · IA que conhece seu TCC</div>
            <h3>“Resume esse artigo e cita do jeito ABNT.”</h3>
            <p>Treinada com os seus documentos, referências e anotações. Gera resumos, sugere metodologias e formata citações.</p>
            <div className="feat-illus ai-card">
              <div className="ai-prompt">› resumir doc “entrevistas_piloto_v3.pdf”</div>
              <div className="ai-response">As 5 entrevistas apontam 3 padrões recorrentes sobre mobilidade urbana: <strong>(1) infraestrutura cicloviária descontínua</strong>, (2) percepção de insegurança noturna, (3) baixa integração modal…</div>
            </div>
          </Reveal>

          <Reveal delay={2} className="feat feat-sm">
            <div className="feat-label">06 · Drive / Docs</div>
            <h3>Integração nativa.</h3>
            <p>Abra, edite e comente sem sair da plataforma. Histórico de versões preservado.</p>
          </Reveal>

          <Reveal delay={3} className="feat feat-sm">
            <div className="feat-label">07 · Anotações</div>
            <h3>Como post-its, só que encontráveis.</h3>
            <p>Tags, links entre notas e busca fulltext.</p>
          </Reveal>

          <Reveal delay={4} className="feat feat-sm" style={{position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:8,right:8,background:"linear-gradient(135deg,#7c3aed,#a855f7)",color:"white",padding:"2px 8px",borderRadius:999,fontSize:".6rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",zIndex:2}}>PRO</div>
            <div className="feat-label">08 · Orientador</div>
            <h3>Feedback em contexto.</h3>
            <p>Seu orientador avalia cada seção, deixa notas e acompanha o progresso do grupo em tempo real.</p>
          </Reveal>

          <Reveal delay={5} className="feat feat-sm" style={{position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:8,right:8,background:"linear-gradient(135deg,#7c3aed,#a855f7)",color:"white",padding:"2px 8px",borderRadius:999,fontSize:".6rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",zIndex:2}}>PRO</div>
            <div className="feat-label">09 · Trabalho Escrito</div>
            <h3>Escreva e envie para revisão.</h3>
            <p>Editor de capítulos com status, contagem de palavras e envio direto para revisão do orientador.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Features });
