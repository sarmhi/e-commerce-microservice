import Joi from 'joi';

export const addItemSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().trim(),
  quantity: Joi.number().required(),
  price: Joi.number().required(),
});

export const updateStockSchema = Joi.object({
  itemId: Joi.string().required(),
  quantity: Joi.number().required(),
});

export const getItemStockSchema = Joi.object({
  itemId: Joi.string().required(),
});
