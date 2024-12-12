import request from 'supertest';

const INVENTORY_API = 'http://localhost:3001/api';
const ORDER_API = 'http://localhost:3002/api';

describe('E2E Test: Order Workflow', () => {
  let itemId: string;

  it('should add a new item to inventory', async () => {
    const res = await request(INVENTORY_API).post('/items').send({
      name: 'Smartphone',
      description: 'High-end smartphone',
      quantity: 50,
      price: 999,
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Item created successfully');
    itemId = res.body.data._id;
  });

  it('should create a new order', async () => {
    const res = await request(ORDER_API).post('/orders').send({
      itemId,
      quantity: 5,
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Order created successfully');
    expect(res.body.data.quantity).toBe(5);
  });

  it('should verify inventory stock is updated', async () => {
    const res = await request(INVENTORY_API).get(`/items/${itemId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.quantity).toBe(45); // 50 - 5 = 45
  });
});
