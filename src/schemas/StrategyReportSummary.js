import mongoose from 'mongoose';


const { Schema } = mongoose;
const strategyReportSummarySchema = new Schema({
  strategy: { type: Schema.Types.ObjectId, ref: 'strategies' },
  instrument: { type: String, required: 'instrumentId is required' },
  total: Number,
  maxProfit: Number,
  maxLoss: Number,
  year: Number,
  monthly: [{
    total: Number, maxProfit: Number, maxLoss: Number, month: String,
  }],
  quarterly: [{
    total: Number, maxProfit: Number, maxLoss: Number, quarter: String,
  }],
  halfYearly: [{
    total: Number, maxProfit: Number, maxLoss: Number, halfYear: String,
  }],
});

const StrategyReportSummary = mongoose.model('strategy_report_summaries', strategyReportSummarySchema);
export default StrategyReportSummary;
