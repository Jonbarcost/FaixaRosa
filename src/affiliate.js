export const AMAZON_ASSOCIATE_TAG = 'faixarosa-20';

export function buildAmazonLink(asin) {
  if (!asin) return null;
  return `https://www.amazon.com.br/dp/${asin}?tag=${AMAZON_ASSOCIATE_TAG}`;
}
