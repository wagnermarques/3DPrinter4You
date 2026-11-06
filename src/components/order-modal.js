import { LitElement, html, css } from 'lit'
import { MATERIALS, getMaterial } from '../config/materials.js'
import { FILAMENT_COLORS, getColor } from '../config/colors.js'
import { LAYER_QUALITIES, INFILL_PRESETS, PRINTER_BED_SPECS } from '../config/print-settings.js'
import { calculatePrintQuote, formatBRL, formatPrintTime } from '../services/pricing-service.js'
import { orderService } from '../services/order-service.js'
import './model-3d-viewer.js'

export class OrderModal extends LitElement {
  static properties = {
    open: { type: Boolean },
    model: { type: Object },
    selectedMaterialId: { type: String },
    selectedColorId: { type: String },
    selectedQualityId: { type: String },
    selectedInfillId: { type: String },
    quantity: { type: Number },
    activeTab: { type: String }, // 'customize' ou 'instant-checkout'
    customerName: { type: String },
    customerPhone: { type: String },
    customerEmail: { type: String },
    deliveryMethod: { type: String },
    customerAddress: { type: String },
    orderNotes: { type: String },
  }

  static styles = css`
    :host {
      display: block;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-card {
      background: var(--md-sys-color-surface, #ffffff);
      color: var(--md-sys-color-on-surface, #0f172a);
      width: 100%;
      max-width: 1040px;
      max-height: 92vh;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      border: 1px solid var(--md-sys-color-outline-variant, #e2e8f0);
      overflow: hidden;
    }

    .modal-header {
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--md-sys-color-outline-variant, #e2e8f0);
      background: var(--md-sys-color-surface-container-low, #f8fafc);
    }

    .header-title-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-title {
      font-size: 18px;
      font-weight: 700;
      margin: 0;
    }

    .header-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 12px;
      background: #0284c7;
      color: #ffffff;
      text-transform: uppercase;
    }

    .close-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: var(--md-sys-color-on-surface-variant, #64748b);
      transition: background 0.2s;
    }

    .close-btn:hover {
      background: var(--md-sys-color-surface-container-highest, #e2e8f0);
      color: #0f172a;
    }

    .modal-body {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      overflow-y: auto;
      flex: 1;
    }

    @media (max-width: 860px) {
      .modal-body {
        grid-template-columns: 1fr;
      }
    }

    /* Lado Esquerdo: Visualizador 3D */
    .viewer-column {
      background: #0f172a;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .viewer-frame {
      flex: 1;
      min-height: 380px;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
    }

    .viewer-info-bar {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      background: rgba(30, 41, 59, 0.8);
      border-radius: 10px;
      padding: 10px 14px;
      color: #cbd5e1;
      font-size: 12px;
    }

    .viewer-info-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .viewer-info-label {
      font-size: 10px;
      color: #94a3b8;
      text-transform: uppercase;
    }

    .viewer-info-value {
      font-weight: 700;
      color: #38bdf8;
      margin-top: 2px;
    }

    /* Lado Direito: Formulário de Configuração */
    .form-column {
      padding: 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .section-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--md-sys-color-primary, #0284c7);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Seletor de Material */
    .materials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 8px;
    }

    .material-card {
      border: 1.5px solid var(--md-sys-color-outline-variant, #cbd5e1);
      border-radius: 10px;
      padding: 10px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      transition: all 0.2s ease;
      background: var(--md-sys-color-surface-container, #ffffff);
    }

    .material-card:hover {
      border-color: #0284c7;
    }

    .material-card.active {
      border-color: #0284c7;
      background: rgba(2, 132, 199, 0.08);
      box-shadow: 0 0 0 2px #0284c7;
    }

    .mat-name {
      font-size: 12px;
      font-weight: 700;
    }

    .mat-badge {
      font-size: 10px;
      color: #0284c7;
      font-weight: 600;
    }

    .mat-price {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }

    /* Paleta de Cores de Filamento */
    .colors-palette {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .color-swatch {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
      position: relative;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .color-swatch:hover {
      transform: scale(1.15);
    }

    .color-swatch.active {
      transform: scale(1.2);
      box-shadow: 0 0 0 3px #0284c7;
    }

    .color-name-label {
      font-size: 12px;
      color: var(--md-sys-color-on-surface-variant, #64748b);
      margin-top: 6px;
      font-style: italic;
    }

    /* Qualidade de Camada & Preenchimento */
    .chips-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .setting-chip {
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid var(--md-sys-color-outline-variant, #cbd5e1);
      background: var(--md-sys-color-surface-container, #f8fafc);
      font-size: 12px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .setting-chip:hover {
      border-color: #0284c7;
    }

    .setting-chip.active {
      background: #0284c7;
      color: #ffffff;
      border-color: #0284c7;
    }

    /* Quantidade */
    .quantity-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .qty-counter {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--md-sys-color-outline-variant, #cbd5e1);
      border-radius: 8px;
      overflow: hidden;
    }

    .qty-btn {
      width: 36px;
      height: 36px;
      background: var(--md-sys-color-surface-container-high, #f1f5f9);
      border: none;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .qty-btn:hover {
      background: #e2e8f0;
    }

    .qty-value {
      width: 44px;
      text-align: center;
      font-weight: 700;
      font-size: 15px;
    }

    .discount-callout {
      font-size: 12px;
      font-weight: 600;
      color: #059669;
      background: #d1fae5;
      padding: 4px 8px;
      border-radius: 6px;
    }

    /* Resumo de Preço e Ações */
    .modal-footer {
      padding: 18px 24px;
      border-top: 1px solid var(--md-sys-color-outline-variant, #e2e8f0);
      background: var(--md-sys-color-surface-container-low, #f8fafc);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .price-summary {
      display: flex;
      flex-direction: column;
    }

    .price-total-label {
      font-size: 11px;
      color: var(--md-sys-color-outline, #64748b);
      text-transform: uppercase;
    }

    .price-total-val {
      font-size: 24px;
      font-weight: 800;
      color: var(--md-sys-color-primary, #0284c7);
    }

    .cta-actions {
      display: flex;
      gap: 10px;
    }

    .btn-secondary {
      padding: 10px 18px;
      border-radius: 10px;
      border: 1px solid var(--md-sys-color-outline, #cbd5e1);
      background: #ffffff;
      color: #0f172a;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background: #f1f5f9;
      border-color: #94a3b8;
    }

    .btn-primary {
      padding: 10px 22px;
      border-radius: 10px;
      border: none;
      background: #0284c7;
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
    }

    .btn-primary:hover {
      background: #0369a1;
      transform: translateY(-1px);
    }

    .btn-whatsapp {
      background: #16a34a;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
    }

    .btn-whatsapp:hover {
      background: #15803d;
    }

    /* Formulário de Finalização Rápida */
    .checkout-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-label {
      font-size: 12px;
      font-weight: 600;
      color: #334155;
    }

    .form-input,
    .form-select,
    .form-textarea {
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 13px;
      background: #ffffff;
      color: #0f172a;
    }

    .form-input:focus,
    .form-textarea:focus {
      outline: none;
      border-color: #0284c7;
      box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
    }

    .toast-success {
      background: #dcfce7;
      color: #15803d;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    }
  `

