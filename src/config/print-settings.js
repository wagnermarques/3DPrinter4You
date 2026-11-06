/**
 * Parâmetros de fatiamento e configurações de impressão
 */
export const LAYER_QUALITIES = [
  {
    id: 'draft',
    name: 'Rascunho Rápido',
    height: '0.28 mm',
    description: 'Menor tempo de impressão, ideal para testes de tamanho e encaixe mecânico.',
    timeMultiplier: 0.72,
    priceMultiplier: 0.85,
  },
  {
    id: 'standard',
    name: 'Padrão Balanceado',
    height: '0.20 mm',
    description: 'Equilíbrio ideal entre resistência mecânica, acabamento superficial e tempo.',
    timeMultiplier: 1.0,
    priceMultiplier: 1.0,
    isDefault: true,
  },
  {
    id: 'fine',
    name: 'Alta Definição',
    height: '0.12 mm',
    description: 'Linhas de camadas quase invisíveis, excelente para peças visíveis e curvas suaves.',
    timeMultiplier: 1.6,
    priceMultiplier: 1.35,
  },
  {
    id: 'ultra',
    name: 'Ultra Detalhe / SLA',
    height: '0.05 mm',
    description: 'Perfeição máxima para colecionáveis, miniaturas minuciosas e joalheria.',
    timeMultiplier: 2.5,
    priceMultiplier: 1.8,
  },
]

export const INFILL_PRESETS = [
  {
    id: 'light',
    percentage: 15,
    name: '15% — Leve / Decorativo',
    description: 'Para vasos, miniaturas e objetos que não sofrerão esforço físico.',
    weightMultiplier: 0.85,
    timeMultiplier: 0.88,
  },
  {
    id: 'standard',
    percentage: 25,
    name: '25% — Padrão Recomendado',
    description: 'Excelente solidez e resistência para a maioria dos usos domésticos.',
    weightMultiplier: 1.0,
    timeMultiplier: 1.0,
    isDefault: true,
  },
  {
    id: 'reinforced',
    percentage: 50,
    name: '50% — Reforçado / Funcional',
    description: 'Para suportes, travas, engrenagens e peças com carga mecânica moderada.',
    weightMultiplier: 1.35,
    timeMultiplier: 1.25,
  },
  {
    id: 'solid',
    percentage: 100,
    name: '100% — Sólido / Extrema Resistência',
    description: 'Peça maciça, máxima resistência ao impacto e compressão estrutural.',
    weightMultiplier: 1.9,
    timeMultiplier: 1.6,
  },
]

export const PRINTER_BED_SPECS = {
  width: 235, // mm (X)
  depth: 235, // mm (Y)
  height: 250, // mm (Z)
  maxPrintVolume: '235 x 235 x 250 mm',
  nozzleDiameter: '0.4 mm (E3D V6 / Bambu Hotend)',
}
