import * as THREE from 'three'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'

/**
 * Utilitários para criação e manipulação de geometrias 3D
 */

/**
 * Centraliza a geometria no plano XY e posiciona a base exatamente em Z = 0 (sobre a mesa de impressão)
 */
export function placeOnBuildPlate(geometry) {
  geometry.computeBoundingBox()
  const box = geometry.boundingBox
  const center = new THREE.Vector3()
  box.getCenter(center)

  // Desloca para centralizar em X e Y, e encostar a base em Z = 0
  geometry.translate(-center.x, -center.y, -box.min.z)
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()
  return geometry
}

/**
 * Mede as dimensões de uma geometria em milímetros e calcula o volume aproximado
 */
export function measureGeometry(geometry) {
  geometry.computeBoundingBox()
  const box = geometry.boundingBox
  const size = new THREE.Vector3()
  box.getSize(size)

  // Cálculo de volume aproximado do Bounding Box e malha
  const bboxVolumeCm3 = (size.x * size.y * size.z) / 1000

  // Estimativa de volume real da peça (aproximadamente 35-50% do Bounding Box para peças típicas)
  const estimatedSolidVolumeCm3 = Math.max(1, bboxVolumeCm3 * 0.42)

  return {
    widthMm: Math.round(size.x),
    depthMm: Math.round(size.y),
    heightMm: Math.round(size.z),
    volumeCm3: Math.round(estimatedSolidVolumeCm3 * 10) / 10,
    bboxVolumeCm3: Math.round(bboxVolumeCm3 * 10) / 10,
  }
}

/**
 * Criação procedural de geometrias 3D elegantes para o catálogo
 */

export function createSpiralVaseGeometry() {
  const points = []
  const height = 110
  const segments = 60

  // Perfil da curva do vaso
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const z = t * height
    // Equação de curva do vaso com bojo e pescoço suave
    const r = 24 + Math.sin(t * Math.PI * 1.5) * 16 + Math.cos(t * Math.PI * 3) * 4
    points.push(new THREE.Vector2(r, z))
  }

  // Revolução com torção geométrica (16 facetas poligonais para visual moderno)
  const baseGeom = new THREE.LatheGeometry(points, 24)
  const pos = baseGeom.attributes.position

  // Aplica torção espiral ao longo do eixo Z (altura)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const angle = (z / height) * Math.PI * 0.8
    const cosA = Math.cos(angle)
    const sinA = Math.sin(angle)
    pos.setXY(i, x * cosA - y * sinA, x * sinA + y * cosA)
  }

  // Gira para orientar o Z para cima (mesa de impressão)
  baseGeom.rotateX(-Math.PI / 2)
  return placeOnBuildPlate(baseGeom)
}

export function createPhoneStandGeometry() {
  const groupGeom = new THREE.BufferGeometry()

  // Base do suporte
  const base = new THREE.BoxGeometry(75, 85, 8)
  base.translate(0, 0, 4)

  // Encosto inclinado (65 graus)
  const back = new THREE.BoxGeometry(70, 8, 100)
  back.rotateX(Math.PI / 7)
  back.translate(0, 10, 50)

  // Trava frontal / gancho para o celular
  const hook = new THREE.BoxGeometry(70, 20, 16)
  hook.translate(0, -28, 10)

  // Apoio traseiro inclinado
  const strut = new THREE.BoxGeometry(20, 50, 10)
  strut.rotateX(-Math.PI / 4)
  strut.translate(0, 25, 25)

  // Junta as caixas
  const meshes = [base, back, hook, strut]
  const merged = mergeBufferGeometries(meshes)
  return placeOnBuildPlate(merged)
}

export function createBenchyBoatGeometry() {
  // Casco do barco Benchy
  const hullPoints = []
  hullPoints.push(new THREE.Vector2(0, 0))
  hullPoints.push(new THREE.Vector2(14, 2))
  hullPoints.push(new THREE.Vector2(22, 10))
  hullPoints.push(new THREE.Vector2(25, 24))
  hullPoints.push(new THREE.Vector2(24, 48))
  hullPoints.push(new THREE.Vector2(0, 56))

  const hull = new THREE.CylinderGeometry(18, 12, 54, 16)
  hull.scale(1.4, 0.45, 0.7)
  hull.rotateZ(Math.PI / 2)
  hull.translate(0, 0, 12)

  // Cabine
  const cabin = new THREE.BoxGeometry(22, 26, 24)
  cabin.translate(0, -2, 28)

  // Teto da cabine curvado
  const roof = new THREE.CylinderGeometry(14, 14, 26, 12, 1, false, 0, Math.PI)
  roof.rotateZ(Math.PI / 2)
  roof.translate(0, -2, 40)

  // Chaminé
  const chimney = new THREE.CylinderGeometry(3.5, 4, 16, 12)
  chimney.rotateX(Math.PI / 2)
  chimney.translate(0, -4, 46)

  // Caixa de carga na popa
  const cargoBox = new THREE.BoxGeometry(16, 14, 10)
  cargoBox.translate(0, 18, 15)

  const merged = mergeBufferGeometries([hull, cabin, roof, chimney, cargoBox])
  return placeOnBuildPlate(merged)
}

