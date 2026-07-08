import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Sequence,
} from 'remotion';

const VIOLET = '#7c3aed';
const CYAN = '#06b6d4';
const EMERALD = '#10b981';
const ROSE = '#f43f5e';
const AMBER = '#f59e0b';

// ─── helpers ────────────────────────────────────────────────────────────────

function spr(frame, delay = 0, config = {}) {
  return spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 14, stiffness: 120, mass: 1, ...config },
  });
}

function fadeIn(frame, start, end) {
  return interpolate(frame, [start, end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
}

function slideUp(frame, delay = 0, px = 40) {
  const s = spr(frame, delay);
  return { opacity: s, transform: `translateY(${(1 - s) * px}px)` };
}

function scaleIn(frame, delay = 0) {
  const s = spr(frame, delay);
  return { opacity: s, transform: `scale(${0.7 + s * 0.3})` };
}

// ─── Logo mark ───────────────────────────────────────────────────────────────

function LogoMark({ size = 80, frame = 0 }) {
  const s = spr(frame, 0, { damping: 12, stiffness: 100 });
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: `linear-gradient(135deg, ${VIOLET}, ${CYAN})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 ${size * 0.15}px ${size * 0.5}px rgba(124,58,237,0.45)`,
      transform: `scale(${s})`, opacity: s,
    }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 40 40" fill="none">
        <rect x="4" y="4" width="14" height="14" rx="3" fill="white" opacity="0.9"/>
        <rect x="22" y="4" width="14" height="14" rx="3" fill="white" opacity="0.5"/>
        <rect x="4" y="22" width="14" height="14" rx="3" fill="white" opacity="0.5"/>
        <rect x="22" y="22" width="14" height="14" rx="3" fill="white" opacity="0.9"/>
      </svg>
    </div>
  );
}

// ─── SCENE 1 — Intro (0–2s, frames 0–60) ────────────────────────────────────

function Scene1() {
  const frame = useCurrentFrame();
  const wordStyle = (delay) => slideUp(frame, delay, 50);

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, #0f0620 0%, #1a0840 50%, #0a1628 100%)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 28,
    }}>
      {/* Glow blobs */}
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)`,
        top: '20%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}/>

      <LogoMark size={96} frame={frame} />

      <div style={{ textAlign: 'center', ...wordStyle(8) }}>
        <div style={{ fontSize: 64, fontWeight: 800, color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: -2, lineHeight: 1 }}>
          TCC<span style={{ background: `linear-gradient(135deg, ${VIOLET}, ${CYAN})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Flow</span>
        </div>
        <div style={{ ...slideUp(frame, 16, 30), fontSize: 22, color: 'rgba(255,255,255,0.6)',
          marginTop: 10, fontFamily: 'system-ui, sans-serif', letterSpacing: 3,
          textTransform: 'uppercase', fontWeight: 300 }}>
          Organize seu TCC
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── SCENE 2 — Problema (2–6s, frames 60–180) ────────────────────────────────

