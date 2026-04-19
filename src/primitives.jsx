// Primitives — shared components
const { useState, useEffect, useRef, useLayoutEffect } = React;

// Reveal on scroll
function Reveal({ children, delay = 0, className = "", as = "div", ...props }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!window.TWEAKS?.animateOnScroll) { setShown(true); return; }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { setShown(true); obs.disconnect(); }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const Tag = as;
  const cls = `reveal ${shown ? "in" : ""} ${delay ? `d${delay}` : ""} ${className}`.trim();
  return <Tag ref={ref} className={cls} {...props}>{children}</Tag>;
}

// Cursor blob
function CursorBlob() {
  const ref = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(window.TWEAKS?.cursorBlob);
  useEffect(() => {
    const onTweak = () => setEnabled(window.TWEAKS?.cursorBlob);
    window.addEventListener("tweaks-changed", onTweak);
    return () => window.removeEventListener("tweaks-changed", onTweak);
  }, []);
  useEffect(() => {
    if (!enabled) return;
    let raf;
    const el = ref.current;
    const onMove = (e) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (el) el.classList.add("active");
    };
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.12;
      pos.current.y += (target.current.y - pos.current.y) * 0.12;
      if (el) el.style.transform = `translate(calc(${pos.current.x}px - 50%), calc(${pos.current.y}px - 50%))`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove);
    tick();
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      if (el) el.classList.remove("active");
    };
  }, [enabled]);
  if (!enabled) return null;
  return <div ref={ref} className="cursor-blob" />;
}

// Arrow icon
const Arrow = ({ size = 14 }) => (
  <svg className="arrow" width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10m0 0L8.5 3.5M13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Brand
function Brand() {
  return (
    <div className="brand">
      <img src="assets/logo.png" alt="TCCFlow" />
      <span>TCCFlow<span className="dot"/></span>
    </div>
  );
}

// Nav
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="container nav-inner">
        <Brand />
        <div className="nav-links">
          <a href="#como">Como funciona</a>
          <a href="#recursos">Recursos</a>
          <a href="#demo">Demo</a>
          <a href="#precos">Preços</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-cta">
          <a href="/pages/login.html" className="btn btn-ghost">Entrar</a>
          <a href="/pages/signup.html" className="btn btn-primary">
            Começar grátis <Arrow/>
          </a>
        </div>
      </div>
    </nav>
  );
}

Object.assign(window, { Reveal, CursorBlob, Arrow, Brand, Nav });
