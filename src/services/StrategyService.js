import Strategy from '../schemas/StrategySchema';

class StrategyService {
  constructor({ id, name, description, createdTime, postedBy } = {}) { // eslint-disable-line
    this.id = id;
    this.name = name;
    this.description = description;
    this.createdTime = createdTime;
    this.postedBy = postedBy;
  }

  async create() {
    if (!this.postedBy) {
      throw new Error('❌ strategy is not properly sent');
    }
    const model = new Strategy(...this);
    return model.save();
  }

  static async get() {
    return Strategy.find().exec();
  }
}

export default StrategyService;
