import { LitElement, html, css } from 'lit'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { measureGeometry } from '../services/stl-generator.js'

export class Model3DViewer extends LitElement {
  static properties = {
    geometry: { type: Object },
    modelColor: { type: String },
    wireframe: { type: Boolean },
    autoRotate: { type: Boolean },
    showBed: { type: Boolean },
    height: { type: String },
    showDimensions: { type: Boolean },
    loading: { type: Boolean },
  }

  static styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 280px;
      background: radial-gradient(circle at 50% 30%, #1e293b 0%, #0f172a 100%);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4);
    }

    .canvas-container {
      width: 100%;
      height: 100%;
      min-height: inherit;
      cursor: grab;
    }

    .canvas-container:active {
      cursor: grabbing;
    }

    /* Toolbar de controles 3D sobre o canvas */
    .controls-overlay {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      z-index: 10;
    }

    .tool-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      color: #f8fafc;
      cursor: pointer;
      font-size: 18px;
      transition: all 0.2s ease;
      user-select: none;
    }

    .tool-btn:hover {
      background: rgba(30, 41, 59, 0.95);
      border-color: #0284c7;
      transform: scale(1.05);
    }

    .tool-btn.active {
      background: #0284c7;
      color: #ffffff;
      border-color: #38bdf8;
      box-shadow: 0 0 12px rgba(2, 132, 199, 0.5);
    }

    /* Badge de dimensões no rodapé do canvas */
    .dimensions-badge {
      position: absolute;
      bottom: 12px;
      left: 12px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 6px 12px;
      color: #cbd5e1;
      font-family: monospace;
      font-size: 11px;
      letter-spacing: 0.5px;
      display: flex;
      gap: 12px;
      z-index: 10;
      pointer-events: none;
    }

    .dim-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .dim-axis {
      color: #38bdf8;
      font-weight: bold;
    }

    /* Indicador de instruções de interação */
    .hint-label {
      position: absolute;
      top: 12px;
      left: 12px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.6);
      background: rgba(0, 0, 0, 0.35);
      padding: 4px 8px;
      border-radius: 4px;
      pointer-events: none;
    }

    .loading-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(15, 23, 42, 0.85);
      color: #38bdf8;
      font-size: 14px;
      gap: 8px;
      z-index: 20;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(56, 189, 248, 0.2);
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `

  constructor() {
    super()
    this.modelColor = '#0284c7'
    this.wireframe = false
    this.autoRotate = true
    this.showBed = true
    this.height = '360px'
    this.showDimensions = true
    this.loading = false

    this._measuredDimensions = { widthMm: 0, depthMm: 0, heightMm: 0 }
  }

  firstUpdated() {
    this._initThree()
    if (this.geometry) {
      this._updateMeshGeometry(this.geometry)
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId)
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect()
    }
    if (this._renderer) {
      this._renderer.dispose()
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('geometry') && this.geometry) {
      this._updateMeshGeometry(this.geometry)
    }
    if (changedProperties.has('modelColor') && this._material) {
      this._material.color.set(this.modelColor)
    }
    if (changedProperties.has('wireframe') && this._material) {
      this._material.wireframe = this.wireframe
    }
    if (changedProperties.has('autoRotate') && this._controls) {
      this._controls.autoRotate = this.autoRotate
    }
    if (changedProperties.has('showBed') && this._bedGroup) {
      this._bedGroup.visible = this.showBed
    }
    if (changedProperties.has('height')) {
      this.style.height = this.height
      this._onResize()
    }
  }

  _initThree() {
    const container = this.shadowRoot.querySelector('.canvas-container')
    if (!container) return

    const width = container.clientWidth || 400
    const height = container.clientHeight || 360

    // Cena
    this._scene = new THREE.Scene()

    // Câmera com ângulo isométrico agradável
    this._camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000)
    this._camera.position.set(160, -200, 150)
    this._camera.up.set(0, 0, 1) // Z para cima (padrão de impressão 3D)

    // Renderizador WebGL
    this._renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this._renderer.setSize(width, height)
    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this._renderer.shadowMap.enabled = true
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(this._renderer.domElement)

    // Controles de Órbita
    this._controls = new OrbitControls(this._camera, this._renderer.domElement)
    this._controls.enableDamping = true
    this._controls.dampingFactor = 0.08
    this._controls.autoRotate = this.autoRotate
    this._controls.autoRotateSpeed = 1.8
    this._controls.maxPolarAngle = Math.PI / 2 - 0.02 // não descer abaixo da mesa
    this._controls.minDistance = 30
    this._controls.maxDistance = 600
    this._controls.target.set(0, 0, 35)

    // Iluminação estúdio profissional
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    this._scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4)
    keyLight.position.set(100, -150, 200)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 1024
    keyLight.shadow.mapSize.height = 1024
    this._scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.7)
    fillLight.position.set(-150, 100, 150)
    this._scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xfef08a, 0.5)
    rimLight.position.set(0, 200, -50)
    this._scene.add(rimLight)

    // Cama de Impressão 3D (Build Plate de 220x220 mm)
    this._buildPrinterBed()

    // Material do modelo 3D
    this._material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.modelColor),
      roughness: 0.35,
      metalness: 0.15,
      wireframe: this.wireframe,
      flatShading: false,
    })

    // ResizeObserver para responsividade
    this._resizeObserver = new ResizeObserver(() => this._onResize())
    this._resizeObserver.observe(container)

    // Loop de animação
    const animate = () => {
      this._animationFrameId = requestAnimationFrame(animate)
      this._controls.update()
      this._renderer.render(this._scene, this._camera)
    }
    animate()
  }

  _buildPrinterBed() {
    this._bedGroup = new THREE.Group()

    const bedSize = 220 // 220 mm
    // Grade milimétrica
    const grid = new THREE.GridHelper(bedSize, 22, 0x0284c7, 0x334155)
    grid.rotation.x = Math.PI / 2 // Coloca no plano XY com Z vertical
    grid.position.z = -0.1
    this._bedGroup.add(grid)

    // Placa de aço flexível PEI (chapa texturizada)
    const plateGeom = new THREE.PlaneGeometry(bedSize + 10, bedSize + 10)
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      metalness: 0.1,
      depthWrite: false,
    })
    const plateMesh = new THREE.Mesh(plateGeom, plateMat)
    plateMesh.receiveShadow = true
    plateMesh.position.z = -0.5
    this._bedGroup.add(plateMesh)

    // Borda da mesa
    const borderGeom = new THREE.EdgesGeometry(plateGeom)
    const borderMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 })
    const border = new THREE.LineSegments(borderGeom, borderMat)
    border.position.z = -0.3
    this._bedGroup.add(border)

    this._scene.add(this._bedGroup)
  }

  _updateMeshGeometry(geom) {
    if (!this._scene || !geom) return

    if (this._currentMesh) {
      this._scene.remove(this._currentMesh)
      if (this._currentMesh.geometry) {
        this._currentMesh.geometry.dispose()
      }
    }

    this._currentMesh = new THREE.Mesh(geom, this._material)
    this._currentMesh.castShadow = true
    this._currentMesh.receiveShadow = true
    this._scene.add(this._currentMesh)

    // Mede dimensões reais
    this._measuredDimensions = measureGeometry(geom)
    this.requestUpdate()

    // Ajusta a câmera e alvo para centralizar a peça no foco
    const h = this._measuredDimensions.heightMm || 40
    this._controls.target.set(0, 0, h / 2)
  }

  _onResize() {
    const container = this.shadowRoot.querySelector('.canvas-container')
    if (!container || !this._renderer || !this._camera) return
    const width = container.clientWidth
    const height = container.clientHeight
    if (width === 0 || height === 0) return

    this._camera.aspect = width / height
    this._camera.updateProjectionMatrix()
    this._renderer.setSize(width, height)
  }

  resetCamera() {
    if (!this._camera || !this._controls) return
    const h = this._measuredDimensions.heightMm || 40
    this._camera.position.set(160, -200, 150)
    this._controls.target.set(0, 0, h / 2)
    this._controls.update()
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate
  }

  toggleWireframe() {
    this.wireframe = !this.wireframe
  }

  toggleBed() {
    this.showBed = !this.showBed
  }

  render() {
    return html`
      <div class="canvas-container"></div>

      <div class="hint-label">🖱️ Gire com o mouse • Zoom com a roda</div>

      <!-- Barra de ferramentas flutuante -->
      <div class="controls-overlay">
        <button
          class="tool-btn ${this.autoRotate ? 'active' : ''}"
          title="${this.autoRotate ? 'Pausar rotação' : 'Girar automaticamente'}"
          @click=${this.toggleAutoRotate}
        >
          🔄
        </button>
        <button
          class="tool-btn ${this.wireframe ? 'active' : ''}"
          title="Alternar modo Wireframe (Malha Poligonal)"
          @click=${this.toggleWireframe}
        >
          🕸️
        </button>
        <button
          class="tool-btn ${this.showBed ? 'active' : ''}"
          title="Mostrar/Ocultar Mesa de Impressão"
          @click=${this.toggleBed}
        >
          📐
        </button>
        <button
          class="tool-btn"
          title="Centralizar Câmera"
          @click=${this.resetCamera}
        >
          🎯
        </button>
      </div>

      <!-- Badge de Dimensões em mm -->
      ${this.showDimensions
        ? html`
            <div class="dimensions-badge">
              <span class="dim-item">
                <span class="dim-axis">X:</span> ${this._measuredDimensions.widthMm}mm
              </span>
              <span class="dim-item">
                <span class="dim-axis">Y:</span> ${this._measuredDimensions.depthMm}mm
              </span>
              <span class="dim-item">
                <span class="dim-axis">Z:</span> ${this._measuredDimensions.heightMm}mm
              </span>
              ${this._measuredDimensions.volumeCm3 > 0
                ? html`
                    <span class="dim-item">
                      <span class="dim-axis">Vol:</span> ${this._measuredDimensions.volumeCm3} cm³
                    </span>
                  `
                : ''}
            </div>
          `
        : ''}

      ${this.loading
        ? html`
            <div class="loading-overlay">
              <div class="spinner"></div>
              <span>Carregando geometria 3D...</span>
            </div>
          `
        : ''}
    `
  }
}

customElements.define('model-3d-viewer', Model3DViewer)
