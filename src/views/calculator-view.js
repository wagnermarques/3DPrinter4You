import { LitElement, html, css } from 'lit'
import { formatBRL } from '../services/pricing-service.js'

export class CalculatorView extends LitElement {
  static properties = {
    spoolCostPerKg: { type: Number },
    partWeightGrams: { type: Number },
    printTimeHours: { type: Number },
    printerWattage: { type: Number },
    electricityKwhCost: { type: Number },
    hourlyMaintenanceCost: { type: Number },
    failureRatePercent: { type: Number },
    profitMarginPercent: { type: Number },
  }

  static styles = css`
    :host {
      display: block;
      padding: 24px;
      max-width: 1100px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 24px;
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

    .calc-layout {
      display: grid;
      grid-template-columns: 1fr 1.15fr;
      gap: 24px;
    }

    @media (max-width: 860px) {
      .calc-layout {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: var(--md-sys-color-surface-container, #ffffff);
      border: 1px solid var(--md-sys-color-outline-variant, #e2e8f0);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .card-title {
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #0284c7;
    }

    .form-group {
      margin-bottom: 14px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .label-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 600;
      color: #334155;
    }

    .val-highlight {
      color: #0284c7;
      font-weight: 700;
    }

    .slider-input {
      width: 100%;
      accent-color: #0284c7;
      cursor: pointer;
    }

    .number-input {
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 14px;
    }

    /* Cards de Resultados */
    .results-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    .result-box {
      background: var(--md-sys-color-surface-container-high, #f8fafc);
      border: 1px solid var(--md-sys-color-outline-variant, #e2e8f0);
      border-radius: 12px;
      padding: 14px;
      display: flex;
      flex-direction: column;
    }

    .res-label {
      font-size: 11px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
    }

    .res-val {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 4px;
    }

    .final-highlight-box {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: #ffffff;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      text-align: center;
      box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.4);
    }

    .final-price-tag {
      font-size: 36px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
  `

  constructor() {
    super()
    this.spoolCostPerKg = 120 // R$ 120,00 por rolo de 1kg
    this.partWeightGrams = 60 // 60g
    this.printTimeHours = 3.5 // 3h 30m
    this.printerWattage = 150 // 150W
    this.electricityKwhCost = 0.92 // R$ 0,92 por kWh
    this.hourlyMaintenanceCost = 2.0 // R$ 2,00 por hora
    this.failureRatePercent = 10 // 10%
    this.profitMarginPercent = 50 // 50%
  }

  render() {
    // 1. Custo de Filamento
    const filamentCost = (this.partWeightGrams / 1000) * this.spoolCostPerKg

    // 2. Custo de Energia Elétrica (kW * horas * tarifa)
    const energyKwh = (this.printerWattage / 1000) * this.printTimeHours
    const electricityCost = energyKwh * this.electricityKwhCost

    // 3. Manutenção / Desgaste
    const maintenanceCost = this.printTimeHours * this.hourlyMaintenanceCost

    // Custo Base
    const baseCost = filamentCost + electricityCost + maintenanceCost

    // Margem de Falha
    const failureCost = baseCost * (this.failureRatePercent / 100)

    // Custo Total de Produção
    const totalProductionCost = baseCost + failureCost

    // Preço Sugerido com Margem de Lucro
    const suggestedPrice = totalProductionCost * (1 + this.profitMarginPercent / 100)
    const netProfit = suggestedPrice - totalProductionCost

    return html`
      <div class="page-header">
        <h1 class="page-title">Calculadora de Custos de Impressão 3D</h1>
        <p class="page-subtitle">
          Simule custos exatos de filamento, energia, desgaste de bico e margens de lucro para orçamentos precisos.
        </p>
      </div>

      <div class="calc-layout">
        <!-- Parâmetros de Entrada -->
        <div class="card">
          <h2 class="card-title">⚙️ Parâmetros da Peça & Máquina</h2>

          <div class="form-group">
            <div class="label-row">
              <span>Preço do Carretel de Filamento (1kg)</span>
              <span class="val-highlight">${formatBRL(this.spoolCostPerKg)}</span>
            </div>
            <input
              type="range"
              min="60"
              max="350"
              step="5"
              class="slider-input"
              .value=${this.spoolCostPerKg}
              @input=${(e) => (this.spoolCostPerKg = Number(e.target.value))}
            />
          </div>

          <div class="form-group">
            <div class="label-row">
              <span>Peso da Peça Fatiada</span>
              <span class="val-highlight">${this.partWeightGrams} g</span>
            </div>
            <input
              type="range"
              min="5"
              max="500"
              step="5"
              class="slider-input"
              .value=${this.partWeightGrams}
              @input=${(e) => (this.partWeightGrams = Number(e.target.value))}
            />
          </div>

          <div class="form-group">
            <div class="label-row">
              <span>Tempo de Impressão</span>
              <span class="val-highlight">${this.printTimeHours} h</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="24"
              step="0.5"
              class="slider-input"
              .value=${this.printTimeHours}
              @input=${(e) => (this.printTimeHours = Number(e.target.value))}
            />
          </div>

          <div class="form-group">
            <div class="label-row">
              <span>Potência Média da Impressora</span>
              <span class="val-highlight">${this.printerWattage} W</span>
            </div>
            <input
              type="range"
              min="50"
              max="400"
              step="10"
              class="slider-input"
              .value=${this.printerWattage}
              @input=${(e) => (this.printerWattage = Number(e.target.value))}
            />
          </div>

          <div class="form-group">
            <div class="label-row">
              <span>Margem de Falha / Suportes</span>
              <span class="val-highlight">${this.failureRatePercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              class="slider-input"
              .value=${this.failureRatePercent}
              @input=${(e) => (this.failureRatePercent = Number(e.target.value))}
            />
          </div>

          <div class="form-group">
            <div class="label-row">
              <span>Margem de Lucro Desejada</span>
              <span class="val-highlight">${this.profitMarginPercent}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              class="slider-input"
              .value=${this.profitMarginPercent}
              @input=${(e) => (this.profitMarginPercent = Number(e.target.value))}
            />
          </div>
        </div>

        <!-- Resultados e Cotação -->
        <div class="card">
          <h2 class="card-title">📊 Decomposição dos Custos</h2>

          <div class="results-grid">
            <div class="result-box">
              <span class="res-label">Matéria-Prima (Filamento)</span>
              <span class="res-val">${formatBRL(filamentCost)}</span>
            </div>

            <div class="result-box">
              <span class="res-label">Energia Elétrica</span>
              <span class="res-val">${formatBRL(electricityCost)}</span>
            </div>

            <div class="result-box">
              <span class="res-label">Depreciação & Manutenção</span>
              <span class="res-val">${formatBRL(maintenanceCost)}</span>
            </div>

            <div class="result-box">
              <span class="res-label">Margem de Falha</span>
              <span class="res-val">${formatBRL(failureCost)}</span>
            </div>
          </div>

          <div style="margin-bottom: 20px; font-size: 14px; color: #475569;">
            <strong>Custo Real de Produção:</strong> ${formatBRL(totalProductionCost)}
          </div>

          <!-- Preço Final Sugerido -->
          <div class="final-highlight-box">
            <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9;">
              Preço Sugerido de Venda
            </span>
            <span class="final-price-tag">${formatBRL(suggestedPrice)}</span>
            <span style="font-size: 13px; opacity: 0.9;">
              Lucro Líquido Estimado: <strong>${formatBRL(netProfit)}</strong> (${this.profitMarginPercent}%)
            </span>
          </div>
        </div>
      </div>
    `
  }
}

customElements.define('calculator-view', CalculatorView)
