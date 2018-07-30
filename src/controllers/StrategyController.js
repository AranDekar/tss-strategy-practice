
import StrategyService from '../services/StrategyService';

export async function getStrategies(req, res) {
  try {
    const data = await StrategyService.get();
    return res.json(data);
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}

export async function postStrategy(req, res) {
  const strategy = req.swagger.params.body.value;
  const service = new StrategyService(strategy);
  try {
    const model = await service.create();
    return res.status(201).json(model);
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
}
