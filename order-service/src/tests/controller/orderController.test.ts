import Order from '../../models/order.model';
import axios from 'axios';
import { Request, Response } from 'express';
import keys from '../../config/keys';
import {
  createOrder,
  getOrder,
  getOrders,
} from '../../controllers/order.controller';

jest.mock('axios'); // Mock axios for Inventory API
jest.mock('../../models/order.model'); // Mock Mongoose Order model

describe('Order Controller Unit Tests', () => {
  const mockRequest = (body = {}, params = {}, query = {}) =>
    ({ body, params, query } as unknown as Request);

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const req = mockRequest({ itemId: 'item123', quantity: 2 });
      const res = mockResponse();

      // Mock Inventory Service response
      (axios.get as jest.Mock).mockResolvedValue({
        data: { data: { _id: 'item123', quantity: 10 } },
      });

      // Mock Inventory Service stock update
      (axios.patch as jest.Mock).mockResolvedValue({});

      // Mock Order creation
      (Order.create as jest.Mock).mockResolvedValue({
        _id: 'order123',
        itemId: 'item123',
        quantity: 2,
        status: 'completed',
      });

      await createOrder(req, res);

      expect(axios.get).toHaveBeenCalledWith(
        `${keys.INVENTORY_SERVICE_URL}/api/items/item123`
      );
      expect(axios.patch).toHaveBeenCalledWith(
        `${keys.INVENTORY_SERVICE_URL}/api/items/stock/item123`,
        { quantity: 8 } // 10 - 2 = 8
      );
      expect(Order.create).toHaveBeenCalledWith({
        itemId: 'item123',
        quantity: 2,
        status: 'completed',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Order created successfully',
        data: {
          _id: 'order123',
          itemId: 'item123',
          quantity: 2,
          status: 'completed',
        },
      });
    });

    it('should return 400 if stock is insufficient', async () => {
      const req = mockRequest({ itemId: 'item123', quantity: 20 });
      const res = mockResponse();

      (axios.get as jest.Mock).mockResolvedValue({
        data: { data: { _id: 'item123', quantity: 5 } },
      });

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Insufficient stock for this item',
      });
    });

    it('should handle errors gracefully', async () => {
      const req = mockRequest({ itemId: 'item123', quantity: 2 });
      const res = mockResponse();

      (axios.get as jest.Mock).mockRejectedValue(
        new Error('Inventory API error')
      );

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error creating order',
        error: expect.anything(),
      });
    });
  });

  describe('getOrder', () => {
    it('should return an order successfully', async () => {
      const req = mockRequest({}, { orderId: 'order123' });
      const res = mockResponse();

      (Order.findById as jest.Mock).mockResolvedValue({
        _id: 'order123',
        itemId: 'item123',
        quantity: 2,
      });

      await getOrder(req, res);

      expect(Order.findById).toHaveBeenCalledWith('order123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Order retrieved successfully',
        data: { _id: 'order123', itemId: 'item123', quantity: 2 },
      });
    });

    it('should return 404 if order not found', async () => {
      const req = mockRequest({}, { orderId: 'order123' });
      const res = mockResponse();

      (Order.findById as jest.Mock).mockResolvedValue(null);

      await getOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
    });
  });

  describe('getOrders', () => {
    it('should retrieve paginated orders successfully', async () => {
      const req = mockRequest({}, {}, { page: 1, limit: 10 });
      const res = mockResponse();

      (Order.paginate as jest.Mock).mockResolvedValue({
        docs: [{ _id: 'order123', itemId: 'item123', quantity: 2 }],
        total: 1,
        page: 1,
        limit: 10,
      });

      await getOrders(req, res);

      expect(Order.paginate).toHaveBeenCalledWith({}, req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Orders retrived successfully',
        data: {
          docs: [{ _id: 'order123', itemId: 'item123', quantity: 2 }],
          total: 1,
          page: 1,
          limit: 10,
        },
      });
    });
  });
});