  constructor() {
    super()
    this.open = false
    this.model = null
    this.selectedMaterialId = 'pla'
    this.selectedColorId = 'black'
    this.selectedQualityId = 'standard'
    this.selectedInfillId = 'standard'
    this.quantity = 1
    this.activeTab = 'customize'

    this.customerName = ''
    this.customerPhone = ''
    this.customerEmail = ''
    this.deliveryMethod = 'retirada'
    this.customerAddress = ''
    this.orderNotes = ''
    this._successMessage = ''
  }

  updated(changedProperties) {
    if (changedProperties.has('model') && this.model) {
      this.selectedMaterialId = this.model.defaultMaterial || 'pla'
      this.selectedColorId = this.model.defaultColor || 'black'
      this.selectedQualityId = 'standard'
      this.selectedInfillId = 'standard'
      this.quantity = 1
      this.activeTab = 'customize'
      this._successMessage = ''
    }
  }

  _close() {
    this.open = false
    this.dispatchEvent(new CustomEvent('close-modal', { bubbles: true, composed: true }))
  }

  _getQuote() {
    if (!this.model) return null
    return calculatePrintQuote({
      baseWeightGrams: this.model.baseWeightGrams,
      basePrintTimeMinutes: this.model.basePrintTimeMinutes,
      materialId: this.selectedMaterialId,
      colorId: this.selectedColorId,
      infillId: this.selectedInfillId,
      qualityId: this.selectedQualityId,
      quantity: this.quantity,
    })
  }

