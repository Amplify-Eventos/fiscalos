# Regras Fiscais & Lógica de Negócio

## 📚 Base Legal

O motor de cálculo do FiscalOS deve seguir a legislação tributária brasileira vigente (2026).
*Nota: Valores e alíquotas devem ser parametrizáveis no banco de dados para fácil atualização.*

---

## 1. Simples Nacional

### Definição
Regime simplificado para Microempresas (ME) e Empresas de Pequeno Porte (EPP) com faturamento até R$ 4,8 milhões/ano.

### Anexos (Tabelas de Alíquotas)
O sistema deve suportar os 5 anexos principais:

- **Anexo I:** Comércio
- **Anexo II:** Indústria
- **Anexo III:** Serviços (Instalação, reparos, agências de viagem, escritórios de contabilidade, etc.)
- **Anexo IV:** Serviços (Limpeza, vigilância, obras, construção civil, etc.) - *Atenção: CPP à parte*
- **Anexo V:** Serviços (Auditoria, jornalismo, tecnologia, publicidade, engenharia, etc.)

### Cálculo do Imposto (RBT12)
A alíquota efetiva não é fixa, depende da Receita Bruta nos últimos 12 meses (RBT12).

**Fórmula:**
```
(RBT12 × Alíquota Nominal) - Parcela a Deduzir
----------------------------------------------  = Alíquota Efetiva
                  RBT12
```

### O Fator R
Crucial para empresas de serviços (intelectuais, saúde, etc.). Define se a empresa paga pelo Anexo III (mais barato) ou Anexo V (mais caro).

**Regra:**
- Se **Folha de Pagamento (últimos 12m)** >= **28%** da **Receita Bruta (últimos 12m)** → **Anexo III** ✅
- Se **Folha de Pagamento (últimos 12m)** < **28%** da **Receita Bruta (últimos 12m)** → **Anexo V** ❌

*O sistema deve calcular isso automaticamente e alertar: "Aumente seu pró-labore em R$ X para economizar R$ Y de imposto".*

---

## 2. Lucro Presumido

### Definição
Regime onde o IR e CSLL são calculados sobre uma margem de lucro pré-definida (presumida) pela lei, não sobre o lucro real.

### Base de Cálculo (Presunção)
- **Comércio/Indústria:** 8% (IRPJ) e 12% (CSLL) sobre faturamento.
- **Serviços:** 32% (IRPJ e CSLL) sobre faturamento.

### Alíquotas Federais (Padrão)
- **PIS:** 0,65%
- **COFINS:** 3,00%
- **IRPJ:** 15% (sobre a base presumida) + 10% de adicional sobre o que exceder R$ 60k/trimestre.
- **CSLL:** 9% (sobre a base presumida).

### Alíquotas Municipais/Estaduais
- **ISS (Serviços):** Varia de 2% a 5% (depende do município). *No MVP, usaremos input ou padrão de 5%.*
- **ICMS (Comércio):** Varia por estado (ex: 18% SP, mas com créditos). *Complexo para MVP, focar em serviços primeiro ou usar alíquota efetiva estimada.*

### Custo de Folha (CPP)
No Lucro Presumido, a empresa paga **20% de INSS Patronal** sobre a folha + RAT + Terceiros (totalizando ~27-28% sobre a folha).
*Diferente do Simples (Anexos I, II, III, V) onde o INSS Patronal já está incluso na guia única (DAS).*

---

## 3. Lucro Real (Não incluso no MVP)

Regime obrigatório para faturamento > R$ 78 milhões ou setor financeiro.
Baseado no lucro contábil real (Receitas - Despesas).
*Complexidade alta devido à necessidade de apurar despesas dedutíveis.*

---

## 🧠 Lógica de Comparação (O "Cérebro" do Sistema)

Para recomendar o melhor regime, o sistema deve:

1. Calcular o imposto total anual estimado no **Simples Nacional** (considerando Fator R).
2. Calcular o imposto total anual estimado no **Lucro Presumido** (PIS+COFINS+IR+CSLL+ISS/ICMS + INSS Patronal sobre folha).
3. Comparar os totais.
4. Exibir a diferença (Economia) e recomendar o menor valor.

**Exemplo de Output:**
> "Sua empresa economizaria **R$ 15.400,00/ano** optando pelo **Simples Nacional (Anexo III)**, desde que mantenha o Fator R acima de 28%."
