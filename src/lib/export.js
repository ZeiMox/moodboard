import { jsPDF } from 'jspdf';
import { fontStack, googleFontsUrl } from '../data/fonts.js';
import { pdfPageFor } from '../data/formats.js';
import { textOn } from './color.js';

// ---- Géométrie partagée entre l'affichage (DOM) et l'export ----------------
export function paletteSpec(it) {
  const n = it.colors.length;
  const sw = it.w / n;
  return { sw, fs: Math.max(8, Math.min(it.h * 0.085, sw * 0.16)) };
}

export function fontSpec(it) {
  const pad = Math.min(it.w, it.h) * 0.08;
  return {
    pad,
    role: Math.max(7, it.h * 0.06),
    name: Math.max(8, it.h * 0.08),
    big: Math.min(it.h * 0.4, it.w * 0.32),
    sample: Math.max(7, Math.min(it.h * 0.07, it.w * 0.055)),
    bigTop: it.h * 0.32,
  };
}

export const SAMPLE = 'Le vif zéphyr jubile sur les kumquats du clown gracieux.';
const UI_FONT = 'Inter, system-ui, sans-serif';

// ---- Chargement des images (CORS) ------------------------------------------
function loadImg(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadItemImage(it) {
  const order = it.useThumb ? [it.thumb, it.src] : [it.src, it.thumb];
  for (const u of order) {
    try { return { img: await loadImg(u), url: u }; } catch { /* suivante */ }
  }
  return null;
}

async function ensureFonts(items) {
  const fams = [...new Set(items.filter((i) => i.family).map((i) => i.family))];
  await Promise.allSettled(fams.map((f) => document.fonts.load(`40px "${f}"`)));
  await Promise.allSettled([document.fonts.load('600 20px Inter'), document.fonts.load('400 20px Inter')]);
}

function wrapLines(ctx, text, maxW) {
  const lines = [];
  for (const para of String(text).split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; } else line = test;
    }
    lines.push(line);
  }
  return lines;
}

function ellipsis(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
  return t + '…';
}

// ---- Rendu canvas (PNG / JPG / PDF) ----------------------------------------
export async function renderCanvas(project, scale = 1) {
  const { W, H, items, bg } = project;
  await ensureFonts(items);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'top';

  const sorted = [...items].sort((a, b) => a.z - b.z);
  const loaded = await Promise.all(sorted.map((it) => (it.type === 'image' ? loadItemImage(it) : null)));

  sorted.forEach((it, idx) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(it.x, it.y, it.w, it.h);
    ctx.clip();
    if (it.type === 'image') {
      if (loaded[idx]) ctx.drawImage(loaded[idx].img, it.x, it.y, it.w, it.h);
    } else if (it.type === 'palette') {
      const { sw, fs } = paletteSpec(it);
      it.colors.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(it.x + i * sw, it.y, Math.ceil(sw), it.h);
        ctx.fillStyle = textOn(c);
        ctx.font = `500 ${fs}px ${UI_FONT}`;
        ctx.fillText(c.toUpperCase(), it.x + i * sw + fs * 0.7, it.y + it.h - fs * 1.8);
      });
    } else if (it.type === 'font') {
      const s = fontSpec(it);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(it.x, it.y, it.w, it.h);
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = Math.max(1, it.h * 0.004);
      ctx.strokeRect(it.x, it.y, it.w, it.h);
      const x = it.x + s.pad, maxW = it.w - s.pad * 2;
      ctx.fillStyle = '#8A8A8A';
      ctx.font = `500 ${s.role}px ${UI_FONT}`;
      ctx.fillText(ellipsis(ctx, it.role.toUpperCase(), maxW), x, it.y + s.pad);
      ctx.fillStyle = '#1A1A1A';
      ctx.font = `600 ${s.name}px ${UI_FONT}`;
      ctx.fillText(ellipsis(ctx, it.family, maxW), x, it.y + s.pad + s.role * 1.6);
      ctx.font = `${s.big}px ${fontStack(it.family)}`;
      ctx.fillText('Aa', x, it.y + s.bigTop);
      ctx.fillStyle = '#444444';
      ctx.font = `${s.sample}px ${fontStack(it.family)}`;
      ctx.fillText(ellipsis(ctx, SAMPLE, maxW), x, it.y + it.h - s.pad - s.sample * 1.2);
    } else if (it.type === 'text') {
      ctx.fillStyle = it.color;
      ctx.font = `${it.size}px ${fontStack(it.family)}`;
      ctx.textAlign = it.align;
      const tx = it.align === 'right' ? it.x + it.w : it.align === 'center' ? it.x + it.w / 2 : it.x;
      wrapLines(ctx, it.text, it.w).forEach((line, i) => ctx.fillText(line, tx, it.y + i * it.size * 1.15 + it.size * 0.05));
    }
    ctx.restore();
  });
  return canvas;
}

