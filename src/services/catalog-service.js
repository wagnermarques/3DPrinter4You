import {
  createSpiralVaseGeometry,
  createPhoneStandGeometry,
  createBenchyBoatGeometry,
  createPlanetaryGearGeometry,
  createHexOrganizerGeometry,
  createCubeLanternGeometry,
  createFlexDragonGeometry,
  createUtilityKeychainGeometry,
} from './stl-generator.js'

export const CATEGORIES = [
  { id: 'todos', label: 'Todos os Modelos', icon: 'apps' },
  { id: 'decoracao', label: 'Decoração & Casa', icon: 'yard' },
  { id: 'utilitarios', label: 'Utilitários & Suportes', icon: 'build' },
  { id: 'miniaturas', label: 'Miniaturas & Geek', icon: 'smart_toy' },
  { id: 'gadgets', label: 'Gadgets & Tech', icon: 'devices' },
  { id: 'brinquedos', label: 'Jogos & Mecânica', icon: 'toys' },
]

export const CATALOG_MODELS = [
  {
    id: 'spiral-vase',
    title: 'Vaso Espiral Geométrico Voronoi',
    category: 'decoracao',
    categoryLabel: 'Decoração & Casa',
    description: 'Vaso moderno com textura helicoidal facetada em espiral. Ideal para flores secas, arranjos ou centro de mesa contemporâneo.',
    defaultMaterial: 'pla',
    defaultColor: 'gold',
    baseWeightGrams: 52,
    basePrintTimeMinutes: 145, // 2h 25m
    dimensions: { x: 70, y: 70, z: 110 },
    rating: 4.9,
    reviewsCount: 38,
    ordersCount: 142,
    generator: createSpiralVaseGeometry,
    tags: ['Vaso', 'Design', 'Espiral', 'Silk Gold', 'Casa'],
    badge: 'Mais Vendido',
  },
  {
    id: 'phone-stand',
    title: 'Suporte Articulado para Smartphone & Tablet',
    category: 'utilitarios',
    categoryLabel: 'Utilitários & Suportes',
    description: 'Suporte de mesa ergonômico com ângulo de visão de 65°, abertura traseira para passagem de cabo de carregador e travas laterais.',
    defaultMaterial: 'petg',
    defaultColor: 'black',
    baseWeightGrams: 64,
    basePrintTimeMinutes: 160, // 2h 40m
    dimensions: { x: 75, y: 85, z: 100 },
    rating: 4.8,
    reviewsCount: 52,
    ordersCount: 230,
    generator: createPhoneStandGeometry,
    tags: ['Celular', 'Escritório', 'PETG', 'Ergonômico'],
    badge: 'Essencial',
  },
  {
    id: 'benchy-boat',
    title: 'Barco 3D Benchy Clássico (Mascote Maker)',
    category: 'miniaturas',
    categoryLabel: 'Miniaturas & Geek',
    description: 'O mundialmente famoso 3DBenchy! Excelente para testar precisão e calibração de impressoras ou como colecionável divertido.',
    defaultMaterial: 'pla',
    defaultColor: 'cyan',
    baseWeightGrams: 28,
    basePrintTimeMinutes: 75, // 1h 15m
    dimensions: { x: 60, y: 31, z: 48 },
    rating: 5.0,
    reviewsCount: 89,
    ordersCount: 310,
    generator: createBenchyBoatGeometry,
    tags: ['Mascote', 'Benchy', 'Maker', 'Colecionável'],
    badge: 'Ícone 3D',
  },
  {
    id: 'flex-dragon',
    title: 'Dragão Articulado Flex com Espinhos Dorsais',
    category: 'miniaturas',
    categoryLabel: 'Miniaturas & Geek',
    description: 'Dragão impresso no esquema Print-in-Place (já sai articulado da mesa sem montagem). Movimento fluido e hipnotizante.',
    defaultMaterial: 'pla',
    defaultColor: 'fire',
    baseWeightGrams: 78,
    basePrintTimeMinutes: 210, // 3h 30m
    dimensions: { x: 180, y: 40, z: 25 },
    rating: 4.9,
    reviewsCount: 44,
    ordersCount: 165,
    generator: createFlexDragonGeometry,
    tags: ['Dragão', 'Articulado', 'Print-in-Place', 'Geek'],
    badge: 'Articulado',
  },
  {
    id: 'hex-organizer',
    title: 'Organizador Colmeia Hexagonal Modular',
    category: 'utilitarios',
    categoryLabel: 'Utilitários & Suportes',
    description: 'Organizador de mesa modular com 7 compartimentos sextavados em alturas escalonadas. Guarda canetas, pincéis e ferramentas.',
    defaultMaterial: 'pla',
    defaultColor: 'titanium',
    baseWeightGrams: 85,
    basePrintTimeMinutes: 230, // 3h 50m
    dimensions: { x: 100, y: 90, z: 75 },
    rating: 4.7,
    reviewsCount: 29,
    ordersCount: 98,
    generator: createHexOrganizerGeometry,
    tags: ['Organizador', 'Colmeia', 'Escritório', 'Minimalista'],
    badge: null,
  },
  {
    id: 'planetary-gear',
    title: 'Mecanismo Planetário Fidget com Engrenagens',
    category: 'brinquedos',
    categoryLabel: 'Jogos & Mecânica',
    description: 'Mecanismo planetário com engrenagem sol central e 4 satélites orbitais sincronizados. Rotação macia e relaxante anti-stress.',
    defaultMaterial: 'petg',
    defaultColor: 'purple',
    baseWeightGrams: 42,
    basePrintTimeMinutes: 110, // 1h 50m
    dimensions: { x: 80, y: 80, z: 14 },
    rating: 4.9,
    reviewsCount: 31,
    ordersCount: 115,
    generator: createPlanetaryGearGeometry,
    tags: ['Mecânica', 'Engrenagem', 'Anti-Stress', 'Fidget'],
    badge: 'Mecânico',
  },
  {
    id: 'cube-lantern',
    title: 'Luminária Cubo Low-Poly com Nicho para Vela LED',
    category: 'decoracao',
    categoryLabel: 'Decoração & Casa',
    description: 'Cubo geométrico vazado com facetas poligonais que projetam sombras estéticas nas paredes quando iluminado internamente por LED.',
    defaultMaterial: 'pla',
    defaultColor: 'white',
    baseWeightGrams: 58,
    basePrintTimeMinutes: 170, // 2h 50m
    dimensions: { x: 65, y: 65, z: 65 },
    rating: 4.8,
    reviewsCount: 18,
    ordersCount: 77,
    generator: createCubeLanternGeometry,
    tags: ['Luminária', 'Low-Poly', 'LED', 'Decoração'],
    badge: null,
  },
  {
    id: 'utility-keychain',
    title: 'Chaveiro Multiuso Ergonômico com Abridor',
    category: 'gadgets',
    categoryLabel: 'Gadgets & Tech',
    description: 'Chaveiro ultra resistente e leve com gancho abridor de garrafas integrado e orifício chanfrado para argola.',
    defaultMaterial: 'petg',
    defaultColor: 'sunset',
    baseWeightGrams: 16,
    basePrintTimeMinutes: 38, // 38m
    dimensions: { x: 65, y: 24, z: 6 },
    rating: 4.6,
    reviewsCount: 22,
    ordersCount: 84,
    generator: createUtilityKeychainGeometry,
    tags: ['Chaveiro', 'Abridor', 'Pocket', 'Leve'],
    badge: 'Econômico',
  },
]

