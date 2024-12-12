import dotenv from 'dotenv';
dotenv.config();

const env = process.env.NODE_ENV;

const keys = {
  PORT: process.env.PORT || 3002,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/order-db',
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost',
  INVENTORY_SERVICE_URL:
    process.env.INVENTORY_SERVICE_URL || 'http://localhost:3001',
};

export default keys;
