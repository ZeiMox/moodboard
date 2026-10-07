import { useRef, useState } from 'react';
import { fontStack } from '../data/fonts.js';
import { textOn } from '../lib/color.js';
import { paletteSpec, fontSpec, SAMPLE } from '../lib/export.js';

const MIN = 24;

function resize(start, mode, dx, dy, lock) {
  let { x, y, w, h } = start;
  const east = mode.includes('e'), south = mode.includes('s');
  w = Math.max(MIN, start.w + (east ? dx : -dx));
  h = lock ? w / start.ratio : Math.max(MIN, start.h + (south ? dy : -dy));
  if (!east) x = start.x + start.w - w;
  if (!south) y = start.y + start.h - h;
  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
}

export default function Board({ project, zoom, selectedId, onSelect, mutate, beginGesture, endGesture, onDropResource }) {
  const { W, H, items, bg } = project;
  const surface = useRef(null);
  const [editingId, setEditingId] = useState(null);

  function startDrag(e, it, mode) {
    if (e.button !== 0 || editingId === it.id) return;
    e.stopPropagation();
    e.preventDefault();
    onSelect(it.id);
    const start = { px: e.clientX, py: e.clientY, ...it };
    const snapshot = beginGesture();
    let moved = false;
    const lock = it.type === 'image';
    // L'élément déplacé passe au premier plan.
    const top = Math.max(...project.items.map((i) => i.z));
    const z = mode === 'move' && it.z !== top ? top + 1 : it.z;
    const onMove = (ev) => {
      const dx = (ev.clientX - start.px) / zoom;
      const dy = (ev.clientY - start.py) / zoom;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 2) return;
      moved = true;
      const geom = mode === 'move'
        ? { x: Math.round(start.x + dx), y: Math.round(start.y + dy), z }
        : resize(start, mode, dx, dy, lock);
      mutate((p) => ({ ...p, items: p.items.map((i) => (i.id === it.id ? { ...i, ...geom } : i)) }), false);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (moved) endGesture(snapshot);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  function onDrop(e) {
    const raw = e.dataTransfer.getData('application/x-moodboard');
    if (!raw) return;
    e.preventDefault();
    const rect = surface.current.getBoundingClientRect();
    onDropResource(JSON.parse(raw), (e.clientX - rect.left) / zoom, (e.clientY - rect.top) / zoom);
  }

  const sorted = [...items].sort((a, b) => a.z - b.z);

  return (
    <div className="board-frame" style={{ width: W * zoom, height: H * zoom }}>
      <div
        ref={surface}
        className="board"
        style={{ width: W, height: H, background: bg, transform: `scale(${zoom})` }}
        onPointerDown={() => { onSelect(null); setEditingId(null); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        {sorted.map((it) => (
          <div
            key={it.id}
            className={`item item-${it.type} ${selectedId === it.id ? 'selected' : ''}`}
            style={{ left: it.x, top: it.y, width: it.w, height: it.h }}
            onPointerDown={(e) => startDrag(e, it, 'move')}
            onDoubleClick={() => it.type === 'text' && setEditingId(it.id)}
          >
            <ItemContent it={it} editing={editingId === it.id} mutate={mutate} stopEditing={() => setEditingId(null)} />
            {selectedId === it.id && editingId !== it.id && (
              <div className="handles" style={{ '--hs': `${10 / zoom}px`, '--bw': `${2 / zoom}px` }}>
                {['nw', 'ne', 'sw', 'se'].map((m) => (
                  <span key={m} className={`handle ${m}`} onPointerDown={(e) => startDrag(e, it, m)} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ItemContent({ it, editing, mutate, stopEditing }) {
  if (it.type === 'image') return <BoardImage it={it} mutate={mutate} />;

  if (it.type === 'palette') {
    const { sw, fs } = paletteSpec(it);
    return it.colors.map((c, i) => (
      <div key={i} className="swatch" style={{ left: i * sw, width: Math.ceil(sw), background: c }}>
        <span style={{ fontSize: fs, color: textOn(c), left: fs * 0.7, top: it.h - fs * 1.8 }}>{c.toUpperCase()}</span>
      </div>
    ));
  }

  if (it.type === 'font') {
    const s = fontSpec(it);
    const ff = fontStack(it.family);
    return (
      <div className="font-card">
        <span className="fc-role" style={{ top: s.pad, left: s.pad, right: s.pad, fontSize: s.role }}>{it.role}</span>
        <span className="fc-name" style={{ top: s.pad + s.role * 1.6, left: s.pad, right: s.pad, fontSize: s.name }}>{it.family}</span>
        <span className="fc-big" style={{ top: s.bigTop, left: s.pad, fontSize: s.big, fontFamily: ff }}>Aa</span>
        <span className="fc-sample" style={{ top: it.h - s.pad - s.sample * 1.2, left: s.pad, right: s.pad, fontSize: s.sample, fontFamily: ff }}>{SAMPLE}</span>
      </div>
    );
  }

  if (it.type === 'text') {
    return (
      <div
        key={editing ? 'editing' : it.text}
        className="text-box"
        contentEditable={editing}
        suppressContentEditableWarning
        ref={(el) => { if (el && editing && document.activeElement !== el) { el.focus(); document.getSelection().selectAllChildren(el); } }}
        onPointerDown={(e) => editing && e.stopPropagation()}
        onBlur={(e) => {
          const text = e.currentTarget.innerText.replace(/\n$/, '');
          stopEditing();
          if (text !== it.text) mutate((p) => ({ ...p, items: p.items.map((i) => (i.id === it.id ? { ...i, text } : i)) }));
        }}
        style={{ fontFamily: fontStack(it.family), fontSize: it.size, color: it.color, textAlign: it.align }}
      >
        {it.text}
      </div>
    );
  }
  return null;
}

function BoardImage({ it, mutate }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="img-missing">Image indisponible</div>;
  return (
    <img
      src={it.useThumb ? it.thumb : it.src}
      crossOrigin="anonymous"
      alt={it.meta.title}
      draggable={false}
      onError={() => {
        if (!it.useThumb && it.thumb) mutate((p) => ({ ...p, items: p.items.map((i) => (i.id === it.id ? { ...i, useThumb: true } : i)) }), false);
        else setFailed(true);
      }}
    />
  );
}
