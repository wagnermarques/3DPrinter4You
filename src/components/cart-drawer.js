import { LitElement, html, css } from 'lit'
import { orderService } from '../services/order-service.js'
import { formatBRL, formatPrintTime } from '../services/pricing-service.js'
import { navigate } from 'fzl-fund-appshell--lit'

export class CartDrawer extends LitElement {
  static properties = {
    open: { type: Boolean },
    customerName: { type: String },
    customerPhone: { type: String },
    customerEmail: { type: String },
    deliveryMethod: { type: String },
    customerAddress: { type: String },
    orderNotes: { type: String },
    isSubmitting: { type: Boolean },
  }

  static styles = css`
    :host {
      display: block;
    }

    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1100;
      display: flex;
      justify-content: flex-end;
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

    .drawer-panel {
      background: var(--md-sys-color-surface, #ffffff);
      color: var(--md-sys-color-on-surface, #0f172a);
      width: 100%;
      max-width: 460px;
      height: 100%;
      display: flex;
      flex-direction: column;
      box-shadow: -8px 0 24px rgba(0, 0, 0, 0.2);
      animation: slideIn 0.25s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }

    .drawer-header {
      padding: 18px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--md-sys-color-outline-variant, #e2e8f0);
      background: var(--md-sys-color-surface-container-low, #f8fafc);
    }

    .drawer-title {
      font-size: 18px;
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
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
      color: #64748b;
    }

    .close-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .drawer-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .empty-cart {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px 20px;
      gap: 12px;
      color: #64748b;
    }

    .empty-icon {
      font-size: 48px;
      opacity: 0.6;
    }

    /* Lista de Itens */
    .cart-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid var(--md-sys-color-outline-variant, #e2e8f0);
      background: var(--md-sys-color-surface-container-lowest, #ffffff);
    }

    .item-color-indicator {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.2);
      display: inline-block;
      vertical-align: middle;
      margin-right: 4px;
    }

    .item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .item-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .item-specs {
      font-size: 12px;
      color: #64748b;
    }

    .item-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
    }

    .qty-controls {
      display: inline-flex;
      align-items: center;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
    }

    .qty-btn {
      width: 26px;
      height: 26px;
      background: #f1f5f9;
      border: none;
      cursor: pointer;
      font-weight: bold;
    }

    .qty-display {
      width: 32px;
      text-align: center;
      font-size: 12px;
      font-weight: 700;
    }

    .item-price {
      font-weight: 700;
      font-size: 14px;
      color: #0284c7;
    }

    .remove-btn {
      background: none;
      border: none;
      color: #ef4444;
      cursor: pointer;
      font-size: 16px;
      padding: 4px;
    }

    /* Formulário de Entrega & Cliente */
    .form-box {
      margin-top: 8px;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .form-title {
      font-size: 13px;
      font-weight: 700;
      color: #0284c7;
      text-transform: uppercase;
    }

    .input-field {
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 13px;
    }

    /* Rodapé do Carrinho */
    .drawer-footer {
      padding: 18px 24px;
      border-top: 1px solid #e2e8f0;
      background: var(--md-sys-color-surface-container-low, #f8fafc);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #64748b;
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      border-top: 1px dashed #cbd5e1;
      padding-top: 8px;
    }

    .checkout-btn {
      width: 100%;
      padding: 12px;
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
      transition: background 0.2s;
    }

    .checkout-btn:hover {
      background: #15803d;
    }
  `

  constructor() {
    super()
    this.open = false
    this.customerName = ''
    this.customerPhone = ''
    this.customerEmail = ''
    this.deliveryMethod = 'retirada'
    this.customerAddress = ''
    this.orderNotes = ''

    this._onCartUpdate = () => this.requestUpdate()
  }

  connectedCallback() {
    super.connectedCallback()
    orderService.addEventListener('cart-updated', this._onCartUpdate)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    orderService.removeEventListener('cart-updated', this._onCartUpdate)
  }

  _close() {
    this.open = false
    this.dispatchEvent(new CustomEvent('close-cart', { bubbles: true, composed: true }))
  }

  _checkout() {
    if (!this.customerName.trim()) {
      alert('Por favor, informe seu nome completo para o pedido.')
      return
    }

    const cart = orderService.getCart()
    if (!cart.length) return

    const deliveryFee = this.deliveryMethod === 'retirada' ? 0 : 18.0
    const order = orderService.createOrder({
      customer: {
        name: this.customerName,
        phone: this.customerPhone,
        email: this.customerEmail,
        deliveryMethod: this.deliveryMethod,
        address: this.customerAddress,
        notes: this.orderNotes,
      },
      deliveryFee,
    })

    // Abre link do WhatsApp
    const waUrl = orderService.generateWhatsAppUrl(order)
    window.open(waUrl, '_blank')

    this._close()
    navigate('meus-pedidos')
  }

