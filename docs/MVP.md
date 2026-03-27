# FiscalOS - MVP

## 🎯 Definição do MVP

**MVP = Minimum Viable Product**

O MVP do FiscalOS é um sistema funcional que permite ao contador:
1. Cadastrar clientes com dados completos
2. Ver análise fiscal automática (Score + Simulações)
3. Baixar relatório PDF consultivo

---

## ✅ Funcionalidades do MVP

### 1. Autenticação
- [x] Login com email/senha
- [x] Cadastro de novo usuário
- [x] Proteção de rotas
- [x] Logout

### 2. Gestão de Clientes
- [x] Listar clientes
- [x] Criar novo cliente (formulário 4 etapas)
- [x] Ver detalhes do cliente
- [x] Excluir cliente
- [x] Editar cliente

### 3. Motor Fiscal
- [x] Simples Nacional (Anexos I-V)
- [x] Lucro Presumido
- [x] Lucro Real (básico)
- [x] Análise de Fator R
- [x] Cálculo de ISS por município
- [x] Respeita tipo de atividade (Serviços vs Comércio)

### 4. Digital Twin
- [x] Modelagem de empresa
- [x] Simulação de cenários
- [x] Score Fiscal (0-100) com Composição Detalhada
- [x] Detecção de oportunidades (Fator R, Separar Ativ., Mudança Regime, ISS)
- [x] Oportunidades Avançadas (Revisão NCM, Sublimite, Equip. Hospitalar, ICMS Estadual)
- [x] Projeção de Crescimento Futuro (Planejamento Tributário)

### 5. Relatórios
- [x] PDF com análise completa
- [x] Plano de ação
- [x] Top 10 simulações
- [x] Personalização White-Label (Logo, Cor Primária e Secundária)
- [x] Projeções de Crescimento (10%, 20%, 30%)
- [x] Detalhamento Visual da Composição do Score Fiscal

### 6. Banco Legislativo
- [x] 30 faixas do Simples Nacional
- [x] 13 CNAEs mapeados
- [x] 12 capitais com ISS

---

## 📊 Métricas de Sucesso do MVP

| Métrica | Meta |
|---------|------|
| Usuários beta | 50 |
| Clientes cadastrados | 200 |
| Simulações realizadas | 500 |
| PDFs gerados | 100 |
| NPS inicial | > 40 |

---

## 🚫 O que NÃO está no MVP

### Funcionalidades Removidas para MVP

| Funcionalidade | Motivo | Planejado para |
|---------------|--------|----------------|
| Edição de clientes | Baixa prioridade | Fase 2 |
| Dashboard comparativo | Complexo | Fase 2 |
| Histórico de simulações | Precisa modelagem extra | Fase 2 |
| Exportação Excel | Nice-to-have | Fase 3 |
| App mobile | Alto esforço | Fase 4 |
| IA/ML | Precisa de dados | Fase 5 |

---

## 🧪 Testes do MVP

### Cenários de Teste

Criamos 3 perfis de clientes para validar:

#### 🔴 Cliente Ruim (Score ~35)
```
Tech Desperdício LTDA
- Receita: R$ 2.500.000
- Folha: R$ 300.000 (Fator R = 12%)
- Regime: Simples Nacional
- Problema: Fator R muito baixo, pagando Anexo V caro
- Esperado: Score baixo, alta economia potencial
```

#### 🟡 Cliente Médio (Score ~60)
```
Soluções Medianas LTDA
- Receita: R$ 3.200.000
- Folha: R$ 900.000 (Fator R = 28%)
- Regime: Simples Nacional
- Situação: Fator R no limite, regime adequado
- Esperado: Score médio, pouca economia potencial
```

#### 🟢 Cliente Bom (Score ~85)
```
Otimiza Fiscal LTDA
- Receita: R$ 4.500.000
- Folha: R$ 1.500.000 (Fator R = 33%)
- Regime: Lucro Presumido
- Situação: Regime adequado, estrutura otimizada
- Esperado: Score alto, mínima economia potencial
```

### Checklist de Teste

- [ ] Cadastro completo de 3 clientes teste
- [ ] Score calculado corretamente
- [ ] Anexos respeitam tipo de atividade
- [ ] ISS calculado com alíquota do município
- [ ] PDF gerado sem erros
- [ ] Estratégias detectadas fazem sentido

---

## 🛠️ Stack do MVP

| Camada | Tecnologia | Motivo |
|--------|------------|--------|
| Framework | Next.js 15 | Full-stack, rápido |
| UI | React + Tailwind + shadcn | Moderno, acessível |
| Auth | Supabase | Simplifica auth |
| Database | Supabase PostgreSQL | Gratuito, escalável |
| ORM | Prisma | Type-safe, migrations |
| PDF | HTML → Print | Simples, sem dependências |

---

## 📅 Timeline do MVP

### Semana 1-2: Setup ✅
- Next.js + TypeScript
- Supabase + Prisma
- Auth funcionando

### Semana 3-4: CRUD ✅
- Cadastro de clientes
- Dashboard
- Formulário 4 etapas

### Semana 5-6: Motor Fiscal ✅
- Cálculos Simples/Presumido/Real
- Banco legislativo
- Digital Twin

### Semana 7-8: Análise e PDF ✅
- Score Fiscal
- Simulações
- Geração de PDF

### Semana 9: Refinamentos e Valor Adicionado (ATUAL)
- [x] Correção de anexos por tipo
- [x] ISS dinâmico por município
- [x] Configurações White-Label (Logo e Duas Cores)
- [x] Detector de Oportunidades Premium
- [x] Projeção de Crescimento Futuro
- [x] Detalhamento Visual do Score Fiscal
- [x] Seed de Clientes de Teste Abrangentes

---

## 🚀 Próximos Passos Pós-MVP

1. **Coleta de Feedback**
   - Usuários beta testam
   - Formulário de NPS
   - Entrevistas qualitativas

2. **Iterações Rápidas**
   - Corrigir bugs
   - Melhorar UX
   - Adicionar features mais pedidas

3. **Preparação para Escala**
   - Otimizar performance
   - Adicionar cache
   - Monitoramento

---

## 📋 Checklist de Lançamento

### Técnico
- [x] Autenticação funcionando
- [x] CRUD de clientes
- [x] Motor fiscal calculando corretamente
- [x] PDF gerando sem erros
- [ ] Testes automatizados (pendente)
- [ ] CI/CD configurado (pendente)

### Produto
- [x] Landing page
- [x] Onboarding básico
- [ ] FAQ/Help (pendente)
- [ ] Termos de uso (pendente)
- [ ] Política de privacidade (pendente)

### Go-to-Market
- [ ] Nome de domínio (pendente)
- [ ] Conta de email suporte (pendente)
- [ ] Lista de beta testers (pendente)
- [ ] Material de divulgação (pendente)
