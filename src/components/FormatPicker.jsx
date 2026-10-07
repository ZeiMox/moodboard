import { PRESETS, computeSize } from '../data/formats.js';

export default function FormatPicker({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const preset = PRESETS.find((p) => p.id === value.preset);
  const { W, H } = computeSize(value);

  return (
    <div className="format-picker">
      <div className="segmented">
        {[['preset', 'Prédéfini'], ['px', 'Pixels'], ['cm', 'Centimètres']].map(([id, label]) => (
          <button key={id} type="button" className={value.mode === id ? 'on' : ''} onClick={() => set({ mode: id })}>{label}</button>
        ))}
      </div>

      {value.mode === 'preset' && (
        <>
          <div className="preset-grid">
            {PRESETS.map((p) => (
              <button key={p.id} type="button" className={`preset ${value.preset === p.id ? 'on' : ''}`} onClick={() => set({ preset: p.id })}>
                <PresetThumb p={p} orientation={value.orientation} />
                <span>{p.label}</span>
                <small>{p.mm ? `${p.mm[0]}×${p.mm[1]} mm` : `${p.px[0]}×${p.px[1]}`}</small>
              </button>
            ))}
          </div>
          {preset?.mm && (
            <div className="row">
              <div className="segmented small">
                <button type="button" className={value.orientation === 'portrait' ? 'on' : ''} onClick={() => set({ orientation: 'portrait' })}>Portrait</button>
                <button type="button" className={value.orientation === 'landscape' ? 'on' : ''} onClick={() => set({ orientation: 'landscape' })}>Paysage</button>
              </div>
              <DpiSelect value={value.dpi} onChange={(dpi) => set({ dpi })} />
            </div>
          )}
        </>
      )}

      {value.mode === 'px' && (
        <div className="row">
          <label className="num">Largeur<input type="number" min="200" max="8000" value={value.wPx} onChange={(e) => set({ wPx: +e.target.value })} /><em>px</em></label>
          <label className="num">Hauteur<input type="number" min="200" max="8000" value={value.hPx} onChange={(e) => set({ hPx: +e.target.value })} /><em>px</em></label>
        </div>
      )}

      {value.mode === 'cm' && (
        <div className="row">
          <label className="num">Largeur<input type="number" min="2" max="200" step="0.5" value={value.wCm} onChange={(e) => set({ wCm: +e.target.value })} /><em>cm</em></label>
          <label className="num">Hauteur<input type="number" min="2" max="200" step="0.5" value={value.hCm} onChange={(e) => set({ hCm: +e.target.value })} /><em>cm</em></label>
          <DpiSelect value={value.dpi} onChange={(dpi) => set({ dpi })} />
        </div>
      )}

      <p className="hint">Taille du board : {W} × {H} px</p>
    </div>
  );
}

function DpiSelect({ value, onChange }) {
  return (
    <label className="num">Résolution
      <select value={value} onChange={(e) => onChange(+e.target.value)}>
        <option value={72}>72 dpi (écran)</option>
        <option value={150}>150 dpi (standard)</option>
        <option value={300}>300 dpi (impression)</option>
      </select>
    </label>
  );
}

function PresetThumb({ p, orientation }) {
  let [w, h] = p.mm || p.px;
  if (p.mm && orientation === 'landscape') [w, h] = [h, w];
  const s = 26 / Math.max(w, h);
  return <i className="thumb" style={{ width: w * s, height: h * s }} />;
}
