import request from 'supertest';
import app from '../../app';
import axios from 'axios';
import Order from '../../models/order.model';

jest.mock('axios'); // Mock axios for external Inventory Service calls
jest.mock('../../models/order.model'); // Mock Mongoose Order model
jest.mock('../../events/rabbitmq', () => ({
  publishToQueue: jest.fn(),
}));

describe('Order Service Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/orders - Create Order', () => {
    it('should create an order successfully', async () => {
      // Mock Inventory Service response
      (axios.get as jest.Mock).mockResolvedValue({
        data: { data: { _id: 'item123', quantity: 10 } },
      });

      // Mock Inventory stock update
      (axios.patch as jest.Mock).mockResolvedValue({});

      // Mock Order creation
      (Order.create as jest.Mock).mockResolvedValue({
        _id: 'order123',
        itemId: 'item123',
        quantity: 2,
        status: 'completed',
      });

      const response = await request(app).post('/api/orders').send({
        itemId: 'item123',
        quantity: 2,
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Order created successfully');
      expect(response.body.data).toEqual({
        _id: 'order123',
        itemId: 'item123',
        quantity: 2,
        status: 'completed',
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/items/item123')
      );
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/api/items/stock/item123'),
        { quantity: 8 }
      );
      expect(Order.create).toHaveBeenCalled();
    });

    it('should return 400 if stock is insufficient', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: { data: { _id: 'item123', quantity: 1 } },
      });

      const response = await request(app).post('/api/orders').send({
        itemId: 'item123',
        quantity: 2,
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Insufficient stock for this item');
      expect(Order.create).not.toHaveBeenCalled();
    });

    it('should return 404 if item is not found', async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: { data: null } });

      const response = await request(app).post('/api/orders').send({
        itemId: 'item123',
        quantity: 2,
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Item not found');
      expect(Order.create).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs', async () => {
      (axios.get as jest.Mock).mockRejectedValue(
        new Error('Inventory API failed')
      );

      const response = await request(app).post('/api/orders').send({
        itemId: 'item123',
        quantity: 2,
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error creating order');
    });
  });

  describe('GET /api/orders/:orderId - Retrieve Order', () => {
    it('should retrieve an order successfully', async () => {
      (Order.findById as jest.Mock).mockResolvedValue({
        _id: 'order123',
        itemId: 'item123',
        quantity: 2,
        status: 'completed',
      });

      const response = await request(app).get('/api/orders/order123');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Order retrieved successfully');
      expect(response.body.data).toEqual({
        _id: 'order123',
        itemId: 'item123',
        quantity: 2,
        status: 'completed',
      });
      expect(Order.findById).toHaveBeenCalledWith('order123');
    });

    it('should return 404 if order is not found', async () => {
      (Order.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/orders/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Order not found');
    });
  });

  describe('GET /api/orders - Retrieve All Orders', () => {
    it('should retrieve paginated orders', async () => {
      (Order.paginate as jest.Mock).mockResolvedValue({
        docs: [
          {
            _id: 'order123',
            itemId: 'item123',
            quantity: 2,
            status: 'completed',
          },
        ],
        totalDocs: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
      });

      const response = await request(app).get('/api/orders?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Orders retrived successfully');
      expect(response.body.data.docs).toHaveLength(1);
      expect(response.body.data.docs[0]).toEqual({
        _id: 'order123',
        itemId: 'item123',
        quantity: 2,
        status: 'completed',
      });
    });
  });
});
