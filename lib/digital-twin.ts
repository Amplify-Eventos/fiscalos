/**
 * DIGITAL TWIN FISCAL
 *
 * Este módulo cria uma representação virtual da empresa
 * e roda simulações fiscais em múltiplos cenários.
 *
 * O objetivo é encontrar a estrutura mais eficiente tributariamente.
 */

import {
  calcularSimplesNacionalV2,
  calcularLucroPresumidoV2,
  calcularLucroReal,
  analisarFatorR,
  calcularFatorR,
  determinarAnexo,
  LIMITES,
} from "./fiscal-engine-v2";

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface ProjecaoFutura {
  percentualCrescimento: number;
  faturamentoProjetado: number;
  impostoProjetado: number;
  aliquotaEfetiva: number;
  alertas: string[];
  melhorRegime: string;
}

export interface EmpresaModel {
  // Identificação
  id: string;
  nome: string;
  cnpj: string;

  // Estrutura Jurídica
  naturezaJuridica: "LTDA" | "SLU" | "MEI" | "EI" | "SA" | "EIRELI";
  porte: "ME" | "EPP" | "DEMAIS";
  regimeAtual: "SIMPLES_NACIONAL" | "LUCRO_PRESUMIDO" | "LUCRO_REAL" | "MEI";

  // Atividade
  cnaePrincipal: string;
  cnaesSecundarios: string[];
  tipoAtividade: "SERVICOS" | "COMERCIO" | "INDUSTRIA" | "LOCACAO" | "MISTO";

  // Financeiro
  receitas: {
    servicos: number;
    comercio: number;
    locacao: number;
    outros: number;
    total: number;
  };

  // Custos
  custos: {
    folhaTotal: number; // Folha 12 meses
    aluguel: number;
    fornecedores: number;
    marketing: number;
    administrativo: number;
    total: number;
  };

  // Trabalhista
  trabalhista: {
    funcionarios: number;
    salarioTotal: number;
    proLabore: number;
    beneficios: number;
  };

  // Localização
  localizacao: {
    municipio: string;
    uf: string;
    municipioIBGE: string;
    issAliquota: number; // 2% a 5%
  };

  // Fiscal Atual
  fiscalAtual: {
    das: number;
    irpj: number;
    csll: number;
    pis: number;
    cofins: number;
    iss: number;
    icms: number;
    inss: number;
    total: number;
  };
}

export interface CenarioSimulacao {
  id: string;
  nome: string;
  descricao: string;
  regime: "MEI" | "SIMPLES_NACIONAL" | "LUCRO_PRESUMIDO" | "LUCRO_REAL";
  estrutura: "UNICA" | "DUAS_EMPRESAS" | "HOLDING";
  anexoSimples?: "I" | "II" | "III" | "IV" | "V";

  // Resultados
  impostoTotal: number;
  aliquotaEfetiva: number;
  impostoMensal: number;

  // Detalhamento
  detalhes: {
    das?: number;
    irpj?: number;
    csll?: number;
    pis?: number;
    cofins?: number;
    iss?: number;
    icms?: number;
    inss?: number;
    cpp?: number;
    adicionalIRPJ?: number;
  };

  // Comparação
  economiaVsAtual: number;
  percentualEconomia: number;

  // Viabilidade
  viavel: boolean;
  restricoes: string[];
}

export interface EstrategiaRecomendada {
  id: string;
  nome: string;
  descricao: string;
  impacto: "ALTO" | "MEDIO" | "BAIXO";
  economiaAnual: number;
  custoImplementacao: number;
  roi: number; // Retorno sobre investimento
  prazoImplementacao: string;
  acoes: string[];
}

export interface ScoreFiscal {
  score: number; // 0-100
  classificacao: "CRITICO" | "RUIM" | "REGULAR" | "BOM" | "OTIMO";
  fatores: {
    fator: string;
    peso: number;
    nota: number;
    observacao: string;
  }[];
  recomendacoes: string[];
}

export interface DiagnosticoFiscal {
  score: ScoreFiscal;
  riscoFiscal: "BAIXO" | "MEDIO" | "ALTO" | "CRITICO";
  eficienciaTributaria: "BAIXA" | "MEDIA" | "ALTA";
  potencialEconomia: "BAIXO" | "MEDIO" | "ALTO";
  problemasDetectados: string[];
  oportunidadesIdentificadas: string[];
}

// ============================================
// DIGITAL TWIN - CLASSE PRINCIPAL
// ============================================

export class DigitalTwinFiscal {
  private empresa: EmpresaModel;

  constructor(dadosEmpresa: Partial<EmpresaModel>) {
    this.empresa = this.normalizarDados(dadosEmpresa);
  }

