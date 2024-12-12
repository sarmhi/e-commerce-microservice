import dotenv from 'dotenv';
dotenv.config();

const env = process.env.NODE_ENV;

const keys = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/inventory-db',
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost',
  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
};

export default keys;
