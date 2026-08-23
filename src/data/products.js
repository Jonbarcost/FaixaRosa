// Cada produto vira um card. "asin" é o código do produto na Amazon
// (visível na URL, ex: amazon.com.br/dp/B0XXXXXXX) — enquanto estiver vazio,
// o card mostra "Em breve" em vez do botão de compra.
//
// Sem preço fixo de propósito: as regras do Programa de Associados da Amazon
// não permitem exibir preço estático (só via Product Advertising API, que só
// libera depois de 3 vendas qualificadas) — o botão já leva pro preço real e
// atualizado na própria página do produto.
export const PRODUCTS = [
  { id: 'p1', name: 'NIVEA Creme Facial Noturno Ultraleve 7 em 1, 100g', category: 'skincare', image: '', price: '', asin: 'B07Y2BBP72' },
  { id: 'p2', name: 'Bepantol Derma Hidratante Facial Toque Seco, 30g', category: 'skincare', image: '', price: '', asin: 'B07Y38NFPS' },
  { id: 'p3', name: 'Base Líquida Maybelline Fit Me Efeito Matte, 30ml', category: 'maquiagem', image: '', price: '', asin: 'B07NX6YF5B' },
  { id: 'p4', name: 'Máscara de Cílios Maybelline Colossal Lavável, 8ml', category: 'maquiagem', image: '', price: '', asin: 'B077BY5B8Q' },
  { id: 'p5', name: 'Egeo Dolce Woman Desodorante Colônia, 90ml', category: 'perfumaria', image: '', price: '', asin: 'B07FB5J47H' },
  { id: 'p6', name: 'O Boticário Floratta Red Body Splash, 200ml', category: 'perfumaria', image: '', price: '', asin: 'B0CDCQ1SKQ' },
  { id: 'p7', name: 'TRESemmé Shampoo Hidratação Profunda, 400ml', category: 'cabelo', image: '', price: '', asin: 'B07DTLVYQ1' },
  { id: 'p8', name: 'Lola Cosmetics Argan Óleo Reparador, 50ml', category: 'cabelo', image: '', price: '', asin: 'B07SBXMSGB' },
  { id: 'p9', name: 'NIVEA Hidratante Corporal Cuida & Repara, 400ml', category: 'corpo-banho', image: '', price: '', asin: 'B0DPJJTFP6' },
  { id: 'p10', name: 'Sabonete Líquido Perfumado Corporal Una Senses, 80ml', category: 'corpo-banho', image: '', price: '', asin: 'B0DQR8MDCB' },
];
