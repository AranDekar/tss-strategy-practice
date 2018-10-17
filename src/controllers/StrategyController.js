import StrategyService from "../services/StrategyService";
import BacktestService from "../services/BacktestService";
import Strategy from "../schemas/Strategy";

export async function getStrategies(req, res) {
  try {
    const postedBy = req.swagger.params.postedBy.value;

    const data = await StrategyService.get(postedBy);
    return res.json(data);
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}

export async function deleteStrategy(req, res) {
  try {
    const strategyId = req.swagger.params.strategyId.value;

    const model = await StrategyService.delete(strategyId);
    if (!model) {
      return res.status(404).send("startegy not found!");
    }
    return res.status(204).send();
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}

export async function postStrategy(req, res) {
  try {
    const strategy = req.swagger.params.strategy.value;
    const model = await StrategyService.create(strategy);
    return res.status(201).json(model);
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}

export async function getYearlyReport(req, res) {
  try {
    const strategyId = req.swagger.params.strategyId.value;

    const data = await StrategyService.getYearlyReport(strategyId);
    if (!data) {
      return res.status(404).send();
    }
    return res.status(200).send(data);
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}

export async function getMonthlyReport(req, res) {
  try {
    const strategyId = req.swagger.params.strategyId.value;
    const instrument = req.swagger.params.instrument.value;

    const data = await StrategyService.getMonthlyReport(strategyId, instrument);
    if (!data) {
      return res.status(404).send();
    }

    return res.status(200).send(data);
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}

export async function backtest(req, res) {
  try {
    const strategyId = req.swagger.params.strategyId.value;
    const service = new BacktestService({ strategyId });
    const summary = await service.backtest();
    return res.status(200).send(summary);
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}
export async function getEvents(req, res) {
  try {
    let collection = Strategy.schema.path("events").options.enum;
    collection = collection.sort();
    const result = collection.map(x => ({ name: x }));
    return res.status(200).send(result);
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}
