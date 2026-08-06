const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

/**
 * Crea una instancia del navegador Chrome.
 * Por defecto se abre visible (headless: false) para que puedas
 * grabar el video demostrativo mostrando la ejecución real.
 *
 * Para correr en modo headless (sin ventana), define la variable de entorno:
 *   HEADLESS=true npm test        (Mac/Linux)
 *   $env:HEADLESS="true"; npm test   (Windows PowerShell)
 */
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
