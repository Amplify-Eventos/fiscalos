# FiscalOS - Arquitetura Técnica

## 🏗️ Visão Geral

O FiscalOS é uma aplicação **fullstack monolítica** construída com Next.js 15, usando o padrão **App Router**. A arquitetura foi desenhada para:

- ⚡ **Performance:** Server Components + Streaming
- 🔒 **Segurança:** Supabase Auth + RLS
- 📊 **Precisão:** Dados legislativos em banco (não hardcodados)
- 🚀 **Escalabilidade:** Serverless-ready

---

## 📁 Estrutura de Pastas

```
fiscalos/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Grupo de rotas de autenticação
│   │   ├── login/page.tsx       # Página de login
│   │   └── cadastro/page.tsx    # Página de cadastro
│   │
│   ├── dashboard/                # Área autenticada
│   │   ├── page.tsx             # Lista de clientes
│   │   ├── layout.tsx           # Layout com sidebar
│   │   └── clientes/
│   │       ├── [id]/            # Detalhes + Simulação
│   │       │   ├── page.tsx
│   │       │   └── actions.ts
│   │       └── novo/            # Cadastro de cliente
│   │           ├── page.tsx
│   │           └── actions.ts
│   │
│   ├── api/                      # API Routes
│   │   ├── clients/route.ts     # CRUD de clientes
│   │   ├── municipios/route.ts  # Lista de municípios
│   │   └── pdf/[id]/route.ts    # Geração de PDF
│   │
│   ├── actions/                  # Server Actions
│   │   └── auth.ts              # Autenticação
│   │
│   ├── layout.tsx               # Layout raiz
│   └── page.tsx                 # Landing page
│
├── lib/                          # Lógica de negócio
│   ├── fiscal-engine-v2.ts      # Motor de cálculo tributário
│   ├── digital-twin.ts          # Simulações e análises
│   ├── prisma.ts                # Cliente Prisma
│   └── supabase/
│       ├── server.ts            # Cliente Supabase (server)
│       └── client.ts            # Cliente Supabase (browser)
│
├── prisma/
│   ├── schema.prisma            # Schema do banco
│   └── seed.ts                  # Dados legislativos
│
├── components/
│   └── ui/                       # shadcn/ui components
│
└── docs/                         # Documentação
```

---

## 🔧 Stack Tecnológica

### Frontend

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Next.js | 15.1.0 | Framework fullstack |
| React | 18.3.1 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| shadcn/ui | latest | Componentes |
| Recharts | 2.x | Gráficos |
| Lucide React | latest | Ícones |

### Backend

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Next.js API Routes | 15.1.0 | REST API |
| Server Actions | 15.1.0 | Mutations |
| Prisma | 5.22.0 | ORM |
| Supabase Auth | latest | Autenticação |

### Database

| Tecnologia | Uso |
|-----------|-----|
| Supabase PostgreSQL | Database principal |
| Prisma Migrate | Migrações |
| Row Level Security | Segurança |

---

## 🗄️ Schema do Banco de Dados

### Diagrama ERD

```
┌─────────────┐       ┌─────────────┐
│    users    │───1:N─│   clients   │
└─────────────┘       └─────────────┘
                            │
                            │ 1:N
                            ▼
                      ┌─────────────┐
                      │ simulations │
                      └─────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│cnae_codes   │  │ simples_rates│  │  iss_rates  │
└─────────────┘  └─────────────┘  └─────────────┘
 (Auxiliar)       (Auxiliar)        (Auxiliar)
```

### Tabelas Principais

