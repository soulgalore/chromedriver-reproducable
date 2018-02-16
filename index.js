'use strict';

const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('alto-saxophone').chromedriver;
// SETUP
const runs = 21;
const url = 'https://en.wikipedia.org/wiki/Sweden';


const chromeOptions = new chrome.Options();

// If you wanna try out mobile emulation enable by next row
// chromeOptions.setMobileEmulation({deviceName: 'iPhone 6'});

const logPrefs = new webdriver.logging.Preferences();
logPrefs.setLevel(
  webdriver.logging.Type.PERFORMANCE,
  webdriver.logging.Level.ALL
);

chromeOptions.setLoggingPrefs(logPrefs);

const timelineTraceCategories = 'devtools.timeline';
const perfLogConf = {
  enableNetwork: true,
  enablePage: true,
  traceCategories: timelineTraceCategories
};
chromeOptions.setPerfLoggingPrefs(perfLogConf);

// Use the Chromedriver supplied by alto-saxophone
const chromedriverPath = chromedriver.binPath();

async function run(i) {
  const serviceBuilder = new chrome.ServiceBuilder(chromedriverPath);
  serviceBuilder.loggingTo('./chromedriver-' + i + '.log');
  serviceBuilder.enableVerboseLogging();
  const chromeDriverService = serviceBuilder.build();
  chrome.setDefaultService(chromeDriverService);

  const driver = new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();

  return driver.get(url).then(() => {
    return driver
      .manage()
      .logs()
      .get(webdriver.logging.Type.PERFORMANCE)
      .then(messages => {
        console.log('Events collected:' + messages.length);
      })
      .then(() => driver.quit())
      .then(() => chromeDriverService.stop());
  });
}
async function runThemAll() {
  for (var i = 0; i < runs; i++) {
    await run(i).catch(err => {
      console.error(err);
    });
  }
}

runThemAll().then(() => console.log('Finished ' + runs + ' runs'));
