import amqp from 'amqplib';
import keys from '../config/keys';

let channel: amqp.Channel;

const rabbitmqUrl = keys.RABBITMQ_URL;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();
    console.log('RabbitMQ connected in Order Service.');
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
    process.exit(1);
  }
};

export const consumeFromQueue = async (
  queue: string,
  callback: (msg: any) => void
) => {
  if (!channel) throw new Error('RabbitMQ channel not established');

  await channel.assertQueue(queue, { durable: true });
  channel.consume(queue, (msg) => {
    if (msg) {
      const content = JSON.parse(msg.content.toString());
      callback(content);
      channel.ack(msg);
    }
  });

  console.log(`Listening for messages on queue: ${queue}`);
};
