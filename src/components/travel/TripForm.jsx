import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Users, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const INTERESTS = [
  { id: "nature", label: "Nature", emoji: "🌲" }, { id: "mountains", label: "Mountains", emoji: "🏔" },
  { id: "photography", label: "Photography", emoji: "📸" }, { id: "food", label: "Food", emoji: "🍜" },
  { id: "museums", label: "Museums", emoji: "🏛" }, { id: "beaches", label: "Beaches", emoji: "🏖" },
  { id: "shopping", label: "Shopping", emoji: "🛍" }, { id: "theme_parks", label: "Theme Parks", emoji: "🎢" },
  { id: "nightlife", label: "Nightlife", emoji: "🌃" }, { id: "culture", label: "Culture", emoji: "🎭" },
  { id: "history", label: "History", emoji: "🏰" }, { id: "adventure", label: "Adventure", emoji: "🚴" },
  { id: "luxury", label: "Luxury", emoji: "💎" }, { id: "relaxation", label: "Relaxation", emoji: "🧘" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧" },
];

const INTENSITY = [
  { id: "relaxed", label: "Relaxed", desc: "2–3 attractions/day, plenty of free time" },
  { id: "balanced", label: "Balanced", desc: "4–6 attractions/day" },
  { id: "packed", label: "Packed", desc: "Maximum sightseeing, efficient routes" },
];

const BUDGET = [
  { id: "budget", label: "Budget", desc: "Lowest practical cost" },
  { id: "standard", label: "Standard", desc: "Best value experience" },
  { id: "luxury", label: "Luxury", desc: "Premium recommendations" },
];

export default function TripForm({ onGenerate, compact = false }) {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState("standard");
  const [intensity, setIntensity] = useState("balanced");
  const [interests, setInterests] = useState([]);
  const [groupSize, setGroupSize] = useState(2);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleInterest = (id) => setInterests((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const submit = (e) => {
    e.preventDefault();
    if (!destination.trim()) return;
    onGenerate({ destination: destination.trim(), days, budget_level: budget, intensity, interests, group_size: groupSize });
  };

  return (
    <motion.form onSubmit={submit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className={`w-full ${compact ? "max-w-3xl" : "max-w-2xl"} mx-auto`}>
      <div className="rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/20 backdrop-blur"><Sparkles className="w-5 h-5 text-white" /></div>
          <div>
            <h2 className="text-white font-display text-xl font-semibold leading-tight">Plan your perfect trip</h2>
            <p className="text-white/70 text-sm">Tell me where — I'll craft the rest.</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-white/80 text-xs font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Destination</label>
            <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Tokyo, Amalfi Coast, Iceland…"
              className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3.5 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/40 transition" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/80 text-xs font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Days</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setDays((d) => Math.max(1, d - 1))} className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white text-lg leading-none hover:bg-white/20 transition">−</button>
                <span className="flex-1 text-center text-white font-display text-lg font-semibold">{days}</span>
                <button type="button" onClick={() => setDays((d) => Math.min(30, d + 1))} className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white text-lg leading-none hover:bg-white/20 transition">+</button>
              </div>
            </div>
            <div>
              <label className="text-white/80 text-xs font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Travelers</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setGroupSize((g) => Math.max(1, g - 1))} className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white text-lg leading-none hover:bg-white/20 transition">−</button>
                <span className="flex-1 text-center text-white font-display text-lg font-semibold">{groupSize}</span>
                <button type="button" onClick={() => setGroupSize((g) => Math.min(20, g + 1))} className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white text-lg leading-none hover:bg-white/20 transition">+</button>
              </div>
            </div>
          </div>
          <div>
            <label className="text-white/80 text-xs font-medium uppercase tracking-wide mb-2 block">Interests <span className="text-white/40 normal-case">(optional)</span></label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((it) => {
                const active = interests.includes(it.id);
                return (
                  <button key={it.id} type="button" onClick={() => toggleInterest(it.id)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${active ? "bg-white text-slate-900 border-white font-medium shadow-lg" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}`}>
                    <span className="mr-1">{it.emoji}</span>{it.label}
                  </button>
                );
              })}
            </div>
          </div>
          <button type="button" onClick={() => setShowAdvanced((s) => !s)} className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition">
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showAdvanced ? "Hide" : "Show"} advanced options
          </button>
          {showAdvanced && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 overflow-hidden">
              <div>
                <label className="text-white/80 text-xs font-medium uppercase tracking-wide mb-2 block">Trip intensity</label>
                <div className="grid grid-cols-3 gap-2">
                  {INTENSITY.map((opt) => (
                    <button key={opt.id} type="button" onClick={() => setIntensity(opt.id)} title={opt.desc}
                      className={`px-3 py-2.5 rounded-2xl text-sm border transition-all text-center ${intensity === opt.id ? "bg-white text-slate-900 border-white font-medium shadow-lg" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white/80 text-xs font-medium uppercase tracking-wide mb-2 block">Budget level</label>
                <div className="grid grid-cols-3 gap-2">
                  {BUDGET.map((opt) => (
                    <button key={opt.id} type="button" onClick={() => setBudget(opt.id)} title={opt.desc}
                      className={`px-3 py-2.5 rounded-2xl text-sm border transition-all text-center ${budget === opt.id ? "bg-white text-slate-900 border-white font-medium shadow-lg" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
        <Button type="submit" disabled={!destination.trim()}
          className="w-full mt-6 h-12 rounded-2xl bg-white text-slate-900 hover:bg-white/90 text-base font-semibold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
          <Sparkles className="w-4 h-4 mr-2 inline-block" /> Generate my itinerary
        </Button>
      </div>
    </motion.form>
  );
}
