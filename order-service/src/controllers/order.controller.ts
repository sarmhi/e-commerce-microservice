import { Request, Response } from 'express';
import axios from 'axios';
import Order, { ORDER_STATUS } from '../models/order.model';
import keys from '../config/keys';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { itemId, quantity } = req.body;
    const inventoryResponse = await axios.get(
      `${keys.INVENTORY_SERVICE_URL}/api/items/${itemId}`
    );
    const foundItemFromInventoryService = inventoryResponse.data.data;

    if (!foundItemFromInventoryService) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    if (foundItemFromInventoryService.quantity < quantity) {
      res.status(400).json({ message: 'Insufficient stock for this item' });
      return;
    }

    await axios.patch(
      `${keys.INVENTORY_SERVICE_URL}/api/items/stock/${itemId}`,
      {
        quantity: foundItemFromInventoryService.quantity - quantity,
      }
    );

    const createdOrderInDB = await Order.create({
      itemId,
      quantity,
      status: ORDER_STATUS.COMPLETED,
    });

    res
      .status(201)
      .json({ message: 'Order created successfully', data: createdOrderInDB });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const foundOrderInDb = await Order.findById(orderId);
    if (!foundOrderInDb) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res
      .status(200)
      .json({ message: 'Order retrieved successfully', data: foundOrderInDb });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving order', error });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const foundOrdersInDb = await Order.paginate({}, req.query);

    res
      .status(200)
      .json({ message: 'Orders retrived successfully', data: foundOrdersInDb });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders', error });
  }
};
