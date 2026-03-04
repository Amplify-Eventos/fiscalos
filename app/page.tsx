import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calculator, Users, FileText, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">FiscalOS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button>Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Zap className="h-4 w-4" />
          Reduza horas de trabalho para minutos
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
          Planejamento Fiscal
          <span className="text-blue-600 block">Automatizado</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          Gere relatórios profissionais de planejamento tributário em minutos. 
          Compare regimes fiscais, calcule economias e encante seus clientes.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/cadastro">
            <Button size="lg" className="text-lg px-8">
              Criar Conta Grátis
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Fazer Login
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
          Tudo que você precisa em um só lugar
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Calculator className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Cálculo Automático
            </h3>
            <p className="text-slate-600">
              Compare Simples Nacional, Lucro Presumido e identifique a melhor opção automaticamente.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Relatórios Profissionais
            </h3>
            <p className="text-slate-600">
              Gere PDFs prontos para apresentar aos seus clientes com sua marca.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Gestão de Clientes
            </h3>
            <p className="text-slate-600">
              Organize todos os seus clientes e seus planejamentos em um só lugar.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para otimizar seu tempo?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Comece gratuitamente e transforme sua rotina de trabalho.
          </p>
          <Link href="/cadastro">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Começar Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-slate-600">
          <p>© 2024 FiscalOS. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
