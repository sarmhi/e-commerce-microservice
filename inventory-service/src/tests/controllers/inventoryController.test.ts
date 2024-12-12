import { Request, Response } from 'express';
import Item from '../../models/item.model';
import {
  addItem,
  getItemStock,
  updateStock,
} from '../../controllers/inventory.controller';
import { publishToQueue } from '../../events/rabbitmq';
import { logEvent } from '../../utils/logger';

jest.mock('../../models/item.model');
jest.mock('../../events/rabbitmq');

jest.mock('../../events/rabbitmq', () => ({
  publishToQueue: jest.fn(),
}));
jest.mock('../../utils/logger', () => ({
  logEvent: jest.fn(),
}));

describe('Inventory Controller Tests', () => {
  const mockRequest = (body = {}, params = {}) => ({ body, params } as Request);
  const mockResponse = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add a new item successfully', async () => {
    const req = mockRequest({
      name: 'Laptop',
      description: 'A powerful laptop',
      quantity: 10,
      price: 1200,
    });
    const res = mockResponse();

    const newItem = {
      _id: '123',
      name: 'Laptop',
      description: 'A powerful laptop',
      quantity: 10,
      price: 1200,
    };

    (Item.create as jest.Mock).mockResolvedValue(newItem);

    await addItem(req, res);

    expect(Item.create).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Item created successfully',
      data: newItem,
    });
  });

  it('should handle errors when adding a new item', async () => {
    const req = mockRequest({
      name: 'Laptop',
      description: 'A powerful laptop',
      quantity: 10,
      price: 1200,
    });
    const res = mockResponse();

    const error = new Error('Database error');
    (Item.create as jest.Mock).mockRejectedValue(error);

    await addItem(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error adding item',
      error,
    });
  });

  it('should update stock successfully and publish event', async () => {
    const req = mockRequest({ quantity: 20 }, { itemId: '123' });
    const res = mockResponse();

    const foundItem = {
      _id: '123',
      name: 'Laptop',
      quantity: 10,
      save: jest
        .fn()
        .mockResolvedValue({ _id: '123', name: 'Laptop', quantity: 20 }),
    };

    (Item.findById as jest.Mock).mockResolvedValue(foundItem);

    (publishToQueue as jest.Mock).mockResolvedValue(undefined);

    (logEvent as jest.Mock).mockResolvedValue(undefined);

    await updateStock(req, res);

    expect(Item.findById).toHaveBeenCalledWith('123');
    expect(foundItem.save).toHaveBeenCalled();
    expect(publishToQueue).toHaveBeenCalledWith('stock_update_queue', {
      event: 'stock_updated',
      data: { itemId: '123', quantity: 20 },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Stock updated successfully',
      data: { _id: '123', name: 'Laptop', quantity: 20 },
    });
  });

  it('should return 404 when updating stock for a non-existent item', async () => {
    const req = mockRequest({ quantity: 20 }, { itemId: '123' });
    const res = mockResponse();

    (Item.findById as jest.Mock).mockResolvedValue(null);

    await updateStock(req, res);

    expect(Item.findById).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Item not found' });
  });

  it('should handle errors when updating stock', async () => {
    const req = mockRequest({ quantity: 20 }, { itemId: '123' });
    const res = mockResponse();

    const error = new Error('Database error');
    (Item.findById as jest.Mock).mockRejectedValue(error);

    await updateStock(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error updating stock',
      error,
    });
  });

  it('should retrieve an item successfully', async () => {
    const req = mockRequest({}, { itemId: '123' });
    const res = mockResponse();

    const foundItem = { _id: '123', name: 'Laptop', quantity: 10 };

    (Item.findById as jest.Mock).mockResolvedValue(foundItem);

    await getItemStock(req, res);

    expect(Item.findById).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Item retrieved successfully',
      data: foundItem,
    });
  });

  it('should return 404 when item is not found', async () => {
    const req = mockRequest({}, { itemId: '123' });
    const res = mockResponse();

    (Item.findById as jest.Mock).mockResolvedValue(null);

    await getItemStock(req, res);

    expect(Item.findById).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Item not found' });
  });

  it('should handle errors when retrieving item stock', async () => {
    const req = mockRequest({}, { itemId: '123' });
    const res = mockResponse();

    const error = new Error('Database error');
    (Item.findById as jest.Mock).mockRejectedValue(error);

    await getItemStock(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error retrieving item stock',
      error,
    });
  });
});