  _addToCart() {
    const quote = this._getQuote()
    const color = getColor(this.selectedColorId)
    const material = getMaterial(this.selectedMaterialId)
    const infill = INFILL_PRESETS.find((i) => i.id === this.selectedInfillId)
    const quality = LAYER_QUALITIES.find((q) => q.id === this.selectedQualityId)

    const cartItem = {
      modelId: this.model.id,
      title: this.model.title,
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
      dimensions: this.model.dimensions,
    }

    orderService.addToCart(cartItem)
    this._successMessage = 'Item adicionado ao carrinho com sucesso!'
    setTimeout(() => {
      this._close()
    }, 1200)
    this.requestUpdate()
  }

  _goToInstantCheckout() {
    this.activeTab = 'instant-checkout'
  }

  _submitInstantOrder() {
    if (!this.customerName.trim()) {
      alert('Por favor, informe seu nome completo.')
      return
    }

    const quote = this._getQuote()
    const color = getColor(this.selectedColorId)
    const material = getMaterial(this.selectedMaterialId)
    const infill = INFILL_PRESETS.find((i) => i.id === this.selectedInfillId)
    const quality = LAYER_QUALITIES.find((q) => q.id === this.selectedQualityId)

    const item = {
      modelId: this.model.id,
      title: this.model.title,
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
      dimensions: this.model.dimensions,
    }

    const order = orderService.createOrder({
      customer: {
        name: this.customerName,
        phone: this.customerPhone,
        email: this.customerEmail,
        deliveryMethod: this.deliveryMethod,
        address: this.customerAddress,
        notes: this.orderNotes,
      },
      items: [item],
      deliveryFee: this.deliveryMethod === 'retirada' ? 0 : 18.0,
    })

    // Gera URL do WhatsApp e abre
    const waUrl = orderService.generateWhatsAppUrl(order)
    window.open(waUrl, '_blank')

    this._successMessage = `Pedido #${order.id} registrado! Abrindo WhatsApp...`
    setTimeout(() => {
      this._close()
    }, 1800)
    this.requestUpdate()
  }

