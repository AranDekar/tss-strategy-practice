import Strategy from '../schemas/strategy_schema';
import StrategyRevision from '../schemas/strategy_revision_schema';

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

  /**
  * Update the code and events of a revision
  * @param {string} code - The code to update - either file name or a module
  * @return {array} Array of events.
  */
  async update(code, events) {
    const revision = await StrategyRevision.findById(this.id).exec();
    if (!revision) {
      throw new Error('revision not found!');
    }
    revision.code = code;
    revision.events = events;
    return revision.save();
  }
}

export default StrategyRevisionService;
