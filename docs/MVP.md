# MVP (Mínimo Produto Viável)

## 🎯 Objetivo do MVP

Validar a proposta de valor principal: **"Gerar um planejamento fiscal comparativo profissional em menos de 5 minutos."**

Não precisamos de todas as features. Precisamos que o **cálculo esteja certo** e o **relatório seja útil**.

---

## 📦 Escopo Fechado

### 1. Funcionalidades Incluídas

#### A. Autenticação Simples
- Login/Cadastro com Email e Senha (via Supabase)
- Recuperação de senha
- Perfil básico do usuário (Nome, Nome do Escritório)

#### B. Gestão de Clientes (CRUD Básico)
- Adicionar empresa (Nome, Faturamento Médio Mensal, Folha Salarial Mensal, Atividade Principal)
- Listar empresas cadastradas
- Editar/Excluir empresa

#### C. Motor de Cálculo (Versão 1.0)
- **Comparativo Fixo:** Simples Nacional (Anexos I, II, III, IV, V) vs. Lucro Presumido
- **Fator R:** Cálculo automático para decidir entre Anexo III e V
- **Regras Fiscais:** Tabelas vigentes de 2026 (ou última atualizada)
- **Input:** Faturamento acumulado 12 meses + Folha salarial

#### D. Saída (Output)
- Tela de resultado com:
  - Melhor regime destacado
  - Tabela comparativa de impostos
  - Gráfico de pizza (Imposto vs. Faturamento)
- **Botão "Gerar PDF":**
  - Download de PDF limpo com logo genérico e dados da análise

### 2. Funcionalidades EXCLUÍDAS do MVP (Ficam para V2)
- ❌ Cálculo de Lucro Real (muito complexo para V1)
- ❌ Importação automática de XML/Excel
- ❌ Integração com APIs da Receita
- ❌ Pagamento online (acesso liberado ou manual no início)
- ❌ Múltiplos usuários por conta
- ❌ Whitelabel (logo personalizado)

---

## 🗓️ Cronograma de Desenvolvimento (Sprint de 2 Semanas)

### Semana 1: Core & Dados
- **Dia 1:** Configuração do projeto (Next.js + Supabase) e Autenticação.
- **Dia 2:** Modelagem do banco de dados e CRUD de Clientes.
- **Dia 3:** Implementação das tabelas fiscais (Simples Nacional) no código.
- **Dia 4:** Implementação da lógica de cálculo (Motor Fiscal V1).
- **Dia 5:** Testes de cálculo com cenários reais (validar com contador).

### Semana 2: Interface & Relatório
- **Dia 6:** Interface de Input (Formulários amigáveis).
- **Dia 7:** Dashboard e visualização de resultados (Gráficos).
- **Dia 8:** Geração de PDF (Layout e dados dinâmicos).
- **Dia 9:** Polimento visual (UI/UX) e correções.
- **Dia 10:** Deploy na Vercel e testes finais.

---

## 🧪 Critérios de Sucesso

O MVP será considerado um sucesso se:
1. O usuário conseguir se cadastrar.
2. O usuário cadastrar uma empresa de serviço (Anexo III/V).
3. O sistema recomendar corretamente o regime tributário (validado por contador).
4. O usuário conseguir baixar um PDF com essa recomendação.
5. Todo o processo levar menos de 5 minutos.
