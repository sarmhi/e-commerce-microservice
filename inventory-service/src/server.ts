import express from 'express';
import keys from './config/keys';
import { connectDB } from './config/db';
import app from './app';
import { connectRabbitMQ } from './events/rabbitmq';

const port = keys.PORT;

app.get('/', (req, res) => {
  res.send('Inventory Service is running!');
});

connectDB()
  .then(connectRabbitMQ)
  .then(() => {
    app.listen(port, () => {
      console.log(`Inventory Service running on http://localhost:${port}`);
    });
  });
