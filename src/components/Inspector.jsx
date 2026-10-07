import { useState } from 'react';
import FormatPicker from './FormatPicker.jsx';
import { FONTS, rankFonts, loadFonts } from '../data/fonts.js';
import { describeFormat } from '../data/formats.js';
import { creditLines } from '../lib/export.js';

const KIND_LABEL = { image: 'Image', texture: 'Texture', pattern: 'Motif' };

export default function Inspector({ project, selected, actions, onChangeFormat, setTab }) {
  return (
    <aside className="panel right">
      <div className="panel-body">
        {selected ? <ItemInspector it={selected} project={project} actions={actions} setTab={setTab} /> : <BoardInspector project={project} actions={actions} onChangeFormat={onChangeFormat} />}
      </div>
    </aside>
  );
}

function BoardInspector({ project, actions, onChangeFormat }) {
  const [editing, setEditing] = useState(false);
  const [fmt, setFmt] = useState(project.format);
  const boardColors = [...new Set(['#FFFFFF', '#F5F3EF', '#1A1A1A', ...project.items.filter((i) => i.type === 'palette').flatMap((i) => i.colors)])];
  const credits = creditLines(project.items);

  return (
    <>
      <h3>Board</h3>
      <label className="lbl">Nom<input className="field" value={project.name} onChange={(e) => actions.setProject({ name: e.target.value }, false)} /></label>

      <label className="lbl">Format</label>
      {!editing ? (
        <div className="row between">
          <span className="hint">{describeFormat(project.format)}</span>
          <button className="btn tiny" onClick={() => { setFmt(project.format); setEditing(true); }}>Modifier</button>
        </div>
      ) : (
        <div className="boxed">
          <FormatPicker value={fmt} onChange={setFmt} />
          <div className="row">
            <button className="btn primary" onClick={() => { onChangeFormat(fmt); setEditing(false); }}>Appliquer</button>
            <button className="btn ghost" onClick={() => setEditing(false)}>Annuler</button>
          </div>
        </div>
      )}

      <label className="lbl">Fond</label>
      <div className="color-pick">
        <input type="color" value={project.bg} onChange={(e) => actions.setProject({ bg: e.target.value.toUpperCase() })} />
        {boardColors.map((c) => <button key={c} className={`dot ${project.bg === c ? 'on' : ''}`} style={{ background: c }} onClick={() => actions.setProject({ bg: c })} title={c} />)}
      </div>

      <button className="btn wide" onClick={actions.relayout}>↻ Réorganiser automatiquement</button>
      <button className="btn wide" onClick={actions.addText}>T  Ajouter un texte</button>

      <h3>Crédits ({credits.length})</h3>
      <ul className="credits">
        {project.items.filter((i) => i.type === 'image').map((i) => (
          <li key={i.id}>
            <b>{KIND_LABEL[i.kind]}</b> « {i.meta.title} » — {i.meta.creator} · {i.meta.license}{' '}
            {i.meta.landing && <a href={i.meta.landing} target="_blank" rel="noreferrer">source</a>}
          </li>
        ))}
      </ul>
      <p className="hint">Astuce : glissez les éléments, redimensionnez-les par les coins, double-cliquez sur un texte pour l’éditer. Suppr pour effacer, Ctrl+Z pour annuler.</p>
    </>
  );
}

function ItemInspector({ it, project, actions, setTab }) {
  return (
    <>
      <div className="row between">
        <h3>{it.type === 'image' ? KIND_LABEL[it.kind] : { palette: 'Palette', font: 'Typographie', text: 'Texte' }[it.type]}</h3>
        <button className="btn tiny ghost" onClick={() => actions.select(null)}>✕</button>
      </div>

      {it.type === 'image' && <ImageFields it={it} actions={actions} setTab={setTab} />}
      {it.type === 'palette' && <PaletteFields it={it} actions={actions} setTab={setTab} />}
      {it.type === 'font' && <FontFields it={it} project={project} actions={actions} setTab={setTab} />}
      {it.type === 'text' && <TextFields it={it} project={project} actions={actions} />}

      <h3>Disposition</h3>
      <div className="grid2">
        <button className="btn" onClick={() => actions.layer(it.id, 'front')}>Premier plan</button>
        <button className="btn" onClick={() => actions.layer(it.id, 'back')}>Arrière-plan</button>
        <button className="btn" onClick={() => actions.duplicate(it.id)}>Dupliquer</button>
        <button className="btn danger" onClick={() => actions.remove(it.id)}>Supprimer</button>
      </div>
      <p className="hint">{Math.round(it.w)} × {Math.round(it.h)} px · x {Math.round(it.x)}, y {Math.round(it.y)}</p>
    </>
  );
}

