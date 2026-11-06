# 3DPrinter4You — Impressão 3D sob Demanda

Aplicação web progressiva (PWA) moderna para catálogo interativo de modelos 3D, personalização em tempo real de filamentos, orçamento transparente e solicitação de impressão 3D sob demanda.

Construído sobre o ecossistema **FzlSoft AppShell (`fzl-fund-appshell--lit`)**, Web Components com **Lit**, e renderização 3D WebGL em tempo real com **Three.js**.

---

## 🚀 Principais Funcionalidades

1. **Catálogo Interativo de Modelos 3D**:
   - Modelos prontos divididos em categorias: Decoração & Casa, Utilitários & Suportes, Miniaturas & Geek, Gadgets & Tech, Jogos & Mecânica.
   - Filtros por categoria, ordenação inteligente e busca textual instantânea.

2. **Visualizador 3D em Tempo Real (`<model-3d-viewer>`)**:
   - Controles de órbita fluídos (rotação 360°, zoom milimétrico e pan).
   - Mesa de impressão realista PEI (220 x 220 mm) com grade milimétrica.
   - Troca de cor do filamento ao vivo refletida diretamente na peça 3D.
   - Alternância de modo Wireframe (malha de polígonos) e rotação automática.
   - Medição automática de dimensões reais (X, Y, Z em mm) e volume em cm³.

3. **Configuração e Personalização de Fatiamento**:
   - **Materiais**: PLA Premium, PETG Ultra Resistente, ABS Engenharia, TPU Flexível 95A e Resina 8K HD.
   - **Paleta de Filamentos**: 14 cores exclusivas (Preto Fosco, Ouro Seda, Azul Royal, Vermelho Carmim, etc.).
   - **Qualidade de Camada**: Rascunho Rápido (0.28 mm), Padrão Balanceado (0.20 mm), Alta Definição (0.12 mm) e Ultra Detalhe (0.05 mm).
   - **Preenchimento (Infill)**: 15% (Leve), 25% (Padrão), 50% (Reforçado) e 100% (Sólido).

4. **Orçamento e Pedido Instantâneo ("Pedir Impressão")**:
   - Cálculo transparente de matéria-prima, tempo de máquina e acabamento.
   - Descontos automáticos progressivos por quantidade (até 18% OFF).
   - Carrinho de compras integrado com resumo de peso total e tempo de impressão.
   - Geração de mensagem formatada para envio direto ao WhatsApp da oficina com 1 clique.

5. **Upload de STL Próprio**:
   - Carregue seu próprio arquivo `.stl` via drag-and-drop.
   - Inspeção 3D imediata, cálculo de dimensões e cotação de impressão sob medida.

6. **Acompanhamento de Pedidos & Status**:
   - Linha do tempo visual de produção (*Pendente ➔ Fatiamento ➔ Imprimindo ➔ Acabamento ➔ Pronto ➔ Entregue*).

7. **Calculadora Maker**:
   - Ferramenta completa para makers e clientes simularem custo de carretel, consumo elétrico (kWh), depreciação de bico e margem de lucro.

---

## 🛠️ Tecnologias Utilizadas

- **Framework do Shell**: [`fzl-fund-appshell--lit`](file:///home/wgn/WORKING/Projects-Srcs/Projects-Srcs-FzlSoft/3DPrinter4You/fzl-fund-ui/appshell-lit) (AppShell PWA, tema dinâmico, rotas hash e acessibilidade Atkinson/OpenDyslexic)
- **Componentes**: [Lit](https://lit.dev/) + Material Web 3 (`@material/web`)
- **Visualização 3D**: [Three.js](https://threejs.org/) (WebGL, OrbitControls, STLLoader)
- **Empacotador**: [Vite](https://vitejs.dev/) + `vite-plugin-pwa`

---

## 📦 Comandos Disponíveis

```bash
# Iniciar o servidor de desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Pré-visualizar a build de produção
npm run preview

# Gerar ícones PWA a partir do SVG
npm run icons
```
