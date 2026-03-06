# FiscalOS - Fluxos do Sistema

## 📋 Fluxos Principais

---

### 1. Fluxo de Cadastro de Cliente

```
┌─────────────────────────────────────────────────────────────────┐
│                    CADASTRO DE CLIENTE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Acesso                                                      │
│     └── Dashboard → "Novo Cliente"                              │
│                                                                 │
│  2. Passo 1: Dados Jurídicos                                    │
│     ├── CNPJ *                                                  │
│     ├── Razão Social *                                          │
│     ├── Natureza Jurídica (LTDA, MEI, etc.)                     │
│     ├── Porte (ME, EPP, Demais)                                 │
│     ├── Regime Tributário Atual                                 │
│     ├── CNAE Principal *                                        │
│     ├── Tipo de Receita (Serviços, Comércio, etc.)              │
│     └── Município (seleciona com ISS)                           │
│                                                                 │
│  3. Passo 2: Dados Financeiros                                  │
│     ├── Receita Serviços (12m)                                  │
│     ├── Receita Comércio (12m)                                  │
│     ├── Receita Locação (12m)                                   │
│     ├── Receita Outros (12m)                                    │
│     └── Cálculo automático: Receita Total                       │
│                                                                 │
│  4. Passo 3: Custos e Folha                                     │
│     ├── Folha de Pagamento 12m *                                │
│     ├── Número de Funcionários                                  │
│     ├── Pró-labore                                              │
│     └── Outros custos                                           │
│                                                                 │
│  5. Passo 4: Impostos Atuais                                    │
│     ├── DAS (se Simples)                                        │
│     ├── IRPJ/CSLL (se Lucro)                                    │
│     ├── ISS                                                     │
│     └── INSS                                                    │
│                                                                 │
│  6. Processamento                                                │
│     ├── Validação de dados                                      │
│     ├── Busca do município no banco                             │
│     ├── Cálculo do Fator R                                      │
│     └── Salvar no banco                                         │
│                                                                 │
│  7. Redirecionamento                                            │
│     └── Dashboard → Detalhes do Cliente                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2. Fluxo de Simulação Fiscal

```
┌─────────────────────────────────────────────────────────────────┐
│                    SIMULAÇÃO FISCAL                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Acesso à página do cliente                                  │
│     └── Dashboard → Clica no cliente                            │
│                                                                 │
│  2. Carregamento dos dados                                      │
│     ├── Buscar cliente do banco                                 │
│     ├── Buscar alíquota ISS pelo município                      │
│     └── Buscar faixas do Simples                                │
│                                                                 │
│  3. Criação do Digital Twin                                     │
│     └── new DigitalTwin(dadosCliente)                           │
│                                                                 │
│  4. Cálculo do Fator R                                          │
│     └── fatorR = folha / faturamento                            │
│                                                                 │
│  5. Determinação dos Anexos Permitidos                          │
│     ├── Serviços + FatorR ≥ 28% → Anexo III                     │
│     ├── Serviços + FatorR < 28% → Anexo V                       │
│     ├── Comércio → Anexo I                                      │
│     └── Indústria → Anexo II                                    │
│                                                                 │
│  6. Execução das Simulações (Paralelo)                          │
│     ├── Simples Nacional (anexos permitidos)                    │
│     │   ├── Empresa Única                                       │
│     │   ├── 2 Empresas (cisão)                                  │
│     │   └── Holding                                             │
│     ├── Lucro Presumido                                         │
│     │   ├── Empresa Única                                       │
│     │   └── Holding                                             │
│     └── Lucro Real                                              │
│         └── Empresa Única                                       │
│                                                                 │
│  7. Cálculo do Score Fiscal                                     │
│     ├── Adequação do Regime (30%)                               │
│     ├── Fator R (20%)                                           │
│     ├── Carga Tributária (20%)                                  │
│     ├── Oportunidades (15%)                                     │
│     └── Regularidade (15%)                                      │
│                                                                 │
│  8. Geração do Diagnóstico                                      │
│     ├── Score + Classificação                                   │
│     ├── Risco Fiscal                                            │
│     ├── Potencial de Economia                                   │
│     └── Problemas Detectados                                    │
│                                                                 │
│  9. Detecção de Estratégias                                     │
│     ├── Mudança de município (ISS)                              │
│     ├── Ajuste de pró-labore (Fator R)                          │
│     ├── Mudança de regime                                       │
│     └── Estrutura societária                                    │
│                                                                 │
│  10. Exibição dos Resultados                                    │
│      ├── Card: Score Fiscal                                     │
│      ├── Card: Melhor Cenário                                   │
│      ├── Tabela: Top 10 Simulações                              │
│      ├── Lista: Estratégias                                     │
│      └── Botão: Gerar PDF                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3. Fluxo de Geração de PDF

