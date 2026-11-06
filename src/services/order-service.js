import { formatBRL, formatPrintTime } from './pricing-service.js'

const CART_STORAGE_KEY = 'fzl_3dp_cart_v1'
const ORDERS_STORAGE_KEY = 'fzl_3dp_orders_v1'

export const ORDER_STATUSES = [
  { id: 'pendente', label: 'Pendente', icon: 'schedule', color: '#f59e0b', step: 1 },
  { id: 'fatiando', label: 'Fatiamento & Preparo', icon: 'tune', color: '#0284c7', step: 2 },
  { id: 'imprimindo', label: 'Imprimindo na Cama 3D', icon: 'precision_manufacturing', color: '#8b5cf6', step: 3 },
  { id: 'acabamento', label: 'Pós-Processo & Inspeção', icon: 'auto_fix_high', color: '#ec4899', step: 4 },
  { id: 'pronto', label: 'Pronto para Envio / Retirada', icon: 'local_shipping', color: '#10b981', step: 5 },
  { id: 'entregue', label: 'Entregue com Sucesso', icon: 'check_circle', color: '#059669', step: 6 },
]

export function getStatusInfo(statusId) {
  return ORDER_STATUSES.find((s) => s.id === statusId) || ORDER_STATUSES[0]
}

/**
 * Gerenciador de Carrinho e Pedidos
 */
class OrderService extends EventTarget {
  constructor() {
    super()
    this.cart = this._loadCart()
    this.orders = this._loadOrders()
  }

