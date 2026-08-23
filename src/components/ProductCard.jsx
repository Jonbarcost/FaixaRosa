import { buildAmazonLink } from '../affiliate';

export default function ProductCard({ product }) {
  const link = buildAmazonLink(product.asin);

  return (
    <div style={styles.card}>
      <div style={styles.imageWrap}>
        {product.image ? (
          <img src={product.image} alt={product.name} style={styles.image} />
        ) : (
          <div style={styles.imagePlaceholder}>🌸</div>
        )}
      </div>
      <div style={styles.body}>
        <p style={styles.name}>{product.name}</p>
        {product.price && <p style={styles.price}>{product.price}</p>}
        {link ? (
          <a href={link} target="_blank" rel="noopener sponsored noreferrer" style={styles.buyButton}>
            Ver na Amazon
          </a>
        ) : (
          <span style={styles.comingSoon}>Em breve</span>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 16,
    overflow: 'hidden',
    background: '#FFFFFF',
    boxShadow: '0 2px 10px rgba(255, 107, 157, 0.12)',
  },
  imageWrap: {
    aspectRatio: '1 / 1',
    background: 'linear-gradient(135deg, #FFE3EE, #FFF0F5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imagePlaceholder: {
    fontSize: 40,
  },
  body: {
    padding: '14px 16px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  name: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    color: '#4A2532',
    lineHeight: 1.35,
  },
  price: {
    margin: 0,
    fontSize: 13,
    color: '#B23A63',
    fontWeight: 700,
  },
  buyButton: {
    marginTop: 4,
    display: 'inline-block',
    textAlign: 'center',
    background: '#FF6B9D',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 600,
    padding: '9px 14px',
    borderRadius: 999,
    textDecoration: 'none',
  },
  comingSoon: {
    marginTop: 4,
    display: 'inline-block',
    textAlign: 'center',
    background: '#F3D9E2',
    color: '#8C5468',
    fontSize: 13,
    fontWeight: 600,
    padding: '9px 14px',
    borderRadius: 999,
  },
};
