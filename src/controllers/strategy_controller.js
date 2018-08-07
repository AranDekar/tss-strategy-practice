
import StrategyService from '../services/strategy_service';

export async function getStrategies(req, res) {
  try {
    const data = await StrategyService.get();
    return res.json(data);
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
