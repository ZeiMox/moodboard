// Vocabulaire du brief : chaque choix est traduit en mots-clés anglais
// (les banques d'images libres sont indexées en anglais), en pistes de
// textures / motifs, en tags typographiques et en palette de départ.

export const CONTEXTS = [
  { id: 'branding', label: 'Identité de marque', en: ['brand', 'design studio'] },
  { id: 'mode', label: 'Mode', en: ['fashion', 'fabric'] },
  { id: 'interieur', label: 'Intérieur', en: ['interior', 'room'] },
  { id: 'architecture', label: 'Architecture', en: ['architecture', 'building'] },
  { id: 'food', label: 'Café / Restaurant', en: ['coffee', 'cafe'] },
  { id: 'evenement', label: 'Mariage / Événement', en: ['wedding', 'flowers'] },
  { id: 'voyage', label: 'Voyage', en: ['travel', 'landscape'] },
  { id: 'bienetre', label: 'Bien-être', en: ['spa', 'plants'] },
  { id: 'tech', label: 'Tech / Web', en: ['technology', 'light'] },
  { id: 'packaging', label: 'Produit / Packaging', en: ['product', 'object'] },
  { id: 'art', label: 'Art / Exposition', en: ['art', 'sculpture'] },
  { id: 'musique', label: 'Musique', en: ['music', 'concert'] },
];

export const STYLES = [
  {
    id: 'minimaliste', label: 'Minimaliste', en: ['minimal'],
    textures: ['white paper texture', 'concrete texture'], patterns: ['geometric pattern lines'],
    fonts: ['sans', 'geometric', 'minimal'],
    palette: ['#F4F1EC', '#D9D4CC', '#A8A29A', '#5B5852', '#1C1C1C'],
  },
  {
    id: 'vintage', label: 'Vintage', en: ['vintage'],
    textures: ['old paper texture', 'worn leather texture'], patterns: ['victorian ornament', 'damask pattern'],
    fonts: ['serif', 'vintage', 'retro'],
    palette: ['#E8DCC4', '#C9A66B', '#8C5A3C', '#4E6151', '#2B2A27'],
  },
  {
    id: 'brutaliste', label: 'Brutaliste', en: ['brutalist', 'concrete'],
    textures: ['concrete texture', 'rough stone texture'], patterns: ['grid pattern'],
    fonts: ['grotesk', 'mono', 'brutal'],
    palette: ['#D6D6D2', '#8E8E89', '#4A4A47', '#1A1A1A', '#E63B2E'],
  },
  {
    id: 'scandinave', label: 'Scandinave', en: ['scandinavian', 'nordic'],
    textures: ['light wood texture', 'linen texture'], patterns: ['nordic pattern'],
    fonts: ['sans', 'humanist', 'minimal'],
    palette: ['#F7F5F2', '#E3DED6', '#B9C4C2', '#7D8C8A', '#3E4A4C'],
  },
  {
    id: 'artdeco', label: 'Art déco', en: ['art deco'],
    textures: ['marble texture', 'gold texture'], patterns: ['art deco pattern'],
    fonts: ['deco', 'didone', 'luxe'],
    palette: ['#0F1B2D', '#1E3A3A', '#C9A44C', '#E8D9B5', '#2B2B2B'],
  },
  {
    id: 'boheme', label: 'Bohème', en: ['bohemian', 'boho'],
    textures: ['rattan texture', 'woven texture'], patterns: ['paisley pattern', 'ikat'],
    fonts: ['serif-soft', 'handwritten', 'boho'],
    palette: ['#E9D8C4', '#D08C60', '#9C6644', '#7F5539', '#B5A886'],
  },
  {
    id: 'industriel', label: 'Industriel', en: ['industrial', 'factory'],
    textures: ['rust metal texture', 'brick wall texture'], patterns: ['metal grid'],
    fonts: ['grotesk', 'condensed', 'industrial'],
    palette: ['#2E2E2E', '#5C5C5C', '#9A8F84', '#B5651D', '#D9D9D9'],
  },
  {
    id: 'japandi', label: 'Japonais / Japandi', en: ['japanese', 'zen'],
    textures: ['washi paper texture', 'bamboo texture'], patterns: ['japanese pattern', 'seigaiha'],
    fonts: ['serif-light', 'japanese', 'minimal'],
    palette: ['#EFEBE4', '#D3C7B6', '#A39B8B', '#5A5246', '#2F2B26'],
  },
  {
    id: 'y2k', label: 'Y2K / Futuriste', en: ['futuristic', 'chrome'],
    textures: ['holographic texture', 'chrome metal texture'], patterns: ['psychedelic pattern'],
    fonts: ['tech', 'rounded', 'y2k'],
    palette: ['#C0C0D8', '#FF6EC7', '#7DF9FF', '#B967FF', '#1B1B3A'],
  },
  {
    id: 'organique', label: 'Organique', en: ['organic', 'natural'],
    textures: ['sand texture', 'stone texture'], patterns: ['botanical illustration', 'leaf pattern'],
    fonts: ['serif-soft', 'humanist', 'organic'],
    palette: ['#EDE6D6', '#C2B280', '#8A9A5B', '#5F7161', '#3E3B32'],
  },
  {
    id: 'luxe', label: 'Luxe / Élégant', en: ['luxury', 'elegant'],
    textures: ['marble texture', 'velvet texture'], patterns: ['damask pattern', 'gold ornament'],
    fonts: ['didone', 'luxe', 'serif'],
    palette: ['#0B0B0B', '#2C2A29', '#C5A880', '#EAE0D5', '#7A1E2C'],
  },
  {
    id: 'retro70', label: 'Rétro 70s', en: ['1970s', 'retro'],
    textures: ['corduroy texture', 'film grain'], patterns: ['1970s pattern', 'wave pattern'],
    fonts: ['retro', 'rounded', 'display'],
    palette: ['#F2C14E', '#F78154', '#B4436C', '#5D2E46', '#4D9078'],
  },
  {
    id: 'pop', label: 'Pop / Coloré', en: ['colorful', 'pop art'],
    textures: ['paint texture', 'confetti'], patterns: ['memphis pattern', 'polka dot pattern'],
    fonts: ['display', 'rounded', 'pop'],
    palette: ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93'],
  },
];