function ImageFields({ it, actions, setTab }) {
  return (
    <>
      <img className="insp-thumb" src={it.thumb} alt="" />
      <p className="meta"><b>{it.meta.title}</b><br />{it.meta.creator}<br />{it.meta.license} · {it.meta.provider}</p>
      <div className="row">
        {it.meta.landing && <a className="btn tiny" href={it.meta.landing} target="_blank" rel="noreferrer">Voir la source ↗</a>}
        {it.meta.licenseUrl && <a className="btn tiny" href={it.meta.licenseUrl} target="_blank" rel="noreferrer">Licence ↗</a>}
      </div>
      <label className="lbl">Catégorie
        <select value={it.kind} onChange={(e) => actions.patch(it.id, { kind: e.target.value })}>
          <option value="image">Image</option><option value="texture">Texture</option><option value="pattern">Motif</option>
        </select>
      </label>
      <button className="btn wide primary" onClick={() => setTab(it.kind)}>⇄ Chercher une autre {KIND_LABEL[it.kind].toLowerCase()}</button>
      <button className="btn wide" onClick={() => actions.patch(it.id, { h: Math.round(it.w / it.ratio) })}>Rétablir les proportions</button>
      <p className="hint">L’image n’est jamais retouchée : seulement redimensionnée, proportions conservées.</p>
    </>
  );
}

function PaletteFields({ it, actions, setTab }) {
  const setColor = (i, c) => actions.patch(it.id, { colors: it.colors.map((x, k) => (k === i ? c.toUpperCase() : x)) });
  return (
    <>
      <div className="pal-edit">
        {it.colors.map((c, i) => (
          <label key={i} style={{ background: c }} title="Modifier">
            <input type="color" value={c} onChange={(e) => setColor(i, e.target.value)} />
          </label>
        ))}
      </div>
      <div className="row">
        <button className="btn tiny" disabled={it.colors.length >= 8} onClick={() => actions.patch(it.id, { colors: [...it.colors, it.colors[it.colors.length - 1]] })}>+ Couleur</button>
        <button className="btn tiny" disabled={it.colors.length <= 2} onClick={() => actions.patch(it.id, { colors: it.colors.slice(0, -1) })}>− Couleur</button>
        <button className="btn tiny" onClick={() => actions.patch(it.id, { colors: [...it.colors].reverse() })}>Inverser</button>
      </div>
      <button className="btn wide primary" onClick={() => setTab('color')}>⇄ Proposer d’autres palettes</button>
    </>
  );
}

function FontFields({ it, project, actions, setTab }) {
  const next = () => {
    const ranked = rankFonts(project.fontTags || [], null).map((f) => f.family);
    const used = new Set(project.items.filter((i) => i.type === 'font').map((i) => i.family));
    const start = ranked.indexOf(it.family);
    const pick = [...ranked.slice(start + 1), ...ranked.slice(0, start)].find((f) => !used.has(f));
    if (pick) { loadFonts([pick]); actions.patch(it.id, { family: pick }); }
  };
  return (
    <>
      <FontSelect value={it.family} onChange={(family) => actions.patch(it.id, { family })} />
      <label className="lbl">Usage<input className="field" value={it.role} onChange={(e) => actions.patch(it.id, { role: e.target.value }, false)} /></label>
      <button className="btn wide primary" onClick={next}>⇄ Suggestion suivante</button>
      <button className="btn wide" onClick={() => setTab('font')}>Parcourir les typographies</button>
    </>
  );
}

function TextFields({ it, actions }) {
  return (
    <>
      <label className="lbl">Texte<textarea className="field" rows={3} value={it.text} onChange={(e) => actions.patch(it.id, { text: e.target.value }, false)} /></label>
      <FontSelect value={it.family} onChange={(family) => actions.patch(it.id, { family })} />
      <div className="row">
        <label className="num">Taille<input type="number" min="6" max="600" value={Math.round(it.size)} onChange={(e) => actions.patch(it.id, { size: +e.target.value || 12 }, false)} /></label>
        <label className="num">Couleur<input type="color" value={it.color} onChange={(e) => actions.patch(it.id, { color: e.target.value })} /></label>
      </div>
      <div className="segmented small">
        {[['left', 'Gauche'], ['center', 'Centre'], ['right', 'Droite']].map(([a, l]) => (
          <button key={a} className={it.align === a ? 'on' : ''} onClick={() => actions.patch(it.id, { align: a })}>{l}</button>
        ))}
      </div>
    </>
  );
}

function FontSelect({ value, onChange }) {
  const known = FONTS.some((f) => f.family === value);
  return (
    <label className="lbl">Police
      <select value={value} onChange={(e) => { loadFonts([e.target.value]); onChange(e.target.value); }}>
        {!known && <option value={value}>{value}</option>}
        {FONTS.map((f) => <option key={f.family} value={f.family}>{f.family}</option>)}
      </select>
    </label>
  );
}
