// Recherche d'images libres de droits sur Openverse (agrégateur CC / domaine public)
// et Wikimedia Commons. Les images sont utilisées telles quelles (aucune retouche),
// et tout contenu signalé comme généré par IA est écarté.

const AI_RE = /(\bai[\s_-]?(generated|art|image|created)\b|generated (by|with) ai|midjourney|stable[\s_-]?diffusion|\bsdxl\b|dall[\s·_-]?e|dreamstudio|craiyon|leonardo\.?ai|adobe firefly|text[\s_-]to[\s_-]image|generative ai|\bgenai\b|novelai|nightcafe|artbreeder|deepdream|généré par (l')?ia|image ia\b)/i;
// Logos, cartes, scans de livres, photos d'archives de rue… peu utiles dans un moodboard.
const NOISE_RE = /\b(logo|icon|map|diagram|chart|graph|screenshot|flag|coat of arms|signature|svg|geograph\.org|dpla|page \d+)\b|\(\d{4}\) \(\d{9,}\)/i;

const cache = new Map();

function isClean(...texts) {
  const t = texts.filter(Boolean).join(' ');
  return !AI_RE.test(t) && !NOISE_RE.test(t);
}

const stripHtml = (s) => (s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

async function openverse(q, { page, strict }) {
  const params = new URLSearchParams({
    q, page: String(page), page_size: '20', mature: 'false',
    license: strict ? 'cc0,pdm' : 'cc0,pdm,by,by-sa',
  });
  const res = await fetch(`https://api.openverse.org/v1/images/?${params}`);
  if (res.status === 429) throw new Error('quota');
  if (!res.ok) throw new Error('openverse ' + res.status);
  const data = await res.json();
  return (data.results || [])
    .filter((r) => r.width && r.height && r.width >= 400 && r.height >= 300)
    .filter((r) => isClean(r.title, (r.tags || []).map((t) => t.name).join(' '), r.creator))
    .map((r) => ({
      id: 'ov-' + r.id,
      src: r.url,
      thumb: r.thumbnail,
      width: r.width,
      height: r.height,
      title: r.title || 'Sans titre',
      creator: r.creator || 'Inconnu',
      license: r.license === 'pdm' ? 'Domaine public' : `CC ${r.license.toUpperCase()} ${r.license_version || ''}`.trim(),
      licenseUrl: r.license_url,
      landing: r.foreign_landing_url,
      provider: `${r.source || r.provider} via Openverse`,
    }));
}

async function wikimedia(q, { page, strict }) {
  const params = new URLSearchParams({
    action: 'query', format: 'json', origin: '*',
    // intitle: rend la recherche Commons beaucoup plus pertinente.
    generator: 'search', gsrsearch: `${q.split(/\s+/).map((w) => `intitle:${w}`).join(' ')} filetype:bitmap`, gsrnamespace: '6',
    gsrlimit: '20', gsroffset: String((page - 1) * 20),
    prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '960',
    iiextmetadatafilter: 'LicenseShortName|LicenseUrl|Artist|Categories|ObjectName',
  });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
  if (!res.ok) throw new Error('wikimedia ' + res.status);
  const data = await res.json();
  const pages = Object.values(data?.query?.pages || {}).sort((a, b) => a.index - b.index);
  return pages
    .map((p) => ({ p, info: p.imageinfo?.[0] }))
    .filter(({ info }) => info && /image\/(jpeg|png|webp)/.test(info.mime) && info.width >= 400 && info.height >= 300)
    .filter(({ p, info }) => {
      const m = info.extmetadata || {};
      const lic = m.LicenseShortName?.value || '';
      const okLicense = strict ? /public domain|cc0|^pd/i.test(lic) : /public domain|cc0|^pd|cc[ -]by/i.test(lic);
      return okLicense && !/\bnc\b|\bnd\b/i.test(lic) && isClean(p.title, m.Categories?.value, m.ObjectName?.value);
    })
    .map(({ p, info }) => {
      const m = info.extmetadata || {};
      return {
        id: 'wm-' + p.pageid,
        src: info.thumburl || info.url,
        thumb: info.thumburl || info.url,
        width: info.width,
        height: info.height,
        title: stripHtml(m.ObjectName?.value) || p.title.replace(/^File:/, '').replace(/\.\w+$/, ''),
        creator: stripHtml(m.Artist?.value) || 'Inconnu',
        license: m.LicenseShortName?.value || 'Domaine public',
        licenseUrl: m.LicenseUrl?.value || info.descriptionurl,
        landing: info.descriptionurl,
        provider: 'Wikimedia Commons',
      };
    });
}

function interleave(a, b) {
  const out = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i]) out.push(a[i]);
    if (b[i]) out.push(b[i]);
  }
  return out;
}

export let lastSearchWarning = '';

// Recherche sur les deux sources en parallèle ; renvoie une liste fusionnée et dédoublonnée.
export async function searchImages(q, { page = 1, strict = true } = {}) {
  const key = `${q}|${page}|${strict}`;
  if (cache.has(key)) return cache.get(key);
  const [ov, wm] = await Promise.allSettled([openverse(q, { page, strict }), wikimedia(q, { page, strict })]);
  lastSearchWarning = ov.status === 'rejected' && ov.reason?.message === 'quota'
    ? 'Quota Openverse atteint pour le moment : résultats Wikimedia uniquement.'
    : '';
  const seen = new Set();
  const results = interleave(ov.value || [], wm.value || []).filter((r) => {
    const k = r.title.toLowerCase();
    if (seen.has(r.id) || seen.has(k)) return false;
    seen.add(r.id); seen.add(k);
    return true;
  });
  if (ov.status === 'rejected' && wm.status === 'rejected') throw new Error('Recherche impossible (réseau ?)');
  cache.set(key, results);
  return results;
}

// Essaie les requêtes dans l'ordre jusqu'à obtenir assez de résultats.
export async function searchUntil(queries, needed, opts) {
  const all = [];
  const ids = new Set();
  let used = queries[0];
  for (const q of queries) {
    if (!q) continue;
    try {
      const res = await searchImages(q, opts);
      if (!all.length) used = q;
      res.forEach((r) => { if (!ids.has(r.id)) { ids.add(r.id); all.push(r); } });
    } catch { /* on passe à la requête suivante */ }
    if (all.length >= needed) break;
  }
  return { query: used, results: all };
}
