const axios = require('axios')

async function getTechnicalAnalysisData (exchange, market, timeframe) {
  try {
    const timeframes = {
      '1m': '1',
      '5m': '5',
      '15m': '15',
      '30m': '30',
      '1h': '60',
      '2h': '120',
      '4h': '240',
      '1d': null,
      '1month': '1M',
      '1w': '1W',
    }

    if (!timeframe || !Object.keys(timeframes).includes(timeframe))
      throw 'timeframe is invalid'

    const columns = [
      'Recommend.Other',
      'Recommend.All',
      'Recommend.MA',
      'RSI',
      'RSI[1]',
      'Stoch.K',
      'Stoch.D',
      'Stoch.K[1]',
      'Stoch.D[1]',
      'CCI20',
      'CCI20[1]',
      'ADX',
      'ADX+DI',
      'ADX-DI',
      'ADX+DI[1]',
      'ADX-DI[1]',
      'AO',
      'AO[1]',
      'AO[2]',
      'Mom',
      'Mom[1]',
      'MACD.macd',
      'MACD.signal',
      'Rec.Stoch.RSI',
      'Stoch.RSI.K',
      'Rec.WR',
      'W.R',
      'Rec.BBPower',
      'BBPower',
      'Rec.UO',
      'UO',
      'EMA10',
      'close',
      'SMA10',
      'EMA20',
      'SMA20',
      'EMA30',
      'SMA30',
      'EMA50',
      'SMA50',
      'EMA100',
      'SMA100',
      'EMA200',
      'SMA200',
      'Rec.Ichimoku',
      'Ichimoku.BLine',
      'Rec.VWMA',
      'VWMA',
      'Rec.HullMA9',
      'HullMA9',
    ]

    const data = JSON.stringify({
      symbols: {
        tickers: [`${exchange.toUpperCase()}:${market.toUpperCase()}`],
        query: { types: [], },
      },
      columns: columns.map((e) => (timeframes[timeframe] ? `${e}|${timeframes[timeframe]}` : e)),
    })

    const response = await axios({
      method: 'post',
      url: 'https://scanner.tradingview.com/crypto/scan',
      headers: { 'Content-Type': 'application/json' },
      data,
    })

    const results = response.data.data[0].d
    const mergedData = {}

    for (const i of columns) {
      const index = columns.indexOf(i)

      mergedData[i] = results[index]
    }
    return mergedData
  } catch (e) {
    return e
  }
}

