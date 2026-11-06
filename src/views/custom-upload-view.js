import { LitElement, html, css } from 'lit'
import { MATERIALS, getMaterial } from '../config/materials.js'
import { FILAMENT_COLORS, getColor } from '../config/colors.js'
import { LAYER_QUALITIES, INFILL_PRESETS, PRINTER_BED_SPECS } from '../config/print-settings.js'
import { parseSTLFile, measureGeometry, createBenchyBoatGeometry, createSpiralVaseGeometry } from '../services/stl-generator.js'
import { calculatePrintQuote, formatBRL, formatPrintTime } from '../services/pricing-service.js'
import { orderService } from '../services/order-service.js'
import '../components/model-3d-viewer.js'

export class CustomUploadView extends LitElement {
  static properties = {
    fileName: { type: String },
    fileSizeKb: { type: Number },
    geometry: { type: Object },
    measuredSpecs: { type: Object },
    selectedMaterialId: { type: String },
    selectedColorId: { type: String },
    selectedQualityId: { type: String },
    selectedInfillId: { type: String },
    quantity: { type: Number },
    isLoading: { type: Boolean },
    isDragging: { type: Boolean },
    customerName: { type: String },
    customerPhone: { type: String },
    customerEmail: { type: String },
    deliveryMethod: { type: String },
    customerAddress: { type: String },
    orderNotes: { type: String },
    successMessage: { type: String },
  }

  static styles = css`
    :host {
      display: block;
      padding: 24px;
      max-width: 1320px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .page-title {
      font-size: 28px;
      font-weight: 800;
      color: var(--md-sys-color-on-surface, #0f172a);
      margin: 0 0 8px 0;
    }

    .page-subtitle {
      font-size: 15px;
      color: var(--md-sys-color-on-surface-variant, #64748b);
      margin: 0;
    }

    .layout-grid {
      display: grid;
      grid-template-columns: 1.25fr 1fr;
      gap: 24px;
    }

    @media (max-width: 900px) {
      .layout-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Lado Esquerdo: Dropzone & Visualizador 3D */
    .viewer-panel {
      background: var(--md-sys-color-surface-container, #ffffff);
      border: 1px solid var(--md-sys-color-outline-variant, #e2e8f0);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .dropzone {
      border: 2px dashed #0284c7;
      border-radius: 14px;
      background: rgba(2, 132, 199, 0.04);
      padding: 28px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .dropzone.dragging {
      background: rgba(2, 132, 199, 0.12);
      border-color: #0369a1;
      transform: scale(1.01);
    }

    .dropzone-icon {
      font-size: 36px;
    }

    .dropzone-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }

    .dropzone-hint {
      font-size: 12px;
      color: #64748b;
    }

    .demo-buttons-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      margin-top: 4px;
    }

    .btn-demo {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #475569;
      cursor: pointer;
    }

    .btn-demo:hover {
      border-color: #0284c7;
      color: #0284c7;
    }

    .viewer-container {
      height: 420px;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
    }

    .specs-panel {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      background: var(--md-sys-color-surface-container-high, #f8fafc);
      border-radius: 10px;
      padding: 12px;
      border: 1px solid var(--md-sys-color-outline-variant, #e2e8f0);
    }

    .spec-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .spec-k {
      font-size: 10px;
      text-transform: uppercase;
      color: #94a3b8;
      font-weight: 700;
    }

    .spec-v {
      font-size: 13px;
      font-weight: 800;
      color: #0284c7;
      margin-top: 2px;
    }

    /* Lado Direito: Opções de Impressão */
    .config-panel {
      background: var(--md-sys-color-surface-container, #ffffff);
      border: 1px solid var(--md-sys-color-outline-variant, #e2e8f0);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .section-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0284c7;
      margin-bottom: 8px;
    }

    .materials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 8px;
    }

    .mat-card {
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 8px 10px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      transition: all 0.2s;
    }

    .mat-card.active {
      border-color: #0284c7;
      background: rgba(2, 132, 199, 0.08);
      box-shadow: 0 0 0 2px #0284c7;
    }

    .palette {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .color-dot {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid #ffffff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
      transition: transform 0.2s;
    }

    .color-dot:hover {
      transform: scale(1.15);
    }

    .color-dot.active {
      transform: scale(1.2);
      box-shadow: 0 0 0 3px #0284c7;
    }

    .chips-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .chip {
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    .chip.active {
      background: #0284c7;
      color: #ffffff;
      border-color: #0284c7;
    }

    .input-field {
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 13px;
      width: 100%;
      box-sizing: border-box;
    }

    .quote-box {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .btn-submit {
      padding: 12px 20px;
      border-radius: 10px;
      border: none;
      background: #16a34a;
      color: #ffffff;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
      transition: background 0.2s;
    }

    .btn-submit:hover {
      background: #15803d;
    }

    .toast-msg {
      padding: 12px;
      background: #dcfce7;
      color: #166534;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
    }
  `

