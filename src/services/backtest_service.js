import fs from 'fs';
import path from 'path';
import requireFromString from 'require-from-string';
import request from 'request-promise';
import StrategyEvent from '../schemas/strategy_event_schema';
import StrategyRevision from '../schemas/strategy_revision_schema';
import StrategyReport from '../schemas/strategy_report_schema';
import StrategyReportSummary from '../schemas/strategy_report_summary_schema';

class BacktestService {
  constructor({ revisionId }) {
    this.revisionId = revisionId;
    this.revision = undefined;
    this.events = [];
    this.reports = [];
    this.annualReps = [];
    this.snapshot = {};
    this.strategyStatus = undefined;
  }

  async backtest() {
    this.revision = await StrategyRevision.findById(this.revisionId).populate('strategy').exec();
    if (this.revision === null) {
      throw new Error('revision not found!');
    }
    let numberOfEvents = 0;
    const summary = [];
    const file = path.join(__dirname, `/pool/${this.revision.code}`);
    const code = fs.readFileSync(file, 'utf8');
    const func = requireFromString(code, file);
    if (!func) {
      throw new Error('code of the revision cannot be executed!');
    }
    const instruments = { AUD_USD: 'AUD_USD', GBP_USD: 'GBP_USD', EUR_USD: 'EUR_USD' };
    for (const [value] of Object.entries(instruments)) {
      const instrument = value;
      this.snapshots = [];
      this.events = [];
      this.reports = [];
      this.snapshot = {};
      this.annualReps = [];
      this.strategyStatus = undefined;
      await this.clearOutDb(instrument);// eslint-disable-line no-await-in-loop

      let stillInLoop = true;
      let candleTime = new Date('1900-01-01').toISOString();
      do {
        /* eslint-disable no-await-in-loop */
        const events = await BacktestService.getInstrumentEvents(instrument, candleTime, this.revision.events.map(x => x));
        /* eslint-enable no-await-in-loop */
        for (const event of events) {
          await this.process(func, instrument, event);// eslint-disable-line no-await-in-loop

          candleTime = event.candleTime; // eslint-disable-line prefer-destructuring
        }
        stillInLoop = events.length !== 0;
      } while (stillInLoop);
      this.produceReport(this.revision, instrument);
      const result = this.produceReportSummary(this.revision, instrument);
      summary.push(result);
      await this.saveIntoDb(); // eslint-disable-line
      numberOfEvents += this.events.length;
    }
    return { numberOfEventsGenrated: numberOfEvents, totalEarn: summary };
  }

  async clearOutDb(instr) {
    await StrategyEvent.deleteMany({ strategyRevision: this.revisionId, instrument: instr }).exec();
    await StrategyReport.deleteMany({ strategyRevision: this.revisionId, instrument: instr }).exec();
    await StrategyReportSummary.deleteMany({ strategyRevision: this.revisionId, instrument: instr }).exec();
    const r = 'dsds';
    return r;
  }

  async saveIntoDb() {
    await StrategyEvent.insertMany(this.events);
    await StrategyReport.insertMany(this.reports);
    await StrategyReportSummary.insertMany(this.annualReps);
  }

