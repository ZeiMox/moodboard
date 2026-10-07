import { useEffect, useState } from 'react';
import Brief from './components/Brief.jsx';
import Editor from './components/Editor.jsx';
import { DEFAULT_FORMAT, computeSize } from './data/formats.js';
import { generateBoard } from './lib/generate.js';
import { loadFonts } from './data/fonts.js';
import { extractPalette } from './lib/color.js';

const STORE_KEY = 'moodboard-studio:v1';
const EMPTY_BRIEF = { title: '', contexts: [], keywords: '', styles: [], moods: [], strict: true };

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; }
}

export default function App() {
  const [project, setProject] = useState(() => loadSaved());
  const [screen, setScreen] = useState(() => (loadSaved()?.items ? 'editor' : 'brief'));
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (project?.items) loadFonts(project.items.filter((i) => i.family).map((i) => i.family));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!project) return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(project)); } catch { /* stockage indisponible */ }
  }, [project]);

  async function generate(brief, format, page = 1) {
    setBusy(true);
    setError('');
    try {
      const result = await generateBoard(brief, format, setStep, page);
      const { W, H } = computeSize(format);
      const { paletteFallback, ...data } = result;
      setProject({ name: brief.title || 'Moodboard', brief, format, W, H, ...data });
      setScreen('editor');
      if (paletteFallback) retryPalette(data.items);
    } catch (e) {
      setError(e.message || 'La génération a échoué.');
    } finally {
      setBusy(false);
      setStep('');
    }
  }

  // Les images sont maintenant en cache : on réessaie d'extraire la palette,
  // sans écraser une palette que l'utilisateur aurait déjà modifiée.
  function retryPalette(items) {
    const pal = items.find((i) => i.type === 'palette');
    const urls = items.filter((i) => i.type === 'image' && i.kind === 'image').map((i) => i.thumb);
    if (!pal) return;
    extractPalette(urls, 5).then((colors) => setProject((p) => ({
      ...p,
      items: p.items.map((i) => (i.id === pal.id && i.colors.join() === pal.colors.join() ? { ...i, colors } : i)),
    }))).catch(() => {});
  }

  if (screen === 'brief' || !project?.items) {
    return (
      <Brief
        initial={{ brief: project?.brief || EMPTY_BRIEF, format: project?.format || DEFAULT_FORMAT }}
        onGenerate={generate}
        busy={busy}
        step={step}
        error={error}
        onCancel={project?.items ? () => setScreen('editor') : null}
      />
    );
  }

  return (
    <Editor
      project={project}
      setProject={setProject}
      onNewBrief={() => setScreen('brief')}
      onRegenerate={() => generate(project.brief, project.format, (project.page || 1) + 1)}
      busy={busy}
      step={step}
      error={error}
    />
  );
}
