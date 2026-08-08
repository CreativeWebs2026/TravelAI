import React, { useMemo } from "react";

const THEMES = {
  forest: { name: "forest", colors: ["#0b3d2e", "#145a3e", "#1e7a4f", "#2d9b6a", "#a7d9a0"], glow: "rgba(45,155,106,0.35)" },
  mountain: { name: "mountain", colors: ["#1a2a3e", "#2c3e5a", "#4a6f8a", "#7fa6c9", "#d6e4ee"], glow: "rgba(127,166,201,0.35)" },
  beach: { name: "beach", colors: ["#024958", "#0a7a8a", "#34c5cf", "#9fe6e8", "#fff3d6"], glow: "rgba(52,197,207,0.35)" },
  sunset: { name: "sunset", colors: ["#2b1055", "#7d2e8e", "#e2583f", "#f7a850", "#ffe5b0"], glow: "rgba(247,168,80,0.4)" },
  city: { name: "city", colors: ["#0a0e27", "#1a2150", "#3a3f8a", "#6d78d4", "#c9d0ff"], glow: "rgba(109,120,212,0.35)" },
  night: { name: "night", colors: ["#050818", "#0c1438", "#1c2a5e", "#3a4f9e", "#8fa8e8"], glow: "rgba(143,168,232,0.4)" },
  desert: { name: "desert", colors: ["#4a2c1a", "#8a4a22", "#c87842", "#e8a968", "#fde2b8"], glow: "rgba(232,169,104,0.35)" },
};

export function themeForType(type) {
  if (!type) return THEMES.sunset;
  const t = type.toLowerCase();
  if (t.includes("beach") || t.includes("island") || t.includes("tropical")) return THEMES.beach;
  if (t.includes("mountain") || t.includes("snow")) return THEMES.mountain;
  if (t.includes("forest") || t.includes("nature")) return THEMES.forest;
  if (t.includes("city") || t.includes("urban")) return THEMES.city;
  if (t.includes("desert")) return THEMES.desert;
  if (t.includes("night")) return THEMES.night;
  return THEMES.sunset;
}

export default function AnimatedBackground({ theme, intensity = 1 }) {
  const cfg = useMemo(() => {
    const base = typeof theme === "string" ? THEMES[theme] || THEMES.sunset : theme || THEMES.sunset;
    return base;
  }, [theme]);

  const style = { "--c1": cfg.colors[0], "--c2": cfg.colors[1], "--c3": cfg.colors[2], "--c4": cfg.colors[3], "--c5": cfg.colors[4], "--glow": cfg.glow };

  return (
    <div className="fixed inset-0 overflow-hidden -z-10" style={style} aria-hidden>
      <div className="absolute inset-0" style={{ background: `linear-gradient(155deg, var(--c1) 0%, var(--c2) 35%, var(--c3) 70%, var(--c4) 100%)` }} />
      <div className="absolute -top-1/4 -left-1/4 w-[80vw] h-[80vw] rounded-full blur-3xl opacity-50 animate-blob" style={{ background: "radial-gradient(circle, var(--c4), transparent 65%)" }} />
      <div className="absolute top-1/3 -right-1/4 w-[70vw] h-[70vw] rounded-full blur-3xl opacity-40 animate-blob-slow" style={{ background: "radial-gradient(circle, var(--c5), transparent 65%)" }} />
      <div className="absolute -bottom-1/4 left-1/4 w-[65vw] h-[65vw] rounded-full blur-3xl opacity-40 animate-blob-rev" style={{ background: "radial-gradient(circle, var(--c3), transparent 65%)" }} />
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 40%, transparent 0%, rgba(0,0,0,0.35) 100%)` }} />
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className="absolute rounded-full animate-float-particle" style={{
          left: `${(i * 53) % 100}%`, top: `${(i * 37) % 100}%`,
          width: `${3 + (i % 4) * 2}px`, height: `${3 + (i % 4) * 2}px`,
          background: "rgba(255,255,255,0.6)", boxShadow: "0 0 12px rgba(255,255,255,0.7)",
          animationDelay: `${(i % 9) * 0.8}s`, animationDuration: `${10 + (i % 7) * 2}s`, opacity: 0.5,
        }} />
      ))}
    </div>
  );
}