  produceReportSummary(strategyRevision, instrument) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const activeReports = this.reports.filter(a => a.timeOut !== undefined && a.timeOut !== null);
    const minYear = activeReports[0].timeOut.getFullYear();
    let totalEarn = 0;
    const yearlyReport = [];
    for (let m = minYear; m <= new Date().getFullYear(); m += 1) {
      let annualTotal = 0;
      let annualMaxProfit = 0;
      let annualMaxLoss = 0;
      const monthlyReps = [];
      // calculating monthly reports for the current year in the loop
      for (let n = 0; n <= 11; n += 1) {
        const reports = activeReports.filter(r => r.timeOut.getFullYear() === m && r.timeOut.getMonth() === n).map(a => a.pips);

        if (reports.length > 0) {
          reports.sort((a, b) => a - b);
          const total = reports.reduce((a, b) => a + b);
          const maxProfit = reports[reports.length - 1];
          const maxLoss = reports[0];

          annualTotal += total;
          annualMaxLoss = maxLoss < annualMaxLoss ? maxLoss : annualMaxLoss;
          annualMaxProfit = maxProfit > annualMaxProfit ? maxProfit : annualMaxProfit;

          monthlyReps.push({
            month: monthNames[n], total, maxProfit, maxLoss,
          });
        }
      }
      // calculating quarterly reports based on calculated monthly reports
      const q1Months = monthlyReps.filter(a => ['Jan', 'Feb', 'Mar'].indexOf(a.month) > -1);

      const q1 = {
        maxLoss: q1Months.length > 0 ? q1Months.map(a => a.maxLoss).sort((a, b) => a - b)[0] : 0,
        maxProfit: q1Months.length > 0 ? q1Months.map(b => b.maxProfit)
          .sort((a, b) => a - b)[q1Months.length - 1] : 0,
        quarter: 'q1',
        total: q1Months.length > 0 ? q1Months.map(c => c.total).reduce((a, b) => a + b) : 0,
      };
      const q2Months = monthlyReps.filter(a => ['Apr', 'May', 'Jun'].indexOf(a.month) > -1);
      const q2 = {
        maxLoss: q2Months.length > 0 ? q2Months.map(a => a.maxLoss).sort((a, b) => a - b)[0] : 0,
        maxProfit: q2Months.length > 0 ? q2Months.map(b => b.maxProfit)
          .sort((a, b) => a - b)[q2Months.length - 1] : 0,
        quarter: 'q2',
        total: q2Months.length > 0 ? q2Months.map(c => c.total).reduce((a, b) => a + b) : 0,
      };
      const q3Months = monthlyReps.filter(a => ['Jul', 'Aug', 'Sep'].indexOf(a.month) > -1);
      const q3 = {
        maxLoss: q3Months.length > 0 ? q3Months.map(a => a.maxLoss).sort((a, b) => a - b)[0] : 0,
        maxProfit: q3Months.length > 0 ? q3Months.map(b => b.maxProfit)
          .sort((a, b) => a - b)[q3Months.length - 1] : 0,
        quarter: 'q3',
        total: q3Months.length > 0 ? q3Months.map(c => c.total).reduce((a, b) => a + b) : 0,
      };
      const q4Months = monthlyReps.filter(a => ['Oct', 'Nov', 'Dec'].indexOf(a.month) > -1);
      const q4 = {
        maxLoss: q4Months.length > 0 ? q4Months.map(a => a.maxLoss).sort((a, b) => a - b)[0] : 0,
        maxProfit: q4Months.length > 0 ? q4Months.map(b => b.maxProfit)
          .sort((a, b) => a - b)[q4Months.length - 1] : 0,
        quarter: 'q4',
        total: q4Months.length > 0 ? q4Months.map(c => c.total).reduce((a, b) => a + b) : 0,
      };

      // calculating half-yearly reports based on calculated monthly reports
      const hy1Months = monthlyReps.filter(a => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        .indexOf(a.month) > -1);
      const hy1 = {
        maxLoss: hy1Months.length > 0 ? hy1Months.map(a => a.maxLoss).sort((a, b) => a - b)[0] : 0,
        maxProfit: hy1Months.length > 0 ? hy1Months.map(b => b.maxProfit)
          .sort((a, b) => a - b)[hy1Months.length - 1] : 0,
        halfYear: 'half-year 1',
        total: hy1Months.length > 0 ? hy1Months.map(c => c.total).reduce((a, b) => a + b) : 0,
      };
      const hy2Months = monthlyReps.filter(a => ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        .indexOf(a.month) > -1);
      const hy2 = {
        maxLoss: hy2Months.length > 0 ? hy2Months.map(a => a.maxLoss).sort((a, b) => a - b)[0] : 0,
        maxProfit: hy2Months.length > 0 ? hy2Months.map(b => b.maxProfit)
          .sort((a, b) => a - b)[hy2Months.length - 1] : 0,
        halfYear: 'half-year 2',
        total: hy2Months.length > 0 ? hy2Months.map(c => c.total).reduce((a, b) => a + b) : 0,
      };

      this.annualReps.push({
        strategyRevision: strategyRevision.id,
        instrument,
        year: m,
        total: annualTotal,
        maxProfit: annualMaxProfit,
        maxLoss: annualMaxLoss,
        monthly: monthlyReps,
        quarterly: [q1, q2, q3, q4],
        halfYearly: [hy1, hy2],
      });
      yearlyReport.push({ year: m, earn: annualTotal });
      totalEarn += annualTotal;
    }
    return { totalEarn, instrument, yearlyReport };
  }

  produceReport(strategyRevision, instrumnet) {
    let report;
    for (const event of this.events) {
      if (['in_buy', 'in_sell'].indexOf(event.event) > -1) {
        report = {
          strategyRevision: strategyRevision.id,
          instrument: instrumnet,
          timeIn: new Date(event.candleTime),
          payload: event.payload,
          priceIn: event.event === 'in_buy' ? event.payload.ask : event.payload.bid,
          tradeType: event.event,
          pips: 0,
          priceOut: undefined,
          timeOut: undefined,
        };
        this.reports.push(report);
      } else if (event.event === 'exited') {
        if (report) {
          report.timeOut = new Date(event.candleTime);
          report.priceOut = report.tradeType === 'in_buy' ? event.payload.bid : event.payload.ask;
          if (report.priceOut) {
            report.pips = report.tradeType === 'in_buy' ? report.priceOut - report.priceIn : report.priceIn - report.priceOut;
            report.pips = Number((report.pips * 100000).toFixed(5));
          }
        }
      }
    }
  }

  static async getInstrumentEvents(instrument, candleTime, events) {
    const options = {
      method: 'GET',
      uri: `${process.env.HTTP_INSTRUMENT}/${instrument}/events?candleTime=${candleTime}&events=${events.join(',')}`,
      qs: {},
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.API_KEY}:${process.env.API_SECRET}`).toString('base64')}`,
        'api-key': '1234',
      },
      json: true, // Automatically parses the JSON string in the response
    };
    return request(options)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  }

  async process(func, instrument, instrumentEvent) {
    try {
      func(this.snapshot, instrumentEvent,
        newSnapshot => this.runExitCommand(instrument, instrumentEvent, newSnapshot),
        newSnapshot => this.runBuyCommand(instrument, instrumentEvent, newSnapshot),
        newSnapshot => this.runSellCommand(instrument, instrumentEvent, newSnapshot));
    } catch (error) {
      throw error;
    }
  }

  runSellCommand(instrument, instrumentEvent, newSnapshot) {
    this.snapshot = newSnapshot;
    if (this.strategyStatus !== 'in_sell') {
      this.runExitCommand(instrument, instrumentEvent, newSnapshot);
      const eventItem = {
        event: 'in_sell',
        isDispatched: false,
        instrument,
        payload: {
          bid: instrumentEvent.bidPrice,
          ask: instrumentEvent.askPrice,
          ...this.snapshot,
        },
        candleTime: instrumentEvent.candleTime,
        time: new Date(),
        strategyRevision: this.revisionId,
      };
      this.events.push(eventItem);
      this.strategyStatus = 'in_sell';
    }
  }

  runBuyCommand(instrument, instrumentEvent, newSnapshot) {
    this.snapshot = newSnapshot;
    if (this.strategyStatus !== 'in_buy') {
      this.runExitCommand(instrument, instrumentEvent, newSnapshot);
      const eventItem = {
        event: 'in_buy',
        instrument,
        isDispatched: false,
        payload: {
          ...this.snapshot,
          bid: instrumentEvent.bidPrice,
          ask: instrumentEvent.askPrice,
        },
        candleTime: instrumentEvent.candleTime,
        time: new Date(),
        strategyRevision: this.revisionId,
      };
      this.events.push(eventItem);
      this.strategyStatus = 'in_buy';
    }
  }

  runExitCommand(instrument, instrumentEvent, newSnapshot) {
    this.snapshot = newSnapshot;
    if (this.strategyStatus !== 'exited') {
      const eventItem = {
        event: 'exited',
        instrument,
        isDispatched: false,
        payload: {
          ...this.snapshot,
          bid: instrumentEvent.bidPrice,
          ask: instrumentEvent.askPrice,
        },
        candleTime: instrumentEvent.candleTime,
        time: new Date(),
        strategyRevision: this.revisionId,
      };
      this.events.push(eventItem);
      this.strategyStatus = 'exited';
    }
  }
}


export default BacktestService;
