# FiscalOS - Regras de Negócio

## 📋 Regras do Simples Nacional

### Elegibilidade

| Condição | Regra |
|----------|-------|
| Faturamento | ≤ R$ 4.800.000 em 12 meses |
| Natureza Jurídica | LTDA, SLU, MEI, EI, EIRELI |
| Natureza Jurídica | S.A. NÃO pode |
| Débitos tributários | Não pode ter débitos inscritos em Dívida Ativa |

### Anexos por Atividade

| Anexo | Atividade | Fator R |
|-------|-----------|---------|
| **I** | Comércio (revenda de mercadorias) | N/A |
| **II** | Indústria (fabricação) | N/A |
| **III** | Serviços com Fator R ≥ 28% | **Obrigatório** |
| **IV** | Serviços específicos (limpeza, construção, advocacia) | N/A |
| **V** | Serviços com Fator R < 28% | **Obrigatório** |

### Fator R

```
Fator R = Folha de Pagamento 12 meses ÷ Receita Bruta 12 meses
```

| Situação | Resultado |
|----------|-----------|
| Fator R ≥ 28% | Pode usar Anexo III (mais barato) |
| Fator R < 28% | Obrigado a usar Anexo V (mais caro) |

### Cálculo do DAS

```
DAS Mensal = (RBT12 × Alíquota - Dedução) ÷ RBT12 × Receita Mensal
```

Onde:
- **RBT12** = Receita Bruta Total dos últimos 12 meses
- **Alíquota** = Alíquota da faixa correspondente
- **Dedução** = Valor a deduzir da faixa

---

## 📋 Regras do Lucro Presumido

### Base de Cálculo por Atividade

| Atividade | IRPJ | CSLL |
|-----------|------|------|
| Serviços em geral | 32% | 32% |
| Comércio | 8% | 12% |
| Locação de bens móveis | 32% | 32% |
| Transporte de carga | 8% | 12% |
| Serviços hospitalares | 8% | 12% |

### Alíquotas

| Tributo | Alíquota |
|---------|----------|
| IRPJ | 15% sobre a base |
| Adicional IRPJ | 10% sobre excedente de R$ 20.000/mês |
| CSLL | 9% sobre a base |
| PIS | 0,65% sobre receita |
| COFINS | 3% sobre receita |
| ISS | 2% a 5% (conforme município) |

### Exemplo de Cálculo

```
Empresa de Serviços - Receita: R$ 100.000/mês

IRPJ:
  Base = R$ 100.000 × 32% = R$ 32.000
  IRPJ = R$ 32.000 × 15% = R$ 4.800

CSLL:
  Base = R$ 100.000 × 32% = R$ 32.000
  CSLL = R$ 32.000 × 9% = R$ 2.880

PIS/COFINS:
  PIS = R$ 100.000 × 0,65% = R$ 650
  COFINS = R$ 100.000 × 3% = R$ 3.000

ISS (São Paulo 5%):
  ISS = R$ 100.000 × 5% = R$ 5.000

Total Mensal = R$ 16.330 (16,33% efetivo)
```

---

## 📋 Regras do Lucro Real

### Conceito
- Tributação sobre o **lucro real** (não presunção)
- Apurado pela contabilidade

### Alíquotas

| Tributo | Alíquota |
|---------|----------|
| IRPJ | 15% sobre lucro |
| Adicional IRPJ | 10% sobre excedente de R$ 20.000/mês |
| CSLL | 9% sobre lucro |
| PIS | 1,65% sobre receita (não-cumulativo) |
| COFINS | 7,6% sobre receita (não-cumulativo) |

### Créditos de PIS/COFINS
- Insumos comprados geram crédito
- Reduz tributo final
- Complexo de calcular (precisa de dados de compras)

---

## 🎯 Regras do Score Fiscal

### Fatores e Pesos

| Fator | Peso | Como Calcula |
|-------|------|--------------|
| Adequação do Regime | 30% | Compara imposto atual vs melhor cenário |
| Fator R | 20% | Se está otimizado (≥28% para serviços) |
| Carga Tributária | 20% | Compara com média do setor |
| Regularidade Fiscal | 15% | Dados completos e coerentes |
| Oportunidades | 15% | Estratégias disponíveis |

### Fórmula por Fator