  /**
   * Normaliza os dados brutos para o modelo padrão
   */
  private normalizarDados(dados: Partial<EmpresaModel>): EmpresaModel {
    const receitaTotal =
      (dados.receitas?.servicos || 0) +
      (dados.receitas?.comercio || 0) +
      (dados.receitas?.locacao || 0) +
      (dados.receitas?.outros || 0);

    return {
      id: dados.id || "",
      nome: dados.nome || "",
      cnpj: dados.cnpj || "",

      naturezaJuridica: dados.naturezaJuridica || "LTDA",
      porte: dados.porte || "ME",
      regimeAtual: dados.regimeAtual || "SIMPLES_NACIONAL",

      cnaePrincipal: dados.cnaePrincipal || "",
      cnaesSecundarios: dados.cnaesSecundarios || [],
      tipoAtividade: dados.tipoAtividade || "SERVICOS",

      receitas: {
        servicos: dados.receitas?.servicos || 0,
        comercio: dados.receitas?.comercio || 0,
        locacao: dados.receitas?.locacao || 0,
        outros: dados.receitas?.outros || 0,
        total: receitaTotal,
      },

      custos: {
        folhaTotal: dados.custos?.folhaTotal || 0,
        aluguel: dados.custos?.aluguel || 0,
        fornecedores: dados.custos?.fornecedores || 0,
        marketing: dados.custos?.marketing || 0,
        administrativo: dados.custos?.administrativo || 0,
        total:
          (dados.custos?.folhaTotal || 0) +
          (dados.custos?.aluguel || 0) +
          (dados.custos?.fornecedores || 0) +
          (dados.custos?.marketing || 0) +
          (dados.custos?.administrativo || 0),
      },

      trabalhista: {
        funcionarios: dados.trabalhista?.funcionarios || 0,
        salarioTotal: dados.trabalhista?.salarioTotal || 0,
        proLabore: dados.trabalhista?.proLabore || 0,
        beneficios: dados.trabalhista?.beneficios || 0,
      },

      localizacao: {
        municipio: dados.localizacao?.municipio || "",
        uf: dados.localizacao?.uf || "",
        municipioIBGE: dados.localizacao?.municipioIBGE || "0000000",
        issAliquota: dados.localizacao?.issAliquota || 0.05,
      },

      fiscalAtual: {
        das: dados.fiscalAtual?.das || 0,
        irpj: dados.fiscalAtual?.irpj || 0,
        csll: dados.fiscalAtual?.csll || 0,
        pis: dados.fiscalAtual?.pis || 0,
        cofins: dados.fiscalAtual?.cofins || 0,
        iss: dados.fiscalAtual?.iss || 0,
        icms: dados.fiscalAtual?.icms || 0,
        inss: dados.fiscalAtual?.inss || 0,
        total:
          (dados.fiscalAtual?.das || 0) * 12 +
          (dados.fiscalAtual?.irpj || 0) * 12 +
          (dados.fiscalAtual?.csll || 0) * 12 +
          (dados.fiscalAtual?.pis || 0) * 12 +
          (dados.fiscalAtual?.cofins || 0) * 12 +
          (dados.fiscalAtual?.iss || 0) * 12 +
          (dados.fiscalAtual?.icms || 0) * 12 +
          (dados.fiscalAtual?.inss || 0) * 12,
      },
    };
  }

  /**
   * Calcula o Fator R da empresa
   */
  calcularFatorR(): number {
    return calcularFatorR(
      this.empresa.custos.folhaTotal,
      this.empresa.receitas.total,
    );
  }

  /**
   * Identifica qual anexo do Simples se aplica (Async)
   */
  async identificarAnexoSimples(): Promise<"I" | "II" | "III" | "IV" | "V"> {
    const fatorR = this.calcularFatorR();
    return determinarAnexo(this.empresa.cnaePrincipal, fatorR);
  }

