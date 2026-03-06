# FiscalOS - Funcionalidades

## 🔮 Digital Twin Fiscal

Cria uma réplica virtual da empresa para simular cenários sem riscos.

### Dados Modelados
- **Identificação:** CNPJ, razão social, natureza jurídica, porte
- **Atividade:** CNAE principal e secundários, tipo de receita
- **Financeiro:** Receitas por tipo (Serviços, Comércio, Locação), ticket médio, clientes
- **Custos:** Folha de pagamento, aluguel, fornecedores, marketing, administrativo
- **Trabalhista:** Funcionários, salários, pró-labore, benefícios
- **Localização:** Município (código IBGE) para cálculo de ISS
- **Fiscal Atual:** Impostos pagos atualmente (DAS, IRPJ, CSLL, PIS, COFINS, ISS, INSS)

### Capacidades do Digital Twin
- Simular mudança de regime tributário
- Testar abertura de nova empresa (cisão)
- Calcular impacto de Holding familiar
- Avaliar mudança de município
- Detectar problemas e oportunidades

---

## ⚡ Motor Fiscal V2

Motor de cálculo 100% fiel à legislação brasileira.

### Simples Nacional (Anexos I-V)
- **6 faixas progressivas** por anexo (tabela oficial)
- **Fórmula oficial:** `(Receita × Alíquota) - Dedução`
- **Fator R automático:** Verifica se folha ≥ 28% para Anexo III
- **CPP:** Incluído nos anexos I, II, III, V; separado no anexo IV

| Anexo | Atividade | Fator R |
|-------|-----------|---------|
| I | Comércio | N/A |
| II | Indústria | N/A |
| III | Serviços com Fator R ≥ 28% | Obrigatório |
| IV | Serviços específicos (limpeza, obras) | N/A |
| V | Serviços com Fator R < 28% | Obrigatório |

### Lucro Presumido
- **Base de cálculo por atividade:**
  - Serviços: 32% para IRPJ e CSLL
  - Comércio: 8% IRPJ, 12% CSLL
  - Locação: 32%
- **Tributos calculados:**
  - IRPJ: 15% + 10% adicional (acima de R$ 20k/mês)
  - CSLL: 9%
  - PIS: 0.65% (cumulativo)
  - COFINS: 3% (cumulativo)
  - ISS: 2% a 5% (conforme município)
  - CPP/INSS: ~28% sobre folha

### Lucro Real
- IRPJ e CSLL sobre lucro real
- PIS/COFINS não-cumulativo (1.65% + 7.6%)
- Créditos de PIS/COFINS sobre insumos

---

## 📊 Score Fiscal (0-100)

Índice de eficiência tributária da empresa.

### Fatores do Score

| Fator | Peso | O que avalia |
|-------|------|--------------|
| Adequação do Regime | 30% | Regime atual é o mais econômico? |
| Fator R | 20% | Folha otimizada para o anexo? |
| Carga Tributária | 20% | Comparativo com setor |
| Regularidade Fiscal | 15% | Dados completos e coerentes |
| Oportunidades | 15% | Estratégias não utilizadas |

### Classificação

| Score | Classificação | Ação |
|-------|---------------|------|
| 80-100 | 🟢 ÓTIMO | Manter estrutura |
| 60-79 | 🔵 BOM | Pequenas otimizações |
| 40-59 | 🟡 REGULAR | Revisar regime |
| 20-39 | 🟠 RUIM | Mudança urgente |
| 0-19 | 🔴 CRÍTICO | Reestruturação necessária |

---

## 🔄 Simulações Automáticas

O sistema roda **180+ cenários automaticamente:**

### Dimensões Testadas

1. **Regimes (3):** Simples, Presumido, Real
2. **Estruturas (3):** Empresa única, 2 empresas, Holding
3. **Anexos Simples (5):** I, II, III, IV, V (respeitando tipo de atividade)
4. **Estratégias:** Aumento de pró-labore, mudança de município

### Regras de Negócio nas Simulações

- Serviços com Fator R ≥ 28% → Anexo III
- Serviços com Fator R < 28% → Anexo V
- Comércio → Anexo I ou II
- Indústria → Anexo II
- Locação → Anexo III

---

## 📋 Relatórios Consultivos

PDF profissional pronto para enviar ao cliente.

### Conteúdo do Relatório

1. **Capa**
   - Nome da empresa, CNPJ, data

2. **Score Fiscal Visual**
   - Círculo colorido com pontuação
   - Classificação textual
   - Métricas resumidas

3. **Melhor Cenário Identificado**
   - Nome do cenário
   - Descrição explicativa
   - Economia anual estimada

4. **Top 10 Simulações**
   - Tabela ordenada por economia
   - Imposto anual, alíquota efetiva, economia

5. **Plano de Ação Estratégico**
   - Estratégias detectadas
   - Passos para implementação
   - ROI de cada ação
   - Prazo estimado

6. **Pontos de Atenção**
   - Problemas detectados
   - Riscos identificados

---

## 🏙️ Banco Legislativo

Dados oficiais no banco de dados, não em constantes fixas.

### Tabelas Auxiliares

| Tabela | Dados | Registros |
|--------|-------|-----------|
| `simples_rates` | Faixas do Simples Nacional | 30 (6 faixas × 5 anexos) |
| `cnae_codes` | CNAEs mapeados | 13 |
| `iss_rates` | ISS por município | 12 capitais |

### Municípios com ISS no Banco

| Município | ISS |
|-----------|-----|
| São Paulo | 5% |
| Rio de Janeiro | 5% |
| Belo Horizonte | 3% |
| Curitiba | 5% |
| Porto Alegre | 4% |
| Brasília | 2% |
| Salvador | 5% |
| Fortaleza | 5% |
| Recife | 5% |
| Goiânia | 5% |
| Florianópolis | 2% |

---

## 📱 Interface do Sistema

### Páginas Implementadas

1. **Landing Page** (`/`)
   - Hero section
   - Explicação do produto
   - CTA para cadastro

2. **Autenticação** (`/login`, `/cadastro`)
   - Email/senha (Supabase Auth)
   - Validação de campos
   - Tratamento de erros

3. **Dashboard** (`/dashboard`)
   - Lista de clientes
   - Busca por nome
   - Card com Score Fiscal

4. **Cadastro de Cliente** (`/dashboard/clientes/novo`)
   - Formulário em 4 etapas
   - Seleção de município
   - Validação de campos obrigatórios

5. **Detalhes do Cliente** (`/dashboard/clientes/[id]`)
   - Score Fiscal detalhado
   - Top 10 simulações
   - Estratégias recomendadas
   - Botão para gerar PDF

6. **API de PDF** (`/api/pdf/[id]`)
   - Geração de relatório HTML
   - Abre em nova aba para impressão/salvar
