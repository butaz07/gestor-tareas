const { expect } = require('chai');
const { buildDriver } = require('../helpers/driver');
const { takeScreenshot } = require('../helpers/screenshot');
const { pause } = require('../helpers/pause');
const { LoginPage } = require('../pages/LoginPage');
const { VALID_USERNAME, VALID_PASSWORD } = require('../helpers/authHelper');

describe('Login (HU1 y HU2)', function () {
  let driver;
  let loginPage;

  beforeEach(async function () {
    driver = await buildDriver();
    loginPage = new LoginPage(driver);
  });

  afterEach(async function () {
    if (!driver) return;
    await takeScreenshot(driver, this, this.currentTest.title);
    await driver.quit();
  });

  // HU1 - Camino feliz
  it('HU1 - permite iniciar sesión con credenciales válidas', async function () {
    await loginPage.open();
    await pause(driver);

    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await pause(driver);

    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).to.include('/tasks');

    const pageSource = await driver.getPageSource();
    expect(pageSource).to.include(VALID_USERNAME);
  });

  // HU2 - Prueba negativa
  it('HU2 - rechaza el acceso con contraseña incorrecta y muestra un mensaje de error', async function () {
    await loginPage.open();
    await pause(driver);

    await loginPage.login(VALID_USERNAME, 'contraseñaIncorrecta123');
    await pause(driver);

    const errorText = await loginPage.getErrorText();
    expect(errorText).to.equal('Usuario o contraseña incorrectos');

    // Debe permanecer en /login, nunca haber otorgado sesión
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).to.include('/login');
  });

  // HU2 - Prueba negativa adicional: campos vacíos
  it('HU2 - no permite enviar el formulario con campos vacíos', async function () {
    await loginPage.open();
    await pause(driver);

    await loginPage.submitEmpty();
    await pause(driver);

    // El navegador bloquea el envío por el atributo "required" del HTML;
    // seguimos en /login y ningún dato fue procesado por el servidor.
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).to.include('/login');
  });
});