  _loadCart() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  _saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart))
    } catch (e) {
      console.error('Erro salvando carrinho:', e)
    }
    this.dispatchEvent(new CustomEvent('cart-updated', { detail: { cart: this.cart } }))
  }

  _loadOrders() {
    try {
      const data = localStorage.getItem(ORDERS_STORAGE_KEY)
      if (data) return JSON.parse(data)
    } catch (e) {
      console.error('Erro lendo pedidos:', e)
    }

    // Pedido inicial de demonstração
    const demoOrders = [
      {
        id: '3DP-8421',
        createdAt: new Date(Date.now() - 3600 * 1000 * 26).toISOString(),
        customer: {
          name: 'Carlos Mendes',
          phone: '(11) 98765-4321',
          email: 'carlos.mendes@exemplo.com',
          deliveryMethod: 'retirada',
          address: 'Balcão da Oficina FzlSoft',
          notes: 'Pode deixar o acabamento bem liso no topo.',
        },
        status: 'imprimindo',
        items: [
          {
            modelId: 'spiral-vase',
            title: 'Vaso Espiral Geométrico Voronoi',
            materialName: 'PLA Premium',
            colorName: 'Ouro Seda Imperial (Silk)',
            colorHex: '#d97706',
            qualityName: 'Alta Definição (0.12 mm)',
            infillName: '15% — Leve / Decorativo',
            weightGrams: 52,
            printTimeMinutes: 145,
            unitPrice: 38.5,
            quantity: 1,
            totalPrice: 38.5,
          },
        ],
        subtotal: 38.5,
        deliveryFee: 0,
        total: 38.5,
      },
    ]
    this._saveOrders(demoOrders)
    return demoOrders
  }

  _saveOrders(orders) {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
      this.orders = orders
    } catch (e) {
      console.error('Erro salvando pedidos:', e)
    }
    this.dispatchEvent(new CustomEvent('orders-updated', { detail: { orders: this.orders } }))
  }

  // Métodos do Carrinho
  getCart() {
    return [...this.cart]
  }

  getCartCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0)
  }

  getCartSummary() {
    const totalItems = this.getCartCount()
    const subtotal = this.cart.reduce((sum, item) => sum + item.totalPrice, 0)
    const totalWeight = this.cart.reduce((sum, item) => sum + (item.weightGrams || 50) * item.quantity, 0)
    const totalTimeMinutes = this.cart.reduce((sum, item) => sum + (item.printTimeMinutes || 60) * item.quantity, 0)

    return {
      totalItems,
      subtotal,
      totalWeight,
      totalTimeMinutes,
    }
  }

  addToCart(item) {
    // Procura se já existe um item com a mesma configuração
    const existingIndex = this.cart.findIndex(
      (i) =>
        i.modelId === item.modelId &&
        i.materialId === item.materialId &&
        i.colorId === item.colorId &&
        i.qualityId === item.qualityId &&
        i.infillId === item.infillId
    )

    if (existingIndex >= 0) {
      this.cart[existingIndex].quantity += item.quantity || 1
      this.cart[existingIndex].totalPrice = this.cart[existingIndex].unitPrice * this.cart[existingIndex].quantity
    } else {
      const cartItem = {
        cartId: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        ...item,
        quantity: item.quantity || 1,
        totalPrice: item.unitPrice * (item.quantity || 1),
      }
      this.cart.push(cartItem)
    }

    this._saveCart()
  }

  updateQuantity(cartId, quantity) {
    if (quantity <= 0) {
      this.removeFromCart(cartId)
      return
    }
    const item = this.cart.find((i) => i.cartId === cartId)
    if (item) {
      item.quantity = quantity
      item.totalPrice = item.unitPrice * quantity
      this._saveCart()
    }
  }

  removeFromCart(cartId) {
    this.cart = this.cart.filter((i) => i.cartId !== cartId)
    this._saveCart()
  }

  clearCart() {
    this.cart = []
    this._saveCart()
  }

  // Criação de Pedido
  createOrder({ customer, items = null, deliveryFee = 0 }) {
    const orderItems = items ? items : this.getCart()
    if (!orderItems.length) {
      throw new Error('Não há itens no carrinho para fechar o pedido.')
    }

    const subtotal = orderItems.reduce((acc, item) => acc + item.totalPrice, 0)
    const total = subtotal + deliveryFee
    const orderNumber = '3DP-' + Math.floor(1000 + Math.random() * 9000)

    const newOrder = {
      id: orderNumber,
      createdAt: new Date().toISOString(),
      customer,
      status: 'pendente',
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
    }

    this.orders.unshift(newOrder)
    this._saveOrders(this.orders)

    // Se o pedido usou o carrinho principal, limpa o carrinho
    if (!items) {
      this.clearCart()
    }

    return newOrder
  }

  getOrders() {
    return [...this.orders]
  }

  getOrderById(id) {
    return this.orders.find((o) => o.id === id) || null
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find((o) => o.id === orderId)
    if (order) {
      order.status = newStatus
      this._saveOrders([...this.orders])
    }
  }

  generateWhatsAppUrl(order, workshopPhone = '5511999999999') {
    const lines = [
      `👋 *Olá! Gostaria de confirmar meu pedido de impressão 3D na 3DPrinter4You!*`,
      ``,
      `🔖 *Pedido:* #${order.id}`,
      `📅 *Data:* ${new Date(order.createdAt).toLocaleDateString('pt-BR')}`,
      `👤 *Cliente:* ${order.customer.name}`,
      `📱 *Contato:* ${order.customer.phone || 'Não informado'}`,
      `📦 *Entrega:* ${order.customer.deliveryMethod === 'retirada' ? 'Retirada no Balcão' : 'Envio Correios/Transportadora'}`,
      order.customer.address ? `📍 *Endereço:* ${order.customer.address}` : '',
      ``,
      `🖨️ *ITENS DO PEDIDO:*`,
    ]

    order.items.forEach((item, index) => {
      lines.push(
        `${index + 1}. *${item.quantity}x ${item.title}*`,
        `   • Filamento: ${item.materialName || item.materialId} (${item.colorName || item.colorHex})`,
        `   • Resolução: ${item.qualityName || '0.20 mm'} | Infill: ${item.infillName || '25%'}`,
        `   • Valor: ${formatBRL(item.totalPrice)}`
      )
    })

    lines.push(
      ``,
      `💰 *Subtotal:* ${formatBRL(order.subtotal)}`,
      order.deliveryFee > 0 ? `🚚 *Frete:* ${formatBRL(order.deliveryFee)}` : `🚚 *Frete:* Grátis (Retirada)`,
      `🏷️ *TOTAL DO PEDIDO:* ${formatBRL(order.total)}`,
      ``,
      order.customer.notes ? `📝 *Observações:* ${order.customer.notes}` : '',
      `Muito obrigado! Aguardo a confirmação e dados para pagamento.`
    )

    const cleanText = lines.filter((l) => l !== '').join('\n')
    return `https://wa.me/${workshopPhone}?text=${encodeURIComponent(cleanText)}`
  }
}

export const orderService = new OrderService()
