// Sélection de Google Fonts (libres, licence OFL / Apache) avec des tags
// d'univers. `role` indique l'usage conseillé : titre (display) ou texte (body).

export const FONTS = [
  { family: 'Playfair Display', cat: 'serif', role: 'display', tags: ['didone', 'luxe', 'serif', 'deco'] },
  { family: 'Bodoni Moda', cat: 'serif', role: 'display', tags: ['didone', 'luxe'] },
  { family: 'DM Serif Display', cat: 'serif', role: 'display', tags: ['didone', 'display', 'vintage'] },
  { family: 'Cormorant Garamond', cat: 'serif', role: 'both', tags: ['serif-light', 'luxe', 'romantic', 'serif'] },
  { family: 'EB Garamond', cat: 'serif', role: 'body', tags: ['serif', 'vintage', 'serif-light'] },
  { family: 'Libre Baskerville', cat: 'serif', role: 'body', tags: ['serif', 'vintage'] },
  { family: 'Lora', cat: 'serif', role: 'body', tags: ['serif-soft', 'organic', 'serif'] },
  { family: 'Fraunces', cat: 'serif', role: 'display', tags: ['serif-soft', 'retro', 'boho', 'organic'] },
  { family: 'Spectral', cat: 'serif', role: 'body', tags: ['serif-light', 'minimal'] },
  { family: 'Cinzel', cat: 'serif', role: 'display', tags: ['deco', 'luxe'] },
  { family: 'Abril Fatface', cat: 'serif', role: 'display', tags: ['retro', 'didone', 'pop'] },
  { family: 'Yeseva One', cat: 'serif', role: 'display', tags: ['romantic', 'display'] },
  { family: 'Shippori Mincho', cat: 'serif', role: 'both', tags: ['japanese', 'serif-light', 'minimal'] },
  { family: 'Inter', cat: 'sans-serif', role: 'body', tags: ['sans', 'minimal', 'tech'] },
  { family: 'Manrope', cat: 'sans-serif', role: 'body', tags: ['sans', 'geometric', 'minimal'] },
  { family: 'Montserrat', cat: 'sans-serif', role: 'both', tags: ['geometric', 'sans', 'urban'] },
  { family: 'Poppins', cat: 'sans-serif', role: 'both', tags: ['geometric', 'rounded', 'pop'] },
  { family: 'Jost', cat: 'sans-serif', role: 'both', tags: ['geometric', 'minimal', 'sans'] },
  { family: 'Raleway', cat: 'sans-serif', role: 'both', tags: ['geometric', 'luxe', 'serif-light'] },
  { family: 'Josefin Sans', cat: 'sans-serif', role: 'display', tags: ['geometric', 'deco', 'vintage'] },
  { family: 'Work Sans', cat: 'sans-serif', role: 'body', tags: ['grotesk', 'sans'] },
  { family: 'Space Grotesk', cat: 'sans-serif', role: 'both', tags: ['grotesk', 'tech', 'y2k'] },
  { family: 'Archivo', cat: 'sans-serif', role: 'body', tags: ['grotesk', 'industrial'] },
  { family: 'Archivo Black', cat: 'sans-serif', role: 'display', tags: ['grotesk', 'brutal', 'display'] },
  { family: 'Oswald', cat: 'sans-serif', role: 'display', tags: ['condensed', 'industrial', 'urban'] },
  { family: 'Bebas Neue', cat: 'sans-serif', role: 'display', tags: ['condensed', 'industrial', 'display'] },
  { family: 'Barlow Condensed', cat: 'sans-serif', role: 'display', tags: ['condensed', 'urban'] },
  { family: 'Nunito', cat: 'sans-serif', role: 'body', tags: ['rounded', 'humanist'] },
  { family: 'Quicksand', cat: 'sans-serif', role: 'both', tags: ['rounded', 'romantic', 'minimal'] },
  { family: 'Karla', cat: 'sans-serif', role: 'body', tags: ['humanist', 'organic'] },
  { family: 'Source Sans 3', cat: 'sans-serif', role: 'body', tags: ['humanist', 'sans'] },
  { family: 'Figtree', cat: 'sans-serif', role: 'body', tags: ['humanist', 'sans'] },
  { family: 'Outfit', cat: 'sans-serif', role: 'both', tags: ['geometric', 'tech'] },
  { family: 'Syne', cat: 'sans-serif', role: 'display', tags: ['tech', 'y2k', 'display'] },
  { family: 'Unbounded', cat: 'sans-serif', role: 'display', tags: ['y2k', 'tech', 'rounded'] },
  { family: 'Zen Kaku Gothic New', cat: 'sans-serif', role: 'body', tags: ['japanese', 'minimal', 'sans'] },
  { family: 'Space Mono', cat: 'monospace', role: 'both', tags: ['mono', 'brutal', 'y2k'] },
  { family: 'IBM Plex Mono', cat: 'monospace', role: 'body', tags: ['mono', 'industrial', 'tech'] },
  { family: 'Rubik Mono One', cat: 'sans-serif', role: 'display', tags: ['brutal', 'display', 'pop'] },
  { family: 'Righteous', cat: 'display', role: 'display', tags: ['retro', 'rounded'] },
  { family: 'Shrikhand', cat: 'display', role: 'display', tags: ['retro', 'pop'] },
  { family: 'Bungee', cat: 'display', role: 'display', tags: ['display', 'urban', 'pop'] },
  { family: 'Monoton', cat: 'display', role: 'display', tags: ['deco', 'y2k', 'retro'] },
  { family: 'Poiret One', cat: 'display', role: 'display', tags: ['deco', 'serif-light', 'luxe'] },
  { family: 'Limelight', cat: 'display', role: 'display', tags: ['deco', 'vintage'] },
  { family: 'Orbitron', cat: 'sans-serif', role: 'display', tags: ['tech', 'y2k'] },
  { family: 'Great Vibes', cat: 'handwriting', role: 'display', tags: ['script', 'luxe', 'romantic'] },
  { family: 'Dancing Script', cat: 'handwriting', role: 'display', tags: ['script', 'romantic'] },
  { family: 'Pacifico', cat: 'handwriting', role: 'display', tags: ['script', 'retro', 'pop'] },
  { family: 'Caveat', cat: 'handwriting', role: 'display', tags: ['handwritten', 'boho', 'organic'] },
  { family: 'Amatic SC', cat: 'handwriting', role: 'display', tags: ['handwritten', 'boho'] },
];

