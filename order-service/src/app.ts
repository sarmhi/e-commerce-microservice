import express, { Request, Response } from 'express';
import orderRoutes from './routes/order.routes';

const app = express();

app.use(express.json());

app.use('healthcheck', (req: Request, res: Response) => {
  res.status(200).send('Order Service is healthy');
});

app.use('/api/orders', orderRoutes);

export default app;
