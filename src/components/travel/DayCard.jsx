import React from "react";
import { motion } from "framer-motion";
import { Sun, Cloud, Moon, UtensilsCrossed, MapPin, Navigation, Clock, DollarSign } from "lucide-react";

const CATEGORY_STYLES = {
  nature: { ring: "ring-emerald-400/30", bg: "bg-emerald-500/10", text: "text-emerald-200" },
  mountain: { ring: "ring-sky-400/30", bg: "bg-sky-500/10", text: "text-sky-200" },
  food: { ring: "ring-orange-400/30", bg: "bg-orange-500/10", text: "text-orange-200" },
  museums: { ring: "ring-violet-400/30", bg: "bg-violet-500/10", text: "text-violet-200" },
  beaches: { ring: "ring-cyan-400/30", bg: "bg-cyan-500/10", text: "text-cyan-200" },
  shopping: { ring: "ring-pink-400/30", bg: "bg-pink-500/10", text: "text-pink-200" },
  nightlife: { ring: "ring-indigo-400/30", bg: "bg-indigo-500/10", text: "text-indigo-200" },
  culture: { ring: "ring-amber-400/30", bg: "bg-amber-500/10", text: "text-amber-200" },
  history: { ring: "ring-yellow-400/30", bg: "bg-yellow-500/10", text: "text-yellow-200" },
  adventure: { ring: "ring-lime-400/30", bg: "bg-lime-500/10", text: "text-lime-200" },
  luxury: { ring: "ring-rose-400/30", bg: "bg-rose-500/10", text: "text-rose-200" },
  relaxation: { ring: "ring-teal-400/30", bg: "bg-teal-500/10", text: "text-teal-200" },
  family: { ring: "ring-fuchsia-400/30", bg: "bg-fuchsia-500/10", text: "text-fuchsia-200" },
  hidden_gem: { ring: "ring-purple-400/40", bg: "bg-purple-500/15", text: "text-purple-200" },
};

function styleForCategory(cat) { if (!cat) return CATEGORY_STYLES.nature; return CATEGORY_STYLES[cat.toLowerCase()] || CATEGORY_STYLES.nature; }

function Activity({ activity, index }) {
  const s = styleForCategory(activity.category);
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="relative pl-6 pb-4 last:pb-0">
      <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-white/80 ring-4 ring-white/10" />
      <div className={`rounded-2xl ${s.bg} ring-1 ${s.ring} p-3.5 backdrop-blur-sm`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h5 className="text-white font-medium text-sm leading-snug">{activity.name}</h5>
              {activity.category && <span className={`text-[10px] uppercase tracking-wide ${s.text} font-medium`}>{activity.category.replace("_", " ")}</span>}
              {activity.is_hidden_gem && <span className="text-[10px] uppercase tracking-wide text-purple-200 bg-purple-500/20 px-1.5 py-0.5 rounded-full font-medium">Hidden gem</span>}
            </div>
            {activity.description && <p className="text-white/65 text-xs mt-1 leading-relaxed">{activity.description}</p>}
            {activity.address && (
              <div className="flex items-center gap-1 text-white/55 text-[11px] mt-1.5">
                <MapPin className="w-3 h-3 shrink-0" /> {activity.address}
              </div>
            )}
            <div className="flex items-center gap-3 mt-2 flex-wrap text-white/50 text-[11px]">
              {activity.best_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {activity.best_time}</span>}
              {activity.travel_time && <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {activity.travel_time}</span>}
              {activity.cost_estimate && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {activity.cost_estimate}</span>}
            </div>
          </div>
          {typeof activity.match_score === "number" && (
            <div className="shrink-0 flex flex-col items-center">
              <div className="text-white font-display font-bold text-lg leading-none">{activity.match_score}</div>
              <div className="text-white/40 text-[9px] uppercase tracking-wide">match</div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Segment({ icon, label, title, activities, accent }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <div className={`flex items-center justify-center w-7 h-7 rounded-xl ${accent} backdrop-blur`}>{icon}</div>
        <div>
          <div className="text-white/50 text-[10px] uppercase tracking-wider font-medium">{label}</div>
          {title && <div className="text-white/80 text-xs">{title}</div>}
        </div>
      </div>
      <div className="border-l border-white/15 ml-3.5 pl-1">{activities?.map((a, i) => (<Activity key={i} activity={a} index={i} />))}</div>
    </div>
  );
}

export default function DayCard({ day, index }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08, duration: 0.5 }} className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/15 p-5 sm:p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-white/50 text-[11px] uppercase tracking-wider font-medium">Day {day.day_number}</div>
          {day.theme && <h3 className="text-white font-display text-xl font-semibold leading-tight mt-0.5">{day.theme}</h3>}
        </div>
        <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
          <span className="text-white font-display font-bold text-lg">{day.day_number}</span>
        </div>
      </div>
      <div className="space-y-5">
        <Segment icon={<Sun className="w-4 h-4 text-amber-200" />} label="Morning" title={day.morning?.route_note} activities={day.morning?.activities} accent="bg-amber-500/20" />
        <Segment icon={<Cloud className="w-4 h-4 text-sky-200" />} label="Afternoon" title={day.afternoon?.route_note} activities={day.afternoon?.activities} accent="bg-sky-500/20" />
        <Segment icon={<Moon className="w-4 h-4 text-indigo-200" />} label="Evening" title={day.evening?.route_note} activities={day.evening?.activities} accent="bg-indigo-500/20" />
      </div>
      {(day.lunch || day.dinner) && (
        <div className="grid sm:grid-cols-2 gap-3 mt-5 pt-5 border-t border-white/10">
          {day.lunch && (
            <div className="rounded-2xl bg-orange-500/10 ring-1 ring-orange-400/20 p-3">
              <div className="flex items-center gap-1.5 text-orange-200 text-[10px] uppercase tracking-wide font-medium mb-1"><UtensilsCrossed className="w-3 h-3" /> Lunch</div>
              <div className="text-white text-sm font-medium">{day.lunch.name}</div>
              {day.lunch.description && <div className="text-white/60 text-xs mt-0.5">{day.lunch.description}</div>}
              {day.lunch.address && <div className="flex items-center gap-1 text-white/50 text-[11px] mt-1"><MapPin className="w-3 h-3 shrink-0" /> {day.lunch.address}</div>}
              {day.lunch.price_range && <div className="text-white/50 text-[11px] mt-1">{day.lunch.price_range}</div>}
            </div>
          )}
          {day.dinner && (
            <div className="rounded-2xl bg-rose-500/10 ring-1 ring-rose-400/20 p-3">
              <div className="flex items-center gap-1.5 text-rose-200 text-[10px] uppercase tracking-wide font-medium mb-1"><UtensilsCrossed className="w-3 h-3" /> Dinner</div>
              <div className="text-white text-sm font-medium">{day.dinner.name}</div>
              {day.dinner.description && <div className="text-white/60 text-xs mt-0.5">{day.dinner.description}</div>}
              {day.dinner.address && <div className="flex items-center gap-1 text-white/50 text-[11px] mt-1"><MapPin className="w-3 h-3 shrink-0" /> {day.dinner.address}</div>}
              {day.dinner.price_range && <div className="text-white/50 text-[11px] mt-1">{day.dinner.price_range}</div>}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