```
┌─────────────────────────────────────────────────────────────────┐
│                    GERAÇÃO DE PDF                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Trigger                                                     │
│     └── Clica em "Baixar Relatório PDF"                         │
│                                                                 │
│  2. Requisição                                                  │
│     └── GET /api/pdf/[clienteId]                                │
│                                                                 │
│  3. Validação                                                   │
│     ├── Verifica autenticação                                   │
│     └── Verifica propriedade do cliente                         │
│                                                                 │
│  4. Coleta de Dados                                             │
│     ├── Busca cliente do banco                                  │
│     ├── Cria Digital Twin                                       │
│     ├── Roda todas as simulações                                │
│     ├── Calcula Score Fiscal                                    │
│     └── Detecta estratégias                                     │
│                                                                 │
│  5. Montagem do HTML                                            │
│     ├── Header com dados da empresa                             │
│     ├── Seção: Score Fiscal com círculo colorido                │
│     ├── Seção: Melhor Cenário em destaque                       │
│     ├── Tabela: Top 10 Simulações                               │
│     ├── Seção: Plano de Ação Estratégico                        │
│     ├── Seção: Alertas e Riscos                                 │
│     └── Footer                                                  │
│                                                                 │
│  6. Retorno                                                     │
│     └── HTML com script window.print()                          │
│                                                                 │
│  7. Browser                                                     │
│     ├── Abre diálogo de impressão                               │
│     └── Usuário salva como PDF                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4. Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTENTICAÇÃO                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CADASTRO                                                       │
│  ─────────                                                      │
│  1. Acesso → /cadastro                                          │
│  2. Preenche: Nome, Email, Senha                                │
│  3. Submit → Server Action                                      │
│  4. Supabase Auth:                                              │
│     ├── Valida email único                                      │
│     ├── Hash da senha                                           │
│     └── Cria usuário                                            │
│  5. Cria registro em users (Prisma)                             │
│  6. Redireciona → /dashboard                                    │
│                                                                 │
│  LOGIN                                                          │
│  ─────                                                          │
│  1. Acesso → /login                                             │
│  2. Preenche: Email, Senha                                      │
│  3. Submit → Server Action                                      │
│  4. Supabase Auth:                                              │
│     ├── Valida credenciais                                      │
│     └── Gera JWT                                                │
│  5. Cookie httpOnly definido                                    │
│  6. Redireciona → /dashboard                                    │
│                                                                 │
│  LOGOUT                                                         │
│  ───────                                                        │
│  1. Clica em "Sair"                                             │
│  2. Server Action: supabase.auth.signOut()                      │
│  3. Cookie removido                                             │
│  4. Redireciona → /login                                        │
│                                                                 │
│  PROTEÇÃO DE ROTAS                                              │
│  ───────────────────                                            │
│  1. Middleware intercepta requisições                           │
│  2. Verifica token JWT                                          │
│  3. Se válido → permite acesso                                  │
│  4. Se inválido → redireciona /login                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5. Fluxo de Decisão de Anexo (Motor V2)

```
┌─────────────────────────────────────────────────────────────────┐
│           DECISÃO DE ANEXO DO SIMPLES                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Entrada: CNAE + Fator R + Tipo de Atividade                    │
│                                                                 │
│  1. Buscar CNAE no banco                                        │
│     ├── Se encontrado → usar anexo mapeado                      │
│     └── Se não encontrado → usar regra por tipo                 │
│                                                                 │
│  2. Regra por Tipo de Atividade                                 │
│     ├── COMERCIO → Anexo I                                      │
│     ├── INDUSTRIA → Anexo II                                    │
│     ├── LOCACAO → Anexo III                                     │
│     └── SERVICOS → Verificar Fator R                            │
│                                                                 │
│  3. Se SERVIÇOS                                                 │
│     ├── Fator R >= 28% → Anexo III (mais barato)                │
│     └── Fator R < 28% → Anexo V (obrigatório)                   │
│                                                                 │
│  4. Retornar anexo correto                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 6. Fluxo de Cálculo do Simples Nacional

```
┌─────────────────────────────────────────────────────────────────┐
│         CÁLCULO SIMPLES NACIONAL (V2)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Entrada: Receita 12m, Anexo, Folha, Município IBGE             │
│                                                                 │
│  1. Buscar faixas do anexo no banco                             │
│     └── SELECT * FROM simples_rates WHERE anexo = ?             │
│                                                                 │
│  2. Encontrar faixa correspondente                              │
│     └── WHERE limiteInferior <= receita <= limiteSuperior       │
│                                                                 │
│  3. Calcular imposto (Fórmula Oficial)                          │
│     ├── Valor = (Receita12m × Alíquota) - Dedução               │
│     ├── Alíquota Efetiva = Valor / Receita12m                   │
│     └── DAS Mensal = Valor / 12                                 │
│                                                                 │
│  4. Separar componentes (se necessário)                         │
│     ├── CPP = Valor × PercentualCPP                             │
│     ├── ISS = ReceitaServiços × ISS Municipal                   │
│     └── ICMS = ReceitaComércio × ICMS (se anexo I/II)           │
│                                                                 │
│  5. Retornar resultado completo                                 │
│     ├── impostoAnual                                            │
│     ├── aliquotaEfetiva                                         │
│     ├── valorDAS                                                │
│     └── detalhes: { cpp, iss, icms, ... }                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxos de Erro

### Erro no Cálculo

```
Erro ao calcular →
  ├── Log do erro no console
  ├── Marcar cenário como não-viável
  ├── Adicionar restrição explicando
  └── Continuar com outros cenários
```

### Erro no Banco de Dados

```
Erro de conexão →
  ├── Verificar URL do banco
  ├── Verificar se Prisma Client foi gerado
  ├── Tentar reconexão
  └── Se persistir, mostrar erro amigável
```

---

## 📱 Responsividade

### Breakpoints

| Dispositivo | Largura | Layout |
|-------------|---------|--------|
| Mobile | < 640px | Cards empilhados, sidebar oculta |
| Tablet | 640-1024px | Grid 2 colunas, sidebar colapsada |
| Desktop | > 1024px | Grid 3-4 colunas, sidebar aberta |

---

## ⚡ Performance

### Otimizações

1. **Server Components:** Páginas renderizadas no servidor
2. **Paralelismo:** Simulações rodando em Promise.all()
3. **Caching:** Dados legislativos não mudam frequentemente
4. **Lazy Loading:** Gráficos carregados sob demanda