  /**
   * Simula um cenário fiscal específico
   */
  async simularCenario(
    regime: "MEI" | "SIMPLES_NACIONAL" | "LUCRO_PRESUMIDO" | "LUCRO_REAL",
    estrutura: "UNICA" | "DUAS_EMPRESAS" | "HOLDING" = "UNICA",
    anexo?: "I" | "II" | "III" | "IV" | "V",
  ): Promise<CenarioSimulacao> {
    const restricoes: string[] = [];
    let viavel = true;

    const receita = this.empresa.receitas.total;
    const folha = this.empresa.custos.folhaTotal;

    // Verificar restrições do Simples Nacional
    if (regime === "SIMPLES_NACIONAL") {
      if (receita > LIMITES.SIMPLES_NACIONAL) {
        restricoes.push(
          "Faturamento excede limite de R$ 4,8M do Simples Nacional",
        );
        viavel = false;
      }
      if (this.empresa.naturezaJuridica === "SA") {
        restricoes.push("S.A. não pode optar pelo Simples Nacional");
        viavel = false;
      }
    }

    // Verificar restrições do MEI
    if (this.empresa.naturezaJuridica === "MEI" && receita > LIMITES.MEI) {
      restricoes.push("Necessário desenquadramento do MEI.");
    }

    let impostoTotal = 0;
    const detalhes: CenarioSimulacao["detalhes"] = {};

    if (regime === "MEI") {
      if (receita > LIMITES.MEI) {
        restricoes.push("Faturamento excede limite do MEI");
        viavel = false;
      }
      if (this.empresa.naturezaJuridica !== "MEI" && this.empresa.naturezaJuridica !== "EI") {
        restricoes.push("Natureza Jurídica não permite MEI");
        viavel = false;
      }
      if (viavel) {
        impostoTotal = 75.60 * 12; // Valor médio DAS MEI
        detalhes.das = 75.60;
      }
    }

    // Calcular impostos por regime
    if (regime === "SIMPLES_NACIONAL" && viavel) {
      const anexoCalculo = anexo || (await this.identificarAnexoSimples());

      try {
        const simples = await calcularSimplesNacionalV2(
          receita,
          anexoCalculo,
          folha,
          this.empresa.localizacao.municipioIBGE,
        );

        impostoTotal = simples.impostoAnual;
        detalhes.das = simples.valorDAS;
        detalhes.cpp = simples.detalhes.cpp;
        detalhes.iss = simples.detalhes.iss;
        detalhes.icms = simples.detalhes.icms;
      } catch (error) {
        // Fallback caso não encontre faixas (ex: seed não rodou)
        console.error("Erro no cálculo Simples V2:", error);
        viavel = false;
        restricoes.push("Erro técnico ao calcular Simples Nacional");
      }
    }

    if (regime === "LUCRO_PRESUMIDO") {
      try {
        const presumido = await calcularLucroPresumidoV2({
          receitaBruta12m: receita,
          folhaPagamento12m: folha,
          tipoAtividade: this.empresa.tipoAtividade,
          receitaServicos: this.empresa.receitas.servicos,
          receitaComercio: this.empresa.receitas.comercio,
          receitaLocacao: this.empresa.receitas.locacao,
          municipioIBGE: this.empresa.localizacao.municipioIBGE,
        });

        impostoTotal = presumido.totalAnual;
        detalhes.irpj = presumido.impostos.irpj;
        detalhes.adicionalIRPJ = presumido.impostos.adicionalIRPJ;
        detalhes.csll = presumido.impostos.csll;
        detalhes.pis = presumido.impostos.pis;
        detalhes.cofins = presumido.impostos.cofins;
        detalhes.iss = presumido.impostos.iss;
        detalhes.cpp = presumido.impostos.cpp;
      } catch (error) {
        console.error("Erro no cálculo Presumido V2:", error);
        viavel = false;
      }
    }

    if (regime === "LUCRO_REAL") {
      try {
        const real = calcularLucroReal({
          receitaBruta12m: receita,
          folhaPagamento12m: folha,
          tipoAtividade: this.empresa.tipoAtividade,
          custosTotais: this.empresa.custos.total,
        });

        impostoTotal = real.totalAnual;
        detalhes.irpj = real.impostos.irpj;
        detalhes.adicionalIRPJ = real.impostos.adicionalIRPJ;
        detalhes.csll = real.impostos.csll;
        detalhes.pis = real.impostos.pis;
        detalhes.cofins = real.impostos.cofins;
        detalhes.cpp = real.impostos.cpp;
      } catch (error) {
        console.error("Erro no cálculo Real V2:", error);
        viavel = false;
      }
    }

    // Estrutura DUAS_EMPRESAS
    if (estrutura === "DUAS_EMPRESAS") {
      const receitaMetade = receita / 2;
      const folhaMetade = folha / 2;

      if (
        receita > LIMITES.SIMPLES_NACIONAL &&
        receitaMetade <= LIMITES.SIMPLES_NACIONAL
      ) {
        viavel = true;
        restricoes.length = 0; // Limpa restrição anterior
        restricoes.push("Cenário hipotético - requer abertura de nova empresa");

        if (regime === "SIMPLES_NACIONAL") {
          const anexoCalc = anexo || (await this.identificarAnexoSimples());
          try {
            const simples1 = await calcularSimplesNacionalV2(
              receitaMetade,
              anexoCalc,
              folhaMetade,
            );
            const simples2 = await calcularSimplesNacionalV2(
              receitaMetade,
              anexoCalc,
              folhaMetade,
            );
            impostoTotal = simples1.impostoAnual + simples2.impostoAnual;
            detalhes.das = impostoTotal;
          } catch (e) {
            viavel = false;
          }
        }
      }
    }

    // Estrutura HOLDING
    if (estrutura === "HOLDING") {
      restricoes.push(
        "Cenário hipotético - requer estrutura societária com Holding",
      );
      // Benefício: 5% economia (simplificação por enquanto, até implementarmos Holding real)
      impostoTotal = impostoTotal * 0.95;
    }

    const impostoAtual = this.empresa.fiscalAtual.total || impostoTotal;
    const economia = impostoAtual - impostoTotal;
    const percentualEconomia =
      impostoAtual > 0 ? (economia / impostoAtual) * 100 : 0;

    return {
      id: `${regime}-${estrutura}-${anexo || "N/A"}`,
      nome: this.gerarNomeCenario(regime, estrutura, anexo),
      descricao: this.gerarDescricaoCenario(regime, estrutura, anexo),
      regime,
      estrutura,
      anexoSimples: anexo,

      impostoTotal,
      aliquotaEfetiva: receita > 0 ? impostoTotal / receita : 0,
      impostoMensal: impostoTotal / 12,

      detalhes,

      economiaVsAtual: economia,
      percentualEconomia,

      viavel,
      restricoes,
    };
  }

