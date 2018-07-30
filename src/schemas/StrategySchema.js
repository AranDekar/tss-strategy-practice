import mongoose from 'mongoose';

const { Schema } = mongoose.Schema;

const strategySchema = new Schema({
  name: { type: String, trim: true, required: 'name is required' },
  description: { type: String, trim: true, required: 'name is required' },
  createdTime: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  postedBy: { type: Schema.Types.ObjectId, required: 'postedBy is required' },
  strategyRevisions: [{ type: Schema.Types.ObjectId, ref: 'StrategyRevisions' }],
});
mongoose.connect(process.env.MONGO_DB, { autoIndex: false });
const Strategy = mongoose.model('Strategy', strategySchema);
export default Strategy;
