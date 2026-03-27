const fs = require('fs');

let code = fs.readFileSync('app/dashboard/clientes/novo/page.tsx', 'utf8');

// Add issAliquota to formData initialization
const formDataInit = `      // Localização
      municipioIBGE: '3550308', // São Paulo por padrão
      // Financeiro
      revenueServicos: '',
      revenueComercio: '',
      revenueLocacao: '',
      revenueOutros: '',
      ticketMedio: '',
      clientCount: '',
      // Custos
      payrollLast12m: '',
      rentExpense: '',
      supplierExpense: '',
      marketingExpense: '',
      adminExpense: '',
      // Trabalhistas
      employeesCount: '',
      preLabor: '',
      benefitsValue: '',
      // Dados Fiscais
      currentDAS: '',
      currentISS: '',
      currentIRPJ: '',
      currentCSLL: '',
      currentPIS: '',
      currentCOFINS: '',
      currentINSS: '',
      // Nova alíquota ISS
      issAliquota: '5.0',`;

code = code.replace(/      \/\/ Localiza��ǜo\s+      municipioIBGE: '3550308',/s, formDataInit);

// Add issAliquota to form submission
const bodyPayload = `            ...formData,
            revenueLast12m: (
              parseFloat(formData.revenueServicos || '0') +
              parseFloat(formData.revenueComercio || '0') +
              parseFloat(formData.revenueLocacao || '0') +
              parseFloat(formData.revenueOutros || '0')
            ),
            employeesCount: parseInt(formData.employeesCount || '0'),
            payrollLast12m: parseFloat(formData.payrollLast12m || '0'),
            issAliquota: parseFloat(formData.issAliquota || '5.0'),`;

code = code.replace(/            payrollLast12m: parseFloat\(formData\.payrollLast12m \|\| '0'\),/, bodyPayload);

// Add the field to the form UI
const issField = `              {/* Alíquota ISS */}
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-md font-semibold text-slate-700 mb-3">Informações Tributárias</h4>
                <div className="space-y-2">
                  <Label htmlFor="issAliquota">Alíquota de ISS (%) *</Label>
                  <Input
                    id="issAliquota"
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    placeholder="Ex: 5.0"
                    value={formData.issAliquota}
                    onChange={(e) => updateFormData('issAliquota', e.target.value)}
                    required
                  />
                  <p className="text-xs text-slate-500">Informe a alíquota de ISS aplicável aos serviços desta empresa</p>
                </div>
              </div>

              {/* Localização */}`;

code = code.replace(/              <\s*\/\s*>\s*\s*\s*<div className="mt-6 pt-6 border-t">\s*\s*<h4 className="text-md font-semibold text-slate-700 mb-4 flex items-center gap-2">\s*\s*<MapPin className="w-4 h-4" \/>/s, issField);

// Update form validation
const validation = `            disabled={loading || !formData.cnpj || !formData.companyName || !formData.payrollLast12m || !formData.issAliquota}`;

code = code.replace(/            disabled={loading \|\| !formData\.cnpj \|\| !formData\.companyName \|\| !formData\.payrollLast12m}/, validation);

fs.writeFileSync('app/dashboard/clientes/novo/page.tsx', code);
console.log('Added ISS field to client form');
