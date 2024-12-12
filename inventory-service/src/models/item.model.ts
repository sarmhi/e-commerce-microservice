import mongoose, { Document, PaginateModel, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IItem extends Document {
  name: string;
  description: string;
  quantity: number;
  price: number;
}

const ItemSchema = new Schema<IItem>(
  {
    name: { type: String },
    description: { type: String },
    quantity: { type: Number, default: 0 },
    price: { type: Number },
  },
  { timestamps: true }
);

ItemSchema.plugin(mongoosePaginate);

export default mongoose.model<IItem, PaginateModel<IItem>>('Item', ItemSchema);