export const MOODS = [
  { id: 'calme', label: 'Calme', en: ['calm', 'serene'], textures: ['linen texture'], fonts: ['minimal', 'serif-light'], palette: ['#EEF0EB', '#CFD8D3', '#A3B5AE', '#6F8580', '#3D4B49'] },
  { id: 'chaleureuse', label: 'Chaleureuse', en: ['warm', 'cozy'], textures: ['wood texture'], fonts: ['serif-soft', 'rounded'], palette: ['#F6E7D8', '#E8B48A', '#C97B4A', '#8E4A2E', '#4A2C21'] },
  { id: 'mysterieuse', label: 'Mystérieuse', en: ['mysterious', 'fog'], textures: ['smoke texture'], fonts: ['serif', 'deco'], palette: ['#1B1D24', '#2F3440', '#4C5466', '#8A8FA3', '#C9B79C'] },
  { id: 'energique', label: 'Énergique', en: ['vibrant', 'dynamic'], textures: ['paint splash'], fonts: ['condensed', 'display'], palette: ['#FF4B3E', '#FFB30F', '#1B998B', '#2D3047', '#F7F7F2'] },
  { id: 'romantique', label: 'Romantique', en: ['romantic', 'pastel'], textures: ['silk texture'], fonts: ['script', 'serif-light'], palette: ['#FBEFEF', '#F4C7C3', '#E39B99', '#B5838D', '#6D597A'] },
  { id: 'melancolique', label: 'Mélancolique', en: ['melancholy', 'rain'], textures: ['rain on glass'], fonts: ['serif', 'serif-light'], palette: ['#D9DDE0', '#9AA5AD', '#6B7880', '#46525A', '#262E33'] },
  { id: 'lumineuse', label: 'Lumineuse', en: ['bright', 'sunlight'], textures: ['white plaster texture'], fonts: ['sans', 'geometric'], palette: ['#FFFDF6', '#FFF1C1', '#FFD87A', '#A7D3E8', '#5B8FA8'] },
  { id: 'dramatique', label: 'Sombre / Dramatique', en: ['dramatic', 'shadow'], textures: ['black stone texture'], fonts: ['didone', 'condensed'], palette: ['#0A0A0A', '#1F1F1F', '#3A2E2A', '#8C1C13', '#D4C5B0'] },
  { id: 'naturelle', label: 'Naturelle', en: ['nature', 'forest'], textures: ['moss texture'], fonts: ['humanist', 'organic'], palette: ['#E9EDE0', '#B5C99A', '#87986A', '#5A6B47', '#2F3A2A'] },
  { id: 'urbaine', label: 'Urbaine', en: ['urban', 'city'], textures: ['asphalt texture'], fonts: ['grotesk', 'condensed'], palette: ['#E4E4E4', '#A0A4A8', '#5E6469', '#2B2F33', '#F2B705'] },
  { id: 'onirique', label: 'Onirique', en: ['dreamy', 'mist'], textures: ['clouds'], fonts: ['serif-light', 'script'], palette: ['#F3EEF8', '#D9CFF0', '#B7C4F0', '#9FB8D9', '#6E6A9E'] },
  { id: 'festive', label: 'Festive', en: ['festive', 'celebration'], textures: ['glitter texture'], fonts: ['display', 'retro'], palette: ['#FFF3E2', '#FFB4A2', '#E5989B', '#B5179E', '#3A0CA3'] },
];

