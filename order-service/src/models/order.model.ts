import mongoose, { Document, PaginateModel, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export enum ORDER_STATUS {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface IOrder extends Document {
  itemId: string;
  quantity: number;
  status: ORDER_STATUS;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    itemId: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: {
      type: String,
      enum: ORDER_STATUS,
      default: ORDER_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.plugin(mongoosePaginate);

export default mongoose.model<IOrder, PaginateModel<IOrder>>(
  'Order',
  OrderSchema
);
