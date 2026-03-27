const fs = require('fs');
let code = fs.readFileSync('lib/digital-twin.ts', 'utf8');

const marker = '// ============================================';

const interfaceProj = `
export interface ProjecaoFutura {
  percentualCrescimento: number
  faturamentoProjetado: number
  impostoProjetado: number
  aliquotaEfetiva: number
  alertas: string[]
  melhorRegime: string
}
`;

// Insert the interface after the first marker (imports)
const parts = code.split('// ============================================\n// TIPOS E INTERFACES\n// ============================================');
if(parts.length === 2) {
  let finalCode = parts[0] + '// ============================================\n// TIPOS E INTERFACES\n// ============================================\n' + interfaceProj + parts[1];
  
  // Add projecao method inside class
  const classEnd = '  // Métodos auxiliares privados';
  const methodProj = `
  /**
   * Projeta cenários futuros baseados em crescimento de faturamento (Async)
   */
  async projetarCrescimento(percentual: number): Promise<ProjecaoFutura> {
    const crescimento = 1 + (percentual / 100);
    
    // Criar uma cópia da empresa com valores inflados
    const empresaProjetada: Partial<EmpresaModel> = {
      ...this.empresa,
      receitas: {
        servicos: this.empresa.receitas.servicos * crescimento,
        comercio: this.empresa.receitas.comercio * crescimento,
        locacao: this.empresa.receitas.locacao * crescimento,
        outros: this.empresa.receitas.outros * crescimento,
        total: this.empresa.receitas.total * crescimento
      },
      custos: {
        ...this.empresa.custos,
        folhaTotal: this.empresa.custos.folhaTotal * crescimento, // Assume folha crescendo com faturamento
        total: this.empresa.custos.total * crescimento
      }
    };
    
    const twinProjetado = new DigitalTwinFiscal(empresaProjetada);
    const melhorCenarioProjetado = await twinProjetado.encontrarMelhorCenario();
    
    const alertas: string[] = [];
    
    // Alertas de sublimite e limite
    if (this.empresa.receitas.total <= LIMITES.SIMPLES_NACIONAL && empresaProjetada.receitas!.total > LIMITES.SIMPLES_NACIONAL) {
      alertas.push(\`Crescimento de \${percentual}% fará a empresa estourar o limite de R$ 4,8M do Simples Nacional.\`);
    } else if (this.empresa.receitas.total <= 3600000 && empresaProjetada.receitas!.total > 3600000) {
      alertas.push(\`Crescimento de \${percentual}% fará a empresa estourar o sublimite de R$ 3,6M. ICMS e ISS serão cobrados por fora.\`);
    }
    
    if (melhorCenarioProjetado.regime !== this.empresa.regimeAtual) {
      alertas.push(\`Com faturamento de R$ \${empresaProjetada.receitas!.total.toLocaleString('pt-BR')}, o regime \${melhorCenarioProjetado.regime.replace('_', ' ')} passará a ser mais vantajoso.\`);
    }

    return {
      percentualCrescimento: percentual,
      faturamentoProjetado: empresaProjetada.receitas!.total,
      impostoProjetado: melhorCenarioProjetado.impostoTotal,
      aliquotaEfetiva: melhorCenarioProjetado.aliquotaEfetiva,
      alertas,
      melhorRegime: melhorCenarioProjetado.regime
    };
  }

  /**
   * Gera um conjunto de projeções (10%, 20%, 30%)
   */
  async gerarProjecaoAnoSeguinte(): Promise<ProjecaoFutura[]> {
    return Promise.all([
      this.projetarCrescimento(10),
      this.projetarCrescimento(20),
      this.projetarCrescimento(30)
    ]);
  }
`;

  finalCode = finalCode.replace('  // M\u00E9todos auxiliares privados', methodProj + '\n  // M\u00E9todos auxiliares privados');
  
  // export function
  const functionExport = `
export async function gerarProjecao(dadosEmpresa: Partial<EmpresaModel>) {
  const twin = new DigitalTwinFiscal(dadosEmpresa);
  return twin.gerarProjecaoAnoSeguinte();
}
`;
  finalCode = finalCode + functionExport;
  
  fs.writeFileSync('lib/digital-twin.ts', finalCode);
  console.log('Project method injected.');
}

// In app/dashboard/clientes/[id]/page.tsx
let pageTsx = fs.readFileSync('app/dashboard/clientes/[id]/page.tsx', 'utf8');

