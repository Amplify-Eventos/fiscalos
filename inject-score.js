const fs = require('fs');

let pageTsx = fs.readFileSync('app/dashboard/clientes/[id]/page.tsx', 'utf8');

const dreMarker = '                        {/* NOVA DRE COMPARATIVA DETALHADA */}';

const newScoreBreakdown = `        {/* SCORE FISCAL COMPOSIÇÃO */}
        {diagnostico && diagnostico.score && (
          <Card className="mb-6 border-blue-100 shadow-sm">
            <CardHeader className="border-b bg-blue-50/30 pb-4">
              <CardTitle className="text-xl flex items-center text-slate-800">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                Composição do Score Fiscal ({diagnostico.score.score}/100)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {diagnostico.score.fatores.map((fator: any, idx: number) => (
                  <div key={idx} className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-full md:w-1/3">
                      <p className="font-semibold text-slate-700 text-sm">{fator.fator}</p>
                      <p className="text-xs text-slate-500">{fator.observacao}</p>
                    </div>
                    <div className="w-full md:w-2/3 flex items-center gap-4">
                      <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={\`h-2.5 rounded-full \${
                            fator.nota >= 80 ? 'bg-green-500' :
                            fator.nota >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }\`} 
                          style={{ width: \`\${Math.min(fator.nota, 100)}%\` }}
                        ></div>
                      </div>
                      <div className="w-12 text-right">
                        <span className={\`text-sm font-bold \${
                            fator.nota >= 80 ? 'text-green-600' :
                            fator.nota >= 50 ? 'text-amber-600' : 'text-red-600'
                          }\`}>
                          {fator.nota}
                        </span>
                        <span className="text-xs text-slate-400">/100</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

`;

pageTsx = pageTsx.replace(dreMarker, newScoreBreakdown + dreMarker);
fs.writeFileSync('app/dashboard/clientes/[id]/page.tsx', pageTsx);

// Agora atualizar a route.ts do PDF
let pdfRoute = fs.readFileSync('app/api/pdf/[id]/route.ts', 'utf8');

const pdfScoreDetails = `
      <div class="score-metrics">
        <div>
          <div class="metric-label">Risco Fiscal</div>
          <div class="metric-value" style="color: \${diagnostico.riscoFiscal === 'BAIXO' ? '#16a34a' : '#dc2626'}">\${diagnostico.riscoFiscal}</div>
        </div>
        <div>
          <div class="metric-label">Eficiência</div>
          <div class="metric-value">\${diagnostico.eficienciaTributaria}</div>
        </div>
        <div>
          <div class="metric-label">Potencial Economia</div>
          <div class="metric-value">\${diagnostico.potencialEconomia}</div>
        </div>
      </div>
    </div>
  </div>`;

const newPdfScoreDetails = `
      <div class="score-metrics">
        <div>
          <div class="metric-label">Risco Fiscal</div>
          <div class="metric-value" style="color: \${diagnostico.riscoFiscal === 'BAIXO' ? '#16a34a' : '#dc2626'}">\${diagnostico.riscoFiscal}</div>
        </div>
        <div>
          <div class="metric-label">Eficiência</div>
          <div class="metric-value">\${diagnostico.eficienciaTributaria}</div>
        </div>
        <div>
          <div class="metric-label">Potencial Economia</div>
          <div class="metric-value">\${diagnostico.potencialEconomia}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="section" style="margin-top: -10px;">
    <div class="section-title">Composição do Score Fiscal</div>
    <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
      \${diagnostico.score.fatores.map(fator => \`
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="font-weight: bold; font-size: 13px; color: #334155;">\${fator.fator}</span>
            <span style="font-size: 13px; font-weight: bold; color: \${fator.nota >= 80 ? '#16a34a' : fator.nota >= 50 ? '#b45309' : '#dc2626'}">\${fator.nota}/100</span>
          </div>
          <div style="width: 100%; background: #f1f5f9; border-radius: 4px; height: 6px; overflow: hidden; margin-bottom: 4px;">
            <div style="height: 6px; background: \${fator.nota >= 80 ? '#22c55e' : fator.nota >= 50 ? '#f59e0b' : '#ef4444'}; width: \${Math.min(fator.nota, 100)}%;"></div>
          </div>
          <div style="font-size: 11px; color: #64748b;">\${fator.observacao}</div>
        </div>
      \`).join('')}
    </div>
  </div>`;

// Fazer substituição
pdfRoute = pdfRoute.replace(pdfScoreDetails, newPdfScoreDetails);
fs.writeFileSync('app/api/pdf/[id]/route.ts', pdfRoute);

console.log('Feito.');
