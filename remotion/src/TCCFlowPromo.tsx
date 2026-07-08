import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// ─── Brand ───
const VIOLET = "#7c3aed";
const CYAN = "#06b6d4";
const EMERALD = "#10b981";
const DARK = "#0f172a";
const WHITE = "#f8fafc";
const FONT = "'Plus Jakarta Sans', 'Inter', sans-serif";

// ─── Kinetic Text: words appear one-by-one like TikTok captions ───
const KineticText: React.FC<{
  text: string;
  startFrame?: number;
  fontSize?: number;
  color?: string;
  highlight?: string;
  highlightWords?: string[];
  bold?: boolean;
  align?: "center" | "left";
}> = ({
  text,
  startFrame = 0,
  fontSize = 68,
  color = WHITE,
  highlight = CYAN,
  highlightWords = [],
  bold = true,
  align = "center",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        gap: "8px 14px",
        lineHeight: 1.3,
      }}
    >
      {words.map((word, i) => {
        const wordDelay = startFrame + i * 4;
        const s = spring({
          frame: frame - wordDelay,
          fps,
          config: { damping: 8, mass: 0.4, stiffness: 200 },
        });
        const opacity = interpolate(frame, [wordDelay, wordDelay + 3], [0, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
        });
        const isHighlight = highlightWords.some(
          (hw) => word.toLowerCase().replace(/[!?,.]/, "") === hw.toLowerCase()
        );

        return (
          <span
            key={i}
            style={{
              fontSize,
              fontWeight: bold ? 800 : 600,
              color: isHighlight ? highlight : color,
              transform: `scale(${s}) translateY(${(1 - s) * 20}px)`,
              opacity,
              display: "inline-block",
              textShadow: isHighlight
                ? `0 0 30px ${highlight}66`
                : "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// ─── Mockup: Dashboard UI ───
const MockupDashboard: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const scale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 12 },
  });

  const stats = [
    { label: "Tarefas", value: "12", color: VIOLET },
    { label: "Membros", value: "4", color: CYAN },
    { label: "Progresso", value: "67%", color: EMERALD },
  ];

  return (
    <div
      style={{
        width: 900,
        background: "#1e293b",
        borderRadius: 32,
        padding: 40,
        transform: `scale(${scale}) rotate(-2deg)`,
        boxShadow: `0 40px 80px rgba(0,0,0,0.5), 0 0 60px ${VIOLET}22`,
        border: `1px solid rgba(255,255,255,0.08)`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${VIOLET}, ${CYAN})`,
          }}
        />
        <div>
          <div
            style={{ fontSize: 22, fontWeight: 700, color: WHITE }}
          >
            Meu TCC
          </div>
          <div style={{ fontSize: 14, color: "#94a3b8" }}>
            Engenharia de Software
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => {
          const cardSpring = spring({
            frame: frame - 15 - i * 8,
            fps,
            config: { damping: 10 },
          });
          return (
            <div
              key={i}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 18,
                padding: "18px 16px",
                textAlign: "center",
                transform: `scale(${cardSpring})`,
                border: `1px solid ${s.color}33`,
              }}
            >
              <div
                style={{ fontSize: 32, fontWeight: 800, color: s.color }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 12,
          borderRadius: 8,
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${interpolate(frame, [20, 60], [0, 67], { extrapolateRight: "clamp" })}%`,
            background: `linear-gradient(90deg, ${VIOLET}, ${CYAN})`,
            borderRadius: 8,
          }}
        />
      </div>
    </div>
  );
};

// ─── Mockup: Kanban Board ───
const MockupKanban: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const scale = spring({ frame: frame - 5, fps, config: { damping: 12 } });

  const columns = [
    {
      title: "A Fazer",
      color: "#f59e0b",
      tasks: ["Revisao bibliografica", "Metodologia"],
    },
    {
      title: "Em Andamento",
      color: CYAN,
      tasks: ["Introducao", "Coleta de dados"],
    },
    { title: "Concluido", color: EMERALD, tasks: ["Tema definido", "Orientador"] },
  ];

  return (
    <div
      style={{
        width: 920,
        display: "flex",
        gap: 16,
        transform: `scale(${scale}) rotate(1deg)`,
      }}
    >
      {columns.map((col, ci) => {
        const colSpring = spring({
          frame: frame - 10 - ci * 10,
          fps,
          config: { damping: 12 },
        });
        return (
          <div
            key={ci}
            style={{
              flex: 1,
              background: "#1e293b",
              borderRadius: 24,
              padding: 20,
              transform: `scale(${colSpring})`,
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              border: `1px solid rgba(255,255,255,0.06)`,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: col.color,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: col.color,
                }}
              />
              {col.title}
            </div>
            {col.tasks.map((task, ti) => {
              const taskSpring = spring({
                frame: frame - 20 - ci * 10 - ti * 6,
                fps,
                config: { damping: 10 },
              });
              return (
                <div
                  key={ti}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 14,
                    padding: "14px 16px",
                    marginBottom: 10,
                    fontSize: 15,
                    color: "#e2e8f0",
                    fontWeight: 500,
                    transform: `scale(${taskSpring})`,
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {task}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// ─── Mockup: AI Search ───
const MockupAI: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const scale = spring({ frame: frame - 5, fps, config: { damping: 12 } });

  const typedLength = Math.floor(
    interpolate(frame, [15, 55], [0, 28], { extrapolateRight: "clamp" })
  );
  const searchText = "inteligencia artificial saude".slice(0, typedLength);

  const results = [
    { title: "IA aplicada ao diagnostico medico", source: "Google Academico" },
    { title: "Machine Learning em dados clinicos", source: "SciELO" },
  ];

  return (
    <div
      style={{
        width: 900,
        background: "#1e293b",
        borderRadius: 32,
        padding: 36,
        transform: `scale(${scale}) rotate(-1deg)`,
        boxShadow: `0 40px 80px rgba(0,0,0,0.5), 0 0 40px ${CYAN}15`,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Search Bar */}
      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          borderRadius: 18,
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 24,
          border: `1px solid ${CYAN}44`,
        }}
      >
        <span style={{ fontSize: 24 }}>🔍</span>
        <span style={{ fontSize: 22, color: "#e2e8f0", fontWeight: 500 }}>
          {searchText}
          <span
            style={{
              opacity: frame % 20 < 10 ? 1 : 0,
              color: CYAN,
            }}
          >
            |
          </span>
        </span>
      </div>

      {/* AI Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${VIOLET}, ${CYAN})`,
            borderRadius: 10,
            padding: "6px 14px",
            fontSize: 14,
            fontWeight: 700,
            color: "white",
          }}
        >
          IA
        </div>
        <span style={{ fontSize: 15, color: "#94a3b8" }}>
          Buscando artigos academicos...
        </span>
      </div>

      {/* Results */}
      {results.map((r, i) => {
        const rOpacity = interpolate(
          frame,
          [55 + i * 15, 65 + i * 15],
          [0, 1],
          { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
        );
        return (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: 16,
              padding: "16px 20px",
              marginBottom: 12,
              opacity: rOpacity,
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{ fontSize: 18, fontWeight: 600, color: WHITE }}
            >
              {r.title}
            </div>
            <div style={{ fontSize: 13, color: CYAN, marginTop: 4 }}>
              {r.source}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Flash Transition ───
const FlashTransition: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 3, 6], [0, 0.9, 0], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background: "white",
        opacity,
        zIndex: 100,
      }}
    />
  );
};

// ═══════════════════════════════════════
// SCENE 1: Hook (0s–3s) - "POV: seu TCC..."
// ═══════════════════════════════════════
const Scene1_Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const shake = Math.sin(frame * 0.8) * (frame < 60 ? 3 : 0);
  const zoom = interpolate(frame, [0, 90], [1, 1.08], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: DARK,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
        transform: `scale(${zoom}) translateX(${shake}px)`,
      }}
    >
      {/* Pulsing red glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, #ef444430 0%, transparent 70%)`,
          filter: "blur(40px)",
          transform: `scale(${1 + Math.sin(frame * 0.1) * 0.15})`,
        }}
      />

      <div style={{ padding: "0 80px", zIndex: 2 }}>
        <KineticText
          text="POV: faltam 2 semanas pro TCC e voce nao tem NADA organizado"
          fontSize={62}
          highlightWords={["NADA"]}
          highlight="#ef4444"
          startFrame={5}
        />
      </div>

      {/* Emoji rain */}
      {[
        { e: "😱", x: 150, delay: 30 },
        { e: "📄", x: 400, delay: 40 },
        { e: "😰", x: 700, delay: 50 },
        { e: "📊", x: 900, delay: 35 },
      ].map((item, i) => {
        const y = interpolate(
          frame,
          [item.delay, item.delay + 40],
          [-100, 2100],
          { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
        );
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: item.x,
              top: y,
              fontSize: 60,
              transform: `rotate(${frame * 3 + i * 90}deg)`,
              opacity: 0.7,
            }}
          >
            {item.e}
          </span>
        );
      })}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════
// SCENE 2: Problem List (3s–6s)
// ═══════════════════════════════════════
const Scene2_Problems: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const items = [
    { text: "Google Docs", icon: "📄" },
    { text: "Trello", icon: "📋" },
    { text: "WhatsApp", icon: "📱" },
    { text: "E-mail", icon: "📧" },
    { text: "Planilha", icon: "📊" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #1a0a2e, ${DARK})`,
        fontFamily: FONT,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ marginBottom: 60, padding: "0 60px" }}>
        <KineticText
          text="Voce usando 5 apps diferentes:"
          fontSize={52}
          color="#94a3b8"
          startFrame={0}
          highlightWords={["5"]}
          highlight="#f87171"
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, width: 800 }}>
        {items.map((item, i) => {
          const delay = 15 + i * 8;
          const slideX = interpolate(
            frame,
            [delay, delay + 8],
            [i % 2 === 0 ? -500 : 500, 0],
            { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
          );
          const opacity = interpolate(frame, [delay, delay + 6], [0, 1], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          });

          // X mark appears after all cards
          const xDelay = delay + 20;
          const xOpacity = interpolate(frame, [xDelay, xDelay + 5], [0, 1], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          });
          const xScale = spring({
            frame: frame - xDelay,
            fps,
            config: { damping: 8, mass: 0.3 },
          });

          return (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: 20,
                padding: "20px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                opacity,
                transform: `translateX(${slideX}px)`,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 36 }}>{item.icon}</span>
                <span style={{ fontSize: 30, color: "#e2e8f0", fontWeight: 600 }}>
                  {item.text}
                </span>
              </div>
              <span
                style={{
                  fontSize: 36,
                  color: "#ef4444",
                  fontWeight: 800,
                  opacity: xOpacity,
                  transform: `scale(${xScale})`,
                  display: "inline-block",
                }}
              >
                ✕
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════
// SCENE 3: Intro TCCFlow (6s–9s)
// ═══════════════════════════════════════
const Scene3_Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 8, mass: 0.5, stiffness: 180 },
  });

  // Ring rotation
  const ringRot = frame * 3;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, #2e1065 0%, ${DARK} 70%)`,
        fontFamily: FONT,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${VIOLET}40 0%, transparent 60%)`,
          filter: "blur(60px)",
        }}
      />

      {/* Spinning ring */}
      <div
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          border: "3px solid transparent",
          background: `conic-gradient(from ${ringRot}deg, ${VIOLET}, ${CYAN}, transparent 60%) border-box`,
          WebkitMask:
            "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          opacity: 0.6,
          transform: `scale(${logoScale})`,
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
          style={{ fontSize: 120, fontWeight: 800, color: WHITE, letterSpacing: -3 }}
        >
          TCC
          <span
            style={{
              background: `linear-gradient(135deg, ${VIOLET}, ${CYAN})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Flow
          </span>
        </div>
      </div>

      {/* Tagline below */}
      <div style={{ position: "absolute", bottom: 580, padding: "0 80px" }}>
        <KineticText
          text="Tudo que voce precisa em UM lugar"
          fontSize={48}
          startFrame={25}
          highlightWords={["UM"]}
          highlight={CYAN}
        />
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════
// SCENE 4: Dashboard Demo (9s–13s)
// ═══════════════════════════════════════
const Scene4_Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #0c0a1d, ${DARK})`,
        fontFamily: FONT,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ position: "absolute", top: 180, padding: "0 60px" }}>
        <KineticText
          text="Dashboard completo"
          fontSize={56}
          startFrame={0}
          highlightWords={["completo"]}
          highlight={VIOLET}
        />
      </div>

      <div style={{ marginTop: 80 }}>
        <MockupDashboard frame={frame} fps={fps} />
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════
// SCENE 5: Kanban Demo (13s–17s)
// ═══════════════════════════════════════
const Scene5_Kanban: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${DARK}, #0c0a1d)`,
        fontFamily: FONT,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ position: "absolute", top: 180, padding: "0 60px" }}>
        <KineticText
          text="Organize tarefas no Kanban"
          fontSize={52}
          startFrame={0}
          highlightWords={["Kanban"]}
          highlight={CYAN}
        />
      </div>

      <div style={{ marginTop: 100 }}>
        <MockupKanban frame={frame} fps={fps} />
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════
// SCENE 6: AI Demo (17s–21s)
// ═══════════════════════════════════════
const Scene6_AI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #0c0a1d, ${DARK})`,
        fontFamily: FONT,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ position: "absolute", top: 180, padding: "0 60px" }}>
        <KineticText
          text="IA busca artigos pra voce"
          fontSize={52}
          startFrame={0}
          highlightWords={["IA"]}
          highlight={CYAN}
        />
      </div>

      <div style={{ marginTop: 100 }}>
        <MockupAI frame={frame} fps={fps} />
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════
// SCENE 7: Feature Rapid Fire (21s–25s)
// ═══════════════════════════════════════
const Scene7_Features: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const features = [
    { icon: "📅", text: "Calendario", frames: [0, 20] },
    { icon: "👥", text: "Equipe ate 8", frames: [20, 40] },
    { icon: "📎", text: "Google Docs integrado", frames: [40, 60] },
    { icon: "📝", text: "Templates prontos", frames: [60, 80] },
    { icon: "🔍", text: "Detector de plagio", frames: [80, 100] },
    { icon: "📊", text: "Grafico Gantt", frames: [100, 120] },
  ];

  return (
    <AbsoluteFill
      style={{
        background: DARK,
        fontFamily: FONT,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ position: "absolute", top: 200, padding: "0 60px" }}>
        <KineticText
          text="E tem muito mais:"
          fontSize={48}
          color="#94a3b8"
          startFrame={0}
        />
      </div>

      {features.map((f, i) => {
        const [start, end] = f.frames;
        const isVisible = frame >= start && frame < end + 10;
        const localFrame = frame - start;
        const s = spring({
          frame: localFrame,
          fps,
          config: { damping: 8, mass: 0.3, stiffness: 200 },
        });
        const exitOpacity =
          frame >= end
            ? interpolate(frame, [end, end + 10], [1, 0], {
                extrapolateRight: "clamp",
              })
            : 1;

        if (!isVisible) return null;

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              transform: `scale(${s})`,
              opacity: exitOpacity,
            }}
          >
            <span style={{ fontSize: 80 }}>{f.icon}</span>
            <span
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: WHITE,
                textShadow: `0 0 30px ${VIOLET}44`,
              }}
            >
              {f.text}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════