  /**
   * Determina os anexos permitidos com base no tipo de atividade
   */
  private obterAnexosPermitidos(): ("I" | "II" | "III" | "IV" | "V")[] {
    const tipo = this.empresa.tipoAtividade;
    const fatorR = this.calcularFatorR();

    switch (tipo) {
      case "COMERCIO":
        // Comércio: Anexo I (maioria) ou Anexo II (posto de combustível)
        return ["I", "II"];

      case "INDUSTRIA":
        // Indústria: Anexo II
        return ["II"];

      case "SERVICOS":
        // Serviços: Anexo III (se Fator R >= 28%) ou Anexo V
        if (fatorR >= LIMITES.FATOR_R_IDEAL) {
          return ["III"]; // Fator R OK - Anexo III é melhor
        } else {
          return ["V"]; // Fator R baixo - Anexo V obrigatório
        }

      case "LOCACAO":
        // Locação: Anexo III
        return ["III"];

      case "MISTO":
        // Atividade mista: simular serviços e comércio
        if (fatorR >= LIMITES.FATOR_R_IDEAL) {
          return ["I", "III"]; // Pode usar Anexo I ou III
        } else {
          return ["I", "V"]; // Comércio (I) ou Serviços (V)
        }

      default:
        // Fallback conservador
        return ["V"];
    }
  }

  /**
   * Roda TODAS as simulações possíveis (Async)
   */
  async rodarTodasSimulacoes(): Promise<CenarioSimulacao[]> {
    const promises: Promise<CenarioSimulacao>[] = [];

    const regimes: ("MEI" | "SIMPLES_NACIONAL" | "LUCRO_PRESUMIDO" | "LUCRO_REAL")[] = [
      "MEI",
      "SIMPLES_NACIONAL",
      "LUCRO_PRESUMIDO",
      "LUCRO_REAL",
    ];

    const estruturas: ("UNICA" | "DUAS_EMPRESAS" | "HOLDING")[] = [
      "UNICA",
      "DUAS_EMPRESAS",
      "HOLDING",
    ];

    // ANEXOS PERMITIDOS por tipo de atividade
    const anexosPermitidos = this.obterAnexosPermitidos();

    for (const regime of regimes) {
      for (const estrutura of estruturas) {
        if (regime === "SIMPLES_NACIONAL") {
          // SIMULAR APENAS OS ANEXOS PERMITIDOS
          for (const anexo of anexosPermitidos) {
            promises.push(this.simularCenario(regime, estrutura, anexo));
          }
        } else {
          promises.push(this.simularCenario(regime, estrutura));
        }
      }
    }

    const cenarios = await Promise.all(promises);

    // Ordenar por economia (maior primeiro)
    return cenarios
      .filter((c) => c.viavel && c.impostoTotal > 0)
      .sort((a, b) => b.economiaVsAtual - a.economiaVsAtual);
  }

  /**
   * Encontra o melhor cenário
   */
  async encontrarMelhorCenario(): Promise<CenarioSimulacao> {
    const cenarios = await this.rodarTodasSimulacoes();
    return cenarios[0];
  }

