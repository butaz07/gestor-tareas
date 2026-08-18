const { expect } = require('chai');
const { buildDriver } = require('../helpers/driver');
const { takeScreenshot } = require('../helpers/screenshot');
const { pause } = require('../helpers/pause');
const { loginAsValidUser } = require('../helpers/authHelper');
const { TasksPage } = require('../pages/TasksPage');
const { EditTaskPage } = require('../pages/EditTaskPage');

// Título de exactamente 50 caracteres (límite permitido)
const TITLE_50_CHARS = 'A'.repeat(50);
// Título de 51 caracteres (un carácter por encima del límite)
const TITLE_51_CHARS = 'A'.repeat(51);

describe('CRUD de tareas (HU3, HU4, HU5, HU6)', function () {
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

  // ---------- HU3: Crear tarea ----------

  it('HU3 - camino feliz: crea una tarea con datos válidos', async function () {
    await tasksPage.createTask('Comprar materiales', 'Para el proyecto final', '2026-12-31');
    await pause(driver);

    await tasksPage.waitForTable();
    expect(await tasksPage.pageContainsText('Comprar materiales')).to.be.true;
  });

  it('HU3 - negativa: no crea la tarea si el título está vacío', async function () {
    await tasksPage.createTask('', 'Descripción sin título', '2026-12-31');
    await pause(driver);

    const errorText = await tasksPage.getFormErrorsText();
    expect(errorText).to.include('El título es obligatorio');
  });

  it('HU3/HU6 - límite: acepta un título de exactamente 50 caracteres', async function () {
    await tasksPage.createTask(TITLE_50_CHARS, 'Prueba de límite', '2026-12-31');
    await pause(driver);

    await tasksPage.waitForTable();
    expect(await tasksPage.pageContainsText(TITLE_50_CHARS)).to.be.true;
  });

  it('HU3/HU6 - límite: rechaza un título de 51 caracteres', async function () {
    await tasksPage.createTask(TITLE_51_CHARS, 'Prueba de límite', '2026-12-31');
    await pause(driver);

    const errorText = await tasksPage.getFormErrorsText();
    expect(errorText).to.include('no puede superar los 50 caracteres');
  });

  it('HU3 - negativa: rechaza una fecha límite anterior a hoy', async function () {
    await tasksPage.createTask('Tarea con fecha vencida', 'x', '2020-01-01');
    await pause(driver);

    const errorText = await tasksPage.getFormErrorsText();
    expect(errorText).to.include('no puede ser anterior a hoy');
  });

  // ---------- HU4: Editar tarea ----------

  it('HU4 - camino feliz: edita el título de una tarea existente', async function () {
    await tasksPage.createTask('Tarea original', 'x', '2026-12-31');
    await pause(driver);
    await tasksPage.clickEditForTitle('Tarea original');
    await pause(driver);

    const editPage = new EditTaskPage(driver);
    await editPage.waitUntilLoaded();
    await editPage.setTitle('Tarea editada');
    await editPage.submit();
    await pause(driver);

    await tasksPage.waitForTable();
    expect(await tasksPage.pageContainsText('Tarea editada')).to.be.true;
  });

  it('HU4/HU6 - límite: acepta la edición con un título de exactamente 50 caracteres', async function () {
    await tasksPage.createTask('Tarea para editar limite 50', 'x', '2026-12-31');
    await pause(driver);
    await tasksPage.clickEditForTitle('Tarea para editar limite 50');
    await pause(driver);

    const editPage = new EditTaskPage(driver);
    await editPage.waitUntilLoaded();
    await editPage.setTitle(TITLE_50_CHARS);
    await editPage.submit();
    await pause(driver);

    await tasksPage.waitForTable();
    expect(await tasksPage.pageContainsText(TITLE_50_CHARS)).to.be.true;
  });

  it('HU4/HU6 - límite: rechaza la edición con un título de 51 caracteres', async function () {
    await tasksPage.createTask('Tarea para editar', 'x', '2026-12-31');
    await pause(driver);
    await tasksPage.clickEditForTitle('Tarea para editar');
    await pause(driver);

    const editPage = new EditTaskPage(driver);
    await editPage.waitUntilLoaded();
    await editPage.setTitle(TITLE_51_CHARS);
    await editPage.submit();
    await pause(driver);

    const errorText = await editPage.getFormErrorsText();
    expect(errorText).to.include('no puede superar los 50 caracteres');
  });

  it('HU4 - negativa: rechaza la edición si el título queda vacío', async function () {
    await tasksPage.createTask('Tarea para dejar sin titulo', 'x', '2026-12-31');
    await pause(driver);
    await tasksPage.clickEditForTitle('Tarea para dejar sin titulo');
    await pause(driver);

    const editPage = new EditTaskPage(driver);
    await editPage.waitUntilLoaded();
    await editPage.setTitle('');
    await editPage.submit();
    await pause(driver);

    const errorText = await editPage.getFormErrorsText();
    expect(errorText).to.include('El título es obligatorio');
  });

  it('HU4 - negativa: rechaza la edición con una fecha límite anterior a hoy', async function () {
    await tasksPage.createTask('Tarea para fecha invalida', 'x', '2026-12-31');
    await pause(driver);
    await tasksPage.clickEditForTitle('Tarea para fecha invalida');
    await pause(driver);

    const editPage = new EditTaskPage(driver);
    await editPage.waitUntilLoaded();
    await editPage.setDueDate('2020-01-01');
    await editPage.submit();
    await pause(driver);

    const errorText = await editPage.getFormErrorsText();
    expect(errorText).to.include('no puede ser anterior a hoy');
  });

  // ---------- HU5: Eliminar tarea ----------

  it('HU5 - camino feliz: elimina una tarea existente', async function () {
    const uniqueTitle = `Tarea a eliminar ${Date.now()}`;
    await tasksPage.createTask(uniqueTitle, 'x', '2026-12-31');
    await pause(driver);
    await tasksPage.waitForTable();

    // Puede haber varias tareas en la tabla (de pruebas anteriores),
    // por eso ubicamos específicamente la fila que contiene nuestro título único.
    await tasksPage.deleteTaskAndAccept(uniqueTitle);
    await pause(driver);

    await tasksPage.waitForTable();
    expect(await tasksPage.pageContainsText(uniqueTitle)).to.be.false;
  });

  it('HU5 - negativa: cancelar la confirmación no elimina la tarea', async function () {
    const uniqueTitle = `Tarea que no se borra ${Date.now()}`;
    await tasksPage.createTask(uniqueTitle, 'x', '2026-12-31');
    await pause(driver);
    await tasksPage.waitForTable();

    await tasksPage.deleteTaskAndCancel(uniqueTitle);
    await pause(driver);

    // Al cancelar el diálogo nativo, la tarea debe seguir existiendo.
    await tasksPage.open();
    await tasksPage.waitForTable();
    expect(await tasksPage.pageContainsText(uniqueTitle)).to.be.true;
  });

  it('HU5 - borde: eliminar un id de tarea inexistente no genera error ni afecta otras tareas', async function () {
    const survivorTitle = `Tarea que debe sobrevivir ${Date.now()}`;
    await tasksPage.createTask(survivorTitle, 'x', '2026-12-31');
    await pause(driver);
    await tasksPage.waitForTable();

    // Un id que no existe en la base de datos (ni pertenece a ningún usuario).
    const fakeId = 999999999999;
    await tasksPage.deleteByIdViaFetch(fakeId);
    await pause(driver);

    await tasksPage.open();
    await tasksPage.waitForTable();
    expect(await tasksPage.pageContainsText(survivorTitle)).to.be.true;
  });
});
