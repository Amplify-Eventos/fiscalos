const fs = require('fs');

let roadmap = fs.readFileSync('docs/ROADMAP.md', 'utf8');

// Replace Fase 2
roadmap = roadmap.replace(
  '## \uD83D\uDEA7 Fase 2 - Aprimoramentos (EM DESENVOLVIMENTO)\n\n**Per\u00EDodo:** Mar\u00E7o - Abril 2026\n**Status:** \uD83D\uDEA7 Em desenvolvimento\n\n### Funcionalidades Planejadas\n\n| Feature | Prioridade | Status | Descri\u00E7\u00E3o |\n|---------|------------|--------|-----------|\n| Edi\u00E7\u00E3o de Clientes | \uD83D\uDD34 Alta | \u23F3 | Editar dados cadastrais |\n| Dashboard Comparativo | \uD83D\uDD34 Alta | \u23F3 | Ranking de clientes por economia |\n| Mais CNAEs | \uD83D\uDFE1 M\u00E9dia | \u23F3 | Expandir de 13 para 50+ CNAEs |\n| An\u00E1lise Fator R Detalhada | \uD83D\uDFE1 M\u00E9dia | \u23F3 | ROI de aumentar pr\u00E9-labore |\n| Hist\u00F3rico de Simula\u00E7\u00F5es | \uD83D\uDFE1 M\u00E9dia | \u23F3 | Salvar e comparar simula\u00E7\u00F5es |\n| Exporta\u00E7\u00E3o Excel | \uD83D\uDFE1 Baixa | \u23F3 | Baixar dados em planilha |',
  '## \uD83D\uDEA7 Fase 2 - Aprimoramentos (NOVA SPRINT)\n\n**Per\u00EDodo:** Abril - Maio 2026\n**Status:** \uD83D\uDEA7 Em planejamento\n\n### Funcionalidades Planejadas\n\n| Feature | Prioridade | Status | Descri\u00E7\u00E3o |\n|---------|------------|--------|-----------|\n| Calculadora P\u00FAblica Viral | \uD83D\uDD34 Alta | \u23F3 | M\u00E1quina de Lead Gen no site oficial |\n| Dashboard Comparativo | \uD83D\uDD34 Alta | \u23F3 | Ranking de clientes por economia |\n| Mais CNAEs | \uD83D\uDFE1 M\u00E9dia | \u23F3 | Expandir de 13 para 50+ CNAEs |\n| Hist\u00F3rico de Simula\u00E7\u00F5es | \uD83D\uDFE1 M\u00E9dia | \u23F3 | Salvar e comparar simula\u00E7\u00F5es antigas |\n| Exporta\u00E7\u00E3o Excel | \uD83D\uDFE2 Baixa | \u23F3 | Baixar dados em planilha |'
);

roadmap = roadmap.replace(
  '## \uD83D\uDE80 Pr\u00F3ximos Passos (Sprint Atual)\n\n**Semana atual:**\n\n| Tarefa | Status |\n|--------|--------|\n| Corrigir anexos por tipo de atividade | \u2705 Feito |\n| Adicionar sele\u00E7\u00E3o de munic\u00EDpio | \u2705 Feito |\n| Atualizar documenta\u00E7\u00E3o | \uD83D\uDEA7 Em progresso |\n| Testar com 3 cen\u00E1rios | \u23F3 Pendente |\n| Implementar edi\u00E7\u00E3o de clientes | \u23F3 Pendente |\n\n**Pr\u00F3xima sprint:**\n\n- [ ] Dashboard comparativo\n- [ ] Hist\u00F3rico de simula\u00E7\u00F5es\n- [ ] Expandir CNAEs',
  '## \uD83D\uDE80 Pr\u00F3ximos Passos (Fechamento do MVP SaaS)\n\n**Entregues com Sucesso (Sprint Conclu\u00EDda):**\n\n| Tarefa | Status |\n|--------|--------|\n| Corrigir anexos e ISS Din\u00E2mico | \u2705 Feito |\n| Detalhamento do Score e PDF White-Label (Cor Prim/Sec e Logo) | \u2705 Feito |\n| Proje\u00E7\u00F5es 10/20/30% e Alertas Sublimite | \u2705 Feito |\n| Novos Detetores de Oportunidade (NCM, Cl\u00EDnica, ind\u00FAstria) | \u2705 Feito |\n| Edi\u00E7\u00E3o de Clientes Completa | \u2705 Feito |\n| Carga de Teste com 8 perfis completos de empresa | \u2705 Feito |\n\n**Pr\u00F3xima sprint (Fase 2 - Lead Gen):**\n\n- [ ] Calculadora p\u00FAblica no site para captar leads\n- [ ] Dashboard comparativo entre clientes\n- [ ] Mais CNAEs parametrizados'
);

fs.writeFileSync('docs/ROADMAP.md', roadmap);

let features = fs.readFileSync('docs/FEATURES.md', 'utf8');

features = features.replace(
  '## \uD83D\uDCCA Score Fiscal (0-100)\n\n\u00CDndice de efici\u00EAncia tribut\u00E1ria da empresa.',
  '## \uD83D\uDCCA Score Fiscal (0-100)\n\n\u00CDndice de efici\u00EAncia tribut\u00E1ria da empresa com **detalhamento visual da composi\u00E7\u00E3o** exibindo barras de progresso parciais para cada crit\u00E9rio (Adequa\u00E7\u00E3o do regime, Fator R, Carga tribut\u00E1ria vs Setor, etc).'
);

features = features.replace(
  '4. **Estrat\u00E9gias:** Aumento de pr\u00E9-labore, mudan\u00E7a de munic\u00EDpio',
  '4. **Estrat\u00E9gias Premium:** Aumento de pr\u00E9-labore, separa\u00E7\u00E3o de atividades, mudan\u00E7a de munic\u00EDpio, revis\u00E3o NCM/ICMS, equipara\u00E7\u00E3o hospitalar, planejamento sa\u00EDda do Simples.\n5. **Proje\u00E7\u00F5es Futuras:** Roda as mesmas dimens\u00F5es simulando um crescimento de faturamento de 10%, 20% e 30% para planejar o pr\u00F3ximo ano do cliente.'
);

features = features.replace(
  '## \uD83D\uDCC4 Relat\u00F3rios Consultivos\n\nPDF profissional pronto para enviar ao cliente.',
  '## \uD83D\uDCC4 Relat\u00F3rios Consultivos White-Label\n\nPDF profissional gerado com a Identidade Visual do Contador (Logo, Cor Prim\u00E1ria e Cor Secund\u00E1ria), pronto para envio e apresenta\u00E7\u00E3o comercial.'
);

fs.writeFileSync('docs/FEATURES.md', features);

console.log('Docs updated.');