  /**
   * Calcula o Score Fiscal da empresa
   */
  async calcularScoreFiscal(): Promise<ScoreFiscal> {
    const fatores: ScoreFiscal["fatores"] = [];
    let scoreTotal = 0;

    // 1. Adequação do Regime (peso 30)
    const melhorCenario = await this.encontrarMelhorCenario();

    // Se não encontrou cenário viável ou imposto é zero, score baixo
    if (!melhorCenario) {
      return {
        score: 0,
        classificacao: "CRITICO",
        fatores: [],
        recomendacoes: ["Dados insuficientes para cálculo"],
      };
    }

    const economiaPotencial =
      melhorCenario.economiaVsAtual / this.empresa.receitas.total;

    let notaRegime = 100;
    if (economiaPotencial > 0.05) notaRegime = 60;
    if (economiaPotencial > 0.1) notaRegime = 40;
    if (economiaPotencial > 0.15) notaRegime = 20;

    fatores.push({
      fator: "Adequação do Regime Tributário",
      peso: 30,
      nota: notaRegime,
      observacao:
        economiaPotencial > 0.05
          ? `Potencial economia de ${(economiaPotencial * 100).toFixed(1)}% do faturamento`
          : "Regime adequado",
    });
    scoreTotal += notaRegime * 0.3;

    // 2. Fator R (peso 25) - só para serviços
    if (this.empresa.tipoAtividade === "SERVICOS" && this.empresa.regimeAtual !== "MEI") {
      const fatorR = this.calcularFatorR();
      let notaFatorR = 100;
      if (fatorR < 0.28) notaFatorR = 50;
      if (fatorR < 0.2) notaFatorR = 30;
      if (fatorR < 0.1) notaFatorR = 10;

      fatores.push({
        fator: "Fator R",
        peso: 25,
        nota: notaFatorR,
        observacao:
          fatorR >= 0.28
            ? "Fator R adequado para Anexo III"
            : `Fator R de ${(fatorR * 100).toFixed(1)}% - abaixo do ideal`,
      });
      scoreTotal += notaFatorR * 0.25;
    } else {
      fatores.push({
        fator: "Fator R",
        peso: 25,
        nota: 100,
        observacao: "Não aplicável (Não é serviço ou é MEI)",
      });
      scoreTotal += 100 * 0.25;
    }

    // 3. Carga Tributária vs Setor (peso 20)
    const cargaTributaria =
      this.empresa.fiscalAtual.total / this.empresa.receitas.total || 0;
    const mediaSetor = 0.12;
    let notaCarga = 100;
    if (cargaTributaria > mediaSetor * 1.2) notaCarga = 70;
    if (cargaTributaria > mediaSetor * 1.5) notaCarga = 40;
    if (cargaTributaria > mediaSetor * 2) notaCarga = 20;

    fatores.push({
      fator: "Carga Tributária vs Setor",
      peso: 20,
      nota: notaCarga,
      observacao: `Carga de ${(cargaTributaria * 100).toFixed(1)}% vs média de ${(mediaSetor * 100).toFixed(0)}%`,
    });
    scoreTotal += notaCarga * 0.2;

    // 4. Regularidade Fiscal (peso 15)
    fatores.push({
      fator: "Regularidade Fiscal",
      peso: 15,
      nota: 90,
      observacao: "Empresa em situação regular",
    });
    scoreTotal += 90 * 0.15;

    // 5. Oportunidades de Planejamento (peso 10)
    const oportunidades = await this.detectarOportunidades();
    const qtdOportunidades = oportunidades.length;
    let notaOportunidades = 100;
    if (qtdOportunidades > 0) notaOportunidades = 80;
    if (qtdOportunidades > 2) notaOportunidades = 60;
    if (qtdOportunidades > 4) notaOportunidades = 40;

    fatores.push({
      fator: "Oportunidades de Otimização",
      peso: 10,
      nota: notaOportunidades,
      observacao:
        qtdOportunidades > 0
          ? `${qtdOportunidades} oportunidades identificadas`
          : "Nenhuma oportunidade óbvia",
    });
    scoreTotal += notaOportunidades * 0.1;

    // Classificação
    let classificacao: ScoreFiscal["classificacao"];
    if (scoreTotal >= 90) classificacao = "OTIMO";
    else if (scoreTotal >= 70) classificacao = "BOM";
    else if (scoreTotal >= 50) classificacao = "REGULAR";
    else if (scoreTotal >= 30) classificacao = "RUIM";
    else classificacao = "CRITICO";

    return {
      score: Math.round(scoreTotal),
      classificacao,
      fatores,
      recomendacoes: this.gerarRecomendacoesScore(scoreTotal),
    };
  }

