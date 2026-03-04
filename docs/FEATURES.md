# Funcionalidades (Features)

## 🌟 Core Features (Essenciais)

Funcionalidades fundamentais para o funcionamento do sistema e entrega de valor imediato.

### 1. Gestão de Clientes
- **Cadastro de Empresas:**
  - Dados cadastrais (CNPJ, Razão Social, CNAE)
  - Histórico de faturamento (últimos 12 meses)
  - Número de funcionários e folha de pagamento
  - Regime tributário atual
- **Dashboard de Clientes:**
  - Listagem de empresas cadastradas
  - Status do último planejamento (Em dia / Vencido)
  - Filtros por regime e faturamento

### 2. Motor de Cálculo Fiscal
- **Simulação de Regimes:**
  - Comparativo automático: Simples Nacional vs. Lucro Presumido vs. Lucro Real
  - Cálculo de impostos federais (PIS, COFINS, IRPJ, CSLL)
  - Cálculo de impostos estaduais/municipais (ICMS, ISS) - *Estimado inicialmente*
  - Cálculo de encargos sobre folha (INSS patronal, RAT, Terceiros)
- **Análise de Fator R:**
  - Verificação automática se a empresa se enquadra no Fator R (Anexo III vs. V do Simples)
  - Sugestão de ajuste no Pró-labore para redução de imposto

### 3. Geração de Relatórios
- **Relatório Executivo (PDF):**
  - Capa personalizada com logo do contador
  - Resumo executivo ("Qual o melhor regime?")
  - Gráficos comparativos de carga tributária
  - Tabela detalhada de impostos por regime
  - Economia projetada anual
- **Customização:**
  - Opção de ocultar regimes não recomendados
  - Campo para observações do contador

---

## 🚀 Growth Features (Diferenciais)

Funcionalidades para encantar o cliente e aumentar o valor percebido.

### 4. Inteligência Tributária
- **Alertas de Oportunidade:**
  - Aviso quando o faturamento se aproxima do limite do Simples
  - Sugestão de mudança de regime baseada na tendência de crescimento
- **Cenários Futuros:**
  - Simulação de crescimento ("E se o faturamento aumentar 20%?")
  - Impacto da contratação de funcionários na carga tributária

### 5. Área do Contador (Admin)
- **Gestão de Equipe:**
  - Convite para colaboradores
  - Níveis de acesso (Admin, Analista, Leitor)
- **Whitelabel (Marca Própria):**
  - Configuração de logo e cores da contabilidade no sistema e relatórios

---

## 🔮 Future Features (Longo Prazo)

Funcionalidades para escalar e tornar o produto indispensável.

### 6. Integrações
- **Importação Automática:**
  - Conexão com sistemas contábeis (Domínio, ContaAzul, Omie) via API ou arquivo
  - Leitura de extratos do Simples Nacional (PGDAS)
- **Busca de CNPJ:**
  - Preenchimento automático de dados via API pública da Receita

### 7. Monitoramento Contínuo
- **Recorrência:**
  - Monitoramento mensal automático
  - Email de alerta se a estratégia tributária deixar de ser a ideal

---

## ✅ Feature List para MVP

Para a versão 1.0 (MVP), focaremos estritamente em:

1. **Cadastro Manual de Cliente** (CNPJ + Faturamento + Folha)
2. **Cálculo Comparativo** (Simples vs. Presumido)
3. **Análise de Fator R** (Simples Nacional)
4. **Geração de Relatório PDF** (Template fixo limpo)

*Lucro Real e integrações ficam para a V2.*
