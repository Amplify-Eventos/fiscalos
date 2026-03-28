// FiscalOS PDF Generator - Build v3
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { criarDigitalTwin } from "@/lib/digital-twin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .eq("userId", user.id)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const { data: userProfile } = await supabase
      .from("users")
      .select(
        "agencyName, agencyLogo, agencyColor, agencyColorSecondary, agencyWebsite",
      )
      .eq("id", user.id)
      .single();

    const agencyName =
      userProfile?.agencyName || "FiscalOS - Inteligência Tributária";
    const agencyColor = userProfile?.agencyColor || "#2563eb";
    const agencyColorSecondary = userProfile?.agencyColorSecondary || "#1e40af";
    const agencyLogo = userProfile?.agencyLogo || "";
    const agencyWebsite = userProfile?.agencyWebsite || "";

    // Criar Digital Twin e rodar análise
    const digitalTwin = criarDigitalTwin({
      id: client.id,
      nome: client.companyName,
      cnpj: client.cnpj,
      naturezaJuridica: client.legalNature || "LTDA",
      porte: client.companySize || "ME",
      regimeAtual: client.taxRegime || "SIMPLES_NACIONAL",
      cnaePrincipal: client.cnaeMain,
      tipoAtividade: client.revenueType || "SERVICOS",
      receitas: {
        servicos: Number(client.revenueServicos || 0),
        comercio: Number(client.revenueComercio || 0),
        locacao: Number(client.revenueLocacao || 0),
        outros: Number(client.revenueOutros || 0),
        total: Number(client.revenueLast12m),
      },
      custos: {
        folhaTotal: Number(client.payrollLast12m),
        aluguel: Number(client.rentExpense || 0),
        fornecedores: Number(client.supplierExpense || 0),
        marketing: Number(client.marketingExpense || 0),
        administrativo: Number(client.adminExpense || 0),
        total:
          Number(client.payrollLast12m) +
          Number(client.rentExpense || 0) +
          Number(client.supplierExpense || 0) +
          Number(client.marketingExpense || 0) +
          Number(client.adminExpense || 0),
      },
      trabalhista: {
        funcionarios: client.employeesCount,
        salarioTotal: Number(client.totalSalary || 0),
        proLabore: Number(client.proLabore || 0),
        beneficios: Number(client.benefits || 0),
      },
      localizacao: {
        municipio: client.municipio || "",
        uf: client.uf || "",
        municipioIBGE: client.municipioIBGE || "3550308",
        issAliquota: client.issAliquota ? Number(client.issAliquota) : 0.05,
      },
      fiscalAtual: {
        das: Number(client.currentDAS || 0),
        irpj: Number(client.currentIRPJ || 0),
        csll: Number(client.currentCSLL || 0),
        pis: Number(client.currentPIS || 0),
        cofins: Number(client.currentCOFINS || 0),
        iss: Number(client.currentISS || 0),
        icms: Number(client.currentICMS || 0),
        inss: Number(client.currentINSS || 0),
        total:
          Number(client.currentDAS || 0) +
          Number(client.currentIRPJ || 0) +
          Number(client.currentCSLL || 0) +
          Number(client.currentPIS || 0) +
          Number(client.currentCOFINS || 0) +
          Number(client.currentISS || 0) +
          Number(client.currentICMS || 0) +
          Number(client.currentINSS || 0),
      },
    });

    // Rodar análise ASSÍNCRONA
    const diagnostico = await digitalTwin.gerarDiagnostico();
    const melhorCenario = await digitalTwin.encontrarMelhorCenario();
    const todasSimulacoes = (await digitalTwin.rodarTodasSimulacoes()).slice(
      0,
      10,
    );
    const estrategias = await digitalTwin.detectingOportunidades();
    const projecoes = await digitalTwin.gerarProjecaoAnoSeguinte();

    // Configurar cores e dados para o PDF
    const scoreColors: Record<string, string> = {
      OTIMO: "#16a34a",
      BOM: "#22c55e",
      REGULAR: "#ca8a04",
      RUIM: "#ea580c",
      CRITICO: "#dc2626",
    };
    const scoreColor = scoreColors[diagnostico.score.classificacao] || "#333";

    const today = new Date().toLocaleDateString("pt-BR");

    // Gerar HTML do Relatório Consultivo
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Planejamento Fiscal Estratégico - ${client.companyName}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; max-width: 900px; margin: 0 auto; line-height: 1.5; }
    .header { border-bottom: 3px solid ${agencyColor}; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: end; }
    .title { font-size: 28px; color: ${agencyColor}; margin: 0; font-weight: 800; }
    .subtitle { color: ${agencyColorSecondary}; margin-top: 5px; font-size: 14px; }
    
    .score-section { display: flex; gap: 30px; margin-bottom: 40px; background: #f8fafc; padding: 30px; border-radius: 12px; }
    .score-circle { width: 120px; height: 120px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; background: ${scoreColor}; flex-shrink: 0; }
    .score-value { font-size: 42px; font-weight: 800; line-height: 1; }
    .score-label { font-size: 12px; opacity: 0.9; }
    
    .score-details { flex: 1; }
    .score-title { font-size: 24px; font-weight: bold; margin: 0 0 5px 0; color: ${scoreColor}; }
    .score-metrics { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 15px; }
    .metric-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; }
    .metric-value { font-size: 16px; font-weight: 600; color: #334155; }
    
    .section { margin-bottom: 40px; }
    .section-title { font-size: 18px; font-weight: 700; color: ${agencyColorSecondary}; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid ${agencyColor}; }
    
    .best-scenario { background: #dcfce7; padding: 25px; border-radius: 12px; border-left: 5px solid #16a34a; margin-bottom: 30px; }
    .scenario-label { font-size: 12px; text-transform: uppercase; color: #15803d; font-weight: bold; }
    .scenario-name { font-size: 24px; font-weight: 800; color: #14532d; margin: 5px 0; }
    .scenario-desc { color: #166534; font-size: 14px; }
    .scenario-savings { font-size: 32px; font-weight: 800; color: #14532d; margin-top: 15px; }
    .scenario-savings-label { font-size: 14px; color: #15803d; }
    
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { background: #f1f5f9; padding: 12px; text-align: left; font-weight: bold; color: #334155; font-size: 13px; border-bottom: 2px solid #e2e8f0; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .highlight { background: #f0fdf4; font-weight: bold; color: #15803d; }
    
    .strategy-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 15px; page-break-inside: avoid; }
    .strategy-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .strategy-title { font-weight: bold; color: #1e293b; font-size: 16px; }
    .strategy-impact { background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; color: #475569; }
    .impact-alto { background: #dcfce7; color: #166534; }
    .impact-medio { background: #fef3c7; color: #b45309; }
    
    .strategy-desc { color: #475569; font-size: 14px; margin-bottom: 15px; }
    .strategy-actions { background: #f8fafc; padding: 15px; border-radius: 6px; }
    .action-item { display: flex; gap: 8px; font-size: 13px; color: #334155; margin-bottom: 5px; }
    .check { color: #16a34a; font-weight: bold; }
    
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; text-align: center; }
    
    @media print { 
      body { padding: 0; }
      .strategy-card { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div style="display: flex; gap: 20px; align-items: center;">
      ${agencyLogo ? `<img src="${agencyLogo}" style="max-height: 60px; max-width: 150px; object-fit: contain;" />` : ""}
      <div>
        <h1 class="title" style="margin-bottom: 5px;">Planejamento Fiscal Estratégico</h1>
        <p class="subtitle" style="margin: 0;">Relatório gerado em ${today}</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b; font-weight: bold;">Preparado por: ${agencyName}</p>
      </div>
    </div>
    <div style="text-align: right">
      <div style="font-weight: bold; font-size: 18px; color: #1e293b;">${client.companyName}</div>
      <div style="font-size: 14px; color: #64748b;">CNPJ: ${client.cnpj}</div>
    </div>
  </div>

  <div class="score-section">
    <div class="score-circle">
      <div class="score-value">${diagnostico.score.score}</div>
      <div class="score-label">SCORE FISCAL</div>
    </div>
    <div class="score-details">
      <h2 class="score-title">${diagnostico.score.classificacao}</h2>
      <p style="margin: 0; color: #64748b; font-size: 14px;">
        ${diagnostico.score.score >= 70 ? "Sua empresa possui uma boa estrutura fiscal, mas ainda há oportunidades." : "Sua estrutura fiscal precisa de atenção urgente para evitar desperdício de dinheiro."}
      </p>
      
      <div class="score-metrics">
        <div>
          <div class="metric-label">Risco Fiscal</div>
          <div class="metric-value" style="color: ${diagnostico.riscoFiscal === "BAIXO" ? "#16a34a" : "#dc2626"}">${diagnostico.riscoFiscal}</div>
        </div>
        <div>
          <div class="metric-label">Eficiência</div>
          <div class="metric-value">${diagnostico.eficienciaTributaria}</div>
        </div>
        <div>
          <div class="metric-label">Potencial Economia</div>
          <div class="metric-value">${diagnostico.potencialEconomia}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="section" style="margin-top: -10px;">
    <div class="section-title">Composição do Score Fiscal</div>
    <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
      ${diagnostico.score.fatores
        .map(
          (fator) => `
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="font-weight: bold; font-size: 13px; color: #334155;">${fator.fator}</span>
            <span style="font-size: 13px; font-weight: bold; color: ${fator.nota >= 80 ? "#16a34a" : fator.nota >= 50 ? "#b45309" : "#dc2626"}">${fator.nota}/100</span>
          </div>
          <div style="width: 100%; background: #f1f5f9; border-radius: 4px; height: 6px; overflow: hidden; margin-bottom: 4px;">
            <div style="height: 6px; background: ${fator.nota >= 80 ? "#22c55e" : fator.nota >= 50 ? "#f59e0b" : "#ef4444"}; width: ${Math.min(fator.nota, 100)}%;"></div>
          </div>
          <div style="font-size: 11px; color: #64748b;">${fator.observacao}</div>
        </div>
      `,
        )
        .join("")}
    </div>
  </div>

  ${
    melhorCenario && melhorCenario.impostoTotal > 0
      ? `
    <div class="best-scenario">
      <div class="scenario-label">Melhor Cenário Identificado</div>
      <h3 class="scenario-name">${melhorCenario.nome}</h3>
      <p class="scenario-desc">${melhorCenario.descricao}</p>
      <div class="scenario-savings">R$ ${melhorCenario.economiaVsAtual.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</div>
      <div class="scenario-savings-label">de economia anual estimada</div>
    </div>
  `
      : ""
  }

  
  <div class="section">
    <div class="section-title" style="border-color: #6366f1; color: #4338ca;">Planejamento Tributário Futuro (Projeção)</div>
    <p style="font-size: 14px; color: #475569; margin-bottom: 15px;">O que acontece com os impostos caso o faturamento da empresa cresça nos próximos 12 meses?</p>
    <div style="display: flex; gap: 15px;">
      ${projecoes
        .map(
          (proj) => `
        <div style="flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: #f8fafc;">
          <div style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 5px;">Crescer ${proj.percentualCrescimento}%</div>
          <div style="font-size: 13px; color: #64748b; margin-bottom: 10px;">Faturamento: R$ ${proj.faturamentoProjetado.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</div>
          
          <div style="font-weight: bold; color: #4338ca; font-size: 15px;">Imposto: R$ ${proj.impostoProjetado.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 10px;">Carga Efetiva: ${(proj.aliquotaEfetiva * 100).toFixed(1)}% | Regime ideal: ${proj.melhorRegime.replace("_", " ")}</div>
          
          ${proj.alertas
            .map(
              (alerta) => `
            <div style="background: #fef3c7; border-left: 3px solid #f59e0b; padding: 8px; font-size: 11px; color: #92400e; margin-top: 5px; font-weight: 500;">
              ${alerta}
            </div>
          `,
            )
            .join("")}
        </div>
      `,
        )
        .join("")}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Simulações de Cenários (Top 10)</div>
    <table>
      <thead>
        <tr>
          <th>Cenário</th>
          <th style="text-align: right">Imposto Anual</th>
          <th style="text-align: right">Alíquota Efetiva</th>
          <th style="text-align: right">Economia</th>
        </tr>
      </thead>
      <tbody>
        ${todasSimulacoes
          .map(
            (cenario, idx) => `
          <tr class="${idx === 0 ? "highlight" : ""}">
            <td>
              <div style="font-weight: 600">${cenario.nome}</div>
              <div style="font-size: 12px; color: #64748b;">${cenario.descricao}</div>
            </td>
            <td style="text-align: right">R$ ${cenario.impostoTotal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</td>
            <td style="text-align: right">${(cenario.aliquotaEfetiva * 100).toFixed(2)}%</td>
            <td style="text-align: right; color: ${cenario.economiaVsAtual > 0 ? "#16a34a" : "#94a3b8"}; font-weight: bold;">
              ${cenario.economiaVsAtual > 0 ? `R$ ${cenario.economiaVsAtual.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}` : "-"}
            </td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  </div>

  ${
    estrategias.length > 0
      ? `
    <div class="section">
      <div class="section-title">Plano de Ação Estratégico</div>
      ${estrategias
        .map(
          (estrategia) => `
        <div class="strategy-card">
          <div class="strategy-header">
            <div class="strategy-title">${estrategia.nome}</div>
            <div class="strategy-impact impact-${estrategia.impacto.toLowerCase()}">${estrategia.impacto} IMPACTO</div>
          </div>
          <p class="strategy-desc">${estrategia.descricao}</p>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 14px;">
            <div><strong>Economia:</strong> <span style="color: #16a34a; font-weight: bold;">R$ ${estrategia.economiaAnual.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/ano</span></div>
            <div><strong>Prazo:</strong> ${estrategia.prazoImplementacao}</div>
          </div>

          <div class="strategy-actions">
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 8px;">Passos para implementação:</div>
            ${estrategia.acoes
              .map(
                (acao) => `
              <div class="action-item"><span class="check">✓</span> ${acao}</div>
            `,
              )
              .join("")}
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `
      : ""
  }

  ${
    diagnostico.problemasDetectados.length > 0
      ? `
    <div class="section">
      <div class="section-title" style="color: #b45309; border-color: #fbbf24;">Pontos de Atenção</div>
      <ul style="color: #b45309;">
        ${diagnostico.problemasDetectados
          .map(
            (problema) => `
          <li style="margin-bottom: 5px;">${problema}</li>
        `,
          )
          .join("")}
      </ul>
    </div>
  `
      : ""
  }

  <div class="footer">
    <p>Este relatório é uma simulação estratégica e não substitui a análise legal de um contador.</p>
    <p>${agencyName} ${agencyWebsite ? `| <a href="${agencyWebsite}" target="_blank">${agencyWebsite}</a>` : ""}</p>
  </div>

  <script>window.onload = () => window.print()</script>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
