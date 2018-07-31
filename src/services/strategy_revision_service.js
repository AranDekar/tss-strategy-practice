import Strategy from '../schemas/StrategySchema';
import StrategyRevision from '../schemas/StrategyRevisionSchema';

class StrategyRevisionService {
  constructor({ id, code, events, strategy } = {}) { // eslint-disable-line
    this.id = id;
    this.code = code;
    this.events = events;
    this.strategy = strategy;
  }

  async create() {
    if (!this.strategy) {
      throw new Error('❌ strategy is not properly sent');
    }
    const strategy = await Strategy.findById(this.strategy).exec();
    if (!strategy) {
      throw new Error('❌ strategy not found');
    }
    const revision = new StrategyRevision(...this);
    await revision.save();
    strategy.strategyRevisions.push(revision.id);
    return strategy.save();
  }

  async updateRevision() {
    const revision = await StrategyRevision.findById(this.id).exec();
    if (!revision) {
      throw new Error('revision not found!');
    }
    revision.code = this.code;
    revision.events = this.events;
    return revision.save();
  }
}

export default StrategyRevisionService;
