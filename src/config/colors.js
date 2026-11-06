/**
 * Cores de filamento disponíveis para impressão 3D
 */
export const FILAMENT_COLORS = [
  { id: 'black', name: 'Preto Fosco Stealth', hex: '#18181b', type: 'Fosco', textDark: false },
  { id: 'white', name: 'Branco Neve Puro', hex: '#f8fafc', type: 'Brilhante', textDark: true },
  { id: 'titanium', name: 'Cinza Titânio Metálico', hex: '#475569', type: 'Metálico', textDark: false },
  { id: 'navy', name: 'Azul Marinho Royal', hex: '#1d4ed8', type: 'Brilhante', textDark: false },
  { id: 'cyan', name: 'Azul Turquesa Neon', hex: '#0284c7', type: 'Vibrante', textDark: false },
  { id: 'emerald', name: 'Verde Esmeralda', hex: '#059669', type: 'Brilhante', textDark: false },
  { id: 'fire', name: 'Vermelho Fogo Carmim', hex: '#dc2626', type: 'Vibrante', textDark: false },
  { id: 'sunset', name: 'Laranja Cítrico Sunset', hex: '#ea580c', type: 'Vibrante', textDark: false },
  { id: 'gold', name: 'Ouro Seda Imperial (Silk)', hex: '#d97706', type: 'Seda / Metálico', textDark: false },
  { id: 'yellow', name: 'Amarelo Girassol', hex: '#facc15', type: 'Vibrante', textDark: true },
  { id: 'purple', name: 'Roxo Cyberpunk Nebula', hex: '#9333ea', type: 'Brilhante', textDark: false },
  { id: 'bronze', name: 'Bronze Envelhecido (Silk)', hex: '#78350f', type: 'Seda / Metálico', textDark: false },
  { id: 'silver', name: 'Prata Espacial Silk', hex: '#94a3b8', type: 'Seda / Metálico', textDark: true },
  { id: 'clear', name: 'Translúcido Cristalino', hex: '#e2e8f0', type: 'Translúcido', textDark: true },
]

export function getColor(id) {
  return FILAMENT_COLORS.find((c) => c.id === id) || FILAMENT_COLORS[0]
}
