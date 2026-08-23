# Espaço Faixa Rosa

Site de curadoria de beleza e cosméticos (skincare, maquiagem, perfumaria,
cabelo, corpo & banho), monetizado via Amazon Associados — cada produto linka
pro item na Amazon com a tag de afiliado (`faixarosa-20`), e a comissão vem
das compras feitas através desses links.

## Rodando localmente

```bash
npm install
npm run dev
```

## Cadastrando produtos reais

Edite `src/data/products.js`. Cada produto precisa do `asin` (o código do
produto na Amazon, visível na URL: `amazon.com.br/dp/B0XXXXXXX`) — sem isso,
o card aparece com "Em breve" em vez de um link de compra.

## Deploy

Publicado no Vercel a partir deste repositório (build: `npm run build`,
saída em `dist/`).
