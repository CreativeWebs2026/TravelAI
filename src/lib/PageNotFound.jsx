import React from "react";
import { Link } from "react-router-dom";
import AnimatedBackground from "@/components/travel/AnimatedBackground";
import { Compass } from "lucide-react";

export default function PageNotFound() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground theme="night" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <Compass className="w-10 h-10 text-white/70 mb-4" />
        <h1 className="text-white font-display text-3xl font-semibold mb-2">Page not found</h1>
        <p className="text-white/60 mb-6">This path doesn't lead anywhere on this trip.</p>
        <Link to="/" className="px-5 py-2.5 rounded-2xl bg-white text-slate-900 font-medium hover:bg-white/90 transition">
          Back home
        </Link>
      </div>
    </div>
  );
}
