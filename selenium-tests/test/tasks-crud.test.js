const { By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const { buildDriver } = require('../helpers/driver');
const { takeScreenshot } = require('../helpers/screenshot');
const { pause } = require('../helpers/pause');
const { loginAsValidUser } = require('../helpers/authHelper');

// Título de exactamente 50 caracteres (límite permitido)
const TITLE_50_CHARS = 'A'.repeat(50);
// Título de 51 caracteres (un carácter por encima del límite)
const TITLE_51_CHARS = 'A'.repeat(51);

describe('CRUD de tareas (HU3, HU4, HU5, HU6)', function () {
  let driver;

  beforeEach(async function () {
    driver = await buildDriver();
    await loginAsValidUser(driver);
  });

  afterEach(async function () {
    if (!driver) return;
    await takeScreenshot(driver, this, this.currentTest.title);
    await driver.quit();
  });

  async function fillTaskForm(title, description, dueDate) {
    const titleInput = await driver.findElement(By.css('[data-testid="task-title-input"]'));
    await titleInput.clear();
    await titleInput.sendKeys(title);
    await pause(driver);

    const descInput = await driver.findElement(By.css('[data-testid="task-description-input"]'));
    await descInput.clear();
    await descInput.sendKeys(description);
    await pause(driver);

    await driver.executeScript(
      `document.querySelector('[data-testid="task-duedate-input"]').value = arguments[0];`,
      dueDate
    );
    await pause(driver);
  }

  // ---------- HU3: Crear tarea ----------

  it('HU3 - camino feliz: crea una tarea con datos válidos', async function () {
    await fillTaskForm('Comprar materiales', 'Para el proyecto final', '2026-12-31');
    await driver.findElement(By.css('[data-testid="create-task-button"]')).click();
    await pause(driver);

    await driver.wait(until.elementLocated(By.css('[data-testid="tasks-table"]')), 5000);
    const pageSource = await driver.getPageSource();
    expect(pageSource).to.include('Comprar materiales');
  });

  it('HU3 - negativa: no crea la tarea si el título está vacío', async function () {
    await fillTaskForm('', 'Descripción sin título', '2026-12-31');
    await driver.findElement(By.css('[data-testid="create-task-button"]')).click();
    await pause(driver);

    const errorList = await driver.wait(
      until.elementLocated(By.css('[data-testid="form-errors"]')),
      5000
    );
    const errorText = await errorList.getText();
    expect(errorText).to.include('El título es obligatorio');
  });

  it('HU3/HU6 - límite: acepta un título de exactamente 50 caracteres', async function () {
    await fillTaskForm(TITLE_50_CHARS, 'Prueba de límite', '2026-12-31');
    await driver.findElement(By.css('[data-testid="create-task-button"]')).click();
    await pause(driver);

    await driver.wait(until.elementLocated(By.css('[data-testid="tasks-table"]')), 5000);
    const pageSource = await driver.getPageSource();
    expect(pageSource).to.include(TITLE_50_CHARS);
  });

  it('HU3/HU6 - límite: rechaza un título de 51 caracteres', async function () {
    await fillTaskForm(TITLE_51_CHARS, 'Prueba de límite', '2026-12-31');
    await driver.findElement(By.css('[data-testid="create-task-button"]')).click();
    await pause(driver);

    const errorList = await driver.wait(
      until.elementLocated(By.css('[data-testid="form-errors"]')),
      5000
    );
    const errorText = await errorList.getText();
    expect(errorText).to.include('no puede superar los 50 caracteres');
  });

  it('HU3 - negativa: rechaza una fecha límite anterior a hoy', async function () {
    await fillTaskForm('Tarea con fecha vencida', 'x', '2020-01-01');
    await driver.findElement(By.css('[data-testid="create-task-button"]')).click();
    await pause(driver);

    const errorList = await driver.wait(
      until.elementLocated(By.css('[data-testid="form-errors"]')),
      5000
    );
    const errorText = await errorList.getText();
    expect(errorText).to.include('no puede ser anterior a hoy');
  });

  // ---------- HU4: Editar tarea ----------

  it('HU4 - camino feliz: edita el título de una tarea existente', async function () {
    // Primero creamos una tarea para poder editarla
    await fillTaskForm('Tarea original', 'x', '2026-12-31');
    await driver.findElement(By.css('[data-testid="create-task-button"]')).click();
    await pause(driver);
    await driver.wait(until.elementLocated(By.css('[data-testid="edit-task-link"]')), 5000);

    await driver.findElement(By.css('[data-testid="edit-task-link"]')).click();
    await pause(driver);
    await driver.wait(until.elementLocated(By.css('[data-testid="edit-task-form"]')), 5000);

    const titleInput = await driver.findElement(By.css('[data-testid="task-title-input"]'));
    await titleInput.clear();
    await titleInput.sendKeys('Tarea editada');
    await driver.findElement(By.css('[data-testid="update-task-button"]')).click();
    await pause(driver);

    await driver.wait(until.elementLocated(By.css('[data-testid="tasks-table"]')), 5000);
    const pageSource = await driver.getPageSource();
    expect(pageSource).to.include('Tarea editada');
  });

  it('HU4/HU6 - límite: rechaza la edición con un título de 51 caracteres', async function () {
    await fillTaskForm('Tarea para editar', 'x', '2026-12-31');
    await driver.findElement(By.css('[data-testid="create-task-button"]')).click();
    await pause(driver);
    await driver.wait(until.elementLocated(By.css('[data-testid="edit-task-link"]')), 5000);

    await driver.findElement(By.css('[data-testid="edit-task-link"]')).click();
    await pause(driver);
    await driver.wait(until.elementLocated(By.css('[data-testid="edit-task-form"]')), 5000);

    const titleInput = await driver.findElement(By.css('[data-testid="task-title-input"]'));
    await titleInput.clear();
    await titleInput.sendKeys(TITLE_51_CHARS);
    await driver.findElement(By.css('[data-testid="update-task-button"]')).click();
    await pause(driver);

    const errorList = await driver.wait(
      until.elementLocated(By.css('[data-testid="form-errors"]')),
      5000
    );
    const errorText = await errorList.getText();
    expect(errorText).to.include('no puede superar los 50 caracteres');
  });

  // ---------- HU5: Eliminar tarea ----------

  it('HU5 - camino feliz: elimina una tarea existente', async function () {
    const uniqueTitle = `Tarea a eliminar ${Date.now()}`;
    await fillTaskForm(uniqueTitle, 'x', '2026-12-31');
    await driver.findElement(By.css('[data-testid="create-task-button"]')).click();
    await pause(driver);
    await driver.wait(until.elementLocated(By.css('[data-testid="tasks-table"]')), 5000);

    // Puede haber varias tareas en la tabla (de pruebas anteriores),
    // por eso ubicamos específicamente la FILA que contiene nuestro título único
    // y hacemos clic en el botón "Eliminar" dentro de esa fila, no en el primero que aparezca.
    const rowXPath = `//tr[@data-testid="task-row"][.//td[contains(text(), "${uniqueTitle}")]]`;
    const deleteButtonXPath = `${rowXPath}//button[@data-testid="delete-task-button"]`;

    await driver.wait(until.elementLocated(By.xpath(rowXPath)), 5000);
    await driver.findElement(By.xpath(deleteButtonXPath)).click();
    await pause(driver);

    // La app usa confirm() nativo del navegador; hay que aceptarlo
    const alert = await driver.wait(until.alertIsPresent(), 3000);
    await alert.accept();

    await driver.wait(until.elementLocated(By.css('[data-testid="tasks-table"]')), 5000);
    const pageSource = await driver.getPageSource();
    expect(pageSource).to.not.include(uniqueTitle);
  });
});
