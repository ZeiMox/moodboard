// Mise en page automatique : rangées « justifiées » qui respectent toujours
// le ratio d'origine des images (simple redimensionnement, jamais de recadrage).

const sum = (a) => a.reduce((s, v) => s + v, 0);

function splitRows(ratios, rowCount) {
  const total = sum(ratios);
  const n = ratios.length;
  const rows = [];
  let row = [], acc = 0;
  for (let i = 0; i < n; i++) {
    row.push(i);
    acc += ratios[i];
    const rowsLeft = rowCount - rows.length - 1;
    if (rowsLeft === 0) continue;
    const target = (total / rowCount) * (rows.length + 1);
    if (acc >= target - ratios[i] / 2 || n - i - 1 === rowsLeft) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length) rows.push(row);
  return rows;
}

export function justify(ratios, rect, gap) {
  const n = ratios.length;
  if (!n) return [];
  let best = null;
  for (let r = 1; r <= n; r++) {
    const rows = splitRows(ratios, r);
    const heights = rows.map((row) => (rect.w - gap * (row.length - 1)) / sum(row.map((i) => ratios[i])));
    const s = Math.min(1, (rect.h - gap * (rows.length - 1)) / sum(heights));
    const coverage = sum(rows.map((row, k) => sum(row.map((i) => ratios[i])) * (heights[k] * s) ** 2)) / (rect.w * rect.h);
    if (!best || coverage > best.coverage) best = { rows, heights, s, coverage };
  }
  const { rows, heights, s } = best;
  const totalH = sum(heights.map((h) => h * s)) + gap * (rows.length - 1);
  const out = new Array(n);
  let y = rect.y + (rect.h - totalH) / 2;
  rows.forEach((row, k) => {
    const h = heights[k] * s;
    const rowW = sum(row.map((i) => ratios[i] * h)) + gap * (row.length - 1);
    let x = rect.x + (rect.w - rowW) / 2;
    row.forEach((i) => {
      const w = ratios[i] * h;
      out[i] = { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
      x += w + gap;
    });
    y += h + gap;
  });
  return out;
}

// Répartit les zones du board selon son orientation.
export function zones(W, H, fontCount) {
  const min = Math.min(W, H);
  const m = Math.round(min * 0.045);
  const gap = Math.round(min * 0.014);
  const titleH = Math.round(min * 0.075);
  const top = m + titleH + gap * 1.5;
  const innerH = H - top - m;
  const z = { m, gap, title: { x: m, y: m, w: W - 2 * m, h: titleH } };

  if (W >= H * 1.15) {
    const mainW = (W - 2 * m - gap * 2) * 0.64;
    const sx = m + mainW + gap * 2;
    const sw = W - m - sx;
    const palH = Math.min(sw * 0.3, innerH * 0.2);
    const fontH = innerH * 0.3;
    z.images = { x: m, y: top, w: mainW, h: innerH };
    z.palette = { x: sx, y: top, w: sw, h: palH };
    z.fonts = { x: sx, y: top + palH + gap, w: sw, h: fontH };
    z.materials = { x: sx, y: top + palH + fontH + gap * 2, w: sw, h: innerH - palH - fontH - gap * 2 };
  } else {
    const imgH = innerH * (W > H * 0.9 ? 0.52 : 0.56);
    const matH = innerH * 0.2;
    const botH = innerH - imgH - matH - gap * 2;
    const by = top + imgH + matH + gap * 2;
    const palW = (W - 2 * m - gap) * (fontCount > 1 ? 0.4 : 0.5);
    z.images = { x: m, y: top, w: W - 2 * m, h: imgH };
    z.materials = { x: m, y: top + imgH + gap, w: W - 2 * m, h: matH };
    z.palette = { x: m, y: by, w: palW, h: botH };
    z.fonts = { x: m + palW + gap, y: by, w: W - 2 * m - palW - gap, h: botH };
  }
  return z;
}

// Recalcule la position de tous les éléments existants.
export function relayout(items, W, H) {
  const imgs = items.filter((i) => i.type === 'image' && i.kind === 'image');
  const mats = items.filter((i) => i.type === 'image' && i.kind !== 'image');
  const palettes = items.filter((i) => i.type === 'palette');
  const fonts = items.filter((i) => i.type === 'font');
  const texts = items.filter((i) => i.type === 'text');
  const z = zones(W, H, fonts.length);
  const pos = new Map();

  justify(imgs.map((i) => i.ratio), z.images, z.gap).forEach((r, k) => pos.set(imgs[k].id, r));
  justify(mats.map((i) => i.ratio), z.materials, z.gap).forEach((r, k) => pos.set(mats[k].id, r));

  const stack = (list, rect, vertical) => {
    const n = list.length;
    list.forEach((it, k) => {
      if (vertical) {
        const h = (rect.h - z.gap * (n - 1)) / n;
        pos.set(it.id, { x: rect.x, y: Math.round(rect.y + k * (h + z.gap)), w: Math.round(rect.w), h: Math.round(h) });
      } else {
        const w = (rect.w - z.gap * (n - 1)) / n;
        pos.set(it.id, { x: Math.round(rect.x + k * (w + z.gap)), y: rect.y, w: Math.round(w), h: Math.round(rect.h) });
      }
    });
  };
  stack(palettes, z.palette, true);
  stack(fonts, z.fonts, false);

  // Titre à gauche, sous-titre à droite.
  texts.forEach((t, k) => {
    const r = z.title;
    if (k === 0) pos.set(t.id, { x: r.x, y: r.y, w: Math.round(r.w * 0.6), h: r.h, size: Math.round(r.h * 0.72) });
    else if (k === 1) pos.set(t.id, { x: Math.round(r.x + r.w * 0.6), y: Math.round(r.y + r.h * 0.45), w: Math.round(r.w * 0.4), h: Math.round(r.h * 0.55), size: Math.round(r.h * 0.26) });
  });

  return items.map((it) => (pos.has(it.id) ? { ...it, ...pos.get(it.id) } : it));
}
