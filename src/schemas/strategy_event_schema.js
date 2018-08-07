import mongoose from 'mongoose';

const { Schema } = mongoose;
const strategyEventSchema = new Schema({
  strategyRevision: { type: Schema.Types.ObjectId, ref: 'strategy_revisions' },
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

const StrategyEvent = mongoose.model('strategy_events', strategyEventSchema);
export default StrategyEvent;