function Scene2() {
  const frame = useCurrentFrame();

  const lines = [
    { text: 'Prazo chegando.', delay: 0, color: 'white' },
    { text: 'Material espalhado.', delay: 12, color: 'rgba(255,255,255,0.8)' },
    { text: 'Orientador cobrando.', delay: 24, color: 'rgba(255,255,255,0.6)' },
  ];

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, #0f0620 0%, #1a0840 60%, #0a1628 100%)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '0 60px', gap: 0,
    }}>
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(244,63,94,0.15) 0%, transparent 70%)`,
        top: '30%', left: '50%', transform: 'translateX(-50%)' }}/>

      <div style={{ ...slideUp(frame, 0, 30), fontSize: 22, color: ROSE,
        fontFamily: 'system-ui, sans-serif', fontWeight: 700, letterSpacing: 4,
        textTransform: 'uppercase', marginBottom: 40 }}>
        Você conhece essa situação?
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
        {lines.map((l, i) => {
          const s = spr(frame, l.delay + 6);
          return (
            <div key={i} style={{
              opacity: s,
              transform: `translateX(${(1 - s) * -60}px)`,
              fontSize: 44, fontWeight: 800, color: l.color,
              fontFamily: 'system-ui, sans-serif', letterSpacing: -1,
              lineHeight: 1.1,
            }}>
              {l.text}
            </div>
          );
        })}
      </div>

      <div style={{ ...slideUp(frame, 42, 30), marginTop: 56, fontSize: 28,
        color: AMBER, fontWeight: 700, fontFamily: 'system-ui, sans-serif',
        textAlign: 'center', lineHeight: 1.3 }}>
        Existe uma solução. ↓
      </div>
    </AbsoluteFill>
  );
}

// ─── SCENE 3 — Features (6–14s, frames 180–420) ──────────────────────────────

function FeatureCard({ icon, title, desc, delay, frame }) {
  const s = spr(frame, delay, { damping: 16, stiffness: 100 });
  return (
    <div style={{
      opacity: s,
      transform: `translateY(${(1 - s) * 60}px) scale(${0.85 + s * 0.15})`,
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 20, padding: '28px 24px',
      display: 'flex', alignItems: 'flex-start', gap: 18,
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ fontSize: 40, flexShrink: 0, lineHeight: 1 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'white',
          fontFamily: 'system-ui, sans-serif', marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)',
          fontFamily: 'system-ui, sans-serif', lineHeight: 1.4 }}>{desc}</div>
      </div>
    </div>
  );
}

function Scene3() {
  const frame = useCurrentFrame();

  const features = [
    { icon: '📋', title: 'Dashboard', desc: 'Tudo do seu TCC em um só lugar', delay: 0, color: VIOLET },
    { icon: '🤖', title: 'TCCFlow AI', desc: 'IA que analisa e revisa seu trabalho', delay: 14, color: CYAN },
    { icon: '📅', title: 'Calendário', desc: 'Planejamento inteligente de prazos', delay: 28, color: EMERALD },
    { icon: '👩‍🏫', title: 'Orientador', desc: 'Painel exclusivo para seu orientador', delay: 42, color: AMBER },
  ];

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, #0f0620 0%, #1a0840 60%, #0a1628 100%)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      padding: '80px 48px 0',
    }}>
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)`,
        top: '10%', left: '50%', transform: 'translateX(-50%)' }}/>

      <div style={{ ...slideUp(frame, 0, 30), textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 18, color: CYAN, fontWeight: 700, letterSpacing: 4,
          textTransform: 'uppercase', marginBottom: 12, fontFamily: 'system-ui, sans-serif' }}>
          Tudo que você precisa
        </div>
        <div style={{ fontSize: 52, fontWeight: 800, color: 'white',
          fontFamily: 'system-ui, sans-serif', letterSpacing: -2, lineHeight: 1.05 }}>
          Uma plataforma{'\n'}
          <span style={{ background: `linear-gradient(135deg, ${VIOLET}, ${CYAN})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            completa
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
        {features.map((f, i) => (
          <FeatureCard key={i} {...f} frame={frame} />
        ))}
      </div>
    </AbsoluteFill>
  );
}

// ─── SCENE 4 — CTA (14–20s, frames 420–600) ──────────────────────────────────

function Scene4() {
  const frame = useCurrentFrame();

  const pulse = interpolate(
    frame % 60, [0, 30, 60], [1, 1.04, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const checks = [
    'Acesso gratuito para começar',
    'IA acadêmica integrada',
    'Suporte ao orientador',
    'Funciona no celular e PC',
  ];

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, #0f0620 0%, #1a0840 50%, #0a1628 100%)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 52px', gap: 0,
    }}>
      {/* big glow */}
      <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)`,
        top: '20%', left: '50%', transform: 'translateX(-50%)' }}/>

      <div style={{ ...scaleIn(frame, 0), marginBottom: 32 }}>
        <LogoMark size={80} frame={0} style={{ transform: 'scale(1)' }} />
      </div>

      <div style={{ ...slideUp(frame, 8, 40), textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 58, fontWeight: 800, color: 'white',
          fontFamily: 'system-ui, sans-serif', letterSpacing: -2, lineHeight: 1.05,
          marginBottom: 16 }}>
          Comece agora,{'\n'}é{' '}
          <span style={{ background: `linear-gradient(135deg, ${EMERALD}, ${CYAN})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            gratuito
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', marginBottom: 52 }}>
        {checks.map((c, i) => {
          const s = spr(frame, i * 10 + 14);
          return (
            <div key={i} style={{ opacity: s, transform: `translateX(${(1 - s) * -40}px)`,
              display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%',
                background: `linear-gradient(135deg, ${EMERALD}, ${CYAN})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: 16 }}>
                ✓
              </div>
              <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.85)',
                fontFamily: 'system-ui, sans-serif', fontWeight: 500 }}>{c}</span>
            </div>
          );
        })}
      </div>

      {/* CTA button */}
      <div style={{ ...slideUp(frame, 52, 50) }}>
        <div style={{
          background: `linear-gradient(135deg, ${VIOLET}, ${CYAN})`,
          borderRadius: 999, padding: '22px 56px',
          fontSize: 28, fontWeight: 800, color: 'white',
          fontFamily: 'system-ui, sans-serif', letterSpacing: -0.5,
          transform: `scale(${pulse})`,
          boxShadow: `0 0 60px rgba(124,58,237,0.5)`,
          textAlign: 'center',
        }}>
          tccflow.app
        </div>
        <div style={{ ...slideUp(frame, 58, 20), textAlign: 'center', marginTop: 16,
          fontSize: 18, color: 'rgba(255,255,255,0.45)',
          fontFamily: 'system-ui, sans-serif' }}>
          Acesse pelo link na bio
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Root composition ─────────────────────────────────────────────────────────

export function Announcement() {
  return (
    <>
      {/* Scene 1: Intro (0–2s) */}
      <Sequence from={0} durationInFrames={70}>
        <Scene1 />
      </Sequence>

      {/* Scene 2: Problema (2–6s) */}
      <Sequence from={60} durationInFrames={130}>
        <Scene2 />
      </Sequence>

      {/* Scene 3: Features (6–14s) */}
      <Sequence from={180} durationInFrames={250}>
        <Scene3 />
      </Sequence>

      {/* Scene 4: CTA (14–20s) */}
      <Sequence from={420} durationInFrames={180}>
        <Scene4 />
      </Sequence>
    </>
  );
}
