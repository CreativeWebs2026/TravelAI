// Real place names + addresses via OpenStreetMap (Nominatim + Overpass) — free,
// no API key. Runs from the browser; both services allow CORS for light use.
// Any failure here (network, rate limit, timeout) should be caught by the
// caller and treated as "no real data available" — the app must still work.

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

export async function geocodeDestination(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(query)}`;
  const res = await withTimeout(fetch(url, { headers: { "Accept-Language": "en" } }), 8000);
  if (!res.ok) throw new Error(`geocode failed: ${res.status}`);
  const data = await res.json();
  if (!data.length) throw new Error("no geocode results");
  const r = data[0];
  return {
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    displayName: r.display_name,
    country: r.address?.country || null,
    city: r.address?.city || r.address?.town || r.address?.village || r.address?.county || null,
    osmType: r.type,
    osmClass: r.class,
  };
}

function buildAddress(tags) {
  const parts = [];
  if (tags["addr:street"]) {
    parts.push(tags["addr:housenumber"] ? `${tags["addr:street"]} ${tags["addr:housenumber"]}` : tags["addr:street"]);
  } else if (tags["addr:place"]) {
    parts.push(tags["addr:place"]);
  }
  if (tags["addr:city"]) parts.push(tags["addr:city"]);
  else if (tags["addr:suburb"]) parts.push(tags["addr:suburb"]);
  return parts.length ? parts.join(", ") : null;
}

function mapOsmCategory(tags) {
  if (tags.tourism === "museum" || tags.tourism === "gallery") return "museums";
  if (tags.tourism === "viewpoint") return "photography";
  if (tags.tourism === "attraction" || tags.tourism === "artwork") return "culture";
  if (tags.tourism === "zoo" || tags.tourism === "theme_park") return "adventure";
  if (tags.historic) return "history";
  if (tags.leisure === "park" || tags.leisure === "garden" || tags.leisure === "nature_reserve") return "nature";
  if (tags.natural === "beach") return "nature";
  if (tags.shop === "mall") return "shopping";
  if (tags.amenity === "marketplace") return "food";
  if (tags.amenity === "nightclub" || tags.amenity === "bar" || tags.amenity === "pub") return "nightlife";
  return null;
}

export async function fetchNearbyPlaces(lat, lon) {
  const query = `[out:json][timeout:25];(
    node["tourism"~"attraction|museum|gallery|viewpoint|zoo|theme_park|artwork"](around:5000,${lat},${lon});
    way["tourism"~"attraction|museum|gallery|viewpoint|zoo|theme_park"](around:5000,${lat},${lon});
    node["historic"](around:5000,${lat},${lon});
    node["leisure"~"park|garden|nature_reserve"](around:5000,${lat},${lon});
    node["amenity"~"restaurant|cafe|bar|pub|nightclub|marketplace"](around:3500,${lat},${lon});
    node["shop"="mall"](around:5000,${lat},${lon});
    node["natural"="beach"](around:8000,${lat},${lon});
  );out center tags 300;`;

  const res = await withTimeout(
    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "data=" + encodeURIComponent(query),
    }),
    15000
  );
  if (!res.ok) throw new Error(`overpass failed: ${res.status}`);
  const data = await res.json();

  return (data.elements || [])
    .filter((el) => el.tags && el.tags.name)
    .map((el) => ({
      id: `${el.type}/${el.id}`,
      name: el.tags["name:en"] || el.tags.name,
      tags: el.tags,
      address: buildAddress(el.tags),
    }));
}

export function buildPlacePools(places) {
  const byCategory = {};
  const restaurants = [];
  const viewpoints = [];
  const hiddenCandidates = [];

  for (const place of places) {
    const t = place.tags;
    if (t.amenity === "restaurant" || t.amenity === "cafe") {
      restaurants.push(place);
      continue;
    }
    const cat = mapOsmCategory(t);
    if (!cat) continue;
    (byCategory[cat] ||= []).push(place);
    if (cat === "photography") viewpoints.push(place);
    if (!t.wikipedia && !t.wikidata) hiddenCandidates.push(place);
  }

  return { byCategory, restaurants, viewpoints, hiddenCandidates };
}
