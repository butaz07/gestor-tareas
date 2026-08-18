const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');


async function buildDriver() {
  const options = new chrome.Options();
  options.addArguments('--window-size=1280,900');
  options.addArguments('--disable-notifications');

  if (process.env.HEADLESS === 'true') {
    options.addArguments('--headless=new');
  }

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  return driver;
}

module.exports = { buildDriver };
