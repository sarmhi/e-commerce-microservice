import request from 'supertest';
import app from '../../app';
import Item from '../../models/item.model';
import { publishToQueue } from '../../events/rabbitmq';
import { logEvent } from '../../utils/logger';

jest.mock('../../models/item.model');
jest.mock('../../events/rabbitmq', () => ({
  publishToQueue: jest.fn(),
}));
jest.mock('../../utils/logger', () => ({
  logEvent: jest.fn(),
}));

describe('Inventory Service Integration Tests', () => {
  const mockItem = {
    _id: '123',
    name: 'Laptop',
    description: 'A powerful laptop',
    quantity: 10,
    price: 1200,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new item', async () => {
    (Item.create as jest.Mock).mockResolvedValue(mockItem);

    const response = await request(app).post('/api/items').send({
      name: 'Laptop',
      description: 'A powerful laptop',
      quantity: 10,
      price: 1200,
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Item created successfully');
    expect(response.body.data).toEqual(mockItem);
  });

  it('should update item stock', async () => {
    const updatedItem = { ...mockItem, quantity: 20 };

    (Item.findById as jest.Mock).mockResolvedValue({
      ...mockItem,
      save: jest.fn().mockResolvedValue(updatedItem),
    });

    (publishToQueue as jest.Mock).mockResolvedValue(undefined);

    (logEvent as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .patch(`/api/items/stock/${mockItem._id}`)
      .send({ quantity: 20 });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Stock updated successfully');
    expect(response.body.data.quantity).toBe(20);
  });

  it('should retrieve item stock', async () => {
    (Item.findById as jest.Mock).mockResolvedValue(mockItem);

    const response = await request(app).get(`/api/items/${mockItem._id}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Item retrieved successfully');
    expect(response.body.data).toEqual(mockItem);
  });

  it('should return 404 when item is not found', async () => {
    (Item.findById as jest.Mock).mockResolvedValue(null);

    const response = await request(app).get(`/api/items/999`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Item not found');
  });
});
