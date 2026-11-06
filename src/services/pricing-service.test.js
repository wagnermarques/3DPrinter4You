import test from 'node:test'
import assert from 'node:assert/strict'
import { calculatePrintQuote, formatBRL, formatPrintTime } from './pricing-service.js'
import { filterCatalog, CATALOG_MODELS } from './catalog-service.js'
import { getMaterial } from '../config/materials.js'
import { getColor } from '../config/colors.js'

test('formatBRL formata valores em moeda brasileira', () => {
  const formatted = formatBRL(35.5)
  assert.ok(formatted.includes('35,50'))
})

test('formatPrintTime formata minutos em horas e minutos', () => {
  assert.equal(formatPrintTime(45), '45 min')
  assert.equal(formatPrintTime(120), '2h')
  assert.equal(formatPrintTime(145), '2h 25m')
})

test('calculatePrintQuote calcula orçamento com descontos de volume', () => {
  const quote1 = calculatePrintQuote({
    baseWeightGrams: 50,
    basePrintTimeMinutes: 120,
    materialId: 'pla',
    quantity: 1,
  })
  assert.ok(quote1.unitPrice > 0)
  assert.equal(quote1.quantity, 1)
  assert.equal(quote1.discountPercentage, 0)

  // Desconto de 10 unidades (18% OFF)
  const quote10 = calculatePrintQuote({
    baseWeightGrams: 50,
    basePrintTimeMinutes: 120,
    materialId: 'pla',
    quantity: 10,
  })
  assert.equal(quote10.discountPercentage, 0.18)
  assert.ok(quote10.totalPrice < quote1.unitPrice * 10)
})

test('filterCatalog filtra por categoria e busca textual', () => {
  const all = filterCatalog({ category: 'todos' })
  assert.equal(all.length, CATALOG_MODELS.length)

  const decor = filterCatalog({ category: 'decoracao' })
  assert.ok(decor.length > 0)
  assert.ok(decor.every((m) => m.category === 'decoracao'))

  const searchVase = filterCatalog({ search: 'vaso' })
  assert.ok(searchVase.length > 0)
  assert.ok(searchVase.some((m) => m.title.toLowerCase().includes('vaso')))
})

test('getMaterial e getColor retornam padrões válidos', () => {
  const pla = getMaterial('pla')
  assert.equal(pla.id, 'pla')
  assert.ok(pla.pricePerGram > 0)

  const defaultMat = getMaterial('nao-existe')
  assert.ok(defaultMat)

  const black = getColor('black')
  assert.equal(black.id, 'black')
  assert.ok(black.hex.startsWith('#'))
})
