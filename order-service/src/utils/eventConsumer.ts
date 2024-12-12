import amqplib from 'amqplib';
import keys from '../config/keys';
import { logStockUpdate } from './logger';

export const consumeStockEvent = async () => {
  try {
    const connection = await amqplib.connect(keys.RABBITMQ_URL);
    const channel = await connection.createChannel();

    const exchange = 'stock_exchange';
    await channel.assertExchange(exchange, 'topic', { durable: true });

    const queue = await channel.assertQueue('', { exclusive: true });
    channel.bindQueue(queue.queue, exchange, 'stock.updated');
    channel.consume(queue.queue, async (message) => {
      if (message) {
        const stockUpdate = JSON.parse(message.content.toString());
        console.log({ message, stockUpdate });
        console.log('Stock update received:', stockUpdate);
        await logStockUpdate(stockUpdate);
        channel.ack(message);
      }
    });
  } catch (error) {
    console.error('Error consuming stock events', error);
  }
};
