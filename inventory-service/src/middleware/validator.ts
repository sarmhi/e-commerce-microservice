import { Request, Response, NextFunction, RequestHandler } from 'express';
import Joi from 'joi';

export const validateInput = (
  schema: Joi.Schema,
  object: any
): { error?: Joi.ValidationError; value?: any } => {
  const { error, value } = schema.validate(object);
  return { error, value };
};

export const validate = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = validateInput(schema, {
      ...req.body,
      ...req.query,
      ...req.params,
    });
    if (!error) {
      return next();
    }
    res.status(400).json({
      message: 'Validation error',
      details: error.details.map((detail) => detail.message),
    });
    return;
  };
};