#### `users` - Contadores
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  planTier  PlanTier @default(FREE)
  clients   Client[]
}
```

#### `clients` - Empresas dos clientes
```prisma
model Client {
  id              String
  userId          String
  
  // Dados Jurídicos
  cnpj            String
  companyName     String
  taxRegime       TaxRegime
  cnaeMain        String
  
  // Localização (NOVO!)
  municipioIBGE   String?  // Código IBGE
  municipio       String?  // Nome
  uf              String?  // Estado
  
  // Financeiro
  revenueLast12m  Decimal
  payrollLast12m  Decimal
  revenueServicos Decimal?
  revenueComercio Decimal?
  
  // Fiscal Atual
  currentDAS      Decimal?
  currentIRPJ     Decimal?
  // ...
  
  simulations     Simulation[]
}
```

#### `simulations` - Histórico de análises
```prisma
model Simulation {
  id          String
  clientId    String
  inputData   Json    // Dados usados na simulação
  resultData  Json    // Resultado completo
  createdAt   DateTime
}
```

### Tabelas Auxiliares (Legislação)

#### `simples_rates` - Faixas do Simples Nacional
```prisma
model SimplesRate {
  anexo           String   // I, II, III, IV, V
  faixa           Int      // 1 a 6
  limiteInferior  Decimal
  limiteSuperior  Decimal
  aliquota        Decimal  // 0.1400 = 14%
  deducao         Decimal
  percentualCPP   Decimal
}
// Total: 30 registros (6 faixas × 5 anexos)
```

#### `iss_rates` - ISS por Município
```prisma
model IssRate {
  ibgeCode  String   @unique
  cityName  String
  stateCode String
  issRate   Decimal  // 0.02 a 0.05
}
// Total: 12 capitais + fallback
```

#### `cnae_codes` - Mapeamento CNAE → Anexo
```prisma
model CnaeCode {
  code         String   @unique
  description  String
  anexoSimples String   // I, II, III, IV, V
}
// Total: 13 CNAEs mapeados
```

---

## 🔐 Autenticação e Autorização

### Fluxo de Autenticação

```
1. Usuário acessa /login
2. Supabase Auth valida email/senha
3. JWT gerado e armazenado em cookie httpOnly
4. Middleware verifica token em cada requisição
5. Server Components acessam user via getUser()
```

### Proteção de Rotas

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
```

### Row Level Security (RLS)

```sql
-- Políticas no Supabase
CREATE POLICY "Users can only see their own clients"
ON clients FOR SELECT
USING (user_id = auth.uid());
```

---

## 📊 Motor Fiscal V2

### Arquitetura do Motor

```
┌─────────────────────────────────────────────────────────────┐
│                    MOTOR FISCAL V2                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Entrada                                                    │
│  ├── receitaBruta12m: number                               │
│  ├── folhaPagamento12m: number                             │
│  ├── cnae: string                                          │
│  ├── municipioIBGE: string                                 │
│  └── tipoAtividade: SERVICOS | COMERCIO | ...              │
│                                                             │
│  Processamento                                              │
│  ├── buscarFaixasSimples(anexo) → Prisma                   │
│  ├── buscarIssRate(ibgeCode) → Prisma                      │
│  ├── determinarAnexo(cnae, fatorR) → Lógica                │
│  └── calcular...() → Fórmulas                              │
│                                                             │
│  Saída                                                      │
│  ├── impostoAnual: number                                  │
│  ├── aliquotaEfetiva: number                               │
│  ├── detalhes: { das, irpj, csll, pis, cofins, iss, cpp } │
│  └── comparativo: { economia, percentual }                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Funções Principais

```typescript
// lib/fiscal-engine-v2.ts

// Calcula Simples Nacional com 6 faixas progressivas
export async function calcularSimplesNacionalV2(
  receita: number,
  anexo: 'I' | 'II' | 'III' | 'IV' | 'V',
  folha: number,
  municipioIBGE: string
): Promise<ResultadoSimples>

// Calcula Lucro Presumido com bases corretas
export async function calcularLucroPresumidoV2(
  dados: DadosEmpresa
): Promise<ResultadoPresumido>

// Determina anexo correto pelo CNAE + Fator R
export async function determinarAnexo(
  cnae: string,
  fatorR: number
): Promise<'I' | 'II' | 'III' | 'IV' | 'V'>

// Analisa se vale a pena aumentar pró-labore
export async function analisarFatorR(
  receita: number,
  folhaAtual: number,
  anexo: string
): Promise<AnaliseFatorR>
```

---

## 🔮 Digital Twin

### Arquitetura

```typescript
// lib/digital-twin.ts

export class DigitalTwin {
  private empresa: EmpresaModel

  constructor(dados: DadosEmpresa) {
    this.empresa = this.validarENormalizar(dados)
  }

