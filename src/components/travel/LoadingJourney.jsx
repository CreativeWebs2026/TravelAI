import React from "react";
import { motion } from "framer-motion";

const PHASES = [
  "Discovering the best attractions…",
  "Finding hidden gems locals love…",
  "Optimizing your daily routes…",
  "Matching places to your interests…",
  "Estimating costs & budgets…",
  "Crafting unforgettable experiences…",
];

export default function LoadingJourney({ destination }) {
  const [phase, setPhase] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p + 1) % PHASES.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="relative w-32 h-32 mb-8">
        <motion.div className="absolute inset-0 rounded-full border-2 border-white/20" style={{ borderTopColor: "rgba(255,255,255,0.9)" }} animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
        <motion.div className="absolute inset-3 rounded-full border-2 border-white/10" style={{ borderRightColor: "rgba(255,255,255,0.7)" }} animate={{ rotate: -360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
        <motion.div className="absolute inset-6 rounded-full border-2 border-white/10" style={{ borderBottomColor: "rgba(255,255,255,0.5)" }} animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
        <div className="absolute inset-0 flex items-center justify-center"><span className="text-2xl">🌍</span></div>
      </div>
      <h3 className="text-white font-display text-2xl font-semibold mb-2">Planning {destination}</h3>
      <motion.p key={phase} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-white/70 text-sm max-w-xs">{PHASES[phase]}</motion.p>
    </div>
  );
}