// Petit dictionnaire FR → EN pour les mots-clés libres.
const FR_EN = {
  café: 'coffee', cafe: 'coffee', restaurant: 'restaurant', boulangerie: 'bakery', pain: 'bread', fleur: 'flower', fleurs: 'flowers',
  mer: 'sea', océan: 'ocean', ocean: 'ocean', plage: 'beach', montagne: 'mountain', montagnes: 'mountains', forêt: 'forest', foret: 'forest',
  arbre: 'tree', arbres: 'trees', ville: 'city', rue: 'street', nuit: 'night', jour: 'day', soleil: 'sun', lune: 'moon', ciel: 'sky',
  nuage: 'cloud', nuages: 'clouds', pluie: 'rain', neige: 'snow', hiver: 'winter', été: 'summer', ete: 'summer', automne: 'autumn',
  printemps: 'spring', bois: 'wood', pierre: 'stone', béton: 'concrete', beton: 'concrete', verre: 'glass', métal: 'metal', metal: 'metal',
  papier: 'paper', tissu: 'fabric', lin: 'linen', soie: 'silk', velours: 'velvet', cuir: 'leather', marbre: 'marble', or: 'gold', argent: 'silver',
  maison: 'house', chambre: 'bedroom', cuisine: 'kitchen', salon: 'living room', jardin: 'garden', plante: 'plant', plantes: 'plants',
  vin: 'wine', thé: 'tea', the: 'tea', chocolat: 'chocolate', fruit: 'fruit', fruits: 'fruits', gâteau: 'cake', gateau: 'cake',
  bijou: 'jewelry', bijoux: 'jewelry', parfum: 'perfume', cosmétique: 'cosmetics', cosmetique: 'cosmetics', vêtement: 'clothing', vetement: 'clothing',
  voiture: 'car', vélo: 'bicycle', velo: 'bicycle', livre: 'book', livres: 'books', musique: 'music', danse: 'dance', théâtre: 'theater',
  sport: 'sport', yoga: 'yoga', mariage: 'wedding', enfant: 'child', enfants: 'children', animal: 'animal', chat: 'cat', chien: 'dog', oiseau: 'bird',
  cheval: 'horse', désert: 'desert', desert: 'desert', lac: 'lake', rivière: 'river', riviere: 'river', île: 'island', ile: 'island',
  rose: 'pink', rouge: 'red', bleu: 'blue', vert: 'green', jaune: 'yellow', noir: 'black', blanc: 'white', gris: 'grey', orange: 'orange',
  violet: 'purple', beige: 'beige', marron: 'brown', doré: 'golden', dore: 'golden', céramique: 'ceramic', ceramique: 'ceramic',
  poterie: 'pottery', lumière: 'light', lumiere: 'light', ombre: 'shadow', architecture: 'architecture', église: 'church', musée: 'museum',
  tropical: 'tropical', méditerranée: 'mediterranean', mediterranee: 'mediterranean', paris: 'paris', japon: 'japan', italie: 'italy',
};

export function translateKeywords(text) {
  return (text || '')
    .toLowerCase()
    .split(/[,;\n]+|\s+(?:et|de|du|des|la|le|les|un|une|avec|pour)\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => chunk.split(/\s+/).map((w) => FR_EN[w] || w).join(' '))
    .filter((w) => w.length > 1);
}