  constructor() {
    super()
    this.fileName = 'benchy-boat.stl'
    this.fileSizeKb = 420
    this.geometry = createBenchyBoatGeometry()
    this.measuredSpecs = measureGeometry(this.geometry)
    this.selectedMaterialId = 'pla'
    this.selectedColorId = 'navy'
    this.selectedQualityId = 'standard'
    this.selectedInfillId = 'standard'
    this.quantity = 1
    this.isLoading = false
    this.isDragging = false

    this.customerName = ''
    this.customerPhone = ''
    this.customerEmail = ''
    this.deliveryMethod = 'retirada'
    this.customerAddress = ''
    this.orderNotes = ''
    this.successMessage = ''
  }

  _onDragOver(e) {
    e.preventDefault()
    this.isDragging = true
  }

  _onDragLeave() {
    this.isDragging = false
  }

  _onDrop(e) {
    e.preventDefault()
    this.isDragging = false
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      this._loadFile(e.dataTransfer.files[0])
    }
  }

  _onFileSelect(e) {
    if (e.target.files && e.target.files.length > 0) {
      this._loadFile(e.target.files[0])
    }
  }

  _loadFile(file) {
    if (!file.name.toLowerCase().endsWith('.stl')) {
      alert('Por favor, envie um arquivo 3D no formato .STL.')
      return
    }

    this.isLoading = true
    this.fileName = file.name
    this.fileSizeKb = Math.round(file.size / 1024)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const geom = parseSTLFile(e.target.result)
        this.geometry = geom
        this.measuredSpecs = measureGeometry(geom)
        this.isLoading = false
        this.requestUpdate()
      } catch (err) {
        console.error('Erro ao ler STL:', err)
        alert('Não foi possível ler o arquivo STL. Verifique se o arquivo não está corrompido.')
        this.isLoading = false
      }
    }
    reader.readAsArrayBuffer(file)
  }

  _loadDemo(type) {
    if (type === 'vase') {
      this.geometry = createSpiralVaseGeometry()
      this.fileName = 'vaso-espiral-demo.stl'
    } else {
      this.geometry = createBenchyBoatGeometry()
      this.fileName = '3d-benchy-demo.stl'
    }
    this.measuredSpecs = measureGeometry(this.geometry)
    this.requestUpdate()
  }

  _submitCustomOrder() {
    if (!this.customerName.trim() || !this.customerPhone.trim()) {
      alert('Por favor, informe seu nome e telefone/WhatsApp.')
      return
    }

    const material = getMaterial(this.selectedMaterialId)
    const color = getColor(this.selectedColorId)
    const infill = INFILL_PRESETS.find((i) => i.id === this.selectedInfillId)
    const quality = LAYER_QUALITIES.find((q) => q.id === this.selectedQualityId)

    // Estimativa baseada no volume
    const estimatedWeightGrams = Math.max(15, Math.round(this.measuredSpecs.volumeCm3 * material.density))
    const estimatedMinutes = Math.max(30, Math.round(estimatedWeightGrams * 2.8))

    const quote = calculatePrintQuote({
      baseWeightGrams: estimatedWeightGrams,
      basePrintTimeMinutes: estimatedMinutes,
      materialId: this.selectedMaterialId,
      colorId: this.selectedColorId,
      infillId: this.selectedInfillId,
      qualityId: this.selectedQualityId,
      quantity: this.quantity,
    })

    const item = {
      modelId: 'custom-' + Date.now(),
      title: `Arquivo Personalizado: ${this.fileName}`,
      materialId: this.selectedMaterialId,
      materialName: material.name,
      colorId: this.selectedColorId,
      colorName: color.name,
      colorHex: color.hex,
      infillId: this.selectedInfillId,
      infillName: infill.name,
      qualityId: this.selectedQualityId,
      qualityName: quality.name,
      weightGrams: quote.effectiveWeightGrams,
      printTimeMinutes: quote.effectiveTimeMinutes,
      unitPrice: quote.unitPrice,
      quantity: this.quantity,
      totalPrice: quote.totalPrice,
      dimensions: {
        x: this.measuredSpecs.widthMm,
        y: this.measuredSpecs.depthMm,
        z: this.measuredSpecs.heightMm,
      },
    }

    const deliveryFee = this.deliveryMethod === 'retirada' ? 0 : 18.0
    const order = orderService.createOrder({
      customer: {
        name: this.customerName,
        phone: this.customerPhone,
        email: this.customerEmail,
        deliveryMethod: this.deliveryMethod,
        address: this.customerAddress,
        notes: `[Arquivo STL: ${this.fileName}] ${this.orderNotes}`,
      },
      items: [item],
      deliveryFee,
    })

    const waUrl = orderService.generateWhatsAppUrl(order)
    window.open(waUrl, '_blank')

    this.successMessage = `Solicitação do pedido #${order.id} enviada com sucesso! Abrindo WhatsApp...`
    this.requestUpdate()
  }

  render() {
    const selectedColor = getColor(this.selectedColorId)
    const selectedMaterial = getMaterial(this.selectedMaterialId)

    const estimatedWeightGrams = Math.max(
      15,
      Math.round((this.measuredSpecs?.volumeCm3 || 25) * selectedMaterial.density)
    )
    const estimatedMinutes = Math.max(30, Math.round(estimatedWeightGrams * 2.8))

    const quote = calculatePrintQuote({
      baseWeightGrams: estimatedWeightGrams,
      basePrintTimeMinutes: estimatedMinutes,
      materialId: this.selectedMaterialId,
      colorId: this.selectedColorId,
      infillId: this.selectedInfillId,
      qualityId: this.selectedQualityId,
      quantity: this.quantity,
    })

    return html`
      <div class="page-header">
        <h1 class="page-title">Imprimir Meu Próprio Modelo 3D</h1>
        <p class="page-subtitle">
          Envie seu arquivo <strong>.STL</strong>, inspecione a peça na mesa 3D interativa, veja as dimensões milimétricas,
          escolha o filamento e solicite o orçamento instantâneo.
        </p>
      </div>

      <div class="layout-grid">
        <!-- Lado Esquerdo -->
        <div class="viewer-panel">
          <!-- Dropzone -->
          <div
            class="dropzone ${this.isDragging ? 'dragging' : ''}"
            @dragover=${this._onDragOver}
            @dragleave=${this._onDragLeave}
            @drop=${this._onDrop}
            @click=${() => this.shadowRoot.querySelector('#fileInput').click()}
          >
            <input
              type="file"
              id="fileInput"
              accept=".stl"
              style="display: none;"
              @change=${this._onFileSelect}
            />
            <div class="dropzone-icon">📥</div>
            <div class="dropzone-title">
              ${this.fileName ? html`Arquivo carregado: <strong>${this.fileName}</strong>` : 'Arraste seu arquivo STL aqui ou clique para selecionar'}
            </div>
            <div class="dropzone-hint">Suporta formato STL binário ou ASCII (até 50MB)</div>

            <div class="demo-buttons-row" @click=${(e) => e.stopPropagation()}>
              <span style="font-size: 11px; color: #64748b;">Ou teste agora:</span>
              <button class="btn-demo" @click=${() => this._loadDemo('benchy')}>🚤 Mascote Benchy</button>
              <button class="btn-demo" @click=${() => this._loadDemo('vase')}>🏺 Vaso Espiral</button>
            </div>
          </div>

          <!-- 3D Viewport -->
          <div class="viewer-container">
            <model-3d-viewer
              .geometry=${this.geometry}
              .modelColor=${selectedColor.hex}
              .autoRotate=${true}
              .showBed=${true}
              .showDimensions=${true}
              .loading=${this.isLoading}
              height="100%"
            ></model-3d-viewer>
          </div>

          <!-- Specs Medidas -->
          <div class="specs-panel">
            <div class="spec-box">
              <span class="spec-k">Largura (X)</span>
              <span class="spec-v">${this.measuredSpecs?.widthMm || 0} mm</span>
            </div>
            <div class="spec-box">
              <span class="spec-k">Profundidade (Y)</span>
              <span class="spec-v">${this.measuredSpecs?.depthMm || 0} mm</span>
            </div>
            <div class="spec-box">
              <span class="spec-k">Altura (Z)</span>
              <span class="spec-v">${this.measuredSpecs?.heightMm || 0} mm</span>
            </div>
            <div class="spec-box">
              <span class="spec-k">Volume</span>
              <span class="spec-v">${this.measuredSpecs?.volumeCm3 || 0} cm³</span>
            </div>
          </div>
        </div>

        <!-- Lado Direito: Parâmetros & Envio de Pedido -->
        <div class="config-panel">
          <div>
            <div class="section-title">🧪 Material do Filamento</div>
            <div class="materials-grid">
              ${MATERIALS.map(
                (m) => html`
                  <div
                    class="mat-card ${this.selectedMaterialId === m.id ? 'active' : ''}"
                    @click=${() => (this.selectedMaterialId = m.id)}
                  >
                    <strong style="font-size: 12px;">${m.name}</strong>
                    <span style="font-size: 10px; color: #0284c7;">${m.badge}</span>
                  </div>
                `
              )}
            </div>
          </div>

          <div>
            <div class="section-title">🎨 Cor da Peça (Preview ao Vivo)</div>
            <div class="palette">
              ${FILAMENT_COLORS.map(
                (c) => html`
                  <div
                    class="color-dot ${this.selectedColorId === c.id ? 'active' : ''}"
                    style="background-color: ${c.hex};"
                    title="${c.name}"
                    @click=${() => (this.selectedColorId = c.id)}
                  ></div>
                `
              )}
            </div>
            <span style="font-size: 12px; color: #64748b; margin-top: 4px; display: inline-block;">
              Cor selecionada: <strong>${selectedColor.name}</strong>
            </span>
          </div>

          <div>
            <div class="section-title">⚡ Resolução de Camada</div>
            <div class="chips-row">
              ${LAYER_QUALITIES.map(
                (q) => html`
                  <div
                    class="chip ${this.selectedQualityId === q.id ? 'active' : ''}"
                    @click=${() => (this.selectedQualityId = q.id)}
                  >
                    ${q.height} • ${q.name}
                  </div>
                `
              )}
            </div>
          </div>

          <div>
            <div class="section-title">🧱 Preenchimento (Infill)</div>
            <div class="chips-row">
              ${INFILL_PRESETS.map(
                (inf) => html`
                  <div
                    class="chip ${this.selectedInfillId === inf.id ? 'active' : ''}"
                    @click=${() => (this.selectedInfillId = inf.id)}
                  >
                    ${inf.percentage}%
                  </div>
                `
              )}
            </div>
          </div>

          <!-- Resumo de Orçamento -->
          <div class="quote-box">
            <div style="display: flex; justify-content: space-between; font-size: 13px;">
              <span>Filamento Estimado:</span>
              <strong>${quote.totalWeightGrams}g (${selectedMaterial.name})</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px;">
              <span>Tempo de Impressão:</span>
              <strong>${formatPrintTime(quote.totalTimeMinutes)}</strong>
            </div>
            <div
              style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; color: #0284c7; border-top: 1px dashed #bae6fd; padding-top: 6px;"
            >
              <span>Total Estimado:</span>
              <span>${formatBRL(quote.totalPrice)}</span>
            </div>
          </div>

          <!-- Dados do Solicitante -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div class="section-title">📋 Solicitar Esta Impressão</div>
            <input
              type="text"
              class="input-field"
              placeholder="Seu Nome Completo *"
              .value=${this.customerName}
              @input=${(e) => (this.customerName = e.target.value)}
            />
            <input
              type="text"
              class="input-field"
              placeholder="WhatsApp / Telefone *"
              .value=${this.customerPhone}
              @input=${(e) => (this.customerPhone = e.target.value)}
            />
            <input
              type="text"
              class="input-field"
              placeholder="Observações (ex: resistência mecânica, orientação...)"
              .value=${this.orderNotes}
              @input=${(e) => (this.orderNotes = e.target.value)}
            />
          </div>

          <button class="btn-submit" @click=${this._submitCustomOrder}>
            <span>💬 Solicitar Impressão via WhatsApp</span>
          </button>

          ${this.successMessage ? html`<div class="toast-msg">${this.successMessage}</div>` : ''}
        </div>
      </div>
    `
  }
}

customElements.define('custom-upload-view', CustomUploadView)
