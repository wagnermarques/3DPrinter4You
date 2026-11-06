import { html } from 'lit'
import 'fzl-fund-appshell--lit/styles/theme.css'
import '@fzl/design-tokens/tokens.css'
import '@fzl/webcomponents-lit'
import { createAppShell, navigate, pattern } from 'fzl-fund-appshell--lit'
import { orderService } from './services/order-service.js'

import './views/catalog-view.js'
import './views/custom-upload-view.js'
import './views/orders-view.js'
import './views/calculator-view.js'
import './views/about-view.js'
import './components/cart-drawer.js'

// Estado global do carrinho para re-render do botão de cabeçalho
let isCartOpen = false

function openCart() {
  const drawer = document.querySelector('cart-drawer')
  if (drawer) {
    drawer.open = true
  }
}

// Inicia o AppShell da FzlSoft
createAppShell({
  mount: '#app',
  title: '3DPrinter4You',
  home: () => html`<catalog-view></catalog-view>`,
  routes: [
    {
      name: 'catalogo',
      match: pattern('catalogo'),
      title: 'Catálogo de Modelos 3D',
      crumb: [{ label: 'Catálogo 3D' }],
      render: () => html`<catalog-view></catalog-view>`,
    },
    {
      name: 'upload-personalizado',
      match: pattern('upload-personalizado'),
      title: 'Imprimir Meu Arquivo STL',
      crumb: [
        { label: 'Catálogo', href: '#/catalogo' },
        { label: 'Upload STL Personalizado' },
      ],
      render: () => html`<custom-upload-view></custom-upload-view>`,
    },
    {
      name: 'meus-pedidos',
      match: pattern('meus-pedidos'),
      title: 'Meus Pedidos & Acompanhamento',
      crumb: [{ label: 'Meus Pedidos' }],
      render: () => html`<orders-view></orders-view>`,
    },
    {
      name: 'calculadora',
      match: pattern('calculadora'),
      title: 'Calculadora de Custos 3D',
      crumb: [{ label: 'Calculadora Maker' }],
      render: () => html`<calculator-view></calculator-view>`,
    },
    {
      name: 'sobre',
      match: pattern('sobre'),
      title: 'Sobre & Guia de Filamentos',
      crumb: [{ label: 'Guia & FAQ' }],
      render: () => html`<about-view></about-view>`,
    },
  ],
  drawer: {
    sections: [
      {
        id: 'catalogo-section',
        label: 'Catálogo & Modelos',
        expanded: true,
        items: [
          {
            label: 'Catálogo de Modelos 3D',
            icon: 'view_in_ar',
            href: '#/catalogo',
          },
          {
            label: 'Imprimir Meu Arquivo STL',
            icon: 'file_upload',
            href: '#/upload-personalizado',
          },
        ],
      },
      {
        id: 'pedidos-section',
        label: 'Pedidos & Acompanhamento',
        expanded: true,
        items: [
          {
            label: 'Meus Pedidos & Status',
            icon: 'inventory_2',
            href: '#/meus-pedidos',
          },
        ],
      },
      {
        id: 'ferramentas-section',
        label: 'Ferramentas Maker',
        expanded: true,
        items: [
          {
            label: 'Calculadora de Custos 3D',
            icon: 'calculate',
            href: '#/calculadora',
          },
          {
            label: 'Guia de Materiais & FAQ',
            icon: 'science',
            href: '#/sobre',
          },
        ],
      },
    ],
  },
  headerActions: () => {
    const count = orderService.getCartCount()
    return html`
      <button
        style="
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          margin-right: 8px;
        "
        @click=${openCart}
      >
        <span>🛒 Carrinho</span>
        <span
          style="
            background: #facc15;
            color: #0f172a;
            border-radius: 12px;
            padding: 1px 7px;
            font-size: 11px;
            font-weight: 800;
          "
        >
          ${count}
        </span>
      </button>

      <button
        style="
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          color: #0284c7;
          border: none;
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        "
        @click=${() => navigate('upload-personalizado')}
      >
        <span>+ Enviar STL</span>
      </button>
    `
  },
})

// Adiciona o drawer de carrinho global ao corpo
const cartEl = document.createElement('cart-drawer')
document.body.appendChild(cartEl)

// Ouvinte para re-renderizar o header quando o carrinho muda
orderService.addEventListener('cart-updated', () => {
  const shell = document.querySelector('app-shell')
  if (shell) {
    shell.requestUpdate()
  }
})
