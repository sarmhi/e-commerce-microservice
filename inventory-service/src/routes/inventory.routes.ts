import express from 'express';
import {
  addItem,
  getItemStock,
  updateStock,
} from '../controllers/inventory.controller';
import { validate } from '../middleware/validator';
import {
  addItemSchema,
  getItemStockSchema,
  updateStockSchema,
} from '../validators/inventory.validation';

const router = express.Router();

router.post('/', validate(addItemSchema), addItem);

router.get('/:itemId', validate(getItemStockSchema), getItemStock);

router.patch('/stock/:itemId', validate(updateStockSchema), updateStock);

export default router;
