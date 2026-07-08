// The asas tiger buddy. One face, several moods, each mapped to a moment in the app:
//   wave = greeting · celebrate = milestone/verdict · snooze = empty/done · thinking = mid-quiz.
// Pure SVG, no state — safe to render server- or client-side. `float` adds the idle bob + ear wiggle.
import type { CSSProperties } from "react";

export type Mood = "base" | "wave" | "celebrate" | "snooze" | "thinking";

const S = { stroke: "#16400F", orange: "#F0562E", gold: "#F6A821", cream: "#FCE7C4", nose: "#C13F1C" };

function Base() {
  return (
    <>
      <path className="asas-ear" d="M34 46 Q30 22 48 27 Q57 31 54 44 Z" fill={S.orange} stroke={S.stroke} strokeWidth="5" strokeLinejoin="round" />
      <path className="asas-ear" d="M94 46 Q98 22 80 27 Q71 31 74 44 Z" fill={S.orange} stroke={S.stroke} strokeWidth="5" strokeLinejoin="round" />
      <path d="M41 41 Q40 31 49 34 Z" fill={S.gold} />
      <path d="M87 41 Q88 31 79 34 Z" fill={S.gold} />
      <rect x="24" y="34" width="80" height="72" rx="38" fill={S.orange} stroke={S.stroke} strokeWidth="5" />
      <path d="M45 42 q-4 6 -6 12" stroke={S.stroke} strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M37 47 q-3 5 -4 10" stroke={S.stroke} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M83 42 q4 6 6 12" stroke={S.stroke} strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M91 47 q3 5 4 10" stroke={S.stroke} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M28 68 q8 1 13 4" stroke={S.stroke} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M100 68 q-8 1 -13 4" stroke={S.stroke} strokeWidth="4" strokeLinecap="round" fill="none" />
      <ellipse cx="64" cy="86" rx="25" ry="15" fill={S.cream} />
      <ellipse cx="42" cy="79" rx="7" ry="5" fill="#FBB48F" opacity="0.85" />
      <ellipse cx="86" cy="79" rx="7" ry="5" fill="#FBB48F" opacity="0.85" />
    </>
  );
}

// Open eyes; `up` lifts the pupils for the thinking pose.
function OpenEyes({ up = false }: { up?: boolean }) {
  const pcy = up ? 56 : 61;
  const gcy = up ? 53.5 : 58.5;
  return (
    <>
      <circle cx="49" cy="60" r="10" fill="#fff" stroke={S.stroke} strokeWidth="3" />
      <circle cx="79" cy="60" r="10" fill="#fff" stroke={S.stroke} strokeWidth="3" />
      <circle cx={up ? 51 : 50} cy={pcy} r="5.5" fill={S.stroke} />
      <circle cx={up ? 81 : 80} cy={pcy} r="5.5" fill={S.stroke} />
      <circle cx={up ? 53.5 : 52.5} cy={gcy} r="2.1" fill="#fff" />
      <circle cx={up ? 83.5 : 82.5} cy={gcy} r="2.1" fill="#fff" />
    </>
  );
}

const Nose = () => <ellipse cx="64" cy="78" rx="5.5" ry="4" fill={S.nose} />;

