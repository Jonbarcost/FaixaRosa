# Espaço Faixa Rosa

Site de curadoria de beleza e cosméticos (React + Vite), monetizado via
**Amazon Associados** — programa de afiliados do usuário, tag `faixarosa-20`
(constante em `src/affiliate.js`). Público-alvo: predominantemente feminino.
Projeto novo, sem relação com o KZUUM (`Jonbarcost/codc-frontend`) — nasceu de
uma conversa sobre monetização do KZUUM que não deu certo (foco em app de
mensagens), e virou um projeto de afiliado separado.

## Por que não tem API da Amazon puxando produto automático
A Product Advertising API (PA-API 5.0) da Amazon só libera acesso depois que
o afiliado gera **3 vendas qualificadas em 180 dias** — sem isso, o acesso é
negado/revogado. Por isso a v1 é **curadoria manual**: produtos cadastrados à
mão em `src/data/products.js`, sem integração com nenhuma API da Amazon.
Isso também combina mais com a proposta de "espaço" boutique do que um
catálogo genérico raspado automaticamente.

## Cadastrando produto real
Cada item em `src/data/products.js` tem `{ id, name, category, image, price,
asin }`. O `asin` é o código do produto na URL da Amazon
(`amazon.com.br/dp/B0XXXXXXX`) — enquanto estiver vazio (`''`), o card mostra
"Em breve" em vez de um botão de compra funcional (ver `ProductCard.jsx`),
de propósito: evita mostrar um link quebrado/produto errado antes de alguém
confirmar o ASIN de verdade. `buildAmazonLink()` em `src/affiliate.js` monta
a URL final com a tag de afiliado.

## Estado atual
Todos os 10 produtos em `products.js` são **placeholders genéricos** (nomes
tipo "Hidratante facial de hidratação intensa", sem marca/preço/ASIN reais) —
servem só pra preencher o layout e mostrar a estrutura de categorias. Preciso
que o usuário (ou eu, com ele apontando produtos específicos) substitua por
produtos reais da Amazon antes do site ir ao ar de verdade.

## Identidade visual
Paleta rosa: `#FF6B9D` (destaque/botões), `#FFF7FA` (fundo), `#4A2532`
(texto principal), `#8C5468`/`#B23A63` (texto secundário/preço). Sem tema
escuro — é um site só, não um app com preferência de usuário.

## Categorias
Fixas em `src/data/categories.js`: Skincare, Maquiagem, Perfumaria, Cabelo,
Corpo & Banho. Filtro client-side simples em `App.jsx` (sem rota, sem
backend — tudo estático).

## Aviso legal obrigatório
O rodapé do site (`App.jsx`) tem a frase de disclosure exigida pelo programa
Amazon Associados ("Como Associado Amazon, o Espaço Faixa Rosa recebe uma
comissão...") — **não remover**, é requisito de operação do programa, não
frescura de compliance.

## Deploy
Site 100% estático (`npm run build` → `dist/`), sem backend. Publicado no
Vercel a partir deste repo, domínio `.vercel.app` por enquanto — o usuário
tem um domínio próprio (`soubarcos.com`, HostGator) que pode virar subdomínio
daqui se o projeto vingar, mas isso ainda não foi decidido.

## Gaps conhecidos
- Produtos são todos placeholder (ver "Estado atual" acima).
- Sem analytics/tracking de cliques além do que a Amazon já reporta no
  painel de Associados.
- Sem busca nem paginação — server assume poucas dezenas de produtos no
  máximo antes de precisar repensar a estrutura de dados.
