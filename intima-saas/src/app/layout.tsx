import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plataforma para lojas de moda íntima e sexshop",
  description:
    "SaaS multi-tenant para lojistas de moda íntima e bem-estar sexual venderem online.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-brand-bg text-brand-text">{children}</body>
    </html>
  );
}