const projecaoWeb = `
        {/* PROJEÇÃO TRIBUTÁRIA FUTURA */}
        {projecoes && projecoes.length > 0 && (
          <Card className="mb-6 border-indigo-100 shadow-sm">
            <CardHeader className="border-b bg-indigo-50/30 pb-4">
              <CardTitle className="text-xl flex items-center text-slate-800">
                <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                Planejamento Tributário Futuro (Projeção)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-4">O que acontece com os impostos se a empresa crescer?</p>
              <div className="grid md:grid-cols-3 gap-4">
                {projecoes.map((proj: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="font-bold text-lg text-slate-800 mb-1">Crescimento de {proj.percentualCrescimento}%</div>
                    <div className="text-sm text-slate-500 mb-3">Faturamento: R$ {proj.faturamentoProjetado.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
                    <div className="text-indigo-700 font-semibold mb-1">
                      Imposto: R$ {proj.impostoProjetado.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-xs text-slate-500 mb-3">
                      Carga efetiva projetada: {(proj.aliquotaEfetiva * 100).toFixed(1)}%<br/>
                      Melhor Regime: {proj.melhorRegime.replace('_', ' ')}
                    </div>
                    {proj.alertas.map((alerta: string, aIdx: number) => (
                      <div key={aIdx} className="bg-amber-100 text-amber-800 text-[11px] p-2 rounded mt-2 font-medium flex items-start">
                        <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                        {alerta}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
`;

pageTsx = pageTsx.replace(
  'const { id } = await params',
  'const { id } = await params'
);

// We need to fetch it in page.tsx
pageTsx = pageTsx.replace(
  'const todasSimulacoes = await digitalTwin.rodarTodasSimulacoes()',
  'const todasSimulacoes = await digitalTwin.rodarTodasSimulacoes()\n    var projecoes = await digitalTwin.gerarProjecaoAnoSeguinte()'
);

pageTsx = pageTsx.replace(
  'let simulacoes: any[] = []',
  'let simulacoes: any[] = []\n  let projecoes: any[] = []'
);

pageTsx = pageTsx.replace(
  'simulacoes = todosCenarios',
  'projecoes = await digitalTwin.gerarProjecaoAnoSeguinte()\n    simulacoes = todosCenarios'
);

pageTsx = pageTsx.replace(
  '{/* NOVA DRE COMPARATIVA DETALHADA */}',
  projecaoWeb + '\n        {/* NOVA DRE COMPARATIVA DETALHADA */}'
);

fs.writeFileSync('app/dashboard/clientes/[id]/page.tsx', pageTsx);

// Update PDF route
let pdfRoute = fs.readFileSync('app/api/pdf/[id]/route.ts', 'utf8');

pdfRoute = pdfRoute.replace(
  'const estrategias = await digitalTwin.detectingOportunidades()',
  'const estrategias = await digitalTwin.detectingOportunidades()\n    const projecoes = await digitalTwin.gerarProjecaoAnoSeguinte()'
);

const projecaoPdf = `
  <div class="section">
    <div class="section-title" style="border-color: #6366f1; color: #4338ca;">Planejamento Tributário Futuro (Projeção)</div>
    <p style="font-size: 14px; color: #475569; margin-bottom: 15px;">O que acontece com os impostos caso o faturamento da empresa cresça nos próximos 12 meses?</p>
    <div style="display: flex; gap: 15px;">
      \${projecoes.map(proj => \`
        <div style="flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: #f8fafc;">
          <div style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 5px;">Crescer \${proj.percentualCrescimento}%</div>
          <div style="font-size: 13px; color: #64748b; margin-bottom: 10px;">Faturamento: R$ \${proj.faturamentoProjetado.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
          
          <div style="font-weight: bold; color: #4338ca; font-size: 15px;">Imposto: R$ \${proj.impostoProjetado.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 10px;">Carga Efetiva: \${(proj.aliquotaEfetiva * 100).toFixed(1)}% | Regime ideal: \${proj.melhorRegime.replace('_', ' ')}</div>
          
          \${proj.alertas.map(alerta => \`
            <div style="background: #fef3c7; border-left: 3px solid #f59e0b; padding: 8px; font-size: 11px; color: #92400e; margin-top: 5px; font-weight: 500;">
              \${alerta}
            </div>
          \`).join('')}
        </div>
      \`).join('')}
    </div>
  </div>
`;

pdfRoute = pdfRoute.replace(
  '<div class="section">\n    <div class="section-title">Simula',
  projecaoPdf + '\n  <div class="section">\n    <div class="section-title">Simula'
);

fs.writeFileSync('app/api/pdf/[id]/route.ts', pdfRoute);

console.log('Projecting updated.');
