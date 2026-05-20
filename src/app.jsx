// Root app
const { useState: useStateA, useEffect: useEffectA } = React;

function MobileSplash() {
  const [phase, setPhase] = useStateA("loading");

  useEffectA(() => {
    const t1 = setTimeout(() => setPhase("ready"), 2200);
    return () => clearTimeout(t1);
  }, []);

  return (
    <div style={{
      minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      background:"linear-gradient(160deg,#0f0a1e 0%,#1a1035 40%,#0d1117 100%)",
      padding:"40px 24px",textAlign:"center",overflow:"hidden",position:"relative"
    }}>
      <style>{`
        @keyframes splash-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes splash-glow{0%,100%{box-shadow:0 0 30px rgba(124,58,237,.3)}50%{box-shadow:0 0 60px rgba(124,58,237,.6),0 0 100px rgba(124,58,237,.2)}}
        @keyframes splash-fade-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes splash-pulse{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes splash-orbit{from{transform:rotate(0deg) translateX(120px) rotate(0deg)}to{transform:rotate(360deg) translateX(120px) rotate(-360deg)}}
        .splash-orb{position:absolute;border-radius:50%;filter:blur(60px);opacity:.15;pointer-events:none}
      `}</style>

      <div className="splash-orb" style={{width:300,height:300,background:"#7c3aed",top:"-10%",left:"-15%"}}/>
      <div className="splash-orb" style={{width:250,height:250,background:"#06b6d4",bottom:"-5%",right:"-10%"}}/>
      <div className="splash-orb" style={{width:180,height:180,background:"#f43f5e",top:"60%",left:"50%",transform:"translateX(-50%)"}}/>

      <div style={{position:"relative",marginBottom:32}}>
        <div style={{
          width:100,height:100,borderRadius:28,
          background:"linear-gradient(135deg,#7c3aed 0%,#a855f7 50%,#06b6d4 100%)",
          display:"flex",alignItems:"center",justifyContent:"center",
          animation:"splash-float 3s ease-in-out infinite, splash-glow 3s ease-in-out infinite",
          boxShadow:"0 20px 60px rgba(124,58,237,.4)"
        }}>
          <img src="/assets/logo.png" alt="TCCFlow" style={{width:60,height:60,objectFit:"contain",filter:"brightness(0) invert(1)"}}
            onError={(e) => { e.target.style.display='none'; e.target.parentNode.innerHTML='<span style="font-size:2.5rem;color:white;font-weight:700">T</span>'; }}
          />
        </div>
        <div style={{
          position:"absolute",top:"50%",left:"50%",width:8,height:8,borderRadius:"50%",
          background:"#06b6d4",animation:"splash-orbit 6s linear infinite",opacity:.6
        }}/>
        <div style={{
          position:"absolute",top:"50%",left:"50%",width:6,height:6,borderRadius:"50%",
          background:"#f43f5e",animation:"splash-orbit 8s linear infinite reverse",opacity:.5
        }}/>
      </div>

      <div style={{animation:"splash-fade-in .8s ease-out .3s both"}}>
        <h1 style={{
          fontFamily:"'Instrument Serif',Georgia,serif",fontSize:"2.5rem",fontWeight:400,
          color:"white",letterSpacing:"-.02em",margin:"0 0 8px",lineHeight:1.1
        }}>
          TCC<em style={{fontStyle:"italic",color:"#a855f7"}}>Flow</em>
        </h1>
      </div>

      <div style={{animation:"splash-fade-in .8s ease-out .6s both"}}>
        <p style={{
          fontSize:".9375rem",color:"rgba(255,255,255,.6)",lineHeight:1.6,
          maxWidth:"28ch",margin:"0 auto 32px"
        }}>
          A plataforma completa para TCCs em grupo. Organize, colabore e entregue com inteligência.
        </p>
      </div>

      <div style={{animation:"splash-fade-in .8s ease-out .9s both",display:"flex",flexDirection:"column",gap:12,width:"100%",maxWidth:300}}>
        {phase === "loading" ? (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
            <div style={{display:"flex",gap:6}}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width:8,height:8,borderRadius:"50%",background:"#a855f7",
                  animation:`splash-pulse 1.2s ease-in-out ${i*.2}s infinite`
                }}/>
              ))}
            </div>
            <span style={{fontSize:".75rem",color:"rgba(255,255,255,.4)"}}>Carregando...</span>
          </div>
        ) : (
          <>
            <a href="/pages/cadastro.html" style={{
              display:"flex",alignItems:"center",justifyContent:"center",gap:8,
              padding:"14px 28px",borderRadius:12,fontWeight:600,fontSize:".9375rem",
              background:"linear-gradient(135deg,#7c3aed,#a855f7)",color:"white",
              textDecoration:"none",boxShadow:"0 8px 32px rgba(124,58,237,.4)",
              animation:"splash-fade-in .5s ease-out both"
            }}>
              Criar grupo gratis
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
            <a href="/pages/login.html" style={{
              display:"flex",alignItems:"center",justifyContent:"center",
              padding:"14px 28px",borderRadius:12,fontWeight:500,fontSize:".9375rem",
              background:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.7)",
              textDecoration:"none",border:"1px solid rgba(255,255,255,.1)",
              animation:"splash-fade-in .5s ease-out .15s both"
            }}>
              Ja tenho conta
            </a>
          </>
        )}
      </div>

      <div style={{animation:"splash-fade-in .8s ease-out 1.2s both",marginTop:40}}>
        <p style={{fontSize:".6875rem",color:"rgba(255,255,255,.25)"}}>
          &copy; 2026 TCCFlow. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}

function App() {
  const [tw, setTw] = useStateA({ ...window.TWEAKS });
  const [isMobile, setIsMobile] = useStateA(() => window.innerWidth <= 768);

  useEffectA(() => {
    applyDom(window.TWEAKS);
    const onTweak = () => setTw({ ...window.TWEAKS });
    window.addEventListener("tweaks-changed", onTweak);
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("tweaks-changed", onTweak); window.removeEventListener("resize", onResize); };
  }, []);

  if (isMobile) return <MobileSplash />;

  let HeroComp = HeroEditorial;
  if (tw.heroVariant === "product") HeroComp = HeroProduct;
  if (tw.heroVariant === "manifesto") HeroComp = HeroManifesto;

  return (
    <>
      <CursorBlob/>
      <Nav/>
      <HeroComp/>
      <Ticker/>
      <HowItWorks/>
      <Features/>
      <Demo/>
      <Personas/>
      <Pricing/>
      <FAQ/>
      <CTAFinal/>
      <Footer/>
      <TweaksPanel/>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
