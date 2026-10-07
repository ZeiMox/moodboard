import { useEffect, useMemo, useState } from 'react';
import { searchImages, lastSearchWarning } from '../lib/sources.js';
import { extractPalette, harmonies, randomBase } from '../lib/color.js';
import { FONTS, loadFonts, rankFonts, fontStack } from '../data/fonts.js';
import { briefParts } from '../lib/generate.js';

const TABS = [
  { id: 'image', label: 'Images' },
  { id: 'texture', label: 'Textures' },
  { id: 'pattern', label: 'Motifs' },
  { id: 'color', label: 'Couleurs' },
  { id: 'font', label: 'Typos' },
];

export default function ResourcePanel({ tab, setTab, project, mutate, selected, actions }) {
  return (
    <aside className="panel left">
      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </nav>
      <div className="panel-body">
        {['image', 'texture', 'pattern'].includes(tab) && (
          <ImageSearch key={tab} kind={tab} project={project} mutate={mutate} selected={selected} actions={actions} />
        )}
        {tab === 'color' && <Colors project={project} selected={selected} actions={actions} />}
        {tab === 'font' && <Fonts project={project} selected={selected} actions={actions} />}
      </div>
    </aside>
  );
}

function ImageSearch({ kind, project, mutate, selected, actions }) {
  const pool = project.pools?.[kind] || { query: '', results: [], page: 1 };
  const [query, setQuery] = useState(pool.query);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const canReplace = selected?.type === 'image';

  async function run(q, page) {
    if (!q.trim()) return;
    setLoading(true);
    setMsg('');
    try {
      const res = await searchImages(q.trim(), { page, strict: project.brief.strict });
      const results = page === 1 ? res : [...pool.results, ...res.filter((r) => !pool.results.some((x) => x.id === r.id))];
      mutate((p) => ({ ...p, pools: { ...p.pools, [kind]: { query: q.trim(), results, page } } }), false);
      setMsg(lastSearchWarning || (res.length ? '' : 'Aucun résultat : essayez un autre mot-clé (en anglais de préférence).'));
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  const hint = { image: 'ex. ceramic cafe, sunset', texture: 'ex. linen texture, marble', pattern: 'ex. art deco pattern' }[kind];
  return (
    <>
      <form className="search" onSubmit={(e) => { e.preventDefault(); run(query, 1); }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={hint} />
        <button className="btn" disabled={loading}>{loading ? '…' : 'Chercher'}</button>
      </form>
      <p className="hint">Cliquez « + » pour ajouter, « ⇄ » pour remplacer l’image sélectionnée, ou glissez sur le board.</p>
      {msg && <p className="warn">{msg}</p>}
      <div className="results">
        {pool.results.map((r) => (
          <div
            key={r.id}
            className="result"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('application/x-moodboard', JSON.stringify({ type: 'image', kind, result: r }))}
            title={`${r.title} — ${r.creator} (${r.license})`}
          >
            <img
              src={r.thumb}
              alt={r.title}
              loading="lazy"
              style={{ aspectRatio: `${r.width} / ${r.height}` }}
              onError={(e) => { e.currentTarget.closest('.result').style.display = 'none'; }}
            />
            <div className="result-actions">
              <button title="Ajouter au board" onClick={() => actions.addImage(r, kind)}>+</button>
              {canReplace && <button title="Remplacer la sélection" onClick={() => actions.replaceImage(selected.id, r, kind)}>⇄</button>}
            </div>
          </div>
        ))}
      </div>
      {pool.results.length > 0 && (
        <button className="btn wide" disabled={loading} onClick={() => run(pool.query || query, pool.page + 1)}>
          {loading ? 'Chargement…' : 'Plus de résultats'}
        </button>
      )}
    </>
  );
}

function PaletteRow({ name, colors, selected, actions }) {
  return (
    <div className="pal-row">
      <div className="pal-head">
        <span>{name}</span>
        <div>
          <button className="btn tiny" onClick={() => actions.addPalette(colors)}>+ Ajouter</button>
          {selected?.type === 'palette' && <button className="btn tiny" onClick={() => actions.patch(selected.id, { colors })}>⇄ Remplacer</button>}
        </div>
      </div>
      <div className="pal-swatches">{colors.map((c, i) => <i key={i} style={{ background: c }} title={c} />)}</div>
    </div>
  );
}

function Colors({ project, selected, actions }) {
  const [extracted, setExtracted] = useState(null);
  const [busy, setBusy] = useState(false);
  const [base, setBase] = useState(() => project.items.find((i) => i.type === 'palette')?.colors[2] || '#8A6E5A');
  const { styles, moods } = briefParts(project.brief);
  const fromImages = selected?.type === 'image' ? [selected] : project.items.filter((i) => i.type === 'image' && i.kind === 'image');

  async function extract() {
    setBusy(true);
    try { setExtracted(await extractPalette(fromImages.map((i) => i.thumb), 5)); } catch { setExtracted([]); }
    setBusy(false);
  }

  return (
    <>
      <button className="btn wide" onClick={extract} disabled={busy}>
        {busy ? 'Analyse…' : selected?.type === 'image' ? 'Extraire la palette de l’image sélectionnée' : 'Extraire la palette des images du board'}
      </button>
      {extracted?.length > 0 && <PaletteRow name="Extraite des images" colors={extracted} selected={selected} actions={actions} />}
      {extracted?.length === 0 && <p className="warn">Extraction impossible pour ces images.</p>}

      <h3>Harmonies</h3>
      <div className="row">
        <input type="color" value={base} onChange={(e) => setBase(e.target.value)} />
        <span className="hint">Couleur de base {base.toUpperCase()}</span>
        <button className="btn tiny" onClick={() => setBase(randomBase())}>Nouvelle</button>
      </div>
      {harmonies(base).map((h) => <PaletteRow key={h.name} name={h.name} colors={h.colors} selected={selected} actions={actions} />)}

      {(styles.length > 0 || moods.length > 0) && <h3>Selon votre brief</h3>}
      {[...styles, ...moods].map((s) => <PaletteRow key={s.id} name={s.label} colors={s.palette} selected={selected} actions={actions} />)}
    </>
  );
}

function Fonts({ project, selected, actions }) {
  const [filter, setFilter] = useState('');
  const [custom, setCustom] = useState('');
  const ranked = useMemo(() => rankFonts(project.fontTags || [], null), [project.fontTags]);
  useEffect(() => { loadFonts(FONTS.map((f) => f.family)); }, []);
  const list = ranked.filter((f) => f.family.toLowerCase().includes(filter.toLowerCase()) || f.tags.some((t) => t.includes(filter.toLowerCase())));
  const target = selected?.type === 'font' || selected?.type === 'text' ? selected : null;

  return (
    <>
      <input className="field" placeholder="Filtrer (nom ou style : serif, script, deco…)" value={filter} onChange={(e) => setFilter(e.target.value)} />
      <p className="hint">Classées selon votre brief. {target ? '« ⇄ » applique la typo à l’élément sélectionné.' : 'Sélectionnez une typo ou un texte du board pour la remplacer.'}</p>
      <div className="font-list">
        {list.map((f) => (
          <div key={f.family} className="font-row">
            <span className="font-prev" style={{ fontFamily: fontStack(f.family) }}>{f.family}</span>
            <small>{f.tags.slice(0, 2).join(' · ')}</small>
            <div className="font-actions">
              <button title="Ajouter une fiche typo" onClick={() => actions.addFont(f.family)}>+</button>
              {target && <button title="Appliquer à la sélection" onClick={() => actions.patch(target.id, { family: f.family })}>⇄</button>}
            </div>
          </div>
        ))}
      </div>
      <h3>Autre Google Font</h3>
      <form className="search" onSubmit={(e) => { e.preventDefault(); if (custom.trim()) { loadFonts([custom.trim()]); target ? actions.patch(target.id, { family: custom.trim() }) : actions.addFont(custom.trim()); setCustom(''); } }}>
        <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Nom exact, ex. Lexend" />
        <button className="btn">{target ? 'Appliquer' : 'Ajouter'}</button>
      </form>
    </>
  );
}
