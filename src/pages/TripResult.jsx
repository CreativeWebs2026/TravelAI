import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { generateItinerary } from "@/lib/itineraryGenerator";
import { resolveCoverImage } from "@/lib/coverImage";
import { TripStore } from "@/lib/tripStore";
import AnimatedBackground, { themeForType } from "@/components/travel/AnimatedBackground";
import LoadingJourney from "@/components/travel/LoadingJourney";
import DayCard from "@/components/travel/DayCard";
import BudgetCard from "@/components/travel/BudgetCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Compass, Gem, Camera, Shield, Clock, MapPin, Sparkles, Image as ImageIcon } from "lucide-react";

export default function TripResult({ planRequest }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trip, setTrip] = useState(null);
  const [generatingCover, setGeneratingCover] = useState(false);

  const runGeneration = async (req) => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateItinerary(req);

      const normalizeSegment = (seg) => {
        if (!seg) return { activities: [] };
        if (Array.isArray(seg)) return { activities: seg };
        if (seg.activities && Array.isArray(seg.activities)) return seg;
        return { activities: [] };
      };
      const days = (res.days || []).map((d) => ({ ...d, morning: normalizeSegment(d.morning), afternoon: normalizeSegment(d.afternoon), evening: normalizeSegment(d.evening) }));

      const destType = res.destination_type || "city";
      const itinerary = { ...res, days };

      const created = TripStore.create({
        destination: req.destination, days: req.days, budget_level: req.budget_level, intensity: req.intensity,
        interests: req.interests || [], group_size: req.group_size || 2, destination_type: destType,
        cover_prompt: res.cover_prompt || "", itinerary, status: "completed",
      });

      setTrip(created);
      generateCover(created);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Something went wrong while planning your trip.");
    } finally {
      setLoading(false);
    }
  };

  const generateCover = async (tripRecord) => {
    if (tripRecord.cover_image_url) return;
    setGeneratingCover(true);
    try {
      const res = await resolveCoverImage(tripRecord.destination, tripRecord.destination_type);
      if (res?.url) {
        const updated = TripStore.update(tripRecord.id, { cover_image_url: res.url });
        setTrip((t) => (t?.id === tripRecord.id ? { ...t, cover_image_url: updated.cover_image_url } : t));
      }
    } catch (e) { } finally { setGeneratingCover(false); }
  };

  useEffect(() => { if (planRequest) runGeneration(planRequest); /* eslint-disable-next-line */ }, []);

  const theme = trip?.destination_type ? themeForType(trip.destination_type) : "sunset";

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <AnimatedBackground theme="sunset" />
        <div className="relative z-10"><LoadingJourney destination={planRequest?.destination} /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen">
        <AnimatedBackground theme="sunset" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <div className="text-5xl mb-4">🌫️</div>
          <h2 className="text-white font-display text-2xl font-semibold mb-2">Couldn't plan that trip</h2>
          <p className="text-white/70 max-w-sm mb-6">{error}</p>
          <Button onClick={() => navigate("/")} className="bg-white text-slate-900 hover:bg-white/90">
            <ArrowLeft className="w-4 h-4 mr-2" /> Try again
          </Button>
        </div>
      </div>
    );
  }

  const it = trip?.itinerary || {};
  const destInfo = it.destination_info || {};
  const days = it.days || [];
  const hiddenGems = it.hidden_gems || [];
  const safety = it.safety_tips || [];
  const photoSpots = it.photography_spots || [];
  const travelTips = it.travel_tips || [];

  return (
    <div className="relative min-h-screen pb-20">
      <AnimatedBackground theme={theme} />
      <div className="relative z-10">
        {trip?.cover_image_url && (
          <div className="absolute inset-x-0 top-0 h-[42vh] overflow-hidden">
            <img src={trip.cover_image_url} alt={trip.destination} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background" />
          </div>
        )}
        <div className={`relative px-6 sm:px-10 pt-8 ${trip?.cover_image_url ? "" : "pt-12"}`}>
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition">
            <ArrowLeft className="w-4 h-4" /> New trip
          </button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20 text-white/90 text-xs">
                <MapPin className="w-3 h-3" /> {destInfo.country || "Destination"}
              </span>
              {generatingCover && (
                <span className="inline-flex items-center gap-1.5 text-white/60 text-xs">
                  <ImageIcon className="w-3 h-3 animate-pulse" /> Rendering cover…
                </span>
              )}
            </div>
            <h1 className="font-display text-white text-4xl sm:text-5xl font-bold leading-tight tracking-tight">{trip.destination}</h1>
            <div className="flex items-center gap-3 mt-3 text-white/70 text-sm flex-wrap">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {trip.days} days</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="capitalize">{trip.budget_level}</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="capitalize">{trip.intensity}</span>
              {trip.group_size > 1 && (<><span className="w-1 h-1 rounded-full bg-white/30" /><span>{trip.group_size} travelers</span></>)}
            </div>
            {destInfo.description && <p className="text-white/75 text-base mt-4 leading-relaxed max-w-2xl">{destInfo.description}</p>}
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 px-6 sm:px-10 mt-10 max-w-3xl mx-auto space-y-6">
        <div>
          <SectionHeader icon={Compass} title="Your itinerary" />
          <div className="space-y-5">{days.map((day, i) => (<DayCard key={i} day={day} index={i} />))}</div>
        </div>

        {hiddenGems.length > 0 && (
          <div>
            <SectionHeader icon={Gem} title="Hidden gems" />
            <div className="grid sm:grid-cols-2 gap-3">
              {hiddenGems.map((g, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl bg-purple-500/10 ring-1 ring-purple-400/25 p-4 backdrop-blur">
                  <div className="text-purple-200 text-[10px] uppercase tracking-wide font-medium mb-1">Locals' pick</div>
                  <h4 className="text-white font-medium">{g.name}</h4>
                  <p className="text-white/65 text-xs mt-1">{g.description}</p>
                  {g.address && <p className="flex items-center gap-1 text-white/45 text-[11px] mt-1.5"><MapPin className="w-3 h-3 shrink-0" /> {g.address}</p>}
                  {g.why_hidden && <p className="text-white/45 text-[11px] mt-1.5 italic">{g.why_hidden}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <BudgetCard breakdown={it.budget_breakdown} days={trip.days} />

        {photoSpots.length > 0 && (
          <div>
            <SectionHeader icon={Camera} title="Photography spots" />
            <div className="space-y-2.5">
              {photoSpots.map((p, i) => (
                <div key={i} className="flex items-start gap-3 rounded-2xl bg-white/5 border border-white/15 p-3.5">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/20 shrink-0"><Camera className="w-4 h-4 text-amber-200" /></div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-white text-sm font-medium">{p.name}</h4>
                      {p.best_time && <span className="text-amber-200 text-[10px] bg-amber-500/15 px-1.5 py-0.5 rounded-full">{p.best_time}</span>}
                    </div>
                    {p.description && <p className="text-white/60 text-xs mt-0.5">{p.description}</p>}
                    {p.address && <p className="flex items-center gap-1 text-white/45 text-[11px] mt-1"><MapPin className="w-3 h-3 shrink-0" /> {p.address}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(safety.length > 0 || travelTips.length > 0) && (
          <div>
            <SectionHeader icon={Shield} title="Safety & travel info" />
            <div className="rounded-2xl bg-white/5 border border-white/15 p-5 space-y-4">
              {safety.length > 0 && (
                <div>
                  <div className="text-white/50 text-[10px] uppercase tracking-wide font-medium mb-2">Safety & scams</div>
                  <ul className="space-y-1.5">
                    {safety.map((s, i) => (<li key={i} className="text-white/75 text-sm flex gap-2"><span className="text-rose-300 mt-0.5">•</span><span>{s}</span></li>))}
                  </ul>
                </div>
              )}
              {travelTips.length > 0 && (
                <div className={safety.length > 0 ? "pt-3 border-t border-white/10" : ""}>
                  <div className="text-white/50 text-[10px] uppercase tracking-wide font-medium mb-2">Local tips</div>
                  <ul className="space-y-1.5">
                    {travelTips.map((t, i) => (<li key={i} className="text-white/75 text-sm flex gap-2"><span className="text-emerald-300 mt-0.5">•</span><span>{t}</span></li>))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button onClick={() => navigate("/")} className="flex-1 h-11 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur">
            <Sparkles className="w-4 h-4 mr-2" /> Plan another
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2.5 mb-4 mt-2">
      <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/15 backdrop-blur border border-white/20"><Icon className="w-4 h-4 text-white" /></div>
      <h2 className="text-white font-display text-xl font-semibold">{title}</h2>
    </div>
  );
}
