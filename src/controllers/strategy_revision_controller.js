
import StrategyRevisionService from '../services/strategy_revision_service';
import BacktestService from '../services/backtest_service';

export async function postRevision(req, res) {
  try {
    const revision = req.swagger.params.revision.value;
    const strategyId = req.swagger.params.strategyId.value;
    if (revision.strategy !== strategyId) {
      return res.status(400).send({ message: 'strategyId mismatch' });
    }

    const service = new StrategyRevisionService(revision);
    const data = await service.create();
    return res.status(200).send(data);
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}

export async function putRevision(req, res) {
  try {
    const revision = req.swagger.params.revision.value;
    const strategyId = req.swagger.params.strategyId.value;
    const revisionId = req.swagger.params.revisionId.value;
    if (revision.strategy !== strategyId || revision.id !== revisionId) {
      return res.status(400).send({ message: 'strategyId/revisionId mismatch' });
    }

    const service = new StrategyRevisionService(revision);
    const data = await service.update(revision.code, revision.events);
    return res.status(200).send(data);
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}

export async function getRevision(req, res) {
  try {
    const strategyId = req.swagger.params.strategyId.value;
    const revisionId = req.swagger.params.revisionId.value;

    const service = new StrategyRevisionService({ strategy: strategyId, id: revisionId });
    const data = await service.getById(revisionId);
    return res.status(200).send(data);
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}

export async function backtest(req, res) {
  try {
    const revisionId = req.swagger.params.revisionId.value;
    const service = new BacktestService({ revisionId });
    const summary = await service.backtest();
    return res.status(200).send(summary);
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}
