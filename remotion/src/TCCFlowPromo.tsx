import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

// ─── Colors & Constants ───
const VIOLET = "#7c3aed";
const CYAN = "#06b6d4";
const EMERALD = "#10b981";
const DARK_BG = "#0f172a";
const LIGHT_TEXT = "#f1f5f9";
const FONT = "Plus Jakarta Sans, Inter, sans-serif";

// ─── Helper: Gradient Text ───
const GradientText: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <span
    style={{
      background: `linear-gradient(135deg, ${VIOLET}, ${CYAN})`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      ...style,
    }}
  >
    {children}
  </span>
);

// ─── Scene 1: Logo Intro (0s–6s, frames 0–179) ───
const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, mass: 0.8 } });
  const subtitleOpacity = interpolate(frame, [40, 70], [0, 1], {
    extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(frame, [40, 70], [30, 0], {
    extrapolateRight: "clamp",
  });

  // Animated gradient ring
  const ringRotation = frame * 2;
  const ringScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15 },
  });

  // Particles
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2 + frame * 0.02;
    const radius = 280 + Math.sin(frame * 0.05 + i) * 40;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const opacity = interpolate(frame, [20, 50], [0, 0.6], {
      extrapolateRight: "clamp",
    });
    return { x, y, opacity, size: 6 + (i % 3) * 4 };
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, #1e1b4b 0%, ${DARK_BG} 70%)`,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
      }}
    >
      {/* Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `calc(50% + ${p.x}px)`,
            top: `calc(50% + ${p.y}px)`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: i % 2 === 0 ? VIOLET : CYAN,
            opacity: p.opacity,
            filter: "blur(1px)",
          }}
        />
      ))}

      {/* Gradient Ring */}
      <div
        style={{
          position: "absolute",
          width: 340,
          height: 340,
          borderRadius: "50%",
          border: `4px solid transparent`,
          background: `conic-gradient(from ${ringRotation}deg, ${VIOLET}, ${CYAN}, ${VIOLET}) border-box`,
          WebkitMask:
            "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          transform: `scale(${ringScale})`,
          opacity: 0.7,
        }}
      />

      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          textAlign: "center",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            color: LIGHT_TEXT,
            letterSpacing: -2,
          }}
        >
          TCC<GradientText>Flow</GradientText>
        </div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          bottom: 600,
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          textAlign: "center",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontSize: 42,
            color: "#94a3b8",
            fontWeight: 500,
          }}
        >
          Planeje seu TCC do inicio ao fim
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: Problem (6s–12s, frames 180–359) ───
const SceneProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleScale = spring({ frame, fps, config: { damping: 10 } });

  const problems = [
    { icon: "📄", text: "Google Docs pra ca..." },
    { icon: "📊", text: "Trello pra la..." },
    { icon: "📱", text: "WhatsApp lotado..." },
    { icon: "😰", text: "Prazo apertando..." },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${DARK_BG} 0%, #1a0a2e 100%)`,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 280,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: LIGHT_TEXT,
            lineHeight: 1.2,
          }}
        >
          Seu TCC ta{"\n"}
          <span style={{ color: "#f87171" }}>uma bagunca?</span>
        </div>
      </div>

      {/* Problem Cards */}
      <div
        style={{
          position: "absolute",
          top: 580,
          display: "flex",
          flexDirection: "column",
          gap: 28,
          width: 800,
        }}
      >
        {problems.map((p, i) => {
          const delay = 30 + i * 20;
          const cardOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
            extrapolateRight: "clamp",
          });
          const cardX = interpolate(
            frame,
            [delay, delay + 15],
            [i % 2 === 0 ? -100 : 100, 0],
            { extrapolateRight: "clamp" }
          );

          return (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(10px)",
                borderRadius: 24,
                padding: "28px 36px",
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity: cardOpacity,
                transform: `translateX(${cardX}px)`,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span style={{ fontSize: 48 }}>{p.icon}</span>
              <span
                style={{ fontSize: 36, color: "#cbd5e1", fontWeight: 500 }}
              >
                {p.text}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Solution / Features (12s–21s, frames 360–629) ───
const SceneSolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const features = [
    { icon: "📋", label: "Tarefas & Kanban", color: VIOLET },
    { icon: "🤖", label: "IA Academica", color: CYAN },
    { icon: "📅", label: "Calendario", color: EMERALD },
    { icon: "👥", label: "Equipe ate 8", color: "#f59e0b" },
    { icon: "📎", label: "Google Docs", color: "#3b82f6" },
    { icon: "📝", label: "Templates TCC", color: "#ec4899" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #1a0a2e 0%, ${DARK_BG} 100%)`,
        fontFamily: FONT,
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 200,
          width: "100%",
          textAlign: "center",
          opacity: titleOpacity,
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 800, color: LIGHT_TEXT }}>
          Tudo em <GradientText>um so lugar</GradientText>
        </div>
      </div>

      {/* Feature Grid */}
      <div
        style={{
          position: "absolute",
          top: 420,
          left: 80,
          right: 80,
          display: "flex",
          flexWrap: "wrap",
          gap: 30,
          justifyContent: "center",
        }}
      >
        {features.map((f, i) => {
          const delay = 20 + i * 18;
          const s = spring({
            frame: frame - delay,
            fps,
            config: { damping: 12, mass: 0.6 },
          });
          const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                width: 420,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${f.color}33`,
                borderRadius: 28,
                padding: "36px 28px",
                textAlign: "center",
                transform: `scale(${s})`,
                opacity,
              }}
            >
              <div style={{ fontSize: 56, marginBottom: 12 }}>{f.icon}</div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: LIGHT_TEXT,
                }}
              >
                {f.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Animated accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: "50%",
          transform: "translateX(-50%)",
          width: interpolate(frame, [140, 200], [0, 600], {
            extrapolateRight: "clamp",
          }),
          height: 4,
          background: `linear-gradient(90deg, ${VIOLET}, ${CYAN})`,
          borderRadius: 4,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Scene 4: Pricing (21s–26s, frames 630–779) ───
const ScenePricing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const priceScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 10, mass: 0.8 },
  });
  const compareOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateRight: "clamp",
  });
  const strikeWidth = interpolate(frame, [80, 100], [0, 100], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, #1e1b4b 0%, ${DARK_BG} 70%)`,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${VIOLET}30 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />

      {/* Price Card */}
      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          border: `2px solid ${VIOLET}55`,
          borderRadius: 40,
          padding: "60px 80px",
          textAlign: "center",
          transform: `scale(${priceScale})`,
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontSize: 36,
            color: "#94a3b8",
            fontWeight: 500,
            marginBottom: 16,
          }}
        >
          Plano Pro
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8 }}>
          <span style={{ fontSize: 48, color: "#94a3b8", fontWeight: 600 }}>
            R$
          </span>
          <GradientText style={{ fontSize: 120, fontWeight: 800 }}>
            97
          </GradientText>
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#64748b",
            fontWeight: 500,
            marginTop: -8,
          }}
        >
          /ano
        </div>
      </div>

      {/* Comparison */}
      <div
        style={{
          position: "absolute",
          bottom: 380,
          textAlign: "center",
          opacity: compareOpacity,
        }}
      >
        <div style={{ fontSize: 30, color: "#64748b", marginBottom: 12 }}>
          Ferramentas separadas custariam
        </div>
        <div style={{ position: "relative", display: "inline-block" }}>
          <span style={{ fontSize: 52, color: "#f87171", fontWeight: 700 }}>
            R$ 1.800/ano
          </span>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: `${strikeWidth}%`,
              height: 4,
              background: "#f87171",
              transform: "translateY(-50%)",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5: CTA (26s–30s, frames 780–899) ───
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12 } });
  const buttonScale = spring({
    frame: frame - 25,
    fps,
    config: { damping: 10 },
  });
  const urlOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Pulse effect on button
  const pulse = Math.sin(frame * 0.15) * 0.03 + 1;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, #1e1b4b 0%, ${DARK_BG} 70%)`,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
      }}
    >
      {/* Glow bursts */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${CYAN}15 0%, transparent 60%)`,
          filter: "blur(80px)",
          transform: `scale(${1 + Math.sin(frame * 0.05) * 0.1})`,
        }}
      />

      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          marginBottom: 60,
          fontSize: 90,
          fontWeight: 800,
          color: LIGHT_TEXT,
          letterSpacing: -2,
        }}
      >
        TCC<GradientText>Flow</GradientText>
      </div>

      {/* CTA Button */}
      <div
        style={{
          transform: `scale(${buttonScale * pulse})`,
          background: `linear-gradient(135deg, ${VIOLET}, ${CYAN})`,
          borderRadius: 30,
          padding: "32px 80px",
          marginBottom: 50,
        }}
      >
        <span
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: "white",
          }}
        >
          Comece agora - e gratis!
        </span>
      </div>

      {/* URL */}
      <div
        style={{
          opacity: urlOpacity,
          fontSize: 48,
          fontWeight: 600,
          letterSpacing: 2,
        }}
      >
        <GradientText>tccflow.com</GradientText>
      </div>
    </AbsoluteFill>
  );
};

// ─── Main Composition ───
export const TCCFlowPromo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Scene 1: Intro (0s–6s) */}
      <Sequence from={0} durationInFrames={180}>
        <SceneIntro />
      </Sequence>

      {/* Scene 2: Problem (6s–12s) */}
      <Sequence from={180} durationInFrames={180}>
        <SceneProblem />
      </Sequence>

      {/* Scene 3: Solution (12s–21s) */}
      <Sequence from={360} durationInFrames={270}>
        <SceneSolution />
      </Sequence>

      {/* Scene 4: Pricing (21s–26s) */}
      <Sequence from={630} durationInFrames={150}>
        <ScenePricing />
      </Sequence>

      {/* Scene 5: CTA (26s–30s) */}
      <Sequence from={780} durationInFrames={120}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