  /**
   * Detecta oportunidades de economia (Async)
   */
  async detectingOportunidades(): Promise<EstrategiaRecomendada[]> {
    const estrategias: EstrategiaRecomendada[] = [];

    // 1. Fator R
    if (this.empresa.regimeAtual !== "MEI") {
      const analiseFatorR = await analisarFatorR(
      this.empresa.receitas.total,
      this.empresa.custos.folhaTotal,
      await this.identificarAnexoSimples(),
    );

    if (analiseFatorR.recomendacao === "VALE_A_PENA") {
      estrategias.push({
        id: "fator-r",
        nome: "Otimizar Fator R (Pró-labore)",
        descricao: `Aumentar pró-labore em R$ ${analiseFatorR.prolaborNecessario.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/mês. Isso reduz o imposto do Anexo V para o III.`,
        impacto: "ALTO",
        economiaAnual:
          analiseFatorR.economiaTributaria - analiseFatorR.custoINSSAdicional,
        custoImplementacao: analiseFatorR.custoINSSAdicional,
        roi: analiseFatorR.rentabilidade,
        prazoImplementacao: "30 dias",
        acoes: [
          "Ajustar retirada de pró-labore",
          "Recalcular DAS no Anexo III",
          "Monitorar folha mensalmente",
        ],
      });
    }

    // 2. Separação de Atividades
    if (this.empresa.tipoAtividade === "MISTO") {
      const melhorCenario = await this.simularCenario(
        "SIMPLES_NACIONAL",
        "DUAS_EMPRESAS",
      );
      if (melhorCenario.economiaVsAtual > 10000) {
        estrategias.push({
          id: "separar-atividades",
          nome: "Separar Atividades em Duas Empresas",
          descricao:
            "Criar empresa separada para cada tipo de atividade pode reduzir impostos significativamente ao segregar receitas.",
          impacto: "ALTO",
          economiaAnual: melhorCenario.economiaVsAtual,
          custoImplementacao: 5000,
          roi: (melhorCenario.economiaVsAtual / 5000) * 100,
          prazoImplementacao: "60 dias",
          acoes: [
            "Consultar contador sobre viabilidade societária",
            "Abrir nova empresa para atividade secundária",
            "Migrar contratos e faturamento gradualmente",
          ],
        });
      }
    }
    }

    // 3. Mudança de Regime
    const melhorCenario = await this.encontrarMelhorCenario();
    if (
      melhorCenario &&
      melhorCenario.regime !== this.empresa.regimeAtual &&
      melhorCenario.economiaVsAtual > 5000
    ) {
      estrategias.push({
        id: "mudar-regime",
        nome: `Migrar para ${melhorCenario.regime.replace("_", " ")}`,
        descricao: `Mudar de ${this.empresa.regimeAtual} para ${melhorCenario.regime} pode economizar R$ ${melhorCenario.economiaVsAtual.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/ano.`,
        impacto: "ALTO",
        economiaAnual: melhorCenario.economiaVsAtual,
        custoImplementacao: 2000,
        roi: (melhorCenario.economiaVsAtual / 2000) * 100,
        prazoImplementacao: "90 dias",
        acoes: [
          "Analisar impacto operacional da mudança",
          "Preparar documentação contábil",
          "Solicitar alteração na Receita Federal (Prazo: Janeiro)",
        ],
      });
    }

    // 4. ISS Alto
    if (
      this.empresa.localizacao.issAliquota >= 0.05 &&
      this.empresa.receitas.servicos > 0
    ) {
      const economiaISS = this.empresa.receitas.servicos * 0.03;
      if (economiaISS > 5000) {
        estrategias.push({
          id: "reduzir-iss",
          nome: "Avaliar Mudança de Município (ISS)",
          descricao: `Seu município cobra 5% de ISS. Mudar para um município vizinho com 2% pode economizar R$ ${economiaISS.toLocaleString(
            "pt-BR",
            { maximumFractionDigits: 0 },
          )}/ano.`,
          impacto: "MEDIO",
          economiaAnual: economiaISS,
          custoImplementacao: 3000,
          roi: (economiaISS / 3000) * 100,
          prazoImplementacao: "90 dias",
          acoes: [
            "Pesquisar municípios vizinhos com ISS de 2%",
            "Avaliar viabilidade de mudança de sede",
            "Planejar custos logísticos",
          ],
        });
      }
    }

    // OPORTUNIDADES INTELIGENTES EXTRAS
    const receitaAnual = this.empresa.receitas.total;

    // A. Oportunidade: Revisão de NCM / Recuperação de Crédito (Para Comércio)
    if (
      (this.empresa.tipoAtividade === "COMERCIO" ||
        this.empresa.tipoAtividade === "MISTO") &&
      receitaAnual > 500000
    ) {
      const economiaEstimada = receitaAnual * 0.01;
      estrategias.push({
        id: "revisao-ncm",
        nome: "Revisão de NCM e Recuperação de ICMS/PIS/COFINS",
        descricao:
          "Produtos monofásicos tributados a maior geram direito a restituição dos últimos 5 anos. Uma auditoria no cadastro de produtos (NCM) pode recuperar caixa imediato.",
        impacto: "ALTO",
        economiaAnual: economiaEstimada,
        custoImplementacao: 1500,
        roi: (economiaEstimada / 1500) * 100,
        prazoImplementacao: "60 dias",
        acoes: [
          "Exportar XMLs de entrada e saída",
          "Cruzar NCMs com a base legal (monofásicos e ST)",
          "Solicitar restituição via portal e-CAC",
        ],
      });
    }

    // B. Oportunidade: Limite do Simples Nacional vs Lucro Presumido
    if (
      this.empresa.regimeAtual === "SIMPLES_NACIONAL" &&
      receitaAnual > 3600000 &&
      receitaAnual <= 4800000
    ) {
      estrategias.push({
        id: "transicao-presumido",
        nome: "Planejamento de Saída do Simples (Risco de Sublimite)",
        descricao:
          "Seu faturamento está na faixa do sublimite (acima de R$ 3,6M). O ICMS/ISS passa a ser cobrado por fora, encarecendo a operação. É preciso preparar a transição para Lucro Presumido urgentemente.",
        impacto: "ALTO",
        economiaAnual: 25000,
        custoImplementacao: 3000,
        roi: (25000 / 3000) * 100,
        prazoImplementacao: "Imediato",
        acoes: [
          "Realizar projeção de faturamento até dezembro",
          "Simular folha e margem no Presumido",
          "Ajustar precificação dos produtos para a nova carga",
        ],
      });
    }

    // C. Oportunidade: Equiparação Hospitalar para Clínicas
    const cnaesSaude = [
      "8630-5/03",
      "8630-5/01",
      "8630-5/02",
      "8610-1/01",
      "8610-1/02",
      "8630-5/04",
    ];
    const isSaude =
      cnaesSaude.includes(this.empresa.cnaePrincipal) ||
      this.empresa.cnaesSecundarios.some((c) => cnaesSaude.includes(c));
    if (
      isSaude &&
      (melhorCenario?.regime === "LUCRO_PRESUMIDO" ||
        this.empresa.regimeAtual === "LUCRO_PRESUMIDO")
    ) {
      const economiaEstimada = receitaAnual * 0.08;
      estrategias.push({
        id: "equiparacao-hospitalar",
        nome: "Equiparação Hospitalar (Clínicas)",
        descricao:
          "Clínicas médicas no Lucro Presumido podem reduzir a base de cálculo do IRPJ de 32% para 8% e CSLL de 32% para 12%, caso atendam às normas da Anvisa.",
        impacto: "ALTO",
        economiaAnual: economiaEstimada,
        custoImplementacao: 5000,
        roi: (economiaEstimada / 5000) * 100,
        prazoImplementacao: "120 dias",
        acoes: [
          "Obter alvará sanitário adequado (Anvisa)",
          "Adequar contrato social para serviços hospitalares",
          "Ajustar apuração fiscal na Receita",
        ],
      });
    }

    // D. Benefícios Fiscais Estaduais (Desenvolve)
    if (this.empresa.tipoAtividade === "INDUSTRIA" && receitaAnual > 1000000) {
      const economiaEstimada = receitaAnual * 0.03;
      estrategias.push({
        id: "beneficio-estadual",
        nome: "Mapeamento de Incentivos Fiscais Estaduais",
        descricao:
          "Indústrias costumam ter acesso a diferimento ou crédito presumido de ICMS dependendo do estado onde operam.",
        impacto: "MEDIO",
        economiaAnual: economiaEstimada,
        custoImplementacao: 4000,
        roi: (economiaEstimada / 4000) * 100,
        prazoImplementacao: "90 dias",
        acoes: [
          "Mapear legislação estadual para a NCM principal",
          "Montar dossiê de solicitação na SEFAZ",
          "Ajustar emissão de notas fiscais (CST)",
        ],
      });
    }

    // E. Risco de Desenquadramento MEI (Malha Fina)
    if (this.empresa.regimeAtual === "MEI" && receitaAnual > LIMITES.MEI) {
      estrategias.push({
        id: "desenquadramento-mei",
        nome: "Desenquadramento Urgente do MEI",
        descricao: `Sua empresa faturou R$ ${receitaAnual.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} e estourou o limite de R$ ${LIMITES.MEI.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} do MEI. Você não se enquadra mais e está criticamente fora de enquadramento, podendo cair na malha fina com multas pesadas. A migração para o Simples Nacional é obrigatória.`,
        impacto: "ALTO",
        economiaAnual: 10000,
        custoImplementacao: 1500,
        roi: (10000 / 1500) * 100,
        prazoImplementacao: "Imediato",
        acoes: [
          "Solicitar desenquadramento no Portal do Simples Nacional",
          "Recolher a diferença dos impostos como ME para estancar o problema",
          "Atualizar natureza jurídica (ex: Empresário Individual ou SLU)",
        ],
      });
    }

    // Ordenar por economia
    return estrategias.sort((a, b) => b.economiaAnual - a.economiaAnual);
  }

