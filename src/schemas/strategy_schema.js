import mongoose from 'mongoose';

const { Schema } = mongoose;

const strategySchema = new Schema({
  name: { type: String, trim: true, required: 'name is required' },
  description: { type: String, trim: true, required: 'name is required' },
  createdTime: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  postedBy: { type: Schema.Types.ObjectId, required: 'postedBy is required' },
  strategyRevisions: [{ type: Schema.Types.ObjectId, ref: 'strategy_revisions' }],
});

mongoose.connect(process.env.MONGO_DB, { autoIndex: false, useNewUrlParser: true });
const Strategy = mongoose.model('strategies', strategySchema);
export default Strategy;
