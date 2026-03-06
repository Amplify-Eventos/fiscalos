# FiscalOS - Motor de Decisão Fiscal

<div align="center">
  <img src="public/logo.svg" alt="FiscalOS Logo" width="200" />
  
  **Sistema Operacional Fiscal para Contadores Brasileiros**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-ORM-purple)](https://www.prisma.io/)
</div>

---

## 🎯 O Problema

Contadores brasileiros perdem horas toda semana fazendo **cálculos tributários manuais** para sugerir o melhor regime para seus clientes. Não existe uma ferramenta que:

- Calcule todos os regimes tributários simultaneamente
- Compare cenários de forma automática
- Gere relatórios consultivos (não apenas números)
- Use dados legislativos REAIS (CNAEs, alíquotas oficiais)

**Resultado:** Decisões fiscais baseadas em intuição, não em dados.

---

## ✨ A Solução: FiscalOS

O **FiscalOS** é um "Motor de Decisão Fiscal" que cria um **Digital Twin Fiscal** de cada empresa e simula **180+ cenários tributários automaticamente**.

### Funcionalidades Principais

| Funcionalidade | Descrição |
|---------------|-----------|
| 🔮 **Digital Twin Fiscal** | Replica virtual da empresa para simulações |
| 📊 **Score Fiscal (0-100)** | Índice de eficiência tributária da empresa |
| 🔄 **180+ Simulações** | 3 regimes × 4 estruturas × 5 estratégias × 3 níveis de folha |
| 📋 **Relatórios Consultivos** | PDF com análise completa e plano de ação |
| 🏙️ **ISS por Município** | Alíquotas reais de 12 capitais brasileiras |
| 📚 **Banco Legislativo** | 30 faixas do Simples, 13 CNAEs mapeados |

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      FISCALOS STACK                         │
├─────────────────────────────────────────────────────────────┤
│  Frontend                                                    │
│  ├── Next.js 15 (App Router)                               │
│  ├── React 18 + TypeScript                                 │
│  ├── Tailwind CSS + shadcn/ui                              │
│  └── Recharts (gráficos)                                   │
├─────────────────────────────────────────────────────────────┤
│  Backend                                                    │
│  ├── Next.js Server Actions                                │
│  ├── API Routes (/api/*)                                   │
│  └── Supabase Auth (email/password)                        │
├─────────────────────────────────────────────────────────────┤
│  Motor Fiscal                                               │
│  ├── lib/fiscal-engine-v2.ts (cálculos)                    │
│  ├── lib/digital-twin.ts (simulações)                      │
│  └── Prisma ORM (dados legislativos)                       │
├─────────────────────────────────────────────────────────────┤
│  Database (Supabase PostgreSQL)                             │
│  ├── clients (dados das empresas)                          │
│  ├── users (contadores)                                    │
│  ├── simples_rates (30 faixas do Simples)                  │
│  ├── cnae_codes (13 CNAEs mapeados)                        │
│  ├── iss_rates (12 capitais)                               │
│  └── simulations (histórico)                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- Conta no Supabase
- pnpm ou npm

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/fiscalos.git
cd fiscalos

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Rode o banco
npx prisma db push
npx prisma db seed

# Inicie o servidor
npm run dev
```

Acesse: http://localhost:3000

---

## 📊 Motor Fiscal V2

O motor de cálculo tributário 100% fiel à legislação brasileira.

### Cálculos Suportados

#### Simples Nacional (Anexos I-V)
- **6 faixas progressivas** por anexo
- Fórmula: `(Receita × Alíquota) - Dedução`
- Verificação automática do Fator R (28%)
- CPP incluso ou separado (Anexo IV)

#### Lucro Presumido
- **Base de cálculo correta por atividade:**
  - Serviços: 32% para IRPJ e CSLL
  - Comércio: 8% IRPJ, 12% CSLL
- PIS/COFINS cumulativo (0.65% + 3%)
- ISS por município (2% a 5%)

#### Lucro Real
- IRPJ: 15% + 10% adicional (acima de R$ 20k/mês)
- CSLL: 9%
- PIS/COFINS não-cumulativo

### Exemplo de Uso

```typescript
import { calcularSimplesNacionalV2, determinarAnexo } from '@/lib/fiscal-engine-v2'

// Determinar anexo correto
const anexo = await determinarAnexo('6201-5/01', 0.32) // CNAE + Fator R

// Calcular Simples Nacional
const resultado = await calcularSimplesNacionalV2(
  2500000, // Receita 12 meses
  'III',   // Anexo
  700000,  // Folha 12 meses
  '3550308' // IBGE São Paulo
)

console.log(resultado)
// {
//   impostoAnual: 350000,
//   aliquotaEfetiva: 0.14,
//   valorDAS: 29166.67,
//   detalhes: { cpp: 120000, iss: 35000, ... }
// }
```

---

## 🗃️ Schema do Banco de Dados

### Tabelas Principais

```prisma
// Clientes (Empresas)
model Client {
  id              String
  cnpj            String
  companyName     String
  taxRegime       TaxRegime      // SIMPLES_NACIONAL | LUCRO_PRESUMIDO | LUCRO_REAL
  cnaeMain        String
  municipioIBGE   String         // Código IBGE para ISS
  revenueLast12m  Decimal
  payrollLast12m  Decimal        // Para Fator R
  // ... + 30 campos
}

// Faixas do Simples Nacional (30 registros)
model SimplesRate {
  anexo           String         // I, II, III, IV, V
  faixa           Int            // 1 a 6
  limiteInferior  Decimal
  limiteSuperior  Decimal
  aliquota        Decimal        // Ex: 0.1400 = 14%
  deducao         Decimal
  percentualCPP   Decimal
}

// ISS por Município (12 capitais)
model IssRate {
  ibgeCode        String         // Código IBGE
  cityName        String         // "São Paulo"
  stateCode       String         // "SP"
  issRate         Decimal        // 0.02 a 0.05
}
```

---

## 📁 Estrutura do Projeto

```
fiscalos/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Páginas de autenticação
│   │   ├── login/
│   │   └── cadastro/
│   ├── dashboard/           # Área logada
│   │   ├── page.tsx        # Lista de clientes
│   │   └── clientes/
│   │       ├── [id]/       # Detalhes + Simulação
│   │       └── novo/       # Cadastro
│   └── api/                 # API Routes
│       ├── clients/
│       ├── municipios/
│       └── pdf/[id]/
├── lib/                     # Lógica de negócio
│   ├── fiscal-engine-v2.ts  # Motor de cálculo
│   ├── digital-twin.ts      # Simulações
│   ├── prisma.ts           # Client Prisma
│   └── supabase/           # Auth
├── prisma/
│   ├── schema.prisma
│   └── seed.ts             # Dados legislativos
├── docs/                    # Documentação
└── components/              # UI Components
    └── ui/                  # shadcn/ui
```

---

## 🧪 Testando o Sistema

### Cenários de Teste

Criamos 3 perfis de empresas para validar:

| Cliente | Faturamento | Fator R | Regime | Score Esperado | Economia |
|---------|-------------|---------|--------|----------------|----------|
| 🔴 Tech Desperdício | R$ 2,5M | 12% | Simples | ~35 | ~R$ 80k/ano |
| 🟡 Soluções Medianas | R$ 3,2M | 28% | Simples | ~60 | ~R$ 30k/ano |
| 🟢 Otimiza Fiscal | R$ 4,5M | 33% | Presumido | ~85 | ~R$ 5k/ano |

---

## 🗺️ Roadmap

### ✅ MVP (Concluído)
- [x] Autenticação (Supabase)
- [x] CRUD de Clientes
- [x] Motor Fiscal V2 (Simples, Presumido, Real)
- [x] Digital Twin + Simulações
- [x] Score Fiscal (0-100)
- [x] Relatório PDF
- [x] Banco Legislativo (CNAEs, ISS, Simples)
- [x] Seleção de Município

### 🚧 Próximas Features
- [ ] Dashboard Comparativo (ranking de clientes)
- [ ] Edição de clientes existentes
- [ ] Mais CNAEs no seed (expandir cobertura)
- [ ] Análise de Fator R detalhada
- [ ] Exportação Excel
- [ ] Histórico de simulações

### 🎯 Futuro
- [ ] Integração com contabilidade online
- [ ] API para desenvolvedores
- [ ] App mobile
- [ ] IA para recomendações personalizadas

---

## 📚 Documentação

- [PROBLEM.md](docs/PROBLEM.md) - O problema que resolvemos
- [PERSONA.md](docs/PERSONA.md) - Para quem construímos
- [FEATURES.md](docs/FEATURES.md) - Funcionalidades detalhadas
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitetura técnica
- [ROADMAP.md](docs/ROADMAP.md) - Planejamento futuro
- [RULES.md](docs/RULES.md) - Regras de negócio
- [FLOWS.md](docs/FLOWS.md) - Fluxos do sistema
- [MVP.md](docs/MVP.md) - Escopo do MVP

---

## 🛠️ Tecnologias

| Categoria | Tecnologia |
|-----------|-----------|
| Framework | Next.js 15 |
| Linguagem | TypeScript 5 |
| UI | React 18 + Tailwind + shadcn/ui |
| Backend | Server Actions + API Routes |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL |
| ORM | Prisma |
| PDF | HTML → Print |
| Gráficos | Recharts |

---

## 👤 Autor

Desenvolvido por **Pulseobot** com supervisão de **Famoso NorT**.

---

## 📄 Licença

MIT License - Use livremente para seus projetos.