  // Métodos de análise
  async gerarDiagnostico(): Promise<DiagnosticoFiscal>
  async calcularScoreFiscal(): Promise<ScoreFiscal>
  async rodarTodasSimulacoes(): Promise<CenarioSimulacao[]>
  async encontrarMelhorCenario(): Promise<CenarioSimulacao>
  async detectingOportunidades(): Promise<EstrategiaRecomendada[]>
  calcularFatorR(): number
}
```

### Fluxo de Simulação

```
1. Criar Digital Twin com dados do cliente
   ↓
2. Calcular Fator R (folha / faturamento)
   ↓
3. Determinar anexos permitidos por tipo de atividade
   ↓
4. Simular todos os cenários:
   - 3 regimes (Simples, Presumido, Real)
   - 3 estruturas (Única, 2 Empresas, Holding)
   - 2-5 anexos (conforme atividade)
   ↓
5. Ordenar por economia
   ↓
6. Gerar diagnóstico + estratégias
```

---

## 📄 Geração de PDF

### Estratégia

Não usamos bibliotecas pesadas como PDFKit ou Puppeteer. O PDF é gerado via **HTML → Print** do navegador.

```typescript
// app/api/pdf/[id]/route.ts

export async function GET(request, { params }) {
  // 1. Buscar cliente
  const client = await prisma.client.findUnique(...)
  
  // 2. Criar Digital Twin
  const twin = criarDigitalTwin(client)
  
  // 3. Rodar análises ASSÍNCRONAS
  const diagnostico = await twin.gerarDiagnostico()
  const cenarios = await twin.rodarTodasSimulacoes()
  
  // 4. Gerar HTML estilizado
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>/* CSS para impressão */</style>
      </head>
      <body>
        <!-- Conteúdo do relatório -->
        <script>window.onload = () => window.print()</script>
      </body>
    </html>
  `
  
  // 5. Retornar HTML (browser abre diálogo de impressão)
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  })
}
```

### Vantagens

- ✅ Sem dependências pesadas
- ✅ Estilização completa com CSS
- ✅ Suporta imagens e gráficos
- ✅ Responsivo para diferentes tamanhos de papel

---

## 🚀 Deploy

### Plataforma Recomendada: Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variáveis de ambiente no dashboard
```

### Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Database (Prisma)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# App
NEXT_PUBLIC_APP_URL=https://fiscalos.com.br
```

---

## 📈 Performance

### Otimizações Implementadas

1. **Server Components:** Páginas renderizadas no servidor
2. **Streaming:** Dados carregados progressivamente
3. **Índices no banco:**
   - `clients(userId)` - Busca por usuário
   - `simples_rates(anexo, faixa)` - Busca de alíquotas
   - `iss_rates(ibgeCode)` - Busca de ISS

### Métricas Alvo

| Métrica | Meta |
|---------|------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Simulação completa | < 2s |
| Geração de PDF | < 3s |

---

## 🔒 Segurança

### Medidas Implementadas

1. **Autenticação:** Supabase Auth com JWT
2. **Autorização:** Middleware + RLS
3. **Validação:** Zod nos inputs
4. **Sanitização:** React escapa HTML automaticamente
5. **HTTPS:** Obrigatório em produção
6. **Secrets:** Variáveis de ambiente, nunca no código

### Dados Sensíveis

- ❌ Não armazenamos senhas (Supabase gerencia)
- ❌ Não armazenamos dados bancários
- ✅ CNPJ é público (Receita Federal)
- ✅ Faturamento é necessário para cálculos

---

## 🧪 Testes

### Estratégia de Testes

```
┌─────────────────────────────────────────────┐
│              TESTES UNITÁRIOS                │
│  - Motor Fiscal (cálculos)                  │
│  - Digital Twin (lógica)                    │
│  - Utilitários                              │
└─────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│           TESTES DE INTEGRAÇÃO              │
│  - API Routes                               │
│  - Server Actions                           │
│  - Database operations                      │
└─────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│              TESTES E2E                      │
│  - Fluxo de cadastro                        │
│  - Fluxo de simulação                       │
│  - Geração de PDF                           │
└─────────────────────────────────────────────┘
```

### Cobertura Atual

- ✅ Motor Fiscal: Testado manualmente com 3 cenários
- ⏳ Testes automatizados: A implementar
