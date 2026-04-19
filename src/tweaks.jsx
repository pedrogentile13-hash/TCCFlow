const { useState: useStateT, useEffect: useEffectT } = React;

function TweaksPanel() {
  const [open, setOpen] = useStateT(false);
  const [active, setActive] = useStateT(false);
  const [tw, setTw] = useStateT({ ...window.TWEAKS });

  useEffectT(() => {
    const onMsg = (e) => {
      if (e.data?.type === "__activate_edit_mode") setActive(true);
      if (e.data?.type === "__deactivate_edit_mode") { setActive(false); setOpen(false); }
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const apply = (next) => {
    const merged = { ...tw, ...next };
    setTw(merged);
    window.TWEAKS = merged;
    applyDom(merged);
    window.dispatchEvent(new CustomEvent("tweaks-changed"));
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: next }, "*");
  };

  useEffectT(() => { applyDom(tw); }, []);

  if (!active) return null;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position:"fixed", bottom:"20px", right:"20px", zIndex:99,
          background:"var(--grad)", color:"white",
          width:"48px", height:"48px", borderRadius:"50%",
          boxShadow:"var(--shadow-lg)", fontSize:"1.25rem",
          display: open ? "none" : "flex", alignItems:"center", justifyContent:"center",
        }}
      >◈</button>

      <div className={`tweaks ${open ? "open" : ""}`}>
        <h4>Tweaks <span className="close" onClick={() => setOpen(false)}>×</span></h4>

        <div className="tweak-row">
          <div className="lbl">Hero</div>
          <div className="tweak-opts">
            {[["editorial","Editorial"], ["product","Produto"], ["manifesto","Manifesto"]].map(([k, l]) => (
              <button key={k} className={tw.heroVariant === k ? "on" : ""} onClick={() => apply({ heroVariant: k })}>{l}</button>
            ))}
          </div>
        </div>

        <div className="tweak-row">
          <div className="lbl">Paleta</div>
          <div className="tweak-opts">
            {[["aurora","Aurora"], ["mono","Mono"], ["sunset","Sunset"]].map(([k, l]) => (
              <button key={k} className={tw.accentMode === k ? "on" : ""} onClick={() => apply({ accentMode: k })}>{l}</button>
            ))}
          </div>
        </div>

        <div className="tweak-row">
          <div className="tweak-switch">
            <span className="lbl" style={{margin:0}}>Dark mode</span>
            <div className={`switch ${tw.darkMode ? "on" : ""}`} onClick={() => apply({ darkMode: !tw.darkMode })}/>
          </div>
        </div>

        <div className="tweak-row">
          <div className="tweak-switch">
            <span className="lbl" style={{margin:0}}>Cursor blob</span>
            <div className={`switch ${tw.cursorBlob ? "on" : ""}`} onClick={() => apply({ cursorBlob: !tw.cursorBlob })}/>
          </div>
        </div>

        <div className="tweak-row">
          <div className="tweak-switch">
            <span className="lbl" style={{margin:0}}>Anim. ao scroll</span>
            <div className={`switch ${tw.animateOnScroll ? "on" : ""}`} onClick={() => apply({ animateOnScroll: !tw.animateOnScroll })}/>
          </div>
        </div>
      </div>
    </>
  );
}

function applyDom(tw) {
  document.documentElement.setAttribute("data-theme", tw.darkMode ? "dark" : "light");
  document.documentElement.setAttribute("data-accent", tw.accentMode);
  document.documentElement.setAttribute("data-hero", tw.heroVariant);
}

Object.assign(window, { TweaksPanel, applyDom });