export function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const toBlob = (canvas, type, q) => new Promise((res) => canvas.toBlob(res, type, q));

export async function exportRaster(project, type, quality = 0.92) {
  const canvas = await renderCanvas(project, 1);
  const blob = await toBlob(canvas, type === 'jpg' ? 'image/jpeg' : 'image/png', quality);
  download(blob, `${slug(project.name)}.${type}`);
}

// ---- SVG (vectoriel ; images intégrées sans ré-encodage) -------------------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function toDataUrl(it) {
  const order = it.useThumb ? [it.thumb, it.src] : [it.src, it.thumb];
  for (const u of order) {
    try {
      const res = await fetch(u, { mode: 'cors' });
      if (!res.ok) continue;
      const blob = await res.blob();
      return await new Promise((resolve) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.readAsDataURL(blob); });
    } catch { /* suivante */ }
  }
  return null;
}

export async function exportSvg(project) {
  const { W, H, items, bg } = project;
  await ensureFonts(items);
  const measure = document.createElement('canvas').getContext('2d');
  const sorted = [...items].sort((a, b) => a.z - b.z);
  const fams = [...new Set(items.filter((i) => i.family).map((i) => i.family)), 'Inter'];
  const parts = [];
  let clipId = 0;
  for (const it of sorted) {
    const cid = `c${clipId++}`;
    parts.push(`<clipPath id="${cid}"><rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}"/></clipPath><g clip-path="url(#${cid})">`);
    if (it.type === 'image') {
      const data = await toDataUrl(it);
      if (data) parts.push(`<image href="${data}" x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" preserveAspectRatio="none"><title>${esc(it.meta.title)} — ${esc(it.meta.creator)} (${esc(it.meta.license)})</title></image>`);
    } else if (it.type === 'palette') {
      const { sw, fs } = paletteSpec(it);
      it.colors.forEach((c, i) => {
        parts.push(`<rect x="${it.x + i * sw}" y="${it.y}" width="${Math.ceil(sw)}" height="${it.h}" fill="${c}"/>`);
        parts.push(`<text x="${it.x + i * sw + fs * 0.7}" y="${it.y + it.h - fs * 1.8}" dominant-baseline="hanging" font-family="Inter, sans-serif" font-weight="500" font-size="${fs}" fill="${textOn(c)}">${c.toUpperCase()}</text>`);
      });
    } else if (it.type === 'font') {
      const s = fontSpec(it);
      const x = it.x + s.pad, maxW = it.w - s.pad * 2;
      measure.font = `${s.sample}px ${fontStack(it.family)}`;
      const sample = ellipsis(measure, SAMPLE, maxW);
      parts.push(`<rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" fill="#FFFFFF" stroke="rgba(0,0,0,0.1)"/>`);
      parts.push(`<text x="${x}" y="${it.y + s.pad}" dominant-baseline="hanging" font-family="Inter, sans-serif" font-weight="500" font-size="${s.role}" fill="#8A8A8A">${esc(it.role.toUpperCase())}</text>`);
      parts.push(`<text x="${x}" y="${it.y + s.pad + s.role * 1.6}" dominant-baseline="hanging" font-family="Inter, sans-serif" font-weight="600" font-size="${s.name}" fill="#1A1A1A">${esc(it.family)}</text>`);
      parts.push(`<text x="${x}" y="${it.y + s.bigTop}" dominant-baseline="hanging" font-family="${esc(fontStack(it.family))}" font-size="${s.big}" fill="#1A1A1A">Aa</text>`);
      parts.push(`<text x="${x}" y="${it.y + it.h - s.pad - s.sample * 1.2}" dominant-baseline="hanging" font-family="${esc(fontStack(it.family))}" font-size="${s.sample}" fill="#444444">${esc(sample)}</text>`);
    } else if (it.type === 'text') {
      measure.font = `${it.size}px ${fontStack(it.family)}`;
      const anchor = it.align === 'right' ? 'end' : it.align === 'center' ? 'middle' : 'start';
      const tx = it.align === 'right' ? it.x + it.w : it.align === 'center' ? it.x + it.w / 2 : it.x;
      wrapLines(measure, it.text, it.w).forEach((line, i) => {
        parts.push(`<text x="${tx}" y="${it.y + i * it.size * 1.15 + it.size * 0.05}" dominant-baseline="hanging" text-anchor="${anchor}" font-family="${esc(fontStack(it.family))}" font-size="${it.size}" fill="${it.color}">${esc(line)}</text>`);
      });
    }
    parts.push('</g>');
  }
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><style>@import url('${googleFontsUrl(fams).replace(/&/g, '&amp;')}');</style></defs>
<rect width="${W}" height="${H}" fill="${bg}"/>
${parts.join('\n')}
</svg>`;
  download(new Blob([svg], { type: 'image/svg+xml' }), `${slug(project.name)}.svg`);
}

// ---- PDF : taille de page déterminée automatiquement -----------------------
export async function exportPdf(project, format, { credits = true } = {}) {
  const page = pdfPageFor(format);
  const { W, H } = project;
  const targetPx = (page.wMm / 25.4) * 200; // ~200 dpi sur la page
  const scale = Math.max(0.5, Math.min(3, targetPx / W, Math.sqrt(60e6 / (W * H))));
  const canvas = await renderCanvas(project, scale);
  const pdf = new jsPDF({ orientation: page.wMm > page.hMm ? 'l' : 'p', unit: 'mm', format: [page.wMm, page.hMm], compress: true });
  let iw = page.wMm, ih = page.hMm, x = 0, y = 0;
  if (page.fit) {
    const s = Math.min(page.wMm / W, page.hMm / H);
    iw = W * s; ih = H * s; x = (page.wMm - iw) / 2; y = (page.hMm - ih) / 2;
    pdf.setFillColor(project.bg);
    pdf.rect(0, 0, page.wMm, page.hMm, 'F');
  }
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', x, y, iw, ih);
  if (credits) {
    pdf.addPage([page.wMm, page.hMm], page.wMm > page.hMm ? 'l' : 'p');
    const m = 15;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Crédits des images', m, m + 4);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    let cy = m + 14;
    for (const line of creditLines(project.items)) {
      const wrapped = pdf.splitTextToSize(line, page.wMm - m * 2);
      if (cy + wrapped.length * 4 > page.hMm - m) { pdf.addPage([page.wMm, page.hMm], page.wMm > page.hMm ? 'l' : 'p'); cy = m; }
      pdf.text(wrapped, m, cy);
      cy += wrapped.length * 4 + 2;
    }
  }
  pdf.save(`${slug(project.name)}.pdf`);
}

export function creditLines(items) {
  const kinds = { image: 'Image', texture: 'Texture', pattern: 'Motif' };
  const lines = items.filter((i) => i.type === 'image').map((i) =>
    `${kinds[i.kind]} — « ${i.meta.title} » par ${i.meta.creator} — ${i.meta.license} — ${i.meta.provider} — ${i.meta.landing || ''}`);
  const fonts = [...new Set(items.filter((i) => i.type === 'font').map((i) => i.family))];
  if (fonts.length) lines.push(`Typographies : ${fonts.join(', ')} — Google Fonts (licence libre OFL / Apache).`);
  return lines;
}

export function exportCredits(project) {
  download(new Blob([creditLines(project.items).join('\n')], { type: 'text/plain;charset=utf-8' }), `${slug(project.name)}-credits.txt`);
}

const slug = (s) => (s || 'moodboard').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'moodboard';
