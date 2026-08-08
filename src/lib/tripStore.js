// Local persistence for Trip records — stands in for the base44 Trip entity.
const STORAGE_KEY = "travelai_trips";

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(trips) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

function makeId() {
  return (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

export const TripStore = {
  create(data) {
    const trip = {
      id: makeId(),
      created_date: new Date().toISOString(),
      status: "planning",
      cover_image_url: "",
      ...data,
    };
    const all = readAll();
    all.push(trip);
    writeAll(all);
    return trip;
  },
  update(id, patch) {
    const all = readAll();
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...patch };
    writeAll(all);
    return all[idx];
  },
  get(id) {
    return readAll().find((t) => t.id === id) || null;
  },
  list() {
    return readAll().sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  },
};
