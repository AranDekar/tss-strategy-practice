import mongoose from 'mongoose';

const { Schema } = mongoose;
const strategyReportSchema = new Schema({
  strategyRevision: { type: Schema.Types.ObjectId, ref: 'strategy_revisions' },
  instrument: { type: String, required: 'instrumentId is required' },
  timeIn: Date,
  timeOut: Date,
  priceIn: Number,
  priceOut: Number,
  tradeType: { type: String, enum: ['in_buy', 'in_sell'], required: 'trade type is required' },
  pips: { type: Number },
  payload: { type: Schema.Types.Mixed },
});

mongoose.connect(process.env.MONGO_DB, { autoIndex: false, useNewUrlParser: true });
const StrategyReport = mongoose.model('strategy_reports', strategyReportSchema);
export default StrategyReport;
