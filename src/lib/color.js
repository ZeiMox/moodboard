// Outils couleur : extraction de palette depuis les images (lecture des pixels,
// sans modifier les images) et harmonies chromatiques.

export const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
export const rgbToHex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
export const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const textOn = (hex) => (luminance(hex) > 150 ? '#1A1A1A' : '#FFFFFF');

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
}

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// k-means simple sur un échantillon de pixels de toutes les images.
export async function extractPalette(urls, count = 5) {
  const pixels = [];
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 48;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const imgs = await Promise.allSettled(urls.map(loadImage));
  for (const r of imgs) {
    if (r.status !== 'fulfilled') continue;
    try {
      ctx.clearRect(0, 0, 48, 48);
      ctx.drawImage(r.value, 0, 0, 48, 48);
      const d = ctx.getImageData(0, 0, 48, 48).data;
      for (let i = 0; i < d.length; i += 8) if (d[i + 3] > 200) pixels.push([d[i], d[i + 1], d[i + 2]]);
    } catch { /* image non lisible (CORS) */ }
  }
  if (pixels.length < 50) throw new Error('pas assez de pixels');

  const k = 8;
  let centers = Array.from({ length: k }, (_, i) => pixels[Math.floor((i + 0.5) * (pixels.length / k))]);
  let counts = new Array(k).fill(0);
  for (let iter = 0; iter < 10; iter++) {
    const sums = centers.map(() => [0, 0, 0]);
    counts = new Array(k).fill(0);
    for (const p of pixels) {
      let best = 0, bd = Infinity;
      centers.forEach((c, i) => { const dd = dist(p, c); if (dd < bd) { bd = dd; best = i; } });
      sums[best][0] += p[0]; sums[best][1] += p[1]; sums[best][2] += p[2]; counts[best]++;
    }
    centers = centers.map((c, i) => (counts[i] ? sums[i].map((v) => v / counts[i]) : c));
  }
  // Les couleurs les plus présentes, mais suffisamment distinctes.
  const ranked = centers.map((c, i) => ({ c, n: counts[i] })).sort((a, b) => b.n - a.n);
  const chosen = [];
  for (const { c } of ranked) {
    if (chosen.every((x) => dist(x, c) > 38)) chosen.push(c);
    if (chosen.length === count) break;
  }
  for (const { c } of ranked) { if (chosen.length >= count) break; if (!chosen.includes(c)) chosen.push(c); }
  return chosen.map((c) => rgbToHex(...c)).sort((a, b) => luminance(b) - luminance(a));
}

export function harmonies(baseHex) {
  const [h, s, l] = rgbToHsl(...hexToRgb(baseHex));
  const sat = Math.max(0.25, s);
  return [
    { name: 'Camaïeu', colors: [0.92, 0.75, 0.55, 0.38, 0.2].map((ll) => hslToHex(h, sat * 0.8, ll)) },
    { name: 'Analogue', colors: [-40, -20, 0, 20, 40].map((d, i) => hslToHex(h + d, sat, [0.8, 0.62, l, 0.45, 0.3][i])) },
    { name: 'Complémentaire', colors: [hslToHex(h, sat * 0.3, 0.94), hslToHex(h, sat, 0.7), baseHex.toUpperCase(), hslToHex(h + 180, sat, 0.45), hslToHex(h, sat * 0.6, 0.18)] },
    { name: 'Triadique', colors: [hslToHex(h, sat * 0.2, 0.95), baseHex.toUpperCase(), hslToHex(h + 120, sat, 0.55), hslToHex(h + 240, sat, 0.5), hslToHex(h, sat * 0.4, 0.15)] },
  ];
}

export function randomBase() {
  return hslToHex(Math.random() * 360, 0.35 + Math.random() * 0.4, 0.4 + Math.random() * 0.25);
}
