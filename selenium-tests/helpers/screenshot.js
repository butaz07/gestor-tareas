const fs = require('fs');
const path = require('path');
const addContext = require('mochawesome/addContext');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Toma una captura de pantalla del estado actual del navegador,
 * la guarda en /screenshots y la adjunta al reporte HTML de Mochawesome.
 *
 * @param {WebDriver} driver - instancia de Selenium
 * @param {Mocha.Context} mochaContext - el "this" del test (para adjuntar al reporte)
 * @param {string} label - nombre descriptivo del escenario (sin espacios raros)
 */
async function takeScreenshot(driver, mochaContext, label) {
  const safeLabel = label.replace(/[^a-z0-9-_]/gi, '_');
  const fileName = `${Date.now()}_${safeLabel}.png`;
  const filePath = path.join(SCREENSHOTS_DIR, fileName);

  const image = await driver.takeScreenshot();
  fs.writeFileSync(filePath, image, 'base64');

  // Adjunta la imagen al reporte HTML (aparece dentro del detalle del test)
  addContext(mochaContext, path.join('..', 'screenshots', fileName));
}

module.exports = { takeScreenshot };
