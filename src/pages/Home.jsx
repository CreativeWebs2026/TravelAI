import React from "react";
import { motion } from "framer-motion";
import AnimatedBackground from "@/components/travel/AnimatedBackground";
import TripForm from "@/components/travel/TripForm";
import { Compass, Sparkles, MapPin, Camera, Gem, Shield } from "lucide-react";

const PILLARS = [
  { icon: Compass, title: "Discover", text: "Best attractions & hidden gems" },
  { icon: Sparkles, title: "Personalize", text: "Plans shaped by your interests" },
  { icon: MapPin, title: "Optimize", text: "Smart daily routes, no backtracking" },
  { icon: Camera, title: "Capture", text: "Photography spots at golden hour" },
];

const SAMPLE_DESTINATIONS = [
  "Tokyo for 5 days",
  "Amalfi Coast, 4 days",
  "Iceland nature trip, 7 days",
  "Marrakech for 6 days",
  "Banff in 5 days",
  "Lisbon for 4 days",
];

export default function Home({ onGenerate }) {
  const handleGenerate = (payload) => onGenerate(payload);

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground theme="sunset" />
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/15 backdrop-blur border border-white/20">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-display text-lg font-semibold tracking-tight">TravelAI</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-white/70 text-sm">
          <Gem className="w-4 h-4" />
          <span>Your personal travel companion</span>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-6 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/80 text-xs mb-6">
            <Sparkles className="w-3.5 h-3.5" /> AI-powered itineraries, crafted like a local guide
          </div>
          <h1 className="font-display text-white text-4xl sm:text-6xl font-bold leading-[1.05] tracking-tight">
            The world,<br />
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">perfectly planned.</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto mt-5 leading-relaxed">
            Enter a destination. Get a complete day-by-day itinerary — attractions, hidden gems, restaurants, budgets, and photography spots.
          </p>
        </motion.div>

        <TripForm onGenerate={handleGenerate} />

        <div className="mt-6 text-center">
          <div className="text-white/40 text-xs uppercase tracking-wide mb-2.5">Try</div>
          <div className="flex flex-wrap justify-center gap-2">
            {SAMPLE_DESTINATIONS.map((d) => (
              <button key={d} onClick={() => onGenerate({ destination: d, days: 5, budget_level: "standard", intensity: "balanced", interests: [] })}
                className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-white/80 text-sm hover:bg-white/15 hover:text-white transition">
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-14">
          {PILLARS.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              className="rounded-2xl bg-white/5 backdrop-blur border border-white/15 p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 mx-auto mb-2.5">
                <p.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-white font-medium text-sm">{p.title}</div>
              <div className="text-white/50 text-xs mt-0.5 leading-snug">{p.text}</div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-12 text-white/40 text-xs">
          <Shield className="w-3.5 h-3.5" /> Safety tips, local customs &amp; scam warnings included in every plan
        </div>
      </div>
    </div>
  );
}
