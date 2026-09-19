const FEATURES = [
  {
    title: "Loja pronta, sem restrição de produto",
    body: "Vitrine, carrinho e checkout específicos para moda íntima e bem-estar sexual — sem o risco de a plataforma genérica banir sua conta por causa do catálogo.",
  },
  {
    title: "Age-gate e embalagem discreta por padrão",
    body: "Confirmação de maioridade na vitrine e opção de envio discreto já vêm ligadas — não é algo que o lojista precisa configurar do zero.",
  },
  {
    title: "Gateway de pagamento plugável",
    body: "A cobrança roda hoje em modo sandbox enquanto validamos a adquirente de alto risco; a troca para o provedor definitivo é uma configuração, não uma reescrita do checkout.",
  },
];

export default function MarketingHome() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm uppercase tracking-wide text-brand-accentSoft">
        Plataforma para lojistas
      </p>
      <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
        Sua loja de moda íntima e sexshop, sem depender de plataforma
        genérica que restringe seu produto.
      </h1>
      <p className="mt-4 max-w-2xl text-brand-muted">
        Cada lojista tem sua própria vitrine, catálogo e painel de pedidos.
        Você assina um plano da plataforma; a Assinatura Rosa (nome
        provisório) cuida da infraestrutura.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="rounded-lg bg-brand-surface p-5">
            <h2 className="font-medium text-brand-text">{feature.title}</h2>
            <p className="mt-2 text-sm text-brand-muted">{feature.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-brand-muted/30 p-5 text-sm text-brand-muted">
        <strong className="text-brand-text">Status do projeto:</strong> MVP em
        desenvolvimento. Pagamento roda em modo de teste (sandbox) até
        fecharmos contrato com uma adquirente de alto risco — ver{" "}
        <code className="text-brand-accentSoft">src/lib/payments/README.md</code>.
      </div>
    </main>
  );
}