export function getModelById(id) {
  return CATALOG_MODELS.find((m) => m.id === id) || null
}

export function filterCatalog({ category = 'todos', search = '', sortBy = 'popular' } = {}) {
  let list = [...CATALOG_MODELS]

  // Filtro por categoria
  if (category && category !== 'todos') {
    list = list.filter((m) => m.category === category)
  }

  // Busca textual
  if (search.trim()) {
    const term = search.toLowerCase().trim()
    list = list.filter(
      (m) =>
        m.title.toLowerCase().includes(term) ||
        m.description.toLowerCase().includes(term) ||
        m.tags.some((t) => t.toLowerCase().includes(term))
    )
  }

  // Ordenação
  if (sortBy === 'popular') {
    list.sort((a, b) => b.ordersCount - a.ordersCount)
  } else if (sortBy === 'price-asc') {
    list.sort((a, b) => a.baseWeightGrams - b.baseWeightGrams)
  } else if (sortBy === 'price-desc') {
    list.sort((a, b) => b.baseWeightGrams - a.baseWeightGrams)
  } else if (sortBy === 'time-asc') {
    list.sort((a, b) => a.basePrintTimeMinutes - b.basePrintTimeMinutes)
  } else if (sortBy === 'rating') {
    list.sort((a, b) => b.rating - a.rating)
  }

  return list
}
