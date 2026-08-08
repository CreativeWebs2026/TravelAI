import React from "react";
import { motion } from "framer-motion";
import { Bed, UtensilsCrossed, Ticket, Car, Compass, Wallet } from "lucide-react";

const ICONS = { accommodation: Bed, food: UtensilsCrossed, attractions: Ticket, transport: Car, activities: Compass };

export default function BudgetCard({ breakdown, days }) {
  if (!breakdown) return null;
  const level = breakdown.standard || breakdown.budget || breakdown.luxury;
  if (!level) return null;

  const tiers = ["budget", "standard", "luxury"].filter((k) => breakdown[k]).map((k) => ({ key: k, data: breakdown[k] }));
  const fmt = (n) => (n != null ? `$${Number(n).toLocaleString()}` : "—");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/15 p-6 shadow-2xl">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/20 backdrop-blur"><Wallet className="w-4 h-4 text-emerald-200" /></div>
        <h3 className="text-white font-display text-lg font-semibold">Budget breakdown</h3>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {tiers.map((t) => (
          <div key={t.key} className={`rounded-2xl p-3 text-center border ${t.key === "standard" ? "bg-white/15 border-white/30" : "bg-white/5 border-white/10"}`}>
            <div className="text-white/50 text-[10px] uppercase tracking-wide capitalize">{t.key}</div>
            <div className="text-white font-display text-lg font-bold mt-0.5">{fmt(t.data.total)}</div>
            <div className="text-white/40 text-[10px]">{fmt(t.data.total_per_day)}/day</div>
          </div>
        ))}
      </div>
      <div className="space-y-2.5">
        {Object.entries(ICONS).map(([key, Icon]) => {
          const val = level[key];
          if (val == null) return null;
          const max = Math.max(...Object.values(ICONS).map((_, i) => Object.values(level)[i] || 0));
          const pct = max > 0 ? Math.min(100, (val / max) * 100) : 0;
          return (
            <div key={key} className="flex items-center gap-3">
              <Icon className="w-4 h-4 text-white/50 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/70 capitalize">{key}</span>
                  <span className="text-white font-medium">{fmt(val)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full bg-gradient-to-r from-white/60 to-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
