import amqp from 'amqplib';
import keys from '../config/keys';

let channel: amqp.Channel;

const rabbitmqUrl = keys.RABBITMQ_URL;

export const connectRabbitMQ = async (): Promise<void> => {
  try {
    const connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();
    console.log('RabbitMQ Connected and Channel Created');
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
    process.exit(1);
  }
};

export const publishToQueue = async (
  queue: string,
  message: any
): Promise<void> => {
  if (!channel) throw new Error('RabbitMQ channel not established');
  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  console.log(`Message sent to queue: ${queue}`);
};
