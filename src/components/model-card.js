import { LitElement, html, css } from 'lit'
import { formatBRL, formatPrintTime, calculatePrintQuote } from '../services/pricing-service.js'
import { getColor } from '../config/colors.js'
import { getMaterial } from '../config/materials.js'

export class ModelCard extends LitElement {
  static properties = {
    model: { type: Object },
  }

  static styles = css`
    :host {
      display: block;
    }

    .card {
      background: var(--md-sys-color-surface-container, #ffffff);
      border: 1px solid var(--md-sys-color-outline-variant, #e2e8f0);
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      height: 100%;
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
      border-color: var(--md-sys-color-primary, #0284c7);
    }

    .preview-header {
      position: relative;
      background: radial-gradient(circle at 50% 40%, #1e293b 0%, #0f172a 100%);
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      cursor: pointer;
    }

    .preview-header:hover .hover-overlay {
      opacity: 1;
    }

    .hover-overlay {
      position: absolute;
      inset: 0;
      background: rgba(2, 132, 199, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #ffffff;
      font-weight: 600;
      font-size: 14px;
      opacity: 0;
      transition: opacity 0.2s ease;
      backdrop-filter: blur(2px);
    }

    .badge-ribbon {
      position: absolute;
      top: 12px;
      left: 12px;
      background: #0284c7;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 4px 10px;
      border-radius: 20px;
      z-index: 5;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }

    .rating-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(4px);
      color: #facc15;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 4px;
      z-index: 5;
    }

    .card-body {
      padding: 18px;
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 12px;
    }

    .category-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--md-sys-color-primary, #0284c7);
    }

    .title {
      font-size: 16px;
      font-weight: 700;
      line-height: 1.35;
      color: var(--md-sys-color-on-surface, #0f172a);
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 44px;
    }

    .description {
      font-size: 13px;
      color: var(--md-sys-color-on-surface-variant, #64748b);
      margin: 0;
      line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .specs-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      padding: 10px;
      background: var(--md-sys-color-surface-container-high, #f8fafc);
      border-radius: 10px;
      border: 1px solid var(--md-sys-color-outline-variant, #e2e8f0);
    }

    .spec-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .spec-label {
      font-size: 10px;
      text-transform: uppercase;
      color: var(--md-sys-color-outline, #94a3b8);
      font-weight: 600;
    }

    .spec-val {
      font-size: 12px;
      font-weight: 700;
      color: var(--md-sys-color-on-surface, #1e293b);
      margin-top: 2px;
    }

    .footer-row {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 10px;
      border-top: 1px solid var(--md-sys-color-outline-variant, #e2e8f0);
    }

    .price-box {
      display: flex;
      flex-direction: column;
    }

    .price-label {
      font-size: 11px;
      color: var(--md-sys-color-outline, #64748b);
    }

    .price-amount {
      font-size: 18px;
      font-weight: 800;
      color: var(--md-sys-color-primary, #0284c7);
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--md-sys-color-primary, #0284c7);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .action-btn:hover {
      background: #0369a1;
    }

    .icon-symbol {
      font-size: 16px;
    }
  `

  _onSelect() {
    this.dispatchEvent(
      new CustomEvent('model-selected', {
        detail: { model: this.model },
        bubbles: true,
        composed: true,
      })
    )
  }

  render() {
    if (!this.model) return html``

    const quote = calculatePrintQuote({
      baseWeightGrams: this.model.baseWeightGrams,
      basePrintTimeMinutes: this.model.basePrintTimeMinutes,
      materialId: this.model.defaultMaterial,
      colorId: this.model.defaultColor,
    })

    const color = getColor(this.model.defaultColor)

    return html`
      <div class="card">
        <div class="preview-header" @click=${this._onSelect}>
          ${this.model.badge ? html`<span class="badge-ribbon">${this.model.badge}</span>` : ''}

          <span class="rating-badge">★ ${this.model.rating}</span>

          <!-- Canvas Preview embutido / Ilustração 3D representativa -->
          <model-3d-viewer
            .geometry=${this.model.generator ? this.model.generator() : null}
            .modelColor=${color.hex}
            .autoRotate=${true}
            .showBed=${false}
            .showDimensions=${false}
            height="200px"
          ></model-3d-viewer>

          <div class="hover-overlay">
            <span class="icon-symbol">view_in_ar</span>
            <span>Explorar em 3D & Personalizar</span>
          </div>
        </div>

        <div class="card-body">
          <div>
            <span class="category-label">${this.model.categoryLabel}</span>
            <h3 class="title">${this.model.title}</h3>
          </div>

          <p class="description">${this.model.description}</p>

          <div class="specs-grid">
            <div class="spec-item">
              <span class="spec-label">Dimensões</span>
              <span class="spec-val">${this.model.dimensions.x}x${this.model.dimensions.z}mm</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Peso</span>
              <span class="spec-val">${this.model.baseWeightGrams}g</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Tempo 3D</span>
              <span class="spec-val">${formatPrintTime(this.model.basePrintTimeMinutes)}</span>
            </div>
          </div>

          <div class="footer-row">
            <div class="price-box">
              <span class="price-label">A partir de</span>
              <span class="price-amount">${formatBRL(quote.unitPrice)}</span>
            </div>

            <button class="action-btn" @click=${this._onSelect}>
              <span>Personalizar</span>
              <span class="icon-symbol">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    `
  }
}

customElements.define('model-card', ModelCard)
