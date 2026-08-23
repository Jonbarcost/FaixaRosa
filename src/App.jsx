import { useMemo, useState } from 'react';
import { CATEGORIES } from './data/categories';
import { PRODUCTS } from './data/products';
import ProductCard from './components/ProductCard';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('todos');

  const filtered = useMemo(() => {
    if (activeCategory === 'todos') return PRODUCTS;
    return PRODUCTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <div style={styles.page}>
      <header style={styles.hero}>
        <p style={styles.eyebrow}>ESPAÇO</p>
        <h1 style={styles.logo}>Faixa Rosa</h1>
        <p style={styles.tagline}>
          Curadoria de beleza e cosméticos — skincare, maquiagem, perfumaria e
          cabelo, com os achados que a gente realmente usaria.
        </p>
      </header>

      <nav style={styles.nav}>
        <button
          onClick={() => setActiveCategory('todos')}
          style={activeCategory === 'todos' ? styles.navButtonActive : styles.navButton}
        >
          Todos
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            style={activeCategory === c.id ? styles.navButtonActive : styles.navButton}
          >
            {c.label}
          </button>
        ))}
      </nav>

      <main style={styles.grid}>
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </main>

      <footer style={styles.footer}>
        <p style={styles.disclosure}>
          Como Associado Amazon, o Espaço Faixa Rosa recebe uma comissão por
          compras qualificadas feitas através dos links deste site.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#FFF7FA',
    color: '#4A2532',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  hero: {
    textAlign: 'center',
    padding: '56px 20px 32px',
  },
  eyebrow: {
    margin: 0,
    letterSpacing: 4,
    fontSize: 12,
    fontWeight: 700,
    color: '#B23A63',
  },
  logo: {
    margin: '4px 0 12px',
    fontSize: 40,
    fontWeight: 800,
    color: '#FF6B9D',
  },
  tagline: {
    margin: '0 auto',
    maxWidth: 480,
    fontSize: 15,
    lineHeight: 1.5,
    color: '#8C5468',
  },
  nav: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    padding: '0 20px 32px',
  },
  navButton: {
    border: '1px solid #F3D9E2',
    background: '#FFFFFF',
    color: '#8C5468',
    fontSize: 13,
    fontWeight: 600,
    padding: '8px 16px',
    borderRadius: 999,
    cursor: 'pointer',
  },
  navButtonActive: {
    border: '1px solid #FF6B9D',
    background: '#FF6B9D',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 600,
    padding: '8px 16px',
    borderRadius: 999,
    cursor: 'pointer',
  },
  grid: {
    maxWidth: 1080,
    margin: '0 auto',
    padding: '0 20px 48px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 18,
  },
  footer: {
    padding: '24px 20px 40px',
    textAlign: 'center',
  },
  disclosure: {
    margin: '0 auto',
    maxWidth: 520,
    fontSize: 12,
    color: '#B48294',
    lineHeight: 1.5,
  },
};