function prepareTechnicalAnalysisData (rawData) {
  if (!rawData || !Object.keys(rawData).length) {
    return null
  }

  const STRONG_BUY = 'strong_buy'
  const BUY = 'buy'
  const STRONG_SELL = 'strong_sell'
  const SELL = 'sell'
  const NEUTRAL = 'neutral'

  const signalComputation = {
    computeMASignal: (e, t) => {
      let o = NEUTRAL

      return e < t && (o = BUY), e > t && (o = SELL), o
    },
    computeRSISignal: (e, t) => {
      let o = NEUTRAL

      return e < 30 && t < e && (o = BUY), e > 70 && t > e && (o = SELL), o
    },
    computeStochSignal: (e, t, o, r) => {
      let n = NEUTRAL

      return (
        e < 20 && t < 20 && e > t && o < r && (n = BUY),
        e > 80 && t > 80 && e < t && o > r && (n = SELL),
          n
      )
    },
    computeCCI20Signal: (e, t) => {
      let o = NEUTRAL

      return e < -100 && e > t && (o = BUY), e > 100 && e < t && (o = SELL), o
    },
    computeADXSignal: (e, t, o, r, n) => {
      let a = NEUTRAL

      return (
        e > 20 && r < n && t > o && (a = BUY),
        e > 20 && r > n && t < o && (a = SELL),
          a
      )
    },
    computeAOSignal: (e, t, o) => {
      let r = NEUTRAL

      return (
        ((e > 0 && t < 0) || (e > 0 && t > 0 && e > t && o > t)) && (r = BUY),
        ((e < 0 && t > 0) || (e < 0 && t < 0 && e < t && o < t)) && (r = SELL),
          r
      )
    },
    computeMomSignal: (e, t) => {
      let o = NEUTRAL

      return e > t && (o = BUY), e < t && (o = SELL), o
    },
    computeMACDSignal: (e, t) => {
      let o = NEUTRAL

      return e > t && (o = BUY), e < t && (o = SELL), o
    },
    computeBBBuySignal: (e, t) => {
      let o = NEUTRAL

      return e < t && (o = BUY), o
    },
    computeBBSellSignal: (e, t) => {
      let o = NEUTRAL

      return e > t && (o = SELL), o
    },
    computePSARSignal: (e, t) => {
      let o = NEUTRAL

      return e < t && (o = BUY), e > t && (o = SELL), o
    },
    computeRecommendSignal: (e) => {
      let t

      return (
        e >= -1 && e < -0.5 && (t = STRONG_SELL),
        e >= -0.5 && e < -0.1 && (t = SELL),
        e >= -0.1 && e <= 0.1 && (t = NEUTRAL),
        e > 0.1 && e <= 0.5 && (t = BUY),
        e > 0.5 && e <= 1 && (t = STRONG_BUY),
          t
      )
    },
    computeSimpleSignal: (e) => {
      let t = NEUTRAL

      return e === -1 && (t = SELL), e === 1 && (t = BUY), t
    },
  }

  const oscillators = {
    RSI: {
      title: 'Relative Strength Index (14)',
      inputs: ['RSI', 'RSI[1]'],
      signalComputation: signalComputation.computeRSISignal,
      result: null,
      value: null,
    },
    'Stoch.K': {
      title: 'Stochastic %K (14, 3, 3)',
      inputs: ['Stoch.K', 'Stoch.D', 'Stoch.K[1]', 'Stoch.D[1]'],
      signalComputation: signalComputation.computeStochSignal,
      result: null,
      value: null,
    },
    CCI20: {
      title: 'Commodity Channel Index (20)',
      inputs: ['CCI20', 'CCI20[1]'],
      signalComputation: signalComputation.computeCCI20Signal,
      result: null,
      value: null,
    },
    ADX: {
      title: 'Average Directional Movement Index (14)',
      inputs: ['ADX', 'ADX+DI', 'ADX-DI', 'ADX+DI[1]', 'ADX-DI[1]'],
      signalComputation: signalComputation.computeADXSignal,
      result: null,
      value: null,
    },
    AO: {
      title: 'Awesome Oscillator',
      inputs: ['AO', 'AO[1]', 'AO[2]'],
      signalComputation: signalComputation.computeAOSignal,
      result: null,
      value: null,
    },
    Mom: {
      title: 'Momentum (10)',
      inputs: ['Mom', 'Mom[1]'],
      signalComputation: signalComputation.computeMomSignal,
      result: null,
      value: null,
    },
    'MACD.macd': {
      title: 'MACD Level (12, 26)',
      inputs: ['MACD.macd', 'MACD.signal'],
      signalComputation: signalComputation.computeMACDSignal,
      result: null,
      value: null,
    },
    'Stoch.RSI.K': {
      title: 'Stochastic Relative Strength Index (3, 3, 14, 14)',
      inputs: ['Rec.Stoch.RSI'],
      signalComputation: signalComputation.computeSimpleSignal,
      result: null,
      value: null,
    },
    'W.R': {
      title: 'Williams Percent Range (14)',
      inputs: ['Rec.WR'],
      signalComputation: signalComputation.computeSimpleSignal,
      result: null,
      value: null,
    },
    BBPower: {
      title: 'Bull Bear Power',
      inputs: ['Rec.BBPower'],
      signalComputation: signalComputation.computeSimpleSignal,
      result: null,
      value: null,
    },
    UO: {
      title: 'Ultimate Oscillator (7, 14, 28)',
      inputs: ['Rec.UO'],
      signalComputation: signalComputation.computeSimpleSignal,
      result: null,
      value: null,
    },
  }
  const movingAverages = {
    EMA10: {
      title: 'Exponential Moving Average (10)',
      inputs: ['EMA10', 'close'],
      signalComputation: signalComputation.computeMASignal,
      result: null,
      value: null,
    },
    EMA20: {
      title: 'Exponential Moving Average (20)',
      inputs: ['EMA20', 'close'],
      signalComputation: signalComputation.computeMASignal,
      result: null,
      value: null,
    },
    EMA30: {
      title: 'Exponential Moving Average (30)',
      inputs: ['EMA30', 'close'],
      signalComputation: signalComputation.computeMASignal,
      result: null,
      value: null,
    },
    EMA50: {
      title: 'Exponential Moving Average (50)',
      inputs: ['EMA50', 'close'],
      signalComputation: signalComputation.computeMASignal,
      result: null,
      value: null,
    },
    EMA100: {
      title: 'Exponential Moving Average (100)',
      inputs: ['EMA100', 'close'],
      signalComputation: signalComputation.computeMASignal,
      result: null,
      value: null,
    },
    EMA200: {
      title: 'Exponential Moving Average (200)',
      inputs: ['EMA200', 'close'],
      signalComputation: signalComputation.computeMASignal,
      result: null,
      value: null,
    },
    SMA10: {
      title: 'Simple Moving Average (10)',
      inputs: ['SMA10', 'close'],
      signalComputation: signalComputation.computeMASignal,
      result: null,
      value: null,
    },
    SMA20: {
      title: 'Simple Moving Average (20)',
      inputs: ['SMA20', 'close'],
      signalComputation: signalComputation.computeMASignal,
      result: null,
      value: null,
    },
    SMA30: {
      title: 'Simple Moving Average (30)',
      inputs: ['SMA30', 'close'],
      signalComputation: signalComputation.computeMASignal,
      result: null,
      value: null,
    },
    SMA50: {
      title: 'Simple Moving Average (50)',
      inputs: ['SMA50', 'close'],
      signalComputation: signalComputation.computeMASignal,
      result: null,
      value: null,
    },
    SMA100: {
      title: 'Simple Moving Average (100)',
      inputs: ['SMA100', 'close'],
      signalComputation: signalComputation.computeMASignal,
      result: null,
      value: null,
    },
    SMA200: {
      title: 'Simple Moving Average (200)',
      inputs: ['SMA200', 'close'],
      signalComputation: signalComputation.computeMASignal,
      result: null,
      value: null,
    },
    'Ichimoku.BLine': {
      title: 'Ichimoku Base Line (9, 26, 52, 26)',
      inputs: ['Rec.Ichimoku'],
      signalComputation: signalComputation.computeSimpleSignal,
      result: null,
      value: null,
    },
    VWMA: {
      title: 'Volume Weighted Moving Average (20)',
      inputs: ['Rec.VWMA'],
      signalComputation: signalComputation.computeSimpleSignal,
      result: null,
      value: null,
    },
    HullMA9: {
      title: 'Hull Moving Average (9)',
      inputs: ['Rec.HullMA9'],
      signalComputation: signalComputation.computeSimpleSignal,
      result: null,
      value: null,
    },
  }

  for (const os in oscillators) {
    const input = oscillators[os].inputs.map((i) => rawData[i])

    oscillators[os].value = rawData[os]
    oscillators[os].result = oscillators[os].signalComputation(...input)
  }
  for (const ma in movingAverages) {
    const input = movingAverages[ma].inputs.map((i) => rawData[i])

    movingAverages[ma].value = rawData[ma]
    movingAverages[ma].result = movingAverages[ma].signalComputation(...input)
  }

  return {
    oscillators: Object.values(oscillators).map(({ title, value, result }) => ({
      title,
      value,
      result,
    })),
    movingAverages: Object.values(movingAverages).map(
      ({ title, value, result }) => ({ title, value, result }),
    ),
  }
}


/* Example */
getTechnicalAnalysisData('BINANCE', 'BTCUSDT', '1d').then((resp) => {
  let data = prepareTechnicalAnalysisData(resp)
  console.log(data)
})
