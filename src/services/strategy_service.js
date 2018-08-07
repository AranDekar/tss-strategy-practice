import Strategy from '../schemas/strategy_schema';

class StrategyService {
  constructor({ id, name, description, createdTime, postedBy } = {}) { // eslint-disable-line
    this.id = id;
    this.name = name;
    this.description = description;
    this.createdTime = createdTime;
    this.postedBy = postedBy;
  }

  static async create(strategy) {
    if (!strategy.postedBy) {
      throw new Error('❌ strategy is not properly sent');
    }
    const model = new Strategy(strategy);
    return model.save();
  }

  static async get() {
    return Strategy.find().exec();
  }
}

export default StrategyService;
