import { LitElement, html, css } from 'lit'
import { orderService, ORDER_STATUSES, getStatusInfo } from '../services/order-service.js'
import { formatBRL, formatPrintTime } from '../services/pricing-service.js'
import { navigate } from 'fzl-fund-appshell--lit'

export class OrdersView extends LitElement {
  static properties = {
    orders: { type: Array },
  }

  static styles = css`
    :host {
      display: block;
      padding: 24px;
      max-width: 1100px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .page-title {
      font-size: 28px;
      font-weight: 800;
      color: var(--md-sys-color-on-surface, #0f172a);
      margin: 0 0 6px 0;
    }

    .page-subtitle {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant, #64748b);
      margin: 0;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .order-card {
      background: var(--md-sys-color-surface-container, #ffffff);
      border: 1px solid var(--md-sys-color-outline-variant, #e2e8f0);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid var(--md-sys-color-outline-variant, #e2e8f0);
      padding-bottom: 14px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .order-id-group {
      display: flex;
      flex-direction: column;
    }

    .order-id {
      font-size: 18px;
      font-weight: 800;
      color: #0284c7;
    }

    .order-date {
      font-size: 12px;
      color: #64748b;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
    }

    /* Barra de Progresso / Stepper do Status 3D */
    .status-stepper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 8px;
      position: relative;
    }

    .stepper-line {
      position: absolute;
      top: 50%;
      left: 30px;
      right: 30px;
      height: 4px;
      background: #e2e8f0;
      z-index: 1;
      transform: translateY(-50%);
    }

    .stepper-line-fill {
      height: 100%;
      background: #0284c7;
      transition: width 0.3s ease;
    }

    .step-item {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .step-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #ffffff;
      border: 3px solid #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      color: #64748b;
      transition: all 0.2s;
    }

    .step-circle.completed {
      background: #0284c7;
      border-color: #0284c7;
      color: #ffffff;
    }

    .step-circle.active {
      border-color: #0284c7;
      color: #0284c7;
      box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.2);
    }

    .step-label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-align: center;
      max-width: 80px;
    }

    .step-label.active {
      color: #0284c7;
      font-weight: 700;
    }

    /* Itens */
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .order-item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      border-radius: 10px;
      background: var(--md-sys-color-surface-container-high, #f8fafc);
      font-size: 13px;
    }

    .item-color-pill {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 6px;
      vertical-align: middle;
    }

    /* Footer da Ordem */
    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--md-sys-color-outline-variant, #e2e8f0);
      padding-top: 14px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .customer-info {
      font-size: 12px;
      color: #64748b;
      line-height: 1.4;
    }

    .actions-group {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .btn-wa {
      background: #16a34a;
      color: #ffffff;
      border: none;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-wa:hover {
      background: #15803d;
    }

    .status-select {
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 12px;
      background: #ffffff;
    }

    .empty-orders {
      text-align: center;
      padding: 60px 20px;
      background: var(--md-sys-color-surface-container, #ffffff);
      border-radius: 16px;
      border: 1px dashed #cbd5e1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
  `

  constructor() {
    super()
    this.orders = orderService.getOrders()
    this._onOrdersUpdated = (e) => {
      this.orders = e.detail.orders
      this.requestUpdate()
    }
  }

  connectedCallback() {
    super.connectedCallback()
    orderService.addEventListener('orders-updated', this._onOrdersUpdated)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    orderService.removeEventListener('orders-updated', this._onOrdersUpdated)
  }

  _advanceStatus(orderId, currentStatus) {
    const currentIndex = ORDER_STATUSES.findIndex((s) => s.id === currentStatus)
    const nextIndex = (currentIndex + 1) % ORDER_STATUSES.length
    orderService.updateOrderStatus(orderId, ORDER_STATUSES[nextIndex].id)
  }

