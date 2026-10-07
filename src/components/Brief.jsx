import { useState } from 'react';
import { CONTEXTS, STYLES, MOODS } from '../data/vocab.js';
import FormatPicker from './FormatPicker.jsx';

const MAX_PICK = 3;

function Chips({ options, value, onChange, max = MAX_PICK, swatches }) {
  const toggle = (id) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else if (value.length < max) onChange([...value, id]);
    else onChange([...value.slice(1), id]);
  };
  return (
    <div className="chips">
      {options.map((o) => (
        <button key={o.id} type="button" className={`chip ${value.includes(o.id) ? 'on' : ''}`} onClick={() => toggle(o.id)}>
          {swatches && <span className="mini-pal">{o.palette.slice(0, 4).map((c) => <i key={c} style={{ background: c }} />)}</span>}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Brief({ initial, onGenerate, busy, step, error, onCancel }) {
  const [brief, setBrief] = useState(initial.brief);
  const [format, setFormat] = useState(initial.format);
  const set = (patch) => setBrief((b) => ({ ...b, ...patch }));
  const ready = (brief.contexts.length || brief.keywords.trim()) && (brief.styles.length || brief.moods.length);

  return (
    <div className="brief-page">
      <header className="brief-head">
        <div className="logo">◧ Moodboard Studio</div>
        {onCancel && <button className="btn ghost" onClick={onCancel}>← Retour au board</button>}
      </header>

      <form className="brief" onSubmit={(e) => { e.preventDefault(); if (ready && !busy) onGenerate(brief, format); }}>
        <h1>Créez votre moodboard</h1>
        <p className="lead">Décrivez votre projet : la plateforme rassemble des images libres de droits, textures, motifs, couleurs et typographies dans le même univers.</p>

        <section>
          <h2><span>1</span>Contexte</h2>
          <input className="field" placeholder="Nom du projet (ex. Café Lumen)" value={brief.title} onChange={(e) => set({ title: e.target.value })} />
          <Chips options={CONTEXTS} value={brief.contexts} onChange={(contexts) => set({ contexts })} max={2} />
          <input className="field" placeholder="Mots-clés du sujet (ex. céramique, matin, plage) — facultatif" value={brief.keywords} onChange={(e) => set({ keywords: e.target.value })} />
        </section>

        <section>
          <h2><span>2</span>Style <small>jusqu’à 3</small></h2>
          <Chips options={STYLES} value={brief.styles} onChange={(styles) => set({ styles })} swatches />
        </section>

        <section>
          <h2><span>3</span>Ambiance <small>jusqu’à 3</small></h2>
          <Chips options={MOODS} value={brief.moods} onChange={(moods) => set({ moods })} swatches />
        </section>

        <section>
          <h2><span>4</span>Format du board</h2>
          <FormatPicker value={format} onChange={setFormat} />
        </section>

        <section className="license">
          <label className="check">
            <input type="checkbox" checked={brief.strict} onChange={(e) => set({ strict: e.target.checked })} />
            Uniquement domaine public / CC0 (aucune attribution requise)
          </label>
          <p className="hint">Décoché : inclut aussi les licences CC BY et CC BY-SA (crédits fournis à l’export). Sources : Openverse et Wikimedia Commons. Les images générées par IA sont exclues.</p>
        </section>

        {error && <p className="error">{error}</p>}
        <button className="btn primary big" disabled={!ready || busy}>
          {busy ? step || 'Génération…' : 'Générer le moodboard →'}
        </button>
        {!ready && <p className="hint center">Choisissez au moins un contexte (ou des mots-clés) et un style ou une ambiance.</p>}
      </form>
    </div>
  );
}
