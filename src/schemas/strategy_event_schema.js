import mongoose from 'mongoose';

const { Schema } = mongoose.Schema;
const strategyEventSchema = new Schema({
  strategyRevision: { type: Schema.Types.ObjectId, ref: 'StrategyRevisions' },
  instrument: { type: String, required: 'instrumentId is required' },
  isDispatched: { type: Boolean, default: false },
  candleTime: { type: Date },
  time: { type: Date },
  event: { type: String },
  payload: { type: Schema.Types.Mixed },
});
strategyEventSchema.index({ time: 1 }); // schema level ascending index on candleTime

strategyEventSchema.statics.findUndispatchedEvents = function findUndispatchedEvents() {
  return this.find({ isDispatched: false }).sort({ time: 1 });
};

mongoose.connect(process.env.MONGO_DB, { autoIndex: false });
const StrategyEvent = mongoose.model('StrategyEvent', strategyEventSchema);
export default StrategyEvent;