  render() {
    if (!this.open || !this.model) return html``

    const quote = this._getQuote()
    const selectedColor = getColor(this.selectedColorId)
    const selectedMaterial = getMaterial(this.selectedMaterialId)

    return html`
      <div class="modal-backdrop" @click=${(e) => e.target.classList.contains('modal-backdrop') && this._close()}>
        <div class="modal-card">
          <!-- Cabeçalho -->
          <div class="modal-header">
            <div class="header-title-box">
              <span class="header-badge">${this.model.categoryLabel}</span>
              <h2 class="header-title">${this.model.title}</h2>
            </div>
            <button class="close-btn" @click=${this._close} title="Fechar">✕</button>
          </div>

          <!-- Corpo com 3D e Formulário -->
          <div class="modal-body">
            <!-- Lado Esquerdo: Visualizador 3D com Orbit e Troca de Cores em Tempo Real -->
            <div class="viewer-column">
              <div class="viewer-frame">
                <model-3d-viewer
                  .geometry=${this.model.generator ? this.model.generator() : null}
                  .modelColor=${selectedColor.hex}
                  .autoRotate=${true}
                  .showBed=${true}
                  .showDimensions=${true}
                  height="100%"
                ></model-3d-viewer>
              </div>

              <!-- Indicadores de Impressão -->
              <div class="viewer-info-bar">
                <div class="viewer-info-item">
                  <span class="viewer-info-label">Material</span>
                  <span class="viewer-info-value">${selectedMaterial.name}</span>
                </div>
                <div class="viewer-info-item">
                  <span class="viewer-info-label">Peso Estimado</span>
                  <span class="viewer-info-value">${quote.totalWeightGrams}g</span>
                </div>
                <div class="viewer-info-item">
                  <span class="viewer-info-label">Tempo 3D</span>
                  <span class="viewer-info-value">${formatPrintTime(quote.totalTimeMinutes)}</span>
                </div>
              </div>
            </div>

            <!-- Lado Direito: Opções de Configuração -->
            <div class="form-column">
              ${this.activeTab === 'customize'
                ? html`
                    <!-- 1. Material -->
                    <div>
                      <div class="section-title">
                        <span>🧪 1. Material do Filamento</span>
                      </div>
                      <div class="materials-grid">
                        ${MATERIALS.map(
                          (m) => html`
                            <div
                              class="material-card ${this.selectedMaterialId === m.id ? 'active' : ''}"
                              @click=${() => (this.selectedMaterialId = m.id)}
                            >
                              <span class="mat-name">${m.name}</span>
                              <span class="mat-badge">${m.badge}</span>
                              <span class="mat-price">${formatBRL(m.pricePerGram)}/g</span>
                            </div>
                          `
                        )}
                      </div>
                    </div>

                    <!-- 2. Cor do Filamento (Preview ao Vivo no 3D) -->
                    <div>
                      <div class="section-title">
                        <span>🎨 2. Cor da Impressão (Preview ao Vivo)</span>
                      </div>
                      <div class="colors-palette">
                        ${FILAMENT_COLORS.map(
                          (c) => html`
                            <div
                              class="color-swatch ${this.selectedColorId === c.id ? 'active' : ''}"
                              style="background-color: ${c.hex};"
                              title="${c.name} (${c.type})"
                              @click=${() => (this.selectedColorId = c.id)}
                            ></div>
                          `
                        )}
                      </div>
                      <div class="color-name-label">
                        Selecionado: <strong>${selectedColor.name}</strong> (${selectedColor.type})
                      </div>
                    </div>

                    <!-- 3. Qualidade da Camada -->
                    <div>
                      <div class="section-title">
                        <span>⚡ 3. Resolução / Altura de Camada</span>
                      </div>
                      <div class="chips-group">
                        ${LAYER_QUALITIES.map(
                          (q) => html`
                            <div
                              class="setting-chip ${this.selectedQualityId === q.id ? 'active' : ''}"
                              @click=${() => (this.selectedQualityId = q.id)}
                            >
                              ${q.height} • ${q.name}
                            </div>
                          `
                        )}
                      </div>
                    </div>

                    <!-- 4. Densidade de Preenchimento -->
                    <div>
                      <div class="section-title">
                        <span>🧱 4. Preenchimento Interno (Infill)</span>
                      </div>
                      <div class="chips-group">
                        ${INFILL_PRESETS.map(
                          (inf) => html`
                            <div
                              class="setting-chip ${this.selectedInfillId === inf.id ? 'active' : ''}"
                              @click=${() => (this.selectedInfillId = inf.id)}
                            >
                              ${inf.percentage}% (${inf.name.split('—')[1]?.trim()})
                            </div>
                          `
                        )}
                      </div>
                    </div>

                    <!-- 5. Quantidade -->
                    <div>
                      <div class="section-title">
                        <span>🔢 5. Quantidade</span>
                      </div>
                      <div class="quantity-row">
                        <div class="qty-counter">
                          <button
                            class="qty-btn"
                            @click=${() => (this.quantity = Math.max(1, this.quantity - 1))}
                          >
                            -
                          </button>
                          <span class="qty-value">${this.quantity}</span>
                          <button class="qty-btn" @click=${() => (this.quantity += 1)}>+</button>
                        </div>
                        ${quote.discountPercentage > 0
                          ? html`
                              <span class="discount-callout">
                                🎉 Desconto de ${Math.round(quote.discountPercentage * 100)}% aplicado!
                              </span>
                            `
                          : html`
                              <span style="font-size: 11px; color: #64748b;">
                                (A partir de 3 unidades: até 18% OFF)
                              </span>
                            `}
                      </div>
                    </div>
                  `
                : html`
                    <!-- Formulário de Pedido Imediato -->
                    <div class="checkout-form">
                      <div class="section-title">
                        <span>📋 Dados para Pedido de Impressão</span>
                      </div>

                      <div class="form-group">
                        <label class="form-label">Nome Completo *</label>
                        <input
                          type="text"
                          class="form-input"
                          placeholder="Ex: Ana Silva"
                          .value=${this.customerName}
                          @input=${(e) => (this.customerName = e.target.value)}
                        />
                      </div>

                      <div class="form-group">
                        <label class="form-label">WhatsApp / Telefone *</label>
                        <input
                          type="text"
                          class="form-input"
                          placeholder="(11) 98765-4321"
                          .value=${this.customerPhone}
                          @input=${(e) => (this.customerPhone = e.target.value)}
                        />
                      </div>

                      <div class="form-group">
                        <label class="form-label">E-mail para Acompanhamento</label>
                        <input
                          type="email"
                          class="form-input"
                          placeholder="ana@exemplo.com"
                          .value=${this.customerEmail}
                          @input=${(e) => (this.customerEmail = e.target.value)}
                        />
                      </div>

                      <div class="form-group">
                        <label class="form-label">Forma de Entrega</label>
                        <select
                          class="form-select"
                          .value=${this.deliveryMethod}
                          @change=${(e) => (this.deliveryMethod = e.target.value)}
                        >
                          <option value="retirada">Retirada no Balcão (Grátis)</option>
                          <option value="correios">Envio Correios / PAC (+ R$ 18,00)</option>
                          <option value="sedex">Envio Expresso / SEDEX (+ R$ 28,00)</option>
                        </select>
                      </div>

                      ${this.deliveryMethod !== 'retirada'
                        ? html`
                            <div class="form-group">
                              <label class="form-label">Endereço de Entrega (com CEP)</label>
                              <input
                                type="text"
                                class="form-input"
                                placeholder="Rua, número, bairro, cidade, CEP"
                                .value=${this.customerAddress}
                                @input=${(e) => (this.customerAddress = e.target.value)}
                              />
                            </div>
                          `
                        : ''}

                      <div class="form-group">
                        <label class="form-label">Observações Especiais de Impressão</label>
                        <textarea
                          class="form-textarea"
                          rows="2"
                          placeholder="Ex: Peça com acabamento liso na parte superior, sem suportes internos..."
                          .value=${this.orderNotes}
                          @input=${(e) => (this.orderNotes = e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  `}
              ${this._successMessage
                ? html`
                    <div class="toast-success">
                      <span>✓</span>
                      <span>${this._successMessage}</span>
                    </div>
                  `
                : ''}
            </div>
          </div>

          <!-- Rodapé com Total e Botões -->
          <div class="modal-footer">
            <div class="price-summary">
              <span class="price-total-label">Total Orçado (${this.quantity}x)</span>
              <span class="price-total-val">${formatBRL(quote.totalPrice)}</span>
            </div>

            <div class="cta-actions">
              ${this.activeTab === 'customize'
                ? html`
                    <button class="btn-secondary" @click=${this._addToCart}>
                      <span>🛒 Adicionar ao Carrinho</span>
                    </button>
                    <button class="btn-primary" @click=${this._goToInstantCheckout}>
                      <span>⚡ Pedir Impressão</span>
                    </button>
                  `
                : html`
                    <button class="btn-secondary" @click=${() => (this.activeTab = 'customize')}>
                      <span>← Voltar</span>
                    </button>
                    <button class="btn-primary btn-whatsapp" @click=${this._submitInstantOrder}>
                      <span>💬 Enviar Pedido via WhatsApp</span>
                    </button>
                  `}
            </div>
          </div>
        </div>
      </div>
    `
  }
}

customElements.define('order-modal', OrderModal)