function Mood({ mood }: { mood: Mood }) {
  switch (mood) {
    case "celebrate":
      return (
        <>
          <path d="M110 57 L112 60 L115 62 L112 64 L110 67 L108 64 L105 62 L108 60 Z" fill={S.gold} />
          <path d="M22 24 L25 29 L30 32 L25 35 L22 40 L19 35 L14 32 L19 29 Z" fill={S.gold} />
          <path d="M103 20 L105 24 L109 26 L105 28 L103 32 L101 28 L97 26 L101 24 Z" fill={S.gold} />
          <circle cx="49" cy="59" r="10.5" fill="#fff" stroke={S.stroke} strokeWidth="3" />
          <circle cx="79" cy="59" r="10.5" fill="#fff" stroke={S.stroke} strokeWidth="3" />
          <circle cx="50" cy="60" r="6" fill={S.stroke} /><circle cx="80" cy="60" r="6" fill={S.stroke} />
          <circle cx="52.5" cy="57.5" r="2.3" fill="#fff" /><circle cx="82.5" cy="57.5" r="2.3" fill="#fff" />
          <ellipse cx="64" cy="76" rx="5.5" ry="4" fill={S.nose} />
          <path d="M50 82 Q64 82 78 82 Q74 101 64 101 Q54 101 50 82 Z" fill="#7A2417" stroke={S.stroke} strokeWidth="3" strokeLinejoin="round" />
          <path d="M56 95 Q64 107 72 95 Q68 91 64 91 Q60 91 56 95 Z" fill="#F98E6B" />
        </>
      );
    case "snooze":
      return (
        <>
          <path d="M92 42 h7 l-7 7 h7" fill="none" stroke={S.gold} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M101 28 h8 l-8 8 h8" fill="none" stroke={S.gold} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M111 14 h9 l-9 9 h9" fill="none" stroke={S.gold} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M42 61 Q49 67 56 61" stroke={S.stroke} strokeWidth="3.4" strokeLinecap="round" fill="none" />
          <path d="M72 61 Q79 67 86 61" stroke={S.stroke} strokeWidth="3.4" strokeLinecap="round" fill="none" />
          <Nose />
          <path d="M64 82 v3" stroke={S.stroke} strokeWidth="3" strokeLinecap="round" />
          <path d="M56 86 Q64 91 72 86" stroke={S.stroke} strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      );
    case "thinking":
      return (
        <>
          <circle cx="96" cy="42" r="2.6" fill={S.gold} /><circle cx="105" cy="31" r="3.6" fill={S.gold} /><circle cx="115" cy="18" r="5" fill={S.gold} />
          <OpenEyes up />
          <Nose />
          <path d="M54 87 Q62 84 70 87" stroke={S.stroke} strokeWidth="3" strokeLinecap="round" fill="none" />
          <ellipse cx="84" cy="103" rx="8" ry="9" fill={S.orange} stroke={S.stroke} strokeWidth="4" />
          <path d="M80 100 v5 M84 99 v6 M88 100 v5" stroke={S.stroke} strokeWidth="2.3" strokeLinecap="round" />
        </>
      );
    case "wave":
      return (
        <>
          <OpenEyes />
          <Nose />
          <path d="M64 82 v3" stroke={S.stroke} strokeWidth="3" strokeLinecap="round" />
          <path d="M64 85 Q57 92 51 87" stroke={S.stroke} strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M64 85 Q71 92 77 87" stroke={S.stroke} strokeWidth="3" strokeLinecap="round" fill="none" />
          <ellipse cx="106" cy="44" rx="9" ry="11" fill={S.orange} stroke={S.stroke} strokeWidth="4" />
          <path d="M102 41 v5 M106 40 v6 M110 41 v5" stroke={S.stroke} strokeWidth="2.4" strokeLinecap="round" />
        </>
      );
    default: // base
      return (
        <>
          <OpenEyes />
          <Nose />
          <path d="M64 82 v3" stroke={S.stroke} strokeWidth="3" strokeLinecap="round" />
          <path d="M64 85 Q57 92 51 87" stroke={S.stroke} strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M64 85 Q71 92 77 87" stroke={S.stroke} strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      );
  }
}

export function Tiger({ mood = "base", size = 104 }: { mood?: Mood; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none">
      <Base />
      <Mood mood={mood} />
    </svg>
  );
}

// Tiger inside the circular badge frame used all over the app.
export function TigerRing({
  mood = "base", size = 122, tiger, border = S.orange, borderWidth = 4,
  bg = "#235E2D", float = false, style,
}: {
  mood?: Mood; size?: number; tiger?: number; border?: string; borderWidth?: number;
  bg?: string; float?: boolean; style?: CSSProperties;
}) {
  return (
    <div
      className={float ? "mascot-float" : undefined}
      style={{
        width: size, height: size, borderRadius: "50%", background: bg,
        border: `${borderWidth}px solid ${border}`, flex: "none",
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", ...style,
      }}
    >
      <Tiger mood={mood} size={tiger ?? Math.round(size * 0.85)} />
    </div>
  );
}
