const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');

jest.mock('../src/db', () => ({
  query: jest.fn()
}));

const fakeProducts = [
  { id: 1, name: 'Guide Docker', description: 'Support pédagogique', price_cents: 1900, stock: 20 },
  { id: 2, name: 'Guide CI/CD', description: 'Pipelines GitHub Actions', price_cents: 2400, stock: 5 }
];

describe('GET /products', () => {
  it('returns 200 with a list of products', async () => {
    pool.query.mockResolvedValueOnce({ rows: fakeProducts });

    const response = await request(app).get('/products');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);
  });

  it('each product has the required fields', async () => {
    pool.query.mockResolvedValueOnce({ rows: fakeProducts });

    const response = await request(app).get('/products');

    response.body.forEach(product => {
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price_cents');
      expect(product).toHaveProperty('stock');
    });
  });

  it('returns 500 when the database fails', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB connection lost'));

    const response = await request(app).get('/products');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
  });
});
