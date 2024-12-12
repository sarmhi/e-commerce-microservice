import express, { Request, Response } from 'express';

import inventoryRoutes from './routes/inventory.routes';

const app = express();
app.use(express.json());

app.use('/healthcheck', (req: Request, res: Response) => {
  res.status(200).send('Inventory Service is healthy');
});

app.use('/api/items', inventoryRoutes);

export default app;
