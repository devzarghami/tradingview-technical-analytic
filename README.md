# TradingView Technical Analytic Data Scraper

This Node.js script allows you to scrape technical analysis data from TradingView, a popular charting platform for traders and investors. You can use this data for your own analysis or automate trading-related tasks.

## Prerequisites

Before using this script, make sure you have the following installed:

- Node.js: You can download and install it from [Node.js website](https://nodejs.org/).

## Getting Started

1. Clone or download this repository to your local machine.

```bash
git clone https://github.com/devzarghami/tradingview-technical-analytic.git
```

2. Navigate to the project directory.

```bash
cd tradingview-technical-analytic
```

3. Install the required dependencies.

```bash
npm install
```

4. Run the script.

```bash
node scraper.js
```

The script will start scraping the technical analysis data from the specified TradingView URLs.

## Data Output

![tradingview-technical-analysis](https://github.com/devzarghami/tradingview-technical-analytic/blob/main/tradingview-technical-analysis-compare.png)

```bash
{
      oscillators: [
        {
          title: 'Relative Strength Index (14)',
          value: 72.85561112,
          result: 'sell'
        },
        ...
      ],
      movingAverages: [
        {
          title: 'Exponential Moving Average (10)',
          value: 22776.85071884,
          result: 'buy'
        },
        ...
      ]
    }
```

## Customization

You can customize the script to scrape additional data or modify its behavior according to your requirements. The code is well-documented and organized in `scraper.js`. Feel free to explore and make changes as needed.

## Acknowledgments

- Special thanks to [TradingView](https://www.tradingview.com/) for providing valuable technical analysis data.

Happy scraping and trading!

https://www.tradingview.com/symbols/BTCUSDT/technicals/?exchange=BINANCE

![tradingview-technical-analysis](https://github.com/devzarghami/tradingview-technical-analytic/blob/main/tradingview-technical-analysis.png)


