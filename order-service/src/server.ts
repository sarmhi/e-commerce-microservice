import app from './app';
import { connectDb } from './config/db';
import keys from './config/keys';
import { connectRabbitMQ, consumeFromQueue } from './events/rabbitmq';
import ItemLogs from './models/itemLogs.model';

const port = keys.PORT;

const init = async () => {
  await connectDb();
  await connectRabbitMQ();

  consumeFromQueue('stock_update_queue', async (message) => {
    console.log('Received stock update:', message);

    await ItemLogs.create({
      itemId: message.data.itemId,
      quantity: message.data.quantity,
      event: message.event,
    });

    console.log(`Stock update logged for itemId: ${message.data.itemId}`);
  });

  app.listen(port, () => {
    console.log(`Order Service running on http://localhost:${port}`);
  });
};

init();
