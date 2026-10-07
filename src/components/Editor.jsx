import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Board from './Board.jsx';
import ResourcePanel from './ResourcePanel.jsx';
import Inspector from './Inspector.jsx';
import ExportDialog from './ExportDialog.jsx';
import { computeSize, describeFormat } from '../data/formats.js';
import { relayout } from '../lib/layout.js';
import { imageItem, uid } from '../lib/generate.js';
import { loadFonts, rankFonts } from '../data/fonts.js';

const snap = (p) => ({ items: p.items, bg: p.bg });

export default function Editor({ project, setProject, onNewBrief, onRegenerate, busy, step, error }) {
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState('image');
  const [zoom, setZoom] = useState(0.4);
  const [showExport, setShowExport] = useState(false);
  const stage = useRef(null);
  const projRef = useRef(project);
  projRef.current = project;
  const past = useRef([]);
  const future = useRef([]);
  const [, force] = useState(0);

  // ---- Historique (annuler / rétablir) ------------------------------------
  const mutate = useCallback((fn, history = true) => {
    const prev = projRef.current;
    const next = fn(prev);
    if (history) { past.current.push(snap(prev)); past.current = past.current.slice(-80); future.current = []; force((n) => n + 1); }
    projRef.current = next;
    setProject(next);
  }, [setProject]);

  const beginGesture = () => snap(projRef.current);
  const endGesture = (before) => { past.current.push(before); future.current = []; force((n) => n + 1); };

  const undo = () => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(snap(projRef.current));
    mutate((p) => ({ ...p, ...prev }), false);
    force((n) => n + 1);
  };
  const redo = () => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(snap(projRef.current));
    mutate((p) => ({ ...p, ...next }), false);
    force((n) => n + 1);
  };

  // ---- Zoom ----------------------------------------------------------------
  const fit = useCallback(() => {
    const el = stage.current;
    if (!el) return;
    const { W, H } = projRef.current;
    setZoom(Math.max(0.05, Math.min((el.clientWidth - 64) / W, (el.clientHeight - 64) / H, 2)));
  }, []);
  useLayoutEffect(fit, [fit, project.W, project.H]);
  useEffect(() => { window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit); }, [fit]);

  // ---- Actions -------------------------------------------------------------
  const maxZ = () => Math.max(0, ...projRef.current.items.map((i) => i.z)) + 1;
  const center = (w, h) => ({ x: Math.round((projRef.current.W - w) / 2), y: Math.round((projRef.current.H - h) / 2) });
  const add = (item) => { mutate((p) => ({ ...p, items: [...p.items, item] })); setSelectedId(item.id); };

  const actions = {
    select: setSelectedId,
    setProject: (patch, history = true) => mutate((p) => ({ ...p, ...patch }), history),
    patch: (id, data, history = true) => mutate((p) => ({ ...p, items: p.items.map((i) => (i.id === id ? { ...i, ...data } : i)) }), history),
    remove: (id) => { mutate((p) => ({ ...p, items: p.items.filter((i) => i.id !== id) })); setSelectedId(null); },
    duplicate: (id) => {
      const it = projRef.current.items.find((i) => i.id === id);
      if (it) add({ ...it, id: uid(), x: it.x + 30, y: it.y + 30, z: maxZ() });
    },
    layer: (id, where) => mutate((p) => {
      const zs = p.items.map((i) => i.z);
      const z = where === 'front' ? Math.max(...zs) + 1 : Math.min(...zs) - 1;
      return { ...p, items: p.items.map((i) => (i.id === id ? { ...i, z } : i)) };
    }),
    addImage: (r, kind, at) => {
      const { W, H } = projRef.current;
      const it = imageItem(r, kind);
      it.w = Math.round(Math.min(W, H) * 0.3);
      it.h = Math.round(it.w / it.ratio);
      Object.assign(it, at ? { x: Math.round(at.x - it.w / 2), y: Math.round(at.y - it.h / 2) } : center(it.w, it.h), { z: maxZ() });
      add(it);
    },
    replaceImage: (id, r, kind) => {
      const old = projRef.current.items.find((i) => i.id === id);
      if (!old) return;
      const fresh = imageItem(r, kind);
      // Même emprise : on conserve la largeur ou la hauteur pour garder les proportions de la nouvelle image.
      let w = old.w, h = old.w / fresh.ratio;
      if (h > old.h * 1.4) { h = old.h; w = h * fresh.ratio; }
      mutate((p) => ({ ...p, items: p.items.map((i) => (i.id === id ? { ...fresh, id, kind: old.kind, x: old.x, y: old.y, w: Math.round(w), h: Math.round(h), z: old.z } : i)) }));
    },
    addPalette: (colors) => {
      const w = Math.round(projRef.current.W * 0.3), h = Math.round(w * 0.3);
      add({ id: uid(), type: 'palette', colors, w, h, ...center(w, h), z: maxZ() });
    },
    addFont: (family) => {
      loadFonts([family]);
      const w = Math.round(Math.min(projRef.current.W, projRef.current.H) * 0.3), h = Math.round(w * 0.75);
      add({ id: uid(), type: 'font', family, role: 'Accent', w, h, ...center(w, h), z: maxZ() });
    },
    addText: () => {
      const p = projRef.current;
      const family = p.items.find((i) => i.type === 'font')?.family || rankFonts(p.fontTags || [], 'display')[0].family;
      const w = Math.round(p.W * 0.35), size = Math.round(Math.min(p.W, p.H) * 0.035);
      add({ id: uid(), type: 'text', text: 'Votre texte', family, size, color: '#1A1A1A', align: 'left', w, h: Math.round(size * 2.6), ...center(w, size * 2.6), z: maxZ() });
    },
    relayout: () => mutate((p) => ({ ...p, items: relayout(p.items, p.W, p.H) })),
  };

  function changeFormat(format) {
    const { W, H } = computeSize(format);
    mutate((p) => ({ ...p, format, W, H, items: relayout(p.items, W, H) }));
  }

  function onDropResource(data, x, y) {
    if (data.type === 'image') actions.addImage(data.result, data.kind, { x, y });
  }

  // ---- Clavier -------------------------------------------------------------
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
      if (!selectedId) return;
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); actions.remove(selectedId); }
      else if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); actions.duplicate(selectedId); }
      else if (e.key === 'Escape') setSelectedId(null);
      else if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        const d = e.shiftKey ? 20 : 2;
        const [dx, dy] = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[e.key];
        const it = projRef.current.items.find((i) => i.id === selectedId);
        if (it) actions.patch(selectedId, { x: it.x + dx, y: it.y + dy });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const selected = project.items.find((i) => i.id === selectedId) || null;

  return (
    <div className="editor">
      <header className="toolbar">
        <div className="logo">◧</div>
        <input className="title-input" value={project.name} onChange={(e) => actions.setProject({ name: e.target.value }, false)} />
        <span className="fmt-badge">{describeFormat(project.format)}</span>
        <div className="spacer" />
        <button className="btn ghost" onClick={undo} disabled={!past.current.length} title="Annuler (Ctrl+Z)">↶</button>
        <button className="btn ghost" onClick={redo} disabled={!future.current.length} title="Rétablir (Ctrl+Y)">↷</button>
        <div className="zoom">
          <button onClick={() => setZoom((z) => Math.max(0.05, z / 1.2))}>−</button>
          <button onClick={fit} title="Ajuster à l’écran">{Math.round(zoom * 100)} %</button>
          <button onClick={() => setZoom((z) => Math.min(4, z * 1.2))}>+</button>
        </div>
        <button className="btn ghost" onClick={onNewBrief}>Modifier le brief</button>
        <button className="btn" onClick={onRegenerate} disabled={busy}>{busy ? step || '…' : '↻ Nouvelle proposition'}</button>
        <button className="btn primary" onClick={() => { setSelectedId(null); setShowExport(true); }}>Exporter</button>
      </header>

      <div className="workspace">
        <ResourcePanel tab={tab} setTab={setTab} project={project} mutate={mutate} selected={selected} actions={actions} />
        <main className="stage" ref={stage} onPointerDown={(e) => e.target === e.currentTarget && setSelectedId(null)}>
          <Board
            project={project}
            zoom={zoom}
            selectedId={selectedId}
            onSelect={setSelectedId}
            mutate={mutate}
            beginGesture={beginGesture}
            endGesture={endGesture}
            onDropResource={onDropResource}
          />
        </main>
        <Inspector project={project} selected={selected} actions={actions} onChangeFormat={changeFormat} setTab={setTab} />
      </div>

      {error && !busy && <div className="toast">{error}</div>}
      {showExport && <ExportDialog project={project} onClose={() => setShowExport(false)} />}
    </div>
  );
}
