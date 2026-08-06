const { By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const { buildDriver } = require('../helpers/driver');
const { takeScreenshot } = require('../helpers/screenshot');
const { pause } = require('../helpers/pause');
const { BASE_URL, VALID_USERNAME, VALID_PASSWORD } = require('../helpers/authHelper');

describe('Login (HU1 y HU2)', function () {
  let driver;

  beforeEach(async function () {
    driver = await buildDriver();
  });

  afterEach(async function () {
    if (!driver) return;
    await takeScreenshot(driver, this, this.currentTest.title);
    await driver.quit();
  });

  // HU1 - Camino feliz
  it('HU1 - permite iniciar sesión con credenciales válidas', async function () {
    await driver.get(`${BASE_URL}/login`);
    await pause(driver);

    await driver.findElement(By.css('[data-testid="username-input"]')).sendKeys(VALID_USERNAME);
    await pause(driver);
    await driver.findElement(By.css('[data-testid="password-input"]')).sendKeys(VALID_PASSWORD);
    await pause(driver);
    await driver.findElement(By.css('[data-testid="login-button"]')).click();
    await pause(driver);

    await driver.wait(until.urlContains('/tasks'), 5000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include('/tasks');

    const pageSource = await driver.getPageSource();
    expect(pageSource).to.include(VALID_USERNAME);
    await pause(driver);
  });

  // HU2 - Prueba negativa
  it('HU2 - rechaza el acceso con contraseña incorrecta y muestra un mensaje de error', async function () {
    await driver.get(`${BASE_URL}/login`);
    await pause(driver);

    await driver.findElement(By.css('[data-testid="username-input"]')).sendKeys(VALID_USERNAME);
    await pause(driver);
    await driver.findElement(By.css('[data-testid="password-input"]')).sendKeys('contraseñaIncorrecta123');
    await pause(driver);
    await driver.findElement(By.css('[data-testid="login-button"]')).click();
    await pause(driver);

    const errorElement = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-error"]')),
      5000
    );
    const errorText = await errorElement.getText();
    expect(errorText).to.equal('Usuario o contraseña incorrectos');
    await pause(driver);

    // Debe permanecer en /login, nunca haber otorgado sesión
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include('/login');
  });

  // HU2 - Prueba negativa adicional: campos vacíos
  it('HU2 - no permite enviar el formulario con campos vacíos', async function () {
    await driver.get(`${BASE_URL}/login`);
    await pause(driver);
    await driver.findElement(By.css('[data-testid="login-button"]')).click();
    await pause(driver);

    // El navegador bloquea el envío por el atributo "required" del HTML;
    // seguimos en /login y ningún dato fue procesado por el servidor.
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include('/login');
  });
});
