import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Real nature photography (forest + mountains), free via LoremFlickr — no API
// key, no bundled assets. Locked seeds so each slot always shows the same,
// pre-checked photo instead of a random draw.
const PHOTOS = [
  "https://loremflickr.com/1920/1200/forest,sunrays,pine?lock=910",
  "https://loremflickr.com/1920/1200/forest,trail,pine?lock=202",
  "https://loremflickr.com/1920/1200/mountain,range,sunrise?lock=404",
  "https://loremflickr.com/1920/1200/lake,mountains,reflection?lock=606",
  "https://loremflickr.com/1920/1200/mountains,alps,peak?lock=303",
  "https://loremflickr.com/1920/1200/waterfall,forest,green?lock=707",
];

export default function PhotoBackground({ intervalMs = 7000 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % PHOTOS.length), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return (
    <div className="fixed inset-0 overflow-hidden -z-10 bg-slate-900">
      <AnimatePresence>
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1.08 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1.6 },
            scale: { duration: intervalMs / 1000 + 1.6, ease: "linear" },
          }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${PHOTOS[index]})` }}
        />
      </AnimatePresence>
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(8,10,20,0.45) 0%, rgba(8,10,20,0.3) 45%, rgba(8,10,20,0.7) 100%)" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(0,0,0,0.4) 100%)" }}
      />
    </div>
  );
}
