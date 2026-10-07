export const PRESETS = [
  { id: 'a3', label: 'A3', mm: [297, 420] },
  { id: 'a4', label: 'A4', mm: [210, 297] },
  { id: 'a5', label: 'A5', mm: [148, 210] },
  { id: 'desktop', label: 'Desktop', px: [1920, 1080] },
  { id: 'laptop', label: 'Laptop', px: [1440, 900] },
  { id: 'tablet', label: 'Tablette', px: [2048, 1536] },
  { id: 'mobile', label: 'Mobile', px: [1080, 1920] },
  { id: 'square', label: 'Carré', px: [1080, 1080] },
  { id: 'banner', label: 'Bannière', px: [1500, 500] },
];

export const A_SERIES = [
  { label: 'A0', mm: [841, 1189] },
  { label: 'A1', mm: [594, 841] },
  { label: 'A2', mm: [420, 594] },
  { label: 'A3', mm: [297, 420] },
  { label: 'A4', mm: [210, 297] },
  { label: 'A5', mm: [148, 210] },
];

export const DEFAULT_FORMAT = { mode: 'preset', preset: 'a4', orientation: 'landscape', wPx: 1920, hPx: 1080, wCm: 30, hCm: 20, dpi: 150 };

const MAX_PX = 8000;
const mmToPx = (mm, dpi) => Math.round((mm / 25.4) * dpi);
const clampPx = (v) => Math.max(200, Math.min(MAX_PX, Math.round(v) || 200));

// Retourne la taille du board en pixels + sa taille physique (mm) si elle est connue.
export function computeSize(format) {
  const f = { ...DEFAULT_FORMAT, ...format };
  let wMm = null, hMm = null, W, H;
  if (f.mode === 'px') {
    W = f.wPx; H = f.hPx;
  } else if (f.mode === 'cm') {
    wMm = f.wCm * 10; hMm = f.hCm * 10;
    W = mmToPx(wMm, f.dpi); H = mmToPx(hMm, f.dpi);
  } else {
    const p = PRESETS.find((x) => x.id === f.preset) || PRESETS[1];
    if (p.mm) {
      let [a, b] = p.mm;
      if (f.orientation === 'landscape') [a, b] = [b, a];
      wMm = a; hMm = b;
      W = mmToPx(a, f.dpi); H = mmToPx(b, f.dpi);
    } else {
      [W, H] = p.px;
    }
  }
  W = clampPx(W); H = clampPx(H);
  return { W, H, mm: wMm ? [wMm, hMm] : null };
}

export function describeFormat(format) {
  const f = { ...DEFAULT_FORMAT, ...format };
  const { W, H } = computeSize(f);
  if (f.mode === 'px') return `${W} × ${H} px`;
  if (f.mode === 'cm') return `${f.wCm} × ${f.hCm} cm · ${f.dpi} dpi`;
  const p = PRESETS.find((x) => x.id === f.preset);
  if (p?.mm) return `${p.label} ${f.orientation === 'landscape' ? 'paysage' : 'portrait'} · ${W} × ${H} px`;
  return `${p?.label} · ${W} × ${H} px`;
}

// Taille de page PDF déterminée automatiquement :
// – board défini physiquement (A3/A4/A5 ou cm) → page à la taille exacte ;
// – board en pixels → format A le plus proche (à 150 dpi), même orientation.
export function pdfPageFor(format) {
  const { W, H, mm } = computeSize(format);
  if (mm) return { wMm: mm[0], hMm: mm[1], label: `${Math.round(mm[0])} × ${Math.round(mm[1])} mm (taille du board)` };
  const landscape = W > H;
  const physW = (W / 150) * 25.4, physH = (H / 150) * 25.4;
  let best = A_SERIES[4], bestScore = Infinity;
  for (const a of A_SERIES) {
    const [pw, ph] = landscape ? [a.mm[1], a.mm[0]] : a.mm;
    const score = Math.abs(Math.log((pw * ph) / (physW * physH)));
    if (score < bestScore) { bestScore = score; best = { ...a, mm: [pw, ph] }; }
  }
  return { wMm: best.mm[0], hMm: best.mm[1], label: `${best.label} ${landscape ? 'paysage' : 'portrait'} (${best.mm[0]} × ${best.mm[1]} mm)`, fit: true };
}
