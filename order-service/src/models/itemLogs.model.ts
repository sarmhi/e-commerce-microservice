import mongoose, { Schema, Document, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IItemLog extends Document {
  sku: string;
  quantity: number;
  event: string;
  updatedAt: Date;
}

const ItemLogSchema: Schema = new Schema(
  {
    itemId: { type: String },
    quantity: { type: Number },
    event: { type: String },
  },
  { timestamps: true }
);

ItemLogSchema.plugin(mongoosePaginate);

export default mongoose.model<IItemLog, PaginateModel<IItemLog>>(
  'ItemLog',
  ItemLogSchema
);
