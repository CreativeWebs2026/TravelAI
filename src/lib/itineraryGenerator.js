// Deterministic itinerary generator — stands in for an LLM call so the app
// works with zero API keys. Seeded by the destination + trip params so the
// same input always produces the same trip, while different input varies output.
// Where possible it fills in real place names and addresses from OpenStreetMap
// (see placesApi.js); when that's unavailable (offline, rate-limited, sparse
// data for the area) it falls back to the template-based names below, so the
// app always produces a full itinerary either way.

import { geocodeDestination, fetchNearbyPlaces, buildPlacePools } from "./placesApi";

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeRng(seedStr) {
  const rng = mulberry32(hashString(seedStr));
  return {
    next: () => rng(),
    int: (min, max) => Math.floor(rng() * (max - min + 1)) + min,
    pick: (arr) => arr[Math.floor(rng() * arr.length)],
    shuffle: (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
  };
}

const DESTINATION_TYPE_KEYWORDS = [
  { type: "beach", words: ["beach", "island", "coast", "bali", "maldives", "cancun", "hawaii", "caribbean", "phuket", "santorini", "ibiza", "seychelles", "zanzibar", "goa", "algarve"] },
  { type: "mountain", words: ["mountain", "alps", "banff", "aspen", "himalaya", "andes", "rockies", "dolomites", "patagonia", "zermatt", "chamonix", "snow", "ski"] },
  { type: "desert", words: ["desert", "dubai", "sahara", "morocco", "marrakech", "abu dhabi", "petra", "jordan", "namibia", "atacama"] },
  { type: "nature", words: ["iceland", "amazon", "yellowstone", "safari", "kenya", "tanzania", "costa rica", "galapagos", "forest", "national park", "rainforest", "fjord", "norway"] },
  { type: "night", words: ["vegas", "las vegas", "night"] },
];

function inferDestinationType(destination) {
  const d = destination.toLowerCase();
  for (const { type, words } of DESTINATION_TYPE_KEYWORDS) {
    if (words.some((w) => d.includes(w))) return type;
  }
  return "city";
}

const COUNTRY_LOOKUP = [
  { words: ["tokyo", "japan", "kyoto", "osaka"], country: "Japan" },
  { words: ["paris", "france", "nice", "lyon", "provence"], country: "France" },
  { words: ["rome", "italy", "amalfi", "venice", "tuscany", "milan", "sicily"], country: "Italy" },
  { words: ["barcelona", "spain", "madrid", "seville", "ibiza"], country: "Spain" },
  { words: ["lisbon", "portugal", "algarve", "porto"], country: "Portugal" },
  { words: ["iceland", "reykjavik"], country: "Iceland" },
  { words: ["marrakech", "morocco", "casablanca", "fes"], country: "Morocco" },
  { words: ["bali", "indonesia", "jakarta"], country: "Indonesia" },
  { words: ["thailand", "bangkok", "phuket", "chiang mai"], country: "Thailand" },
  { words: ["greece", "santorini", "athens", "mykonos"], country: "Greece" },
  { words: ["banff", "canada", "vancouver", "toronto"], country: "Canada" },
  { words: ["new york", "usa", "california", "hawaii", "vegas", "miami", "chicago", "yellowstone"], country: "United States" },
  { words: ["dubai", "abu dhabi", "uae"], country: "United Arab Emirates" },
  { words: ["egypt", "cairo", "luxor"], country: "Egypt" },
  { words: ["mexico", "cancun", "oaxaca"], country: "Mexico" },
  { words: ["peru", "machu picchu", "lima"], country: "Peru" },
  { words: ["kenya", "tanzania", "safari"], country: "East Africa" },
  { words: ["switzerland", "zermatt", "chamonix", "swiss"], country: "Switzerland" },
  { words: ["norway", "fjord"], country: "Norway" },
  { words: ["london", "england", "uk", "scotland", "edinburgh"], country: "United Kingdom" },
];

function inferCountry(destination) {
  const d = destination.toLowerCase();
  for (const { words, country } of COUNTRY_LOOKUP) {
    if (words.some((w) => d.includes(w))) return country;
  }
  return "the region";
}

function shortName(destination) {
  return destination.split(",")[0].split(" for ")[0].split(" in ")[0].trim();
}

const THEME_POOL = [
  "Old town & local flavors", "Coastal exploration", "Art, architecture & history",
  "Markets & neighborhoods", "Nature & wide-open views", "Local life & hidden corners",
  "Landmarks & lookout points", "Food crawl & street life", "Slow morning, big evening",
  "Off the tourist trail", "Culture & craftsmanship", "Golden hour & viewpoints",
];

const CATEGORY_POOL = ["nature", "museums", "food", "culture", "history", "shopping", "adventure", "relaxation", "nightlife", "photography"];

const ACTIVITY_TEMPLATES = {
  nature: [
    { name: "{dest} Botanical Gardens", desc: "A quiet green escape with curated native plantings and shaded walking paths." },
    { name: "Sunrise walk along the {dest} waterfront", desc: "Early light over the water before the crowds arrive." },
    { name: "{dest} Nature Reserve", desc: "Trails winding through untouched landscape, good for a slow wander." },
    { name: "Viewpoint above {dest}", desc: "The best wide shot of the city or coastline, especially near sunset." },
  ],
  museums: [
    { name: "{dest} National Museum", desc: "The definitive collection covering the region's history in one stop." },
    { name: "{dest} Museum of Modern Art", desc: "Rotating contemporary exhibits in a striking building." },
    { name: "{dest} History & Heritage Center", desc: "Compact, well-curated, worth 90 minutes." },
  ],
  food: [
    { name: "{dest} Central Market food crawl", desc: "Stall-hopping through the best local snacks and produce." },
    { name: "Cooking class in {dest}", desc: "Hands-on class covering a few signature regional dishes." },
    { name: "{dest} Night Food Market", desc: "Street food, local crowds, best after dark." },
  ],
  culture: [
    { name: "{dest} Old Town walking tour", desc: "Self-guided route through the historic core, best done slowly." },
    { name: "Local artisan workshops in {dest}", desc: "Small studios where craftspeople still work by hand." },
    { name: "{dest} Cultural Center", desc: "Rotating performances, exhibitions, and community events." },
  ],
  history: [
    { name: "{dest} Old Fortress / Citadel", desc: "Centuries-old defensive site with sweeping views." },
    { name: "{dest} Heritage Quarter", desc: "Preserved streets and buildings from the city's founding era." },
    { name: "Guided history walk of {dest}", desc: "A local guide connects the dots between eras and landmarks." },
  ],
  shopping: [
    { name: "{dest} Design District", desc: "Independent boutiques, concept stores, and local labels." },
    { name: "{dest} Flea & Antique Market", desc: "Weekend market good for one-of-a-kind finds." },
    { name: "Main shopping street of {dest}", desc: "The central strip for both local brands and souvenirs." },
  ],
  adventure: [
    { name: "Half-day hike near {dest}", desc: "A moderate trail with a rewarding payoff view." },
    { name: "{dest} bike tour", desc: "Cover more ground on two wheels with a local guide." },
    { name: "Water activity near {dest}", desc: "Kayaking, snorkeling, or a boat trip depending on the coastline." },
  ],
  relaxation: [
    { name: "{dest} spa & thermal baths", desc: "A slow, restorative afternoon away from the itinerary." },
    { name: "Rooftop lounge in {dest}", desc: "Quiet drinks with a view, good pace-breaker mid-trip." },
    { name: "Park picnic in {dest}", desc: "Pick up market food and slow down for a couple of hours." },
  ],
  nightlife: [
    { name: "{dest} rooftop bar crawl", desc: "A few of the best-reviewed rooftop spots within walking distance." },
    { name: "Live music venue in {dest}", desc: "Local acts, casual door policy, good energy on weekends." },
    { name: "{dest} night market & bars", desc: "Where the city actually goes after 9pm." },
  ],
  photography: [
    { name: "{dest} golden hour viewpoint", desc: "The single best-known frame of the destination, timed right." },
    { name: "Backstreets of {dest} photo walk", desc: "Texture, color, and everyday life away from the landmarks." },
    { name: "{dest} skyline at blue hour", desc: "Best shot 20 minutes after sunset, before it's fully dark." },
  ],
};

const HIDDEN_GEM_TEMPLATES = [
  { name: "The courtyard behind {dest}'s main square", desc: "A quiet pocket most visitors walk straight past.", why: "No signage, and it's easy to miss the entrance from the street." },
  { name: "A family-run spot on the edge of {dest}'s old quarter", desc: "Small menu, no English signage, consistently full of locals.", why: "It doesn't show up in most guidebooks or search results." },
  { name: "The upper terrace above {dest}", desc: "Same view as the famous lookout, a five-minute walk further and empty.", why: "Most tour groups stop at the first viewpoint and turn back." },
  { name: "{dest}'s early-morning fish/produce market", desc: "Wraps up by 8am, before most travelers are even awake.", why: "Timing alone keeps it off the typical itinerary." },
  { name: "A neighborhood two stops past the tourist center of {dest}", desc: "Residential streets, local cafes, a completely different pace.", why: "It requires a short transit ride most visitors skip." },
];

const SAFETY_TIPS_POOL = [
  "Keep a digital and physical copy of your passport and travel insurance details.",
  "Use official taxis or ride-hailing apps rather than unlicensed drivers, especially from transit hubs.",
  "Be cautious of overly friendly strangers offering unsolicited tours or 'special deals' near major landmarks — a common setup for scams.",
  "Keep valuables in a front pocket or zipped bag in crowded markets and public transport.",
  "Check local emergency numbers and the nearest embassy/consulate before you arrive.",
  "Avoid displaying expensive cameras or jewelry openly in unfamiliar neighborhoods at night.",
  "Confirm prices verbally before getting into unmetered taxis or ordering at tourist-area restaurants.",
  "Drink bottled or filtered water unless local tap water is confirmed safe.",
  "Register with your country's local travel advisory service for real-time alerts during your trip.",
];

const TRAVEL_TIPS_POOL = [
  "Download offline maps before you go — signal can be unreliable outside city centers.",
  "Learn a handful of basic local phrases; even simple greetings go a long way.",
  "Carry a small amount of local cash for markets and small vendors that don't take cards.",
  "Group nearby attractions by neighborhood rather than by category to cut down on transit time.",
  "Check opening hours for major sights the night before — many close one day a week.",
  "Book popular restaurants a few days ahead during peak season.",
  "Pack layers — mornings and evenings can swing in temperature more than midday.",
];

const RESTAURANT_ADJECTIVES = ["Family-run", "Local favorite", "Cozy", "Award-winning", "Unassuming", "Bustling", "Rustic", "Modern"];
const RESTAURANT_NOUNS = ["Kitchen", "Table", "Bistro", "House", "Corner", "Tavern", "Grill", "Eatery"];

const PRICE_RANGES = {
  budget: ["$5–10", "$8–15"],
  standard: ["$15–30", "$20–40"],
  luxury: ["$50–90", "$80–150"],
};

const COST_ESTIMATES = {
  budget: ["Free", "$0–5", "$5–10"],
  standard: ["$10–20", "$15–25", "$20–35"],
  luxury: ["$30–60", "$50–100", "Free"],
};

function fillTemplate(str, dest) {
  return str.replace(/\{dest\}/g, dest);
}

const CATEGORY_LABELS = {
  nature: "green space", museums: "museum", food: "food spot", culture: "cultural landmark",
  history: "historic site", shopping: "shopping spot", adventure: "activity venue",
  relaxation: "relaxing spot", nightlife: "nightlife venue", photography: "scenic viewpoint",
};

function takeFromPool(pool, usedIds, rng) {
  if (!pool || !pool.length) return null;
  const available = pool.filter((p) => !usedIds.has(p.id));
  if (!available.length) return null;
  const poi = rng.pick(available);
  usedIds.add(poi.id);
  return poi;
}

function buildActivity(rng, category, dest, interests, budgetLevel, isHiddenGem, placePools, usedIds) {
  const matchBase = interests?.includes(category) ? rng.int(82, 98) : rng.int(55, 80);
  const common = {
    category,
    match_score: matchBase,
    best_time: rng.pick(["Morning", "Midday", "Afternoon", "Golden hour", "Evening"]),
    travel_time: `${rng.int(5, 25)} min`,
    cost_estimate: rng.pick(COST_ESTIMATES[budgetLevel] || COST_ESTIMATES.standard),
    is_hidden_gem: !!isHiddenGem,
  };

  const poi = placePools ? takeFromPool(placePools.byCategory[category], usedIds, rng) : null;
  if (poi) {
    return {
      ...common,
      name: poi.name,
      description: `A real, mapped ${CATEGORY_LABELS[category] || "spot"} in ${dest}.`,
      address: poi.address,
    };
  }

  const pool = ACTIVITY_TEMPLATES[category] || ACTIVITY_TEMPLATES.culture;
  const tpl = rng.pick(pool);
  return {
    ...common,
    name: fillTemplate(tpl.name, dest),
    description: fillTemplate(tpl.desc, dest),
    address: null,
  };
}

function titleCase(str) {
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildRestaurant(rng, dest, budgetLevel, placePools, usedIds) {
  const poi = placePools ? takeFromPool(placePools.restaurants, usedIds, rng) : null;
  if (poi) {
    const cuisine = poi.tags.cuisine ? titleCase(poi.tags.cuisine.split(";")[0]) : "Local";
    return {
      name: poi.name,
      cuisine,
      description: "Real, mapped restaurant — recommended for the quality-to-price ratio.",
      price_range: rng.pick(PRICE_RANGES[budgetLevel] || PRICE_RANGES.standard),
      address: poi.address,
    };
  }

  const cuisines = ["Local", "Seafood", "Street food", "Fusion", "Traditional", "Farm-to-table"];
  return {
    name: `${rng.pick(RESTAURANT_ADJECTIVES)} ${dest} ${rng.pick(RESTAURANT_NOUNS)}`,
    cuisine: rng.pick(cuisines),
    description: "Recommended for the quality-to-price ratio and consistently good reviews from locals.",
    price_range: rng.pick(PRICE_RANGES[budgetLevel] || PRICE_RANGES.standard),
    address: null,
  };
}

const INTENSITY_COUNTS = {
  relaxed: [1, 1, 1],
  balanced: [2, 2, 1],
  packed: [2, 3, 2],
};

const BUDGET_DAILY = {
  budget: { accommodation: 35, food: 20, attractions: 12, transport: 8, activities: 10 },
  standard: { accommodation: 90, food: 45, attractions: 30, transport: 15, activities: 30 },
  luxury: { accommodation: 280, food: 110, attractions: 70, transport: 40, activities: 90 },
};

async function tryFetchRealPlaces(destination) {
  try {
    const geo = await geocodeDestination(destination);
    const places = await fetchNearbyPlaces(geo.lat, geo.lon);
    const pools = buildPlacePools(places);
    return { geo, pools };
  } catch (e) {
    return { geo: null, pools: null };
  }
}

export async function generateItinerary(req) {
  const { destination, days, budget_level = "standard", intensity = "balanced", interests = [], group_size = 2 } = req;
  const dest = shortName(destination);
  const rng = makeRng(`${destination}|${days}|${budget_level}|${intensity}|${(interests || []).join(",")}`);

  const { geo, pools: placePools } = await tryFetchRealPlaces(destination);
  const usedPlaceIds = new Set();

  const destination_type = inferDestinationType(destination);
  const country = geo?.country || inferCountry(destination);

  const preferredCategories = interests?.length ? interests.filter((i) => ACTIVITY_TEMPLATES[i]) : [];
  const categoryPool = preferredCategories.length ? [...preferredCategories, ...rng.shuffle(CATEGORY_POOL)] : rng.shuffle(CATEGORY_POOL);

  const counts = INTENSITY_COUNTS[intensity] || INTENSITY_COUNTS.balanced;
  const themes = rng.shuffle(THEME_POOL);

  const genDays = [];
  for (let d = 0; d < days; d++) {
    const dayCategoryPool = rng.shuffle(categoryPool);
    let catIdx = 0;
    const nextCategory = () => {
      const c = dayCategoryPool[catIdx % dayCategoryPool.length];
      catIdx++;
      return c;
    };
    const hiddenGemSlot = rng.int(0, counts[0] + counts[1] + counts[2] - 1);
    let slot = 0;
    const buildSegment = (n) => {
      const activities = [];
      for (let i = 0; i < n; i++) {
        const isGem = slot === hiddenGemSlot;
        activities.push(buildActivity(rng, nextCategory(), dest, interests, budget_level, isGem, placePools, usedPlaceIds));
        slot++;
      }
      return { route_note: `Grouped for minimal backtracking around ${dest}.`, activities };
    };

    genDays.push({
      day_number: d + 1,
      theme: themes[d % themes.length],
      morning: buildSegment(counts[0]),
      afternoon: buildSegment(counts[1]),
      evening: buildSegment(counts[2]),
      lunch: buildRestaurant(rng, dest, budget_level, placePools, usedPlaceIds),
      dinner: buildRestaurant(rng, dest, budget_level, placePools, usedPlaceIds),
    });
  }

  const realHiddenCandidates = (placePools?.hiddenCandidates || []).filter((p) => !usedPlaceIds.has(p.id));
  const realHiddenGems = rng.shuffle(realHiddenCandidates).slice(0, 4).map((p) => {
    usedPlaceIds.add(p.id);
    return {
      name: p.name,
      description: `A mapped local spot in ${dest} that doesn't show up in most guides.`,
      why_hidden: "Lightly documented online — no Wikipedia entry, mostly known to locals.",
      address: p.address,
    };
  });
  const templateHiddenGems = rng.shuffle(HIDDEN_GEM_TEMPLATES).slice(0, Math.max(0, 4 - realHiddenGems.length)).map((g) => ({
    name: fillTemplate(g.name, dest),
    description: fillTemplate(g.desc, dest),
    why_hidden: g.why,
    address: null,
  }));
  const hiddenGems = [...realHiddenGems, ...templateHiddenGems];

  const groupMultiplier = 1 + (Math.max(1, group_size) - 1) * 0.85;
  const buildTier = (tier) => {
    const base = BUDGET_DAILY[tier];
    const accommodation = Math.round(base.accommodation * groupMultiplier * days);
    const food = Math.round(base.food * group_size * days);
    const attractions = Math.round(base.attractions * group_size * days);
    const transport = Math.round(base.transport * group_size * days);
    const activities = Math.round(base.activities * group_size * days);
    const total = accommodation + food + attractions + transport + activities;
    return {
      accommodation, food, attractions, transport, activities,
      total_per_day: Math.round(total / days),
      total,
    };
  };

  const budget_breakdown = {
    budget: buildTier("budget"),
    standard: buildTier("standard"),
    luxury: buildTier("luxury"),
  };

  const safety_tips = rng.shuffle(SAFETY_TIPS_POOL).slice(0, 5);
  const travel_tips = rng.shuffle(TRAVEL_TIPS_POOL).slice(0, 5);

  const photography_spots = rng.shuffle(genDays.flatMap((d) => [...d.morning.activities, ...d.afternoon.activities, ...d.evening.activities]))
    .slice(0, 4)
    .map((a) => ({ name: a.name, best_time: a.best_time, description: `Frame it during ${a.best_time.toLowerCase()} for the best light.`, address: a.address || null }));

  const seasonByType = {
    beach: "Late spring through early autumn", mountain: "Winter for snow, summer for hiking",
    desert: "Late autumn through early spring, avoiding peak heat", nature: "Late spring to early autumn",
    night: "Year-round, evenings", city: "Spring or autumn for mild weather",
  };

  return {
    destination_info: {
      title: dest,
      country,
      description: `${dest} blends ${rng.pick(["a compact walkable core", "a mix of old and new", "distinct neighborhoods", "a relaxed pace"])} with ${rng.pick(["strong local food culture", "standout scenery", "a rich history", "an easy-to-love atmosphere"])}, making it a natural fit for a ${days}-day trip.`,
      best_time: seasonByType[destination_type] || "Spring or autumn",
      type: destination_type,
    },
    days: genDays,
    hidden_gems: hiddenGems,
    budget_breakdown,
    safety_tips,
    photography_spots,
    travel_tips,
    destination_type,
    cover_prompt: `Cinematic wide shot of ${dest}, ${destination_type} scenery, golden hour light, ultra-detailed`,
  };
}
