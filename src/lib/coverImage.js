// Resolves a cover photo without any API key — stands in for base44's GenerateImage.
// LoremFlickr serves real, theme-matched stock photography and supports a `lock`
// seed so the same destination always gets the same image.

const KEYWORDS_BY_TYPE = {
  beach: "beach,ocean,tropical",
  mountain: "mountains,alps,landscape",
  nature: "nature,landscape,wilderness",
  desert: "desert,dunes,sand",
  night: "city,night,lights",
  city: "cityscape,skyline,urban",
};

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

export async function resolveCoverImage(destination, destinationType) {
  const keywords = KEYWORDS_BY_TYPE[destinationType] || "travel,landscape,scenic";
  const seed = hashString(destination) % 100000;
  const url = `https://loremflickr.com/1200/800/${encodeURIComponent(keywords)}?lock=${seed}`;
  return { url };
}
