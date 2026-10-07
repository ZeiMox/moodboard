import { CONTEXTS, STYLES, MOODS, translateKeywords } from '../data/vocab.js';
import { rankFonts, loadFonts } from '../data/fonts.js';
import { computeSize } from '../data/formats.js';
import { searchImages } from './sources.js';
import { extractPalette, luminance } from './color.js';
import { relayout } from './layout.js';

export const uid = () => Math.random().toString(36).slice(2, 10);
const uniq = (a) => [...new Set(a.filter(Boolean).map((s) => s.trim()))];

export function briefParts(brief) {
  const contexts = CONTEXTS.filter((c) => brief.contexts.includes(c.id));
  const styles = STYLES.filter((s) => brief.styles.includes(s.id));
  const moods = MOODS.filter((m) => brief.moods.includes(m.id));
  return { contexts, styles, moods };
}

// Construit les requêtes de recherche (en anglais) à partir du brief.
export function buildQueries(brief) {
  const { contexts, styles, moods } = briefParts(brief);
  const subjects = uniq([...translateKeywords(brief.keywords), ...contexts.map((c) => c.en[0]), ...contexts.map((c) => c.en[1])]);
  const st = styles.map((s) => s.en[0]);
  const md = moods.map((m) => m.en[0]);
  const s0 = subjects[0], s1 = subjects[1] || subjects[0];
  const images = uniq([
    s0 && st[0] && `${s0} ${st[0]}`,
    s1 && md[0] && `${s1} ${md[0]}`,
    st[0] && md[0] && `${st[0]} ${md[0]}`,
    s0, s1, st[1] && `${s0 || ''} ${st[1]}`, subjects[2], st[0], md[0], md[1], 'still life',
  ]);
  const textures = uniq([...styles.flatMap((s) => s.textures), ...moods.flatMap((m) => m.textures), 'paper texture']);
  const patterns = uniq([...styles.flatMap((s) => s.patterns), 'ornament pattern', 'textile pattern']);
  const fontTags = uniq([...styles.flatMap((s) => s.fonts), ...moods.flatMap((m) => m.fonts)]);
  const fallbackPalette = (styles[0] || moods[0] || STYLES[0]).palette;
  return { images, textures, patterns, fontTags, fallbackPalette };
}

// Interroge plusieurs requêtes et mélange les résultats pour varier le board.
export async function gather(queries, needed, opts, parallel = 2) {
  const lists = [];
  let i = 0;
  while (i < queries.length && lists.flat().length < needed) {
    const batch = queries.slice(i, i + parallel);
    const res = await Promise.allSettled(batch.map((q) => searchImages(q, opts)));
    res.forEach((r) => r.status === 'fulfilled' && lists.push(r.value));
    i += parallel;
  }
  const out = [], ids = new Set();
  for (let k = 0; k < Math.max(0, ...lists.map((l) => l.length)); k++) {
    lists.forEach((l) => { if (l[k] && !ids.has(l[k].id)) { ids.add(l[k].id); out.push(l[k]); } });
  }
  return out;
}

export function imageItem(r, kind) {
  return {
    id: uid(), type: 'image', kind, x: 0, y: 0, w: r.width, h: r.height, z: 0,
    ratio: r.width / r.height, src: r.src, thumb: r.thumb, useThumb: false,
    meta: { title: r.title, creator: r.creator, license: r.license, licenseUrl: r.licenseUrl, landing: r.landing, provider: r.provider, sourceId: r.id },
  };
}

export async function generateBoard(brief, format, onStep = () => {}, page = 1) {
  const { W, H } = computeSize(format);
  const q = buildQueries(brief);
  const opts = { strict: brief.strict, page };
  const imageCount = W * H > 3.5e6 ? 9 : 8;

  onStep('Recherche des images…');
  const images = await gather(q.images, imageCount + 6, opts);
  if (images.length < 3) throw new Error('Trop peu d’images trouvées. Essayez d’autres mots-clés ou élargissez les licences.');

  onStep('Recherche des textures et motifs…');
  const [textures, patterns] = await Promise.all([gather(q.textures, 4, opts, 1), gather(q.patterns, 4, opts, 1)]);

  const chosen = images.slice(0, imageCount);
  const used = new Set(chosen.map((r) => r.id));
  const tex = textures.filter((r) => !used.has(r.id)).slice(0, 2);
  tex.forEach((r) => used.add(r.id));
  const pat = patterns.filter((r) => !used.has(r.id)).slice(0, 2);

  onStep('Extraction de la palette…');
  let colors = q.fallbackPalette;
  let paletteFallback = true;
  try {
    colors = await Promise.race([
      extractPalette(chosen.map((r) => r.thumb), 5),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000)),
    ]);
    paletteFallback = false;
  } catch { /* palette du style en attendant ; l'extraction est relancée en arrière-plan */ }

  onStep('Choix des typographies…');
  const display = rankFonts(q.fontTags, 'display')[0];
  const body = rankFonts(q.fontTags, 'body').find((f) => f.family !== display.family && f.cat !== display.cat)
    || rankFonts(q.fontTags, 'body').find((f) => f.family !== display.family);
  loadFonts([display.family, body.family]);

  const sorted = [...colors].sort((a, b) => luminance(b) - luminance(a));
  const bg = luminance(sorted[0]) > 228 ? sorted[0] : '#FFFFFF';
  const ink = luminance(sorted[sorted.length - 1]) < 90 ? sorted[sorted.length - 1] : '#1A1A1A';
  const { styles, moods } = briefParts(brief);

  const items = [
    ...chosen.map((r) => imageItem(r, 'image')),
    ...tex.map((r) => imageItem(r, 'texture')),
    ...pat.map((r) => imageItem(r, 'pattern')),
    { id: uid(), type: 'palette', colors, x: 0, y: 0, w: 100, h: 100, z: 0 },
    { id: uid(), type: 'font', family: display.family, role: 'Titres', x: 0, y: 0, w: 100, h: 100, z: 0 },
    { id: uid(), type: 'font', family: body.family, role: 'Texte courant', x: 0, y: 0, w: 100, h: 100, z: 0 },
    { id: uid(), type: 'text', text: brief.title || 'Moodboard', family: display.family, color: ink, align: 'left', x: 0, y: 0, w: 100, h: 100, size: 40, z: 0 },
    { id: uid(), type: 'text', text: [...styles, ...moods].map((x) => x.label).join(' · ') || ' ', family: body.family, color: ink, align: 'right', x: 0, y: 0, w: 100, h: 100, size: 20, z: 0 },
  ].map((it, i) => ({ ...it, z: i }));

  return {
    items: relayout(items, W, H),
    bg,
    pools: {
      image: { query: q.images[0], results: images, page },
      texture: { query: q.textures[0], results: textures, page },
      pattern: { query: q.patterns[0], results: patterns, page },
    },
    fontTags: q.fontTags,
    page,
    paletteFallback,
  };
}
