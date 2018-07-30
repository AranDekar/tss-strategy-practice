import mongoose from 'mongoose';

const { Schema } = mongoose.Schema;
const strategyReportSchema = new Schema({
  strategyRevision: { type: Schema.Types.ObjectId, ref: 'StrategyRevisions' },
  instrument: { type: String, required: 'instrumentId is required' },
  timeIn: Date,
  timeOut: Date,
  priceIn: Number,
  priceOut: Number,
  tradeType: { type: String, enum: ['in_buy', 'in_sell'], required: 'trade type is required' },
  pips: { type: Number },
  payload: { type: Schema.Types.Mixed },
});

mongoose.connect(process.env.MONGO_DB, { autoIndex: false });
const StrategyReport = mongoose.model('StrategyReport', strategyReportSchema);
export default StrategyReport;
