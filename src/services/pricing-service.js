import { getMaterial } from '../config/materials.js'
import { LAYER_QUALITIES, INFILL_PRESETS } from '../config/print-settings.js'

/**
 * Serviço de cálculo de custos e orçamentos para impressão 3D
 */

// Custos operacionais base
export const PRICING_CONFIG = {
  machineHourlyRate: 6.5, // R$/hora da máquina em funcionamento
  baseSetupFee: 5.0, // R$ taxa de preparação, fatiamento e pós-processamento
  deliveryPickupPrice: 0.0, // Retirada grátis
  deliveryStandardPrice: 18.0, // PAC / Correios padrão
  deliveryExpressPrice: 28.0, // SEDEX / Expressa
}

/**
 * Formata um valor numérico em reais (BRL)
 */
export function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata minutos em string legível (ex: "2h 45m" ou "35m")
 */
export function formatPrintTime(minutes) {
  const rounded = Math.round(minutes)
  const h = Math.floor(rounded / 60)
  const m = rounded % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * Calcula o orçamento detalhado de impressão
 */
export function calculatePrintQuote({
  baseWeightGrams = 50,
  basePrintTimeMinutes = 120,
  materialId = 'pla',
  colorId = 'black',
  infillId = 'standard',
  qualityId = 'standard',
  quantity = 1,
} = {}) {
  const material = getMaterial(materialId)
  const infill = INFILL_PRESETS.find((i) => i.id === infillId) || INFILL_PRESETS[1]
  const quality = LAYER_QUALITIES.find((q) => q.id === qualityId) || LAYER_QUALITIES[1]

  // Peso efetivo ajustado pelo preenchimento (infill)
  const effectiveWeightGrams = Math.round(baseWeightGrams * infill.weightMultiplier)

  // Tempo efetivo ajustado pela altura de camada (qualidade) e preenchimento
  const effectiveTimeMinutes = Math.round(
    basePrintTimeMinutes * quality.timeMultiplier * infill.timeMultiplier
  )

  // Custo de filamento / matéria-prima
  const filamentCost = effectiveWeightGrams * material.pricePerGram

  // Custo de máquina e energia
  const machineHours = effectiveTimeMinutes / 60
  const machineCost = machineHours * PRICING_CONFIG.machineHourlyRate

  // Preço unitário base
  const unitRawPrice = (filamentCost + machineCost + PRICING_CONFIG.baseSetupFee) * quality.priceMultiplier
  // Arredonda para centavos bonitos
  const unitPrice = Math.max(12, Math.round(unitRawPrice * 2) / 2)

  // Desconto por volume / quantidade
  let discountPercentage = 0
  if (quantity >= 10) discountPercentage = 0.18
  else if (quantity >= 5) discountPercentage = 0.12
  else if (quantity >= 3) discountPercentage = 0.07

  const subtotal = unitPrice * quantity
  const discountAmount = subtotal * discountPercentage
  const totalPrice = subtotal - discountAmount

  return {
    unitPrice,
    quantity,
    subtotal,
    discountPercentage,
    discountAmount,
    totalPrice,
    effectiveWeightGrams,
    effectiveTimeMinutes,
    totalTimeMinutes: effectiveTimeMinutes * quantity,
    totalWeightGrams: effectiveWeightGrams * quantity,
    filamentCost,
    machineCost,
    material,
    infill,
    quality,
  }
}
