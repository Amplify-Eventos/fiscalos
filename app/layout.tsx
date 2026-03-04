import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FiscalOS - Planejamento Fiscal Inteligente",
  description: "Onde contadores transformam horas de trabalho em minutos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