  render() {
    return html`
      <div class="page-header">
        <div>
          <h1 class="page-title">Meus Pedidos & Acompanhamento</h1>
          <p class="page-subtitle">
            Acompanhe o status de fatiamento, impressão na mesa e envio das suas peças 3D em tempo real.
          </p>
        </div>

        <button
          style="background: #0284c7; color: #fff; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; cursor: pointer;"
          @click=${() => navigate('catalogo')}
        >
          + Novo Pedido
        </button>
      </div>

      ${this.orders.length === 0
        ? html`
            <div class="empty-orders">
              <span style="font-size: 48px;">📦</span>
              <h3>Nenhum pedido registrado ainda</h3>
              <p style="color: #64748b; font-size: 14px;">
                Explore o catálogo de modelos 3D ou envie seu arquivo STL para fazer o seu primeiro pedido!
              </p>
              <button
                style="background: #0284c7; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer;"
                @click=${() => navigate('catalogo')}
              >
                Explorar Catálogo 3D
              </button>
            </div>
          `
        : html`
            <div class="orders-list">
              ${this.orders.map((order) => {
                const statusInfo = getStatusInfo(order.status)
                const currentStep = statusInfo.step || 1

                return html`
                  <div class="order-card">
                    <!-- Topo -->
                    <div class="order-header">
                      <div class="order-id-group">
                        <span class="order-id">Pedido #${order.id}</span>
                        <span class="order-date">
                          Criado em ${new Date(order.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <div class="status-badge" style="background-color: ${statusInfo.color};">
                        <span>●</span>
                        <span>${statusInfo.label}</span>
                      </div>
                    </div>

                    <!-- Stepper Visual de Produção 3D -->
                    <div class="status-stepper">
                      <div class="stepper-line">
                        <div
                          class="stepper-line-fill"
                          style="width: ${((currentStep - 1) / (ORDER_STATUSES.length - 1)) * 100}%;"
                        ></div>
                      </div>

                      ${ORDER_STATUSES.map(
                        (step) => html`
                          <div class="step-item">
                            <div
                              class="step-circle ${step.step < currentStep ? 'completed' : ''} ${step.step === currentStep ? 'active' : ''}"
                            >
                              ${step.step < currentStep ? '✓' : step.step}
                            </div>
                            <span class="step-label ${step.step === currentStep ? 'active' : ''}">
                              ${step.label.split('&')[0]}
                            </span>
                          </div>
                        `
                      )}
                    </div>

                    <!-- Lista de Peças do Pedido -->
                    <div class="items-list">
                      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b;">
                        Peças 3D Solicitadas (${order.items.length})
                      </span>
                      ${order.items.map(
                        (item) => html`
                          <div class="order-item-row">
                            <div>
                              <strong>${item.quantity}x ${item.title}</strong>
                              <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                                <span
                                  class="item-color-pill"
                                  style="background-color: ${item.colorHex || '#0284c7'};"
                                ></span>
                                <span>${item.materialName || 'PLA'} (${item.colorName || 'Padrão'})</span>
                                • <span>${item.qualityName || '0.20 mm'}</span> •
                                <span>${item.infillName || '25% infill'}</span>
                              </div>
                            </div>
                            <strong style="color: #0284c7;">${formatBRL(item.totalPrice)}</strong>
                          </div>
                        `
                      )}
                    </div>

                    <!-- Rodapé com Informações de Contato e Ações -->
                    <div class="order-footer">
                      <div class="customer-info">
                        <strong>Cliente:</strong> ${order.customer.name} |
                        <strong>Contato:</strong> ${order.customer.phone || 'N/A'}<br />
                        <strong>Entrega:</strong>
                        ${order.customer.deliveryMethod === 'retirada' ? 'Retirada no Balcão' : 'Correios / Envio'}
                        ${order.customer.address ? ` (${order.customer.address})` : ''}
                      </div>

                      <div class="actions-group">
                        <select
                          class="status-select"
                          .value=${order.status}
                          @change=${(e) => orderService.updateOrderStatus(order.id, e.target.value)}
                        >
                          ${ORDER_STATUSES.map(
                            (s) => html`<option value=${s.id} ?selected=${s.id === order.status}>
                              Status: ${s.label}
                            </option>`
                          )}
                        </select>

                        <button
                          class="btn-wa"
                          @click=${() => window.open(orderService.generateWhatsAppUrl(order), '_blank')}
                        >
                          <span>💬 WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </div>
                `
              })}
            </div>
          `}
    `
  }
}

customElements.define('orders-view', OrdersView)
