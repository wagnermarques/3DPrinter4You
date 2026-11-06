import { LitElement, html, css } from 'lit'
import { MATERIALS } from '../config/materials.js'
import { PRINTER_BED_SPECS } from '../config/print-settings.js'

export class AboutView extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 24px;
      max-width: 1040px;
      margin: 0 auto;
    }

    .hero-box {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      border-radius: 20px;
      padding: 36px 32px;
      margin-bottom: 32px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }

    .hero-title {
      font-size: 32px;
      font-weight: 900;
      margin: 0 0 12px 0;
      color: #38bdf8;
    }

    .hero-desc {
      font-size: 16px;
      line-height: 1.6;
      color: #cbd5e1;
      margin: 0;
    }

    .section {
      margin-bottom: 36px;
    }

    .section-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--md-sys-color-on-surface, #0f172a);
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Grid de Materiais */
    .materials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 16px;
    }

    .mat-card {
      background: var(--md-sys-color-surface-container, #ffffff);
      border: 1px solid var(--md-sys-color-outline-variant, #e2e8f0);
      border-radius: 14px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .mat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .mat-name {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }

    .mat-tag {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 12px;
      background: #e0f2fe;
      color: #0284c7;
    }

    .mat-desc {
      font-size: 13px;
      color: #64748b;
      line-height: 1.45;
    }

    .mat-specs {
      font-size: 12px;
      color: #334155;
      background: #f8fafc;
      padding: 8px 12px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
    }

    /* FAQ */
    .faq-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .faq-item {
      background: var(--md-sys-color-surface-container, #ffffff);
      border: 1px solid var(--md-sys-color-outline-variant, #e2e8f0);
      border-radius: 12px;
      padding: 18px 20px;
    }

    .faq-q {
      font-size: 15px;
      font-weight: 700;
      color: #0284c7;
      margin: 0 0 6px 0;
    }

    .faq-a {
      font-size: 14px;
      color: #475569;
      line-height: 1.5;
      margin: 0;
    }
  `

  render() {
    return html`
      <div class="hero-box">
        <h1 class="hero-title">3DPrinter4You — Impressão 3D sob Demanda</h1>
        <p class="hero-desc">
          Oferecemos soluções completas em manufatura aditiva (FDM e Resina SLA). Desde objetos decorativos
          e miniaturas ultra detalhadas até peças técnicas de engenharia em ABS e PETG com alta resistência térmica
          e mecânica.
        </p>
      </div>

      <!-- Guia de Materiais -->
      <div class="section">
        <h2 class="section-title">🧪 Guia Completo de Filamentos & Resinas</h2>
        <div class="materials-grid">
          ${MATERIALS.map(
            (m) => html`
              <div class="mat-card">
                <div class="mat-header">
                  <span class="mat-name">${m.name}</span>
                  <span class="mat-tag">${m.badge}</span>
                </div>
                <p class="mat-desc">${m.description}</p>
                <div class="mat-specs">
                  <span>Densidade: ${m.density} g/cm³</span>
                  <span>Mesa: ${m.bedTemp}</span>
                  <span>Bico: ${m.nozzleTemp}</span>
                </div>
              </div>
            `
          )}
        </div>
      </div>

      <!-- FAQ -->
      <div class="section">
        <h2 class="section-title">❓ Perguntas Frequentes</h2>
        <div class="faq-list">
          <div class="faq-item">
            <h3 class="faq-q">Qual formato de arquivo 3D posso enviar?</h3>
            <p class="faq-a">
              Aceitamos arquivos no formato <strong>.STL</strong>, <strong>.OBJ</strong> e <strong>.3MF</strong>.
              Você pode enviar diretamente pela página de envio personalizado ou pelo WhatsApp.
            </p>
          </div>

          <div class="faq-item">
            <h3 class="faq-q">Qual é o volume máximo de impressão?</h3>
            <p class="faq-a">
              Nosso parque conta com impressoras de volume útil até <strong>${PRINTER_BED_SPECS.maxPrintVolume}</strong>
              para peças inteiras, além da possibilidade de fatiar e montar peças maiores com pinos de encaixe.
            </p>
          </div>

          <div class="faq-item">
            <h3 class="faq-q">Qual o prazo médio de produção e envio?</h3>
            <p class="faq-a">
              A maioria das peças do catálogo é impressa em <strong>24h a 48h úteis</strong>. Peças volumosas ou
              lotes maiores têm prazos alinhados individualmente no WhatsApp.
            </p>
          </div>

          <div class="faq-item">
            <h3 class="faq-q">Como é feito o pagamento?</h3>
            <p class="faq-a">
              O pagamento pode ser feito via PIX ou Cartão após a aprovação técnica do fatiamento do modelo.
            </p>
          </div>
        </div>
      </div>
    `
  }
}

customElements.define('about-view', AboutView)
