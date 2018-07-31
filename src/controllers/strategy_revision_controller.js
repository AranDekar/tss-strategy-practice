
import StrategyRevisionService from '../services/strategy_revision_service';
import BacktestService from '../services/backtest_service';

export async function postRevision(req, res) {
  const revision = req.swagger.params.body.value;
  const strategyId = req.swagger.params.strategyId.value;
  try {
    if (revision.strategy !== strategyId) return res.status(400).send({ message: 'strategyId mismatch' });

    const service = new StrategyRevisionService(...revision);
    const data = await service.create();
    return res.status(200).send(data);
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}

export async function putRevision(req, res) {
  const revision = req.swagger.params.body.value;
  const strategyId = req.swagger.params.strategyId.value;
  const revisionId = req.swagger.params.revisionId.value;
  try {
    if (revision.strategy !== strategyId || revision.id !== revisionId) {
      return res.status(400).send({ message: 'strategyId/revisionId mismatch' });
    }

    const service = new StrategyRevisionService(...revision);
    const data = await service.updateRevision();
    return res.status(200).send(data);
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}

export async function backtest(req, res) {
  const revisionId = req.swagger.params.strategyRevisionId.value;
  try {
    const service = new BacktestService(revisionId);
    const numberOfEvents = await service.backtest();
    return res.status(200).send({ message: `${numberOfEvents} events are being processed to backtest the strategy` });
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}