const loaded = new Set();

// Charge une ou plusieurs familles depuis Google Fonts (une seule requête).
export function loadFonts(families) {
  const missing = [...new Set(families)].filter((f) => f && !loaded.has(f));
  if (!missing.length) return;
  missing.forEach((f) => loaded.add(f));
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = googleFontsUrl(missing);
  document.head.appendChild(link);
}

export function googleFontsUrl(families) {
  const q = families.map((f) => 'family=' + encodeURIComponent(f).replace(/%20/g, '+')).join('&');
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}

export function fontStack(family) {
  const f = FONTS.find((x) => x.family === family);
  const fallback = f?.cat === 'serif' ? 'serif' : f?.cat === 'monospace' ? 'monospace' : f?.cat === 'handwriting' ? 'cursive' : 'sans-serif';
  return `"${family}", ${fallback}`;
}

// Classe les typos selon les tags du brief.
export function rankFonts(tags, role) {
  return FONTS.map((f) => {
    let score = 0;
    tags.forEach((t, i) => { if (f.tags.includes(t)) score += 3 - Math.min(2, i * 0.3); });
    if (role && (f.role === role || f.role === 'both')) score += 1.5;
    if (role && f.role !== role && f.role !== 'both') score -= 2;
    return { ...f, score };
  }).sort((a, b) => b.score - a.score);
}
