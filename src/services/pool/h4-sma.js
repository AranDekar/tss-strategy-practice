module.exports = (currentSnapshot, event, exit, buy, sell) => {
  const newSnapshot = { ...currentSnapshot };
  const toPips = pips => Number((pips * 100000).toFixed(5));
  if (event.name === 'h4_sma_changed') {
    if (event.context.period === 20) {
      newSnapshot.sma = event.context.result;
      let doBuy = false;
      let diff = toPips(newSnapshot.sma - event.bidPrice);
      if (diff < 0) {
        diff = toPips(event.askPrice - newSnapshot.sma);
        doBuy = true;
      }
      newSnapshot.diff = diff;
      if (diff < 100) {
        exit(newSnapshot);
      }
      if (diff > 250) {
        if (doBuy) {
          buy(newSnapshot);
        } else {
          sell(newSnapshot);
        }
      }
    }
  }
};
