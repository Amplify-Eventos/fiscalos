# FiscalOS - Roadmap

## 🗺️ Visão Geral do Produto

O FiscalOS está em desenvolvimento ativo. Este roadmap mostra o que já foi entregue, o que está em desenvolvimento e o que está planejado.

---

## 🏆 Fase 1 - MVP (CONCLUÍDA E ENTREGUE)

**Período:** Janeiro - Março 2026
**Status:** ✅ Entregue e Validado

### Funcionalidades Entregues

| Feature | Status | Descrição |
|---------|--------|-----------|
| Autenticação | ✅ | Login/Cadastro com Supabase Auth |
| CRUD de Clientes | ✅ | Cadastrar, listar, visualizar, editar, excluir |
| Motor Fiscal V2 | ✅ | Simples, Presumido, Real com dados do banco |
| Digital Twin | ✅ | Simulação de 180+ cenários e projeção de crescimento |
| Score Fiscal | ✅ | Índice 0-100 com composição visual das notas parciais |
| Detector Oportunidades | ✅ | Avisos inteligentes (Fator R, Sublimite, NCM, Clínicas, etc.) |
| Relatórios PDF | ✅ | Geração de relatório White-Label (Logo + Cor Primária/Secundária) |
| Banco Legislativo | ✅ | 30 faixas Simples, 13 CNAEs, 12 ISS |

### Arquivos Principais

```
lib/fiscal-engine-v2.ts    → Motor de cálculo
lib/digital-twin.ts        → Simulações
prisma/seed.ts             → Dados legislativos
app/api/pdf/[id]/route.ts  → Geração de PDF
```

---

## 🚧 Fase 2 - Aprimoramentos (EM DESENVOLVIMENTO)

**Período:** Março - Abril 2026
**Status:** 🚧 Em desenvolvimento

### Funcionalidades Planejadas

| Feature | Prioridade | Status | Descrição |
|---------|------------|--------|-----------|
| Edição de Clientes | 🔴 Alta | ⏳ | Editar dados cadastrais |
| Dashboard Comparativo | 🔴 Alta | ⏳ | Ranking de clientes por economia |
| Mais CNAEs | 🟡 Média | ⏳ | Expandir de 13 para 50+ CNAEs |
| Análise Fator R Detalhada | 🟡 Média | ⏳ | ROI de aumentar pró-labore |
| Histórico de Simulações | 🟡 Média | ⏳ | Salvar e comparar simulações |
| Exportação Excel | 🟢 Baixa | ⏳ | Baixar dados em planilha |

---

## 🎯 Fase 3 - Crescimento (PLANEJADO)

**Período:** Maio - Julho 2026
**Status:** 📋 Planejado

### Funcionalidades Planejadas

| Feature | Prioridade | Descrição |
|---------|------------|-----------|
| Planos Pagos | 🔴 Alta | FREE, PRO, AGENCY com limites |
| Múltiplos Usuários | 🔴 Alta | Time de contadores no mesmo escritório |
| API Pública | 🟡 Média | Integração com sistemas de contabilidade |
| Webhooks | 🟡 Média | Notificações para sistemas externos |
| Templates de Relatório | 🟡 Média | Personalizar marca do escritório |
| Alertas Automáticos | 🟢 Baixa | Avisar quando cliente pode economizar |

---

## 🚀 Fase 4 - Escala (FUTURO)

**Período:** Agosto - Dezembro 2026
**Status:** 🔮 Visão futura

### Funcionalidades Planejadas

| Feature | Descrição |
|---------|-----------|
| App Mobile | iOS/Android para contadores em campo |
| IA Tributária | Recomendações personalizadas com ML |
| Integração Contabilidade | Conectar com Domínio Sistemas, ContaAzul |
| Marketplace | Contadores oferecem serviços no FiscalOS |
| Certificado Digital | Validação automática de dados |
| WhatsApp Bot | Consultas rápidas via chat |

---

## 📊 Priorização

### Framework de Decisão

```
Impacto
   ↑
   │  ┌─────────────┐
   │  │ Dashboard   │
   │  │ Comparativo │
   │  └─────────────┘
   │         │
   │  ┌──────┴──────┐
   │  │  Edição de  │
   │  │  Clientes   │
   │  └─────────────┘
   │
   └────────────────────────→ Esforço
         Baixo        Alto
```

### Critérios de Priorização

1. **Valor para o usuário:** Resolve dor real?
2. **Diferenciação:** Nos destaca da concorrência?
3. **Viabilidade técnica:** Conseguimos implementar?
4. **Retorno:** Gera receita ou retém usuários?

---

## 🎯 Metas por Trimestre

### Q1 2026 (Jan-Mar) ✅
- [x] MVP funcional
- [x] 10 usuários beta
- [x] Feedback inicial coletado

### Q2 2026 (Abr-Jun)
- [ ] Edição de clientes
- [ ] Dashboard comparativo
- [ ] 100 usuários ativos
- [ ] Primeiras assinaturas pagas

### Q3 2026 (Jul-Set)
- [ ] API pública
- [ ] Integrações
- [ ] 500 usuários ativos
- [ ] R$ 10k MRR

### Q4 2026 (Out-Dez)
- [ ] App mobile
- [ ] IA tributária
- [ ] 2000 usuários ativos
- [ ] R$ 50k MRR

---

## 🔄 Processo de Desenvolvimento

### Metodologia: Kanban

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   BACKLOG   │─→│  DESENVOLV. │─→│   TESTE     │─→│   PRONTO    │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
     │                 │                │                │
   Ideias          Codificando       Validando       Entregue
```

### Ciclo de Release

1. **Planejamento** (Segunda)
2. **Desenvolvimento** (Segunda-Quinta)
3. **Testes** (Sexta)
4. **Deploy** (Sexta à noite)
5. **Monitoramento** (Sábado)

---

## 📝 Como Contribuir

### Reportar Bugs

1. Abra uma issue no GitHub
2. Descreva o problema
3. Inclua prints/screenshots
4. Informe seu navegador e dispositivo

### Sugerir Features

1. Abra uma discussão no GitHub
2. Explique o problema que resolve
3. Descreva a solução proposta
4. Aguarde feedback da comunidade

---

## 🗓️ Próximos Passos (Sprint Atual)

**Semana atual:**

| Tarefa | Status |
|--------|--------|
| Corrigir anexos por tipo de atividade | ✅ Feito |
| Adicionar seleção de município | ✅ Feito |
| Atualizar documentação | 🚧 Em progresso |
| Testar com 3 cenários | ⏳ Pendente |
| Implementar edição de clientes | ⏳ Pendente |

**Próxima sprint:**

- [ ] Dashboard comparativo
- [ ] Histórico de simulações
- [ ] Expandir CNAEs
