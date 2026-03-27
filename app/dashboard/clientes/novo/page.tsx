"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  DollarSign,
  Users,
  Receipt,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  MapPin,
} from "lucide-react";

interface Municipio {
  id: string;
  ibgeCode: string;
  cityName: string;
  stateCode: string;
  issRate: number;
}

const STEPS = [
  { id: 1, name: "Dados Jurídicos", icon: Building2 },
  { id: 2, name: "Financeiro", icon: DollarSign },
  { id: 3, name: "Custos", icon: Users },
  { id: 4, name: "Fiscal Atual", icon: Receipt },
];

export default function NovoClientePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);

  // Carregar municípios ao montar
  useEffect(() => {
    async function carregarMunicipios() {
      try {
        const res = await fetch("/api/municipios");
        const data = await res.json();
        setMunicipios(data);
      } catch (error) {
        console.error("Erro ao carregar municípios:", error);
      }
    }
    carregarMunicipios();
  }, []);

  const [formData, setFormData] = useState({
    // Dados Jurídicos
    cnpj: "",
    companyName: "",
    fantasyName: "",
    openingDate: "",
    legalNature: "LTDA",
    companySize: "ME",
    taxRegime: "SIMPLES_NACIONAL",
    simplesOpt: true,
    // Atividade Econômica
    cnaeMain: "",
    cnaeSecondary: "",
    activityDesc: "",
    revenueType: "SERVICOS",
    // Localização
    municipioIBGE: "3550308", // São Paulo por padrão
    // Financeiro
    revenueServicos: "",
    revenueComercio: "",
    revenueLocacao: "",
    revenueOutros: "",
    ticketMedio: "",
    clientCount: "",
    // Custos
    payrollLast12m: "",
    rentExpense: "",
    supplierExpense: "",
    marketingExpense: "",
    adminExpense: "",
    // Trabalhistas
    employeesCount: "",
    totalSalary: "",
    proLabore: "",
    benefits: "",
    // Fiscal Atual
    currentDAS: "",
    currentIRPJ: "",
    currentCSLL: "",
    currentPIS: "",
    currentCOFINS: "",
    currentISS: "",
    currentINSS: "",
  });

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          revenueLast12m:
            parseFloat(formData.revenueServicos || "0") +
            parseFloat(formData.revenueComercio || "0") +
            parseFloat(formData.revenueLocacao || "0") +
            parseFloat(formData.revenueOutros || "0"),
          employeesCount: parseInt(formData.employeesCount || "0"),
          payrollLast12m: parseFloat(formData.payrollLast12m || "0"),
        }),
      });

      if (response.ok) {
        const client = await response.json();
        router.push(`/dashboard/clientes/${client.id}`);
      } else {
        alert("Erro ao cadastrar cliente");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar cliente");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Dados Jurídicos da Empresa
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0001-00"
                  value={formData.cnpj}
                  onChange={(e) => updateFormData("cnpj", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="openingDate">Data de Abertura</Label>
                <Input
                  id="openingDate"
                  type="date"
                  value={formData.openingDate}
                  onChange={(e) =>
                    updateFormData("openingDate", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Razão Social</Label>
              <Input
                id="companyName"
                placeholder="Empresa Exemplo Ltda"
                value={formData.companyName}
                onChange={(e) => updateFormData("companyName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fantasyName">Nome Fantasia</Label>
              <Input
                id="fantasyName"
                placeholder="Nome Fantasia"
                value={formData.fantasyName}
                onChange={(e) => updateFormData("fantasyName", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="legalNature">Natureza Jurídica</Label>
                <select
                  id="legalNature"
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.legalNature}
                  onChange={(e) =>
                    updateFormData("legalNature", e.target.value)
                  }
                >
                  <option value="LTDA">LTDA</option>
                  <option value="SLU">SLU</option>
                  <option value="MEI">MEI</option>
                  <option value="EI">EI</option>
                  <option value="SA">S.A.</option>
                  <option value="EIRELI">EIRELI</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companySize">Porte</Label>
                <select
                  id="companySize"
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.companySize}
                  onChange={(e) =>
                    updateFormData("companySize", e.target.value)
                  }
                >
                  <option value="ME">ME - Microempresa</option>
                  <option value="EPP">EPP - Empresa de Pequeno Porte</option>
                  <option value="DEMAIS">Demais</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxRegime">Regime Tributário Atual</Label>
                <select
                  id="taxRegime"
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.taxRegime}
                  onChange={(e) => updateFormData("taxRegime", e.target.value)}
                >
                  <option value="SIMPLES_NACIONAL">Simples Nacional</option>
                  <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
                  <option value="LUCRO_REAL">Lucro Real</option>
                  <option value="MEI">MEI</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="simplesOpt">Opção pelo Simples</Label>
                <select
                  id="simplesOpt"
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.simplesOpt ? "sim" : "nao"}
                  onChange={(e) =>
                    updateFormData("simplesOpt", e.target.value === "sim")
                  }
                >
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnaeMain">CNAE Principal</Label>
                <Input
                  id="cnaeMain"
                  placeholder="0000-0/00"
                  value={formData.cnaeMain}
                  onChange={(e) => updateFormData("cnaeMain", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnaeSecondary">CNAEs Secundários</Label>
                <Input
                  id="cnaeSecondary"
                  placeholder="Separar por vírgula"
                  value={formData.cnaeSecondary}
                  onChange={(e) =>
                    updateFormData("cnaeSecondary", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenueType">Tipo Principal de Receita</Label>
              <select
                id="revenueType"
                className="w-full border rounded-md px-3 py-2"
                value={formData.revenueType}
                onChange={(e) => updateFormData("revenueType", e.target.value)}
              >
                <option value="SERVICOS">Serviços</option>
                <option value="COMERCIO">Comércio</option>
                <option value="INDUSTRIA">Indústria</option>
                <option value="LOCACAO">Locação</option>
                <option value="MISTO">Misto</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityDesc">Descrição da Atividade</Label>
              <Input
                id="activityDesc"
                placeholder="Descreva as atividades principais da empresa"
                value={formData.activityDesc}
                onChange={(e) => updateFormData("activityDesc", e.target.value)}
              />
            </div>

            {/* Localização */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-md font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Localização
              </h4>

              <div className="space-y-2">
                <Label htmlFor="municipioIBGE">Município *</Label>
                <select
                  id="municipioIBGE"
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.municipioIBGE}
                  onChange={(e) =>
                    updateFormData("municipioIBGE", e.target.value)
                  }
                  required
                >
                  <option value="">Selecione o município</option>
                  {municipios.map((m) => (
                    <option key={m.ibgeCode} value={m.ibgeCode}>
                      {m.cityName} - {m.stateCode} (ISS:{" "}
                      {(m.issRate * 100).toFixed(1)}%)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">
                  O ISS varia de 2% a 5% conforme o município. Escolha o correto
                  para cálculos precisos.
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Dados Financeiros (Últimos 12 meses)
            </h3>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Dica:</strong> Separe sua receita por tipo de
                atividade para um cálculo mais preciso dos impostos.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="revenueServicos">Receita Serviços (R$)</Label>
                <Input
                  id="revenueServicos"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.revenueServicos}
                  onChange={(e) =>
                    updateFormData("revenueServicos", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenueComercio">Receita Comércio (R$)</Label>
                <Input
                  id="revenueComercio"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.revenueComercio}
                  onChange={(e) =>
                    updateFormData("revenueComercio", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="revenueLocacao">Receita Locação (R$)</Label>
                <Input
                  id="revenueLocacao"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.revenueLocacao}
                  onChange={(e) =>
                    updateFormData("revenueLocacao", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenueOutros">Outras Receitas (R$)</Label>
                <Input
                  id="revenueOutros"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.revenueOutros}
                  onChange={(e) =>
                    updateFormData("revenueOutros", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="bg-slate-100 rounded-lg p-4 mt-4">
              <p className="text-sm text-slate-600">
                <strong>Faturamento Total 12 meses:</strong> R${" "}
                {(
                  parseFloat(formData.revenueServicos || "0") +
                  parseFloat(formData.revenueComercio || "0") +
                  parseFloat(formData.revenueLocacao || "0") +
                  parseFloat(formData.revenueOutros || "0")
                ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="ticketMedio">Ticket Médio (R$)</Label>
                <Input
                  id="ticketMedio"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.ticketMedio}
                  onChange={(e) =>
                    updateFormData("ticketMedio", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientCount">Número de Clientes</Label>
                <Input
                  id="clientCount"
                  type="number"
                  placeholder="0"
                  value={formData.clientCount}
                  onChange={(e) =>
                    updateFormData("clientCount", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Custos e Dados Trabalhistas
            </h3>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800">
                ⚠️ <strong>Importante:</strong> A folha de pagamento é essencial
                para calcular o Fator R e o INSS.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payrollLast12m">
                Folha de Pagamento 12 meses (R$) *
              </Label>
              <Input
                id="payrollLast12m"
                type="number"
                step="0.01"
                placeholder="Inclua salários + pró-labore"
                value={formData.payrollLast12m}
                onChange={(e) =>
                  updateFormData("payrollLast12m", e.target.value)
                }
                required
              />
              <p className="text-xs text-slate-500">
                Salários + Pró-labore + Encargos
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeesCount">Número de Funcionários</Label>
                <Input
                  id="employeesCount"
                  type="number"
                  placeholder="0"
                  value={formData.employeesCount}
                  onChange={(e) =>
                    updateFormData("employeesCount", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalSalary">Total Salários Mensal (R$)</Label>
                <Input
                  id="totalSalary"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.totalSalary}
                  onChange={(e) =>
                    updateFormData("totalSalary", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proLabore">Pró-labore Mensal (R$)</Label>
                <Input
                  id="proLabore"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.proLabore}
                  onChange={(e) => updateFormData("proLabore", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="benefits">Benefícios Mensal (R$)</Label>
                <Input
                  id="benefits"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.benefits}
                  onChange={(e) => updateFormData("benefits", e.target.value)}
                />
              </div>
            </div>

            <hr className="my-6" />

            <h4 className="font-semibold text-slate-700">
              Outros Custos (Mensal)
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rentExpense">Aluguel (R$)</Label>
                <Input
                  id="rentExpense"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.rentExpense}
                  onChange={(e) =>
                    updateFormData("rentExpense", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierExpense">Fornecedores (R$)</Label>
                <Input
                  id="supplierExpense"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.supplierExpense}
                  onChange={(e) =>
                    updateFormData("supplierExpense", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marketingExpense">Marketing (R$)</Label>
                <Input
                  id="marketingExpense"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.marketingExpense}
                  onChange={(e) =>
                    updateFormData("marketingExpense", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminExpense">
                  Despesas Administrativas (R$)
                </Label>
                <Input
                  id="adminExpense"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.adminExpense}
                  onChange={(e) =>
                    updateFormData("adminExpense", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Dados Fiscais Atuais
            </h3>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800">
                💡 <strong>Por que pedimos isso?</strong> Para comparar o que
                você paga vs o que deveria pagar e identificar economia.
              </p>
            </div>

            <h4 className="font-semibold text-slate-700">
              Impostos Mensais Atuais
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentDAS">DAS - Simples Nacional (R$)</Label>
                <Input
                  id="currentDAS"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.currentDAS}
                  onChange={(e) => updateFormData("currentDAS", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentISS">ISS (R$)</Label>
                <Input
                  id="currentISS"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.currentISS}
                  onChange={(e) => updateFormData("currentISS", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentIRPJ">IRPJ (R$)</Label>
                <Input
                  id="currentIRPJ"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.currentIRPJ}
                  onChange={(e) =>
                    updateFormData("currentIRPJ", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentCSLL">CSLL (R$)</Label>
                <Input
                  id="currentCSLL"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.currentCSLL}
                  onChange={(e) =>
                    updateFormData("currentCSLL", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPIS">PIS (R$)</Label>
                <Input
                  id="currentPIS"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.currentPIS}
                  onChange={(e) => updateFormData("currentPIS", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentCOFINS">COFINS (R$)</Label>
                <Input
                  id="currentCOFINS"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.currentCOFINS}
                  onChange={(e) =>
                    updateFormData("currentCOFINS", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentINSS">INSS Patronal (R$)</Label>
              <Input
                id="currentINSS"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.currentINSS}
                onChange={(e) => updateFormData("currentINSS", e.target.value)}
              />
            </div>

            <div className="bg-slate-100 rounded-lg p-4 mt-4">
              <p className="text-sm text-slate-600">
                <strong>Total Impostos Mensais:</strong> R${" "}
                {(
                  parseFloat(formData.currentDAS || "0") +
                  parseFloat(formData.currentISS || "0") +
                  parseFloat(formData.currentIRPJ || "0") +
                  parseFloat(formData.currentCSLL || "0") +
                  parseFloat(formData.currentPIS || "0") +
                  parseFloat(formData.currentCOFINS || "0") +
                  parseFloat(formData.currentINSS || "0")
                ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Cadastrar Novo Cliente
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-slate-300 text-slate-400"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p
                    className={`text-sm font-medium ${currentStep >= step.id ? "text-blue-600" : "text-slate-400"}`}
                  >
                    {step.name}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-12 sm:w-24 h-0.5 mx-2 ${currentStep > step.id ? "bg-blue-600" : "bg-slate-200"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardContent className="py-6">
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                >
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    !formData.cnpj ||
                    !formData.companyName ||
                    !formData.payrollLast12m ||
                    !formData.issAliquota
                  }
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Finalizar Cadastro
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
