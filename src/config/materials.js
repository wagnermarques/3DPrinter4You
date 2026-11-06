/**
 * Definições de filamentos e materiais para impressão 3D
 */
export const MATERIALS = [
  {
    id: 'pla',
    name: 'PLA Premium',
    badge: 'Mais Popular',
    description: 'Excelente acabamento superficial, ecológico (biodegradável derivado do milho), ideal para decoração, protótipos e miniaturas.',
    pricePerGram: 0.16,
    density: 1.24, // g/cm³
    bedTemp: '60°C',
    nozzleTemp: '205°C',
    tags: ['Ecológico', 'Alta Precisão', 'Decoração', 'Fácil Impressão'],
    recommendedFor: ['Vasos e Decoração', 'Action Figures', 'Brinquedos', 'Protótipos Rápidos'],
    color: '#0284c7'
  },
  {
    id: 'petg',
    name: 'PETG Ultra Resistente',
    badge: 'Alta Resistência',
    description: 'Combina a facilidade do PLA com a resistência mecânica e térmica do ABS. Resistente à água, intempéries e raios UV.',
    pricePerGram: 0.19,
    density: 1.27,
    bedTemp: '80°C',
    nozzleTemp: '240°C',
    tags: ['Resistente UV', 'Impermeável', 'Impacto', 'Uso Externo'],
    recommendedFor: ['Suportes de Carro/Moto', 'Caixas Elétricas', 'Peças Externas', 'Ganchos Funcionais'],
    color: '#059669'
  },
  {
    id: 'abs',
    name: 'ABS Engenharia',
    badge: 'Industrial',
    description: 'Material rígido para aplicações que exigem resistência a altas temperaturas (até 100°C) e impacto. Permite acabamento acetona.',
    pricePerGram: 0.21,
    density: 1.04,
    bedTemp: '100°C',
    nozzleTemp: '250°C',
    tags: ['Resiste Calor', 'Usinável', 'Engenharia', 'Automotivo'],
    recommendedFor: ['Peças Automotivas', 'Engrenagens', 'Equipamentos Industriais', 'Gabinetes'],
    color: '#d97706'
  },
  {
    id: 'tpu',
    name: 'TPU Flexível 95A',
    badge: 'Flexível',
    description: 'Filamento elástico e emborrachado com dureza Shore 95A. Não racha, amortece impactos e é resistente a óleos e abrasão.',
    pricePerGram: 0.28,
    density: 1.21,
    bedTemp: '50°C',
    nozzleTemp: '225°C',
    tags: ['Emborrachado', 'Anti-impacto', 'Elástico', 'Resistente a Óleos'],
    recommendedFor: ['Capinhas de Celular', 'Gaxetas e Vedações', 'Pneus de Robótica', 'Amortecedores'],
    color: '#9333ea'
  },
  {
    id: 'resina',
    name: 'Resina 8K Alta Definição',
    badge: 'Máximo Detalhe',
    description: 'Polimerização por luz UV (SLA/MSLA) com camadas de até 0.03mm. Perfeição micrométrica sem linhas de camadas visíveis.',
    pricePerGram: 0.38,
    density: 1.15,
    bedTemp: 'N/A (Luz UV)',
    nozzleTemp: 'Cura UV 405nm',
    tags: ['Micrométrico', 'Sem Linhas Visíveis', 'Colecionáveis', 'Joalheria'],
    recommendedFor: ['Miniaturas de RPG', 'Bustos e Esculturas', 'Protótipos Médicos/Odonto', 'Joias'],
    color: '#e11d48'
  }
]

export function getMaterial(id) {
  return MATERIALS.find((m) => m.id === id) || MATERIALS[0]
}
