import Joi from 'joi';

export const getOrdersSchema = Joi.object({
  page: Joi.number(),
  limit: Joi.number(),
});

export const createOrderSchema = Joi.object({
  itemId: Joi.string().required(),
  quantity: Joi.number().required(),
});

export const getOrderSchema = Joi.object({
  orderId: Joi.string().required(),
});
