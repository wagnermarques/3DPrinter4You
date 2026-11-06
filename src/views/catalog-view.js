import { LitElement, html, css } from 'lit'
import { CATEGORIES, filterCatalog } from '../services/catalog-service.js'
import { navigate } from 'fzl-fund-appshell--lit'
import '../components/model-card.js'
import '../components/order-modal.js'

export class CatalogView extends LitElement {
  static properties = {
    selectedCategory: { type: String },
    searchQuery: { type: String },
    sortBy: { type: String },
    activeModalModel: { type: Object },
    isModalOpen: { type: Boolean },
  }

  static styles = css`
    :host {
      display: block;
      padding: 24px;
      max-width: 1320px;
      margin: 0 auto;
    }

    /* Hero Banner */
    .hero-banner {
      background: linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #38bdf8 100%);
      border-radius: 20px;
      padding: 36px 32px;
      color: #ffffff;
      margin-bottom: 28px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.3);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
    }

    .hero-content {
      max-width: 680px;
      z-index: 2;
    }

    .hero-tagline {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .hero-title {
      font-size: 32px;
      font-weight: 900;
      line-height: 1.2;
      margin: 0 0 12px 0;
    }

    .hero-subtitle {
      font-size: 15px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.9);
      margin: 0 0 20px 0;
    }

    .hero-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn-hero-primary {
      background: #ffffff;
      color: #0284c7;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
    }

    .btn-hero-primary:hover {
      transform: translateY(-2px);
    }

    .btn-hero-secondary {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #ffffff;
      padding: 10px 18px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      backdrop-filter: blur(6px);
      transition: background 0.2s;
    }

    .btn-hero-secondary:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    /* Barra de Filtros e Busca */
    .controls-bar {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .search-and-sort {
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      min-width: 280px;
      position: relative;
    }

    .search-input {
      width: 100%;
      padding: 12px 16px 12px 42px;
      border-radius: 12px;
      border: 1px solid var(--md-sys-color-outline-variant, #cbd5e1);
      background: var(--md-sys-color-surface-container, #ffffff);
      color: var(--md-sys-color-on-surface, #0f172a);
      font-size: 14px;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #0284c7;
      box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      font-size: 18px;
      pointer-events: none;
    }

    .sort-select {
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid var(--md-sys-color-outline-variant, #cbd5e1);
      background: var(--md-sys-color-surface-container, #ffffff);
      color: var(--md-sys-color-on-surface, #0f172a);
      font-size: 14px;
      cursor: pointer;
    }

    /* Chips de Categorias */
    .categories-chips {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .category-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 20px;
      border: 1px solid var(--md-sys-color-outline-variant, #e2e8f0);
      background: var(--md-sys-color-surface-container-low, #f8fafc);
      color: var(--md-sys-color-on-surface-variant, #475569);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
    }

    .category-chip:hover {
      border-color: #0284c7;
      color: #0284c7;
    }

    .category-chip.active {
      background: #0284c7;
      color: #ffffff;
      border-color: #0284c7;
    }

    /* Grid do Catálogo */
    .models-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 48px 20px;
      background: var(--md-sys-color-surface-container-low, #f8fafc);
      border-radius: 16px;
      border: 1px dashed var(--md-sys-color-outline-variant, #cbd5e1);
      color: #64748b;
    }
  `

  constructor() {
    super()
    this.selectedCategory = 'todos'
    this.searchQuery = ''
    this.sortBy = 'popular'
    this.activeModalModel = null
    this.isModalOpen = false

    this._onModelSelected = (e) => {
      this.activeModalModel = e.detail.model
      this.isModalOpen = true
    }
  }

  connectedCallback() {
    super.connectedCallback()
    this.addEventListener('model-selected', this._onModelSelected)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.removeEventListener('model-selected', this._onModelSelected)
  }

  render() {
    const models = filterCatalog({
      category: this.selectedCategory,
      search: this.searchQuery,
      sortBy: this.sortBy,
    })

    return html`
      <!-- Hero Banner -->
      <div class="hero-banner">
        <div class="hero-content">
          <div class="hero-tagline">
            <span>✨</span> Impressão 3D de Alta Fidelidade • FzlSoft
          </div>
          <h1 class="hero-title">Modelos 3D prontos para transformar sua ideia em realidade</h1>
          <p class="hero-subtitle">
            Explore peças exclusivas, interaja com o visualizador 3D em tempo real, escolha o tipo de filamento,
            a cor dos seus sonhos e faça o pedido da sua impressão em poucos segundos!
          </p>
          <div class="hero-actions">
            <button class="btn-hero-primary" @click=${() => navigate('upload-personalizado')}>
              <span>🚀 Enviar Meu Arquivo STL</span>
            </button>
            <button class="btn-hero-secondary" @click=${() => navigate('calculadora')}>
              <span>🧮 Calculadora Maker</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Barra de Filtros e Busca -->
      <div class="controls-bar">
        <div class="search-and-sort">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              class="search-input"
              placeholder="Buscar modelos 3D por nome, utilidade ou tag..."
              .value=${this.searchQuery}
              @input=${(e) => (this.searchQuery = e.target.value)}
            />
          </div>

          <select class="sort-select" .value=${this.sortBy} @change=${(e) => (this.sortBy = e.target.value)}>
            <option value="popular">🔥 Mais Populares</option>
            <option value="price-asc">💵 Menor Preço</option>
            <option value="price-desc">💎 Maior Preço</option>
            <option value="time-asc">⚡ Impressão Mais Rápida</option>
            <option value="rating">★ Melhor Avaliados</option>
          </select>
        </div>

        <div class="categories-chips">
          ${CATEGORIES.map(
            (cat) => html`
              <button
                class="category-chip ${this.selectedCategory === cat.id ? 'active' : ''}"
                @click=${() => (this.selectedCategory = cat.id)}
              >
                <span>${cat.label}</span>
              </button>
            `
          )}
        </div>
      </div>

      <!-- Grid de Cards de Modelos 3D -->
      <div class="models-grid">
        ${models.length === 0
          ? html`
              <div class="empty-state">
                <h3>Nenhum modelo encontrado</h3>
                <p>Tente ajustar sua busca ou limpar os filtros de categoria.</p>
                <button
                  class="btn-hero-primary"
                  style="margin-top: 12px; background: #0284c7; color: #fff;"
                  @click=${() => {
                    this.selectedCategory = 'todos'
                    this.searchQuery = ''
                  }}
                >
                  Ver Todos os Modelos
                </button>
              </div>
            `
          : models.map(
              (model) => html`<model-card .model=${model}></model-card>`
            )}
      </div>

      <!-- Modal de Visualização 3D e Pedido -->
      <order-modal
        .open=${this.isModalOpen}
        .model=${this.activeModalModel}
        @close-modal=${() => (this.isModalOpen = false)}
      ></order-modal>
    `
  }
}

customElements.define('catalog-view', CatalogView)