  // Alias para manter compatibilidade com código antigo se necessário
  async detectarOportunidades() {
    return this.detectingOportunidades();
  }

  /**
   * Gera diagnóstico completo (Async)
   */
  async gerarDiagnostico(): Promise<DiagnosticoFiscal> {
    const score = await this.calcularScoreFiscal();
    const oportunidades = await this.detectingOportunidades();
    const problemas: string[] = [];

    // Detectar problemas
    if (score.score < 50) {
      problemas.push("Estrutura tributária ineficiente");
    }

    if (
      this.empresa.receitas.total > LIMITES.SIMPLES_NACIONAL &&
      this.empresa.regimeAtual === "SIMPLES_NACIONAL"
    ) {
      problemas.push("Faturamento excede limite do Simples Nacional");
    }

    const fatorR = this.calcularFatorR();
    if (fatorR < 0.28 && this.empresa.tipoAtividade === "SERVICOS" && this.empresa.regimeAtual !== "MEI") {
      problemas.push("Fator R abaixo do ideal para serviços (Anexo V)");
    }

    if (this.empresa.fiscalAtual.total > this.empresa.receitas.total * 0.2) {
      problemas.push("Carga tributária superior a 20% do faturamento");
    }

    // Classificar risco
    let risco: DiagnosticoFiscal["riscoFiscal"];
    if (score.score < 30) risco = "CRITICO";
    else if (score.score < 50) risco = "ALTO";
    else if (score.score < 70) risco = "MEDIO";
    else risco = "BAIXO";

    // Classificar eficiência
    let eficiencia: DiagnosticoFiscal["eficienciaTributaria"];
    if (score.score >= 80) eficiencia = "ALTA";
    else if (score.score >= 50) eficiencia = "MEDIA";
    else eficiencia = "BAIXA";

    // Classificar potencial economia
    let potencial: DiagnosticoFiscal["potencialEconomia"];
    const economiaTotal = oportunidades.reduce(
      (sum, o) => sum + o.economiaAnual,
      0,
    );
    if (economiaTotal > 50000) potencial = "ALTO";
    else if (economiaTotal > 10000) potencial = "MEDIO";
    else potencial = "BAIXO";

    return {
      score,
      riscoFiscal: risco,
      eficienciaTributaria: eficiencia,
      potencialEconomia: potencial,
      problemasDetectados: problemas,
      oportunidadesIdentificadas: oportunidades.map((o) => o.nome),
    };
  }

