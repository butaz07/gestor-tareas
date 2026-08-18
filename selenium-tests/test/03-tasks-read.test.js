const { expect } = require('chai');
const { buildDriver } = require('../helpers/driver');
const { takeScreenshot } = require('../helpers/screenshot');
const { pause } = require('../helpers/pause');
const { loginAsValidUser } = require('../helpers/authHelper');
const { TasksPage } = require('../pages/TasksPage');

describe('Listado de tareas (HU4 - Leer)', function () {
  let driver;
  let tasksPage;

  beforeEach(async function () {
    driver = await buildDriver();
    tasksPage = new TasksPage(driver);
    await loginAsValidUser(driver);
  });

  afterEach(async function () {
    if (!driver) return;
    await takeScreenshot(driver, this, this.currentTest.title);
    await driver.quit();
  });

  it('HU4 - camino feliz: lista todas las tareas creadas, con su título y fecha límite correctos', async function () {
    const suffix = Date.now();
    const tasksToCreate = [
      { title: `Tarea de lectura A ${suffix}`, description: 'Primera', dueDate: '2026-09-01' },
      { title: `Tarea de lectura B ${suffix}`, description: 'Segunda', dueDate: '2026-09-15' },
      { title: `Tarea de lectura C ${suffix}`, description: 'Tercera', dueDate: '2026-10-01' },
    ];

    for (const t of tasksToCreate) {
      await tasksPage.createTask(t.title, t.description, t.dueDate);
      await pause(driver);
      await tasksPage.waitForTable();
    }

    // Las tres tareas deben aparecer en el listado, cada una en su propia fila,
    // con la fecha límite correcta junto a su título.
    for (const t of tasksToCreate) {
      const row = await tasksPage.getRowByTitle(t.title);
      const rowText = await row.getText();
      expect(rowText).to.include(t.title);
      expect(rowText).to.include(t.dueDate);
    }
  });

  it('HU4 - borde: muestra el estado vacío cuando el usuario no tiene tareas registradas', async function () {
    await tasksPage.open();
    await tasksPage.waitForTable();

    // Nos aseguramos de partir de un estado limpio, sin depender del orden
    // de ejecución de otros archivos de prueba.
    await tasksPage.deleteAllVisibleTasks();

    expect(await tasksPage.getTaskCount()).to.equal(0);
    expect(await tasksPage.isEmptyStateVisible()).to.be.true;
  });
});
