# README #

This README would normally document whatever steps are necessary to get your application up and running.

## What is this repository for? ##

Analytical Server "OHLC" (Open/High/Low/Close) time series based on the 'Trades' input dataset.

### `npm install`

Dependend packages will install

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:5000](http://localhost:5000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## Detailed Documentation ##

You can see the `OHLC BAR` chart with blank values ​​after page render. Below that bar chart you will see the `Start` button to start the fake trade and a timer will run next to the button to indicate the end time of the trade.

For the first 15 seconds the 'OHLC Bar' chart will be empty. The results will be displayed at the end of 15 seconds. The result json will publish the result next to the chart.
This will continue until the sample file data is exhausted