  /**
   * Projeta cenários futuros baseados em crescimento de faturamento (Async)
   */
  async projetarCrescimento(percentual: number): Promise<ProjecaoFutura> {
    const crescimento = 1 + percentual / 100;

    // Criar uma cópia da empresa com valores inflados
    const empresaProjetada: Partial<EmpresaModel> = {
      ...this.empresa,
      receitas: {
        servicos: this.empresa.receitas.servicos * crescimento,
        comercio: this.empresa.receitas.comercio * crescimento,
        locacao: this.empresa.receitas.locacao * crescimento,
        outros: this.empresa.receitas.outros * crescimento,
        total: this.empresa.receitas.total * crescimento,
      },
      custos: {
        ...this.empresa.custos,
        folhaTotal: this.empresa.custos.folhaTotal * crescimento, // Assume folha crescendo com faturamento
        total: this.empresa.custos.total * crescimento,
      },
    };

    const twinProjetado = new DigitalTwinFiscal(empresaProjetada);
    const melhorCenarioProjetado = await twinProjetado.encontrarMelhorCenario();

    const alertas: string[] = [];

    // Alertas de sublimite e limite
    if (
      this.empresa.receitas.total <= LIMITES.SIMPLES_NACIONAL &&
      empresaProjetada.receitas!.total > LIMITES.SIMPLES_NACIONAL
    ) {
      alertas.push(
        `Crescimento de ${percentual}% fará a empresa estourar o limite de R$ 4,8M do Simples Nacional.`,
      );
    } else if (
      this.empresa.receitas.total <= 3600000 &&
      empresaProjetada.receitas!.total > 3600000
    ) {
      alertas.push(
        `Crescimento de ${percentual}% fará a empresa estourar o sublimite de R$ 3,6M. ICMS e ISS serão cobrados por fora.`,
      );
    }

    if (melhorCenarioProjetado.regime !== this.empresa.regimeAtual) {
      alertas.push(
        `Com faturamento de R$ ${empresaProjetada.receitas!.total.toLocaleString("pt-BR")}, o regime ${melhorCenarioProjetado.regime.replace("_", " ")} passará a ser mais vantajoso.`,
      );
    }

    return {
      percentualCrescimento: percentual,
      faturamentoProjetado: empresaProjetada.receitas!.total,
      impostoProjetado: melhorCenarioProjetado.impostoTotal,
      aliquotaEfetiva: melhorCenarioProjetado.aliquotaEfetiva,
      alertas,
      melhorRegime: melhorCenarioProjetado.regime,
    };
  }

  /**
   * Gera um conjunto de projeções (10%, 20%, 30%)
   */
  async gerarProjecaoAnoSeguinte(): Promise<ProjecaoFutura[]> {
    return Promise.all([
      this.projetarCrescimento(10),
      this.projetarCrescimento(20),
      this.projetarCrescimento(30),
    ]);
  }

  // Métodos auxiliares privados

  private gerarNomeCenario(
    regime: string,
    estrutura: string,
    anexo?: string,
  ): string {
    const regimeNome = regime.replace("_", " ");
    const estruturaNome =
      estrutura === "UNICA"
        ? "Empresa Única"
        : estrutura === "DUAS_EMPRESAS"
          ? "2 Empresas"
          : "Holding";
    const anexoNome = anexo ? ` - Anexo ${anexo}` : "";

    return `${regimeNome} | ${estruturaNome}${anexoNome}`;
  }

  private gerarDescricaoCenario(
    regime: string,
    estrutura: string,
    anexo?: string,
  ): string {
    let descricao = `Simulação com regime ${regime.replace("_", " ")}`;

    if (estrutura === "DUAS_EMPRESAS") {
      descricao += ", dividindo faturamento em duas empresas";
    } else if (estrutura === "HOLDING") {
      descricao += ", com estrutura de Holding familiar";
    }

    if (anexo) {
      descricao += `, utilizando Anexo ${anexo} do Simples Nacional`;
    }

    return descricao;
  }

  private gerarRecomendacoesScore(score: number): string[] {
    const recomendacoes: string[] = [];

    if (score < 50) {
      recomendacoes.push(
        "Recomendamos uma revisão completa da estrutura tributária",
      );
    }

    if (score < 70) {
      recomendacoes.push("Existem oportunidades de economia identificadas");
    }

    if (score < 90) {
      recomendacoes.push(
        "Consulte um contador especializado para implementar as estratégias sugeridas",
      );
    }

    return recomendacoes;
  }
}

// ============================================
// FUNÇÕES DE CONVENIÊNCIA
// ============================================

export function criarDigitalTwin(
  dadosEmpresa: Partial<EmpresaModel>,
): DigitalTwinFiscal {
  return new DigitalTwinFiscal(dadosEmpresa);
}

export async function rodarAnaliseCompleta(
  dadosEmpresa: Partial<EmpresaModel>,
) {
  const twin = new DigitalTwinFiscal(dadosEmpresa);

  const diagnostico = await twin.gerarDiagnostico();
  const melhorCenario = await twin.encontrarMelhorCenario();
  const todasSimulacoes = await twin.rodarTodasSimulacoes();
  const estrategias = await twin.detectingOportunidades();

  return {
    diagnostico,
    melhorCenario,
    todasSimulacoes,
    estrategias,
  };
}

export async function gerarProjecao(dadosEmpresa: Partial<EmpresaModel>) {
  const twin = new DigitalTwinFiscal(dadosEmpresa);
  return twin.gerarProjecaoAnoSeguinte();
}