// SCENE 8: Price (25s–28s)
// ═══════════════════════════════════════
const Scene8_Price: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardScale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 10, mass: 0.6 },
  });

  const oldPriceStrike = interpolate(frame, [45, 60], [0, 100], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 50%, #2e1065 0%, ${DARK} 70%)`,
        fontFamily: FONT,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ padding: "0 60px", marginBottom: 60 }}>
        <KineticText
          text="E o melhor? Cabe no bolso!"
          fontSize={52}
          startFrame={0}
          highlightWords={["bolso!"]}
          highlight={EMERALD}
        />
      </div>

      {/* Price Card */}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          border: `2px solid ${VIOLET}55`,
          borderRadius: 40,
          padding: "50px 80px",
          textAlign: "center",
          transform: `scale(${cardScale})`,
          boxShadow: `0 0 80px ${VIOLET}20`,
        }}
      >
        <div style={{ fontSize: 28, color: "#94a3b8", marginBottom: 8 }}>
          Plano Pro
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 40, color: "#94a3b8", fontWeight: 600 }}>
            R$
          </span>
          <span
            style={{
              fontSize: 110,
              fontWeight: 800,
              background: `linear-gradient(135deg, ${VIOLET}, ${CYAN})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            97
          </span>
        </div>
        <div style={{ fontSize: 28, color: "#64748b" }}>/ano</div>
      </div>

      {/* Old price comparison */}
      <div
        style={{
          marginTop: 50,
          textAlign: "center",
          opacity: interpolate(frame, [35, 45], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div style={{ fontSize: 24, color: "#64748b", marginBottom: 8 }}>
          Apps separados custariam
        </div>
        <div style={{ position: "relative", display: "inline-block" }}>
          <span style={{ fontSize: 44, color: "#ef4444", fontWeight: 700 }}>
            R$ 1.800/ano
          </span>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: `${oldPriceStrike}%`,
              height: 4,
              background: "#ef4444",
              transform: "translateY(-50%)",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════
// SCENE 9: CTA Final (28s–30s)
// ═══════════════════════════════════════
const Scene9_CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: { damping: 10, mass: 0.5 },
  });
  const btnScale = spring({
    frame: frame - 15,
    fps,
    config: { damping: 8 },
  });
  const pulse = 1 + Math.sin(frame * 0.2) * 0.03;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, #2e1065 0%, ${DARK} 70%)`,
        fontFamily: FONT,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Big glow */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${CYAN}20 0%, transparent 60%)`,
          filter: "blur(80px)",
        }}
      />

      {/* Logo */}
      <div
        style={{
          fontSize: 100,
          fontWeight: 800,
          color: WHITE,
          letterSpacing: -3,
          transform: `scale(${logoScale})`,
          marginBottom: 50,
          zIndex: 2,
        }}
      >
        TCC
        <span
          style={{
            background: `linear-gradient(135deg, ${VIOLET}, ${CYAN})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Flow
        </span>
      </div>

      {/* CTA Button */}
      <div
        style={{
          background: `linear-gradient(135deg, ${VIOLET}, ${CYAN})`,
          borderRadius: 28,
          padding: "28px 70px",
          transform: `scale(${btnScale * pulse})`,
          marginBottom: 40,
          zIndex: 2,
          boxShadow: `0 20px 60px ${VIOLET}44`,
        }}
      >
        <span style={{ fontSize: 40, fontWeight: 700, color: "white" }}>
          Comece gratis agora!
        </span>
      </div>

      {/* URL */}
      <div
        style={{
          opacity: interpolate(frame, [25, 40], [0, 1], {
            extrapolateRight: "clamp",
          }),
          fontSize: 44,
          fontWeight: 700,
          letterSpacing: 3,
          zIndex: 2,
          background: `linear-gradient(135deg, ${VIOLET}, ${CYAN})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        tccflow.com
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════
// MAIN COMPOSITION
// ═══════════════════════════════════════
export const TCCFlowPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      {/* Scene 1: Hook (0–3s) */}
      <Sequence from={0} durationInFrames={90}>
        <Scene1_Hook />
      </Sequence>

      {/* Flash */}
      <Sequence from={88} durationInFrames={8}>
        <FlashTransition frame={0} />
      </Sequence>

      {/* Scene 2: Problems (3–6s) */}
      <Sequence from={90} durationInFrames={90}>
        <Scene2_Problems />
      </Sequence>

      {/* Flash */}
      <Sequence from={178} durationInFrames={8}>
        <FlashTransition frame={0} />
      </Sequence>

      {/* Scene 3: TCCFlow Intro (6–9s) */}
      <Sequence from={180} durationInFrames={90}>
        <Scene3_Intro />
      </Sequence>

      {/* Flash */}
      <Sequence from={268} durationInFrames={8}>
        <FlashTransition frame={0} />
      </Sequence>

      {/* Scene 4: Dashboard (9–13s) */}
      <Sequence from={270} durationInFrames={120}>
        <Scene4_Dashboard />
      </Sequence>

      {/* Flash */}
      <Sequence from={388} durationInFrames={8}>
        <FlashTransition frame={0} />
      </Sequence>

      {/* Scene 5: Kanban (13–17s) */}
      <Sequence from={390} durationInFrames={120}>
        <Scene5_Kanban />
      </Sequence>

      {/* Flash */}
      <Sequence from={508} durationInFrames={8}>
        <FlashTransition frame={0} />
      </Sequence>

      {/* Scene 6: AI (17–21s) */}
      <Sequence from={510} durationInFrames={120}>
        <Scene6_AI />
      </Sequence>

      {/* Flash */}
      <Sequence from={628} durationInFrames={8}>
        <FlashTransition frame={0} />
      </Sequence>

      {/* Scene 7: Feature Rapid Fire (21–25s) */}
      <Sequence from={630} durationInFrames={120}>
        <Scene7_Features />
      </Sequence>

      {/* Flash */}
      <Sequence from={748} durationInFrames={8}>
        <FlashTransition frame={0} />
      </Sequence>

      {/* Scene 8: Price (25–28s) */}
      <Sequence from={750} durationInFrames={90}>
        <Scene8_Price />
      </Sequence>

      {/* Flash */}
      <Sequence from={838} durationInFrames={8}>
        <FlashTransition frame={0} />
      </Sequence>

      {/* Scene 9: CTA (28–30s) */}
      <Sequence from={840} durationInFrames={60}>
        <Scene9_CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
