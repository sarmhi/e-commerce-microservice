import express from 'express';
import {
  createOrder,
  getOrder,
  getOrders,
} from '../controllers/order.controller';
import { validate } from '../middleware/validator';
import {
  createOrderSchema,
  getOrderSchema,
  getOrdersSchema,
} from '../validators/order.validation';

const router = express.Router();

router.post('/', validate(createOrderSchema), createOrder);

router.get('/:orderId', validate(getOrderSchema), getOrder);

router.get('/', validate(getOrdersSchema), getOrders);

export default router;
