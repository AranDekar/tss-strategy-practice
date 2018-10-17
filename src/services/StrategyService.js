import Strategy from "../schemas/Strategy";
import StrategyReportSummary from "../schemas/StrategyReportSummary";
import StrategyEvent from "../schemas/StrategyEvent";
import StrategyReport from "../schemas/StrategyReport";

class StrategyService {
  static async create(strategy) {
    if (!strategy.postedBy) {
      throw new Error("❌ strategy is not properly sent");
    }
    const model = new Strategy(strategy);
    return model.save();
  }

  static async get(postedBy) {
    let collection = [];
    if (postedBy) {
      collection = await Strategy.find({ postedBy }).exec();
    }
    collection = await Strategy.find().exec();
    return collection;
  }

  static async delete(strategyId) {
    await StrategyEvent.deleteMany({ strategy: strategyId }).exec();
    await StrategyReport.deleteMany({ strategy: strategyId }).exec();
    await StrategyReportSummary.deleteMany({ strategy: strategyId }).exec();
    return Strategy.findByIdAndRemove(strategyId).exec();
  }

  /**
   * Get yearly report of a backtest
   */
  static async getYearlyReport(strategy) {
    return StrategyReportSummary.where({ strategy })
      .select("instrument year total maxProfit maxLoss")
      .exec();
  }

  /**
   * Get yearly report of a backtest
   */
  static async getMonthlyReport(strategy, instrument) {
    const result = [];
    const data = await StrategyReportSummary.where({ strategy, instrument })
      .select(
        "instrument year monthly.month monthly.total monthly.maxProfit  monthly.maxLoss"
      )
      .exec();
    for (const item of data) {
      const { year } = item;
      for (const monthly of item.monthly) {
        const { month, total, maxProfit, maxLoss } = monthly;
        result.push({
          strategy,
          instrument,
          year,
          month,
          total,
          maxProfit,
          maxLoss
        });
      }
    }
    return result;
  }
}

export default StrategyService;