export function createPlanetaryGearGeometry() {
  // Engrenagem central Sol
  const sunGear = new THREE.CylinderGeometry(16, 16, 14, 18)
  sunGear.rotateX(Math.PI / 2)

  // 4 Satélites planetários em volta
  const satellites = []
  const count = 4
  const orbitRadius = 36
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const sat = new THREE.CylinderGeometry(12, 12, 14, 14)
    sat.rotateX(Math.PI / 2)
    sat.translate(Math.cos(angle) * orbitRadius, Math.sin(angle) * orbitRadius, 0)
    satellites.push(sat)
  }

  // Anel externo com dentes
  const outerRing = new THREE.TorusGeometry(52, 6, 12, 32)

  const merged = mergeBufferGeometries([sunGear, ...satellites, outerRing])
  return placeOnBuildPlate(merged)
}

export function createHexOrganizerGeometry() {
  const hexes = []
  const hexRadius = 18
  const hexHeight = 65

  // Padrão colmeia 7 hexágonos
  const positions = [
    [0, 0, 75],
    [32, 0, 60],
    [-32, 0, 60],
    [16, 28, 50],
    [-16, 28, 50],
    [16, -28, 50],
    [-16, -28, 50],
  ]

  for (const [x, y, h] of positions) {
    // Hexágono externo
    const hex = new THREE.CylinderGeometry(hexRadius, hexRadius, h, 6)
    hex.rotateX(Math.PI / 2)
    hex.translate(x, y, h / 2)
    hexes.push(hex)
  }

  const merged = mergeBufferGeometries(hexes)
  return placeOnBuildPlate(merged)
}

export function createCubeLanternGeometry() {
  // Cubo geométrico vazado Voronoi / Low-Poly
  const cube = new THREE.BoxGeometry(60, 60, 60, 4, 4, 4)
  const pos = cube.attributes.position

  // Aplica deformação facetada tipo low-poly
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    // Suave perturbação nos vértices
    const noise = Math.sin(x * 0.15) * Math.cos(y * 0.15) * 3
    pos.setXYZ(i, x + noise, y + noise, z)
  }

  // Base de encaixe para vela LED
  const baseLid = new THREE.CylinderGeometry(20, 20, 4, 16)
  baseLid.rotateX(Math.PI / 2)
  baseLid.translate(0, 0, -28)

  const merged = mergeBufferGeometries([cube, baseLid])
  return placeOnBuildPlate(merged)
}

export function createFlexDragonGeometry() {
  // Segmentos articulados de criatura / dragão flex
  const segments = []
  const total = 9
  for (let i = 0; i < total; i++) {
    const scale = 1 - (i / total) * 0.45
    const seg = new THREE.ConeGeometry(12 * scale, 18, 6)
    seg.rotateZ(Math.PI / 2)
    seg.rotateX(Math.PI / 2)
    seg.translate((i - total / 2) * 16, Math.sin(i * 0.6) * 10, 8 * scale)

    // Espinhos dorsais
    const spike = new THREE.ConeGeometry(3 * scale, 10 * scale, 4)
    spike.translate((i - total / 2) * 16, Math.sin(i * 0.6) * 10, 16 * scale)

    segments.push(seg, spike)
  }

  // Cabeça do dragão
  const head = new THREE.BoxGeometry(22, 18, 14)
  head.translate((-total / 2) * 16 - 12, 0, 10)
  segments.push(head)

  const merged = mergeBufferGeometries(segments)
  return placeOnBuildPlate(merged)
}

export function createUtilityKeychainGeometry() {
  // Chaveiro multifunção ergonômico
  const body = new THREE.BoxGeometry(65, 24, 6)
  body.translate(0, 0, 3)

  // Gancho / Abridor
  const opener = new THREE.TorusGeometry(10, 3, 8, 16)
  opener.translate(26, 0, 3)

  // Orifício para argola do chaveiro
  const ringHole = new THREE.CylinderGeometry(4, 4, 10, 16)
  ringHole.rotateX(Math.PI / 2)
  ringHole.translate(-26, 0, 3)

  const merged = mergeBufferGeometries([body, opener])
  return placeOnBuildPlate(merged)
}

/**
 * Função utilitária para unir múltiplas BufferGeometries em uma só
 */
function mergeBufferGeometries(geometries) {
  let totalVertices = 0
  for (const g of geometries) {
    totalVertices += g.attributes.position.count
  }

  const positions = new Float32Array(totalVertices * 3)
  const normals = new Float32Array(totalVertices * 3)

  let offset = 0
  for (const g of geometries) {
    const pos = g.attributes.position
    // Assegura normais
    if (!g.attributes.normal) {
      g.computeVertexNormals()
    }
    const norm = g.attributes.normal

    // Converte para não indexado se necessário para mesclar com segurança
    const nonIndexed = g.index ? g.toNonIndexed() : g
    const p = nonIndexed.attributes.position
    const n = nonIndexed.attributes.normal

    for (let i = 0; i < p.array.length; i++) {
      positions[offset + i] = p.array[i]
      normals[offset + i] = n ? n.array[i] : 0
    }
    offset += p.array.length
  }

  const merged = new THREE.BufferGeometry()
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  merged.computeVertexNormals()
  return merged
}

/**
 * Carregador de arquivo STL enviado pelo usuário (ArrayBuffer)
 */
export function parseSTLFile(arrayBuffer) {
  const loader = new STLLoader()
  const geometry = loader.parse(arrayBuffer)
  return placeOnBuildPlate(geometry)
}
