import { Request, Response } from 'express';
import Item from '../models/item.model';
import { publishToQueue } from '../events/rabbitmq';
import { logEvent } from '../utils/logger';

export const addItem = async (req: Request, res: Response) => {
  try {
    const newItem = await Item.create({ ...req.body });

    res
      .status(201)
      .json({ message: 'Item created successfully', data: newItem });
  } catch (error) {
    //log the error
    res.status(500).json({ message: 'Error adding item', error });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const foundItemIndB = await Item.findById(itemId);
    if (!foundItemIndB) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    foundItemIndB.quantity = quantity;
    const updatedItemInDb = await foundItemIndB.save();

    await publishToQueue('stock_update_queue', {
      event: 'stock_updated',
      data: { itemId: updatedItemInDb._id, quantity: updatedItemInDb.quantity },
    });

    await logEvent('stock_updated', {
      itemId: updatedItemInDb._id,
      name: updatedItemInDb.name,
      quantity: updatedItemInDb.quantity,
    });

    res
      .status(200)
      .json({ message: 'Stock updated successfully', data: updatedItemInDb });
  } catch (error) {
    res.status(500).json({ message: 'Error updating stock', error });
  }
};

export const getItemStock = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const foundItemIndB = await Item.findById(itemId);
    if (!foundItemIndB) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    res
      .status(200)
      .json({ message: 'Item retrieved successfully', data: foundItemIndB });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving item stock', error });
  }
};