**1. Adequação do Regime (30%)**
```
Economia Potencial = (Melhor Cenário - Atual) / Receita

Se economia > 15% → Nota 20
Se economia > 10% → Nota 40
Se economia > 5%  → Nota 60
Se economia > 0%  → Nota 80
Se economia = 0%  → Nota 100
```

**2. Fator R (20%)**
```
Se serviços:
  Se Fator R >= 28% → Nota 100
  Se Fator R >= 20% → Nota 60
  Se Fator R < 20%  → Nota 20

Se comércio/indústria:
  Nota 100 (não se aplica)
```

**3. Carga Tributária (20%)**
```
Comparar alíquota efetiva com benchmark do setor

Se abaixo da média → Nota 100
Se na média        → Nota 70
Se acima da média  → Nota 40
```

---

## 📏 Regras de Simulação

### Anexos Permitidos por Tipo

```typescript
SERVIÇOS:
  Se FatorR >= 28% → Anexo III
  Se FatorR < 28%  → Anexo V

COMÉRCIO:
  → Anexo I

INDÚSTRIA:
  → Anexo II

LOCAÇÃO:
  → Anexo III

MISTO:
  → Depende da receita predominante
```

### Estruturas de Empresa

| Estrutura | Condição | Benefício |
|-----------|----------|-----------|
| Empresa Única | Padronão | Sem economia adicional |
| 2 Empresas | Receita > R$ 4,8M | Cada uma no Simples |
| Holding | Sempre viável | ~5% economia (aproximação) |

---

## 🏙️ Regras de ISS

### Variação por Município

| Município | ISS | Observação |
|-----------|-----|------------|
| São Paulo | 5% | Padrão |
| Rio de Janeiro | 5% | Padrão |
| Brasília | 2% | Incentivo TI |
| Florianópolis | 2% | Polo tecnológico |
| Belo Horizonte | 3% | Intermediário |

### Estratégia de Mudança
- Calcula economia de mudar para município com ISS menor
- Considera custo de mudança (aluguel, logística)
- ROI da operação

---

## ⚠️ Alertas e Restrições

### Limite do Simples Nacional
```
Se receita > R$ 4.800.000:
  ❌ Não pode Simples Nacional
  ✅ Sugerir Lucro Presumido ou Real
```

### Fator R Crítico
```
Se serviços e Fator R < 20%:
  ⚠️ Alerta vermelho
  💡 Sugerir aumento de pró-labore
```

### Próximo do Limite
```
Se receita > R$ 4.000.000:
  ⚠️ Alerta amarelo
  💡 Planejar transição de regime
```

---

## 📊 Constantes do Sistema

```typescript
const LIMITES = {
  SIMPLES_NACIONAL: 4_800_000,    // R$ 4,8 milhões
  MEI: 81_000,                     // R$ 81 mil
  FATOR_R_IDEAL: 0.28,             // 28%
  ADICIONAL_IRPJ_LIMITE: 20_000,   // R$ 20k/mês
}

const ALIQUOTAS = {
  IRPJ_BASE: 0.15,                 // 15%
  IRPJ_ADICIONAL: 0.10,            // 10%
  CSLL: 0.09,                      // 9%
  PIS_CUMULATIVO: 0.0065,          // 0,65%
  COFINS_CUMULATIVO: 0.03,         // 3%
  CPP: 0.28,                       // ~28% sobre folha
}

const BASES_CALCULO = {
  IRPJ_SERVICOS: 0.32,             // 32%
  CSLL_SERVICOS: 0.32,             // 32%
  IRPJ_COMERCIO: 0.08,             // 8%
  CSLL_COMERCIO: 0.12,             // 12%
}
```


## ?? AI Guidelines (Preveno de Travamento)

1. **Nunca** rode `npm run dev` ou `npx next dev` de forma sncrona/bloqueante via ferramenta de execuo, pois o processo no termina e causa timeout. Se precisar rodar o servidor, use processos em background (process / yieldMs).
2. **Nunca** faa leitura em massa das pastas `.next`, `node_modules`, ou arquivos de lock gigantes como `package-lock.json`.
3. Ao rodar comandos do Prisma que possam causar perda de dados (como `npx prisma db push`), use a flag `--accept-data-loss` caso tenha certeza absoluta da alterao, ou pea confirmao expressa ao usurio antes de rodar para no travar em prompts iterativos (Y/N).
4. Caso ocorra erro de linting ou type-checking, resolva os problemas de um arquivo por vez, sem encher o contexto de logs extensos.