  render() {
    if (!this.open) return html``

    const cart = orderService.getCart()
    const summary = orderService.getCartSummary()
    const deliveryFee = this.deliveryMethod === 'retirada' ? 0 : 18.0
    const totalOrder = summary.subtotal + deliveryFee

    return html`
      <div class="drawer-backdrop" @click=${(e) => e.target.classList.contains('drawer-backdrop') && this._close()}>
        <div class="drawer-panel">
          <div class="drawer-header">
            <h3 class="drawer-title">
              <span>🛒 Carrinho de Impressão</span>
              <span style="font-size: 13px; font-weight: normal; color: #64748b;">
                (${summary.totalItems} ${summary.totalItems === 1 ? 'item' : 'itens'})
              </span>
            </h3>
            <button class="close-btn" @click=${this._close} title="Fechar">✕</button>
          </div>

          <div class="drawer-content">
            ${cart.length === 0
              ? html`
                  <div class="empty-cart">
                    <div class="empty-icon">🖨️</div>
                    <p><strong>Seu carrinho de impressão está vazio.</strong></p>
                    <p style="font-size: 12px;">Escolha um modelo do catálogo ou envie seu próprio arquivo 3D!</p>
                  </div>
                `
              : html`
                  <!-- Lista de Peças 3D -->
                  ${cart.map(
                    (item) => html`
                      <div class="cart-item">
                        <div class="item-details">
                          <h4 class="item-title">${item.title}</h4>
                          <div class="item-specs">
                            <span
                              class="item-color-indicator"
                              style="background-color: ${item.colorHex || '#0284c7'};"
                            ></span>
                            <span>${item.colorName}</span> • <span>${item.materialName}</span>
                          </div>
                          <div class="item-specs">
                            <span>${item.qualityName}</span> • <span>${item.infillName}</span>
                          </div>

                          <div class="item-actions">
                            <div class="qty-controls">
                              <button
                                class="qty-btn"
                                @click=${() => orderService.updateQuantity(item.cartId, item.quantity - 1)}
                              >
                                -
                              </button>
                              <span class="qty-display">${item.quantity}</span>
                              <button
                                class="qty-btn"
                                @click=${() => orderService.updateQuantity(item.cartId, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>

                            <span class="item-price">${formatBRL(item.totalPrice)}</span>

                            <button
                              class="remove-btn"
                              title="Remover"
                              @click=${() => orderService.removeFromCart(item.cartId)}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    `
                  )}

                  <!-- Formulário de Contato e Entrega -->
                  <div class="form-box">
                    <span class="form-title">Dados para Envio / Contato</span>
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
                      type="email"
                      class="input-field"
                      placeholder="E-mail (opcional)"
                      .value=${this.customerEmail}
                      @input=${(e) => (this.customerEmail = e.target.value)}
                    />

                    <select
                      class="input-field"
                      .value=${this.deliveryMethod}
                      @change=${(e) => (this.deliveryMethod = e.target.value)}
                    >
                      <option value="retirada">Retirada no Balcão (Grátis)</option>
                      <option value="correios">Correios / PAC (+ R$ 18,00)</option>
                    </select>

                    ${this.deliveryMethod !== 'retirada'
                      ? html`
                          <input
                            type="text"
                            class="input-field"
                            placeholder="Endereço de Entrega Completo"
                            .value=${this.customerAddress}
                            @input=${(e) => (this.customerAddress = e.target.value)}
                          />
                        `
                      : ''}

                    <input
                      type="text"
                      class="input-field"
                      placeholder="Instruções ou observações para impressão"
                      .value=${this.orderNotes}
                      @input=${(e) => (this.orderNotes = e.target.value)}
                    />
                  </div>
                `}
          </div>

          ${cart.length > 0
            ? html`
                <div class="drawer-footer">
                  <div class="summary-row">
                    <span>Peso total estimado:</span>
                    <strong>${summary.totalWeight}g de filamento</strong>
                  </div>
                  <div class="summary-row">
                    <span>Tempo de máquina:</span>
                    <strong>${formatPrintTime(summary.totalTimeMinutes)}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Subtotal:</span>
                    <strong>${formatBRL(summary.subtotal)}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Frete:</span>
                    <strong>${deliveryFee > 0 ? formatBRL(deliveryFee) : 'Grátis'}</strong>
                  </div>

                  <div class="summary-total">
                    <span>Total do Pedido:</span>
                    <span style="color: #0284c7;">${formatBRL(totalOrder)}</span>
                  </div>

                  <button class="checkout-btn" @click=${this._checkout}>
                    <span>💬 Confirmar Pedido via WhatsApp</span>
                  </button>
                </div>
              `
            : ''}
        </div>
      </div>
    `
  }
}

customElements.define('cart-drawer', CartDrawer)
