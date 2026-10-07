import { useState } from 'react';
import { exportRaster, exportSvg, exportPdf, exportCredits } from '../lib/export.js';
import { pdfPageFor } from '../data/formats.js';

const FORMATS = [
  { id: 'png', label: 'PNG', desc: 'Sans perte, idéal écran' },
  { id: 'jpg', label: 'JPG', desc: 'Plus léger, pour partager' },
  { id: 'svg', label: 'SVG', desc: 'Vectoriel, images intégrées' },
  { id: 'pdf', label: 'PDF', desc: 'Impression, taille auto' },
];

export default function ExportDialog({ project, onClose }) {
  const [type, setType] = useState('png');
  const [quality, setQuality] = useState(0.9);
  const [credits, setCredits] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const page = pdfPageFor(project.format);

  async function run() {
    setBusy(true);
    setError('');
    try {
      if (type === 'png' || type === 'jpg') await exportRaster(project, type, quality);
      else if (type === 'svg') await exportSvg(project);
      else await exportPdf(project, project.format, { credits });
      onClose();
    } catch (e) {
      console.error(e);
      setError('L’export a échoué : une image refuse peut-être d’être lue (CORS). Remplacez-la puis réessayez.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-back" onPointerDown={onClose}>
      <div className="modal" onPointerDown={(e) => e.stopPropagation()}>
        <h2>Exporter le moodboard</h2>
        <div className="export-grid">
          {FORMATS.map((f) => (
            <button key={f.id} className={`export-opt ${type === f.id ? 'on' : ''}`} onClick={() => setType(f.id)}>
              <b>.{f.label.toLowerCase()}</b><small>{f.desc}</small>
            </button>
          ))}
        </div>

        {type !== 'pdf' && <p className="hint">Dimensions : <b>{project.W} × {project.H} px</b> (taille du board, modifiable dans le panneau de droite).</p>}
        {type === 'jpg' && (
          <label className="lbl">Qualité {Math.round(quality * 100)} %
            <input type="range" min="0.5" max="1" step="0.05" value={quality} onChange={(e) => setQuality(+e.target.value)} />
          </label>
        )}
        {type === 'svg' && <p className="hint">Les typographies sont liées à Google Fonts : ouvrez le SVG dans un navigateur ou installez les polices pour un rendu fidèle.</p>}
        {type === 'pdf' && (
          <>
            <p className="hint">Taille de page déterminée automatiquement : <b>{page.label}</b>{page.fit ? ' — le board est centré, proportions conservées.' : '.'}</p>
            <label className="check"><input type="checkbox" checked={credits} onChange={(e) => setCredits(e.target.checked)} /> Ajouter une page de crédits</label>
          </>
        )}

        {error && <p className="error">{error}</p>}
        <div className="row between">
          <button className="btn ghost" onClick={() => exportCredits(project)}>Crédits (.txt)</button>
          <div className="row">
            <button className="btn ghost" onClick={onClose}>Annuler</button>
            <button className="btn primary" onClick={run} disabled={busy}>{busy ? 'Export…' : `Exporter en .${type}`}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
