const { By, until } = require('selenium-webdriver');

const BASE_URL = 'http://localhost:3000';

/**
 * Page Object de /tasks: formulario de creación + listado de tareas.
 * Centraliza los selectores para que las pruebas describan "qué" se
 * verifica, no "cómo" se ubica cada elemento en el DOM.
 */
class TasksPage {
  constructor(driver) {
    this.driver = driver;

    this.titleInput = By.css('[data-testid="task-title-input"]');
    this.descriptionInput = By.css('[data-testid="task-description-input"]');
    this.dueDateInput = By.css('[data-testid="task-duedate-input"]');
    this.createButton = By.css('[data-testid="create-task-button"]');
    this.formErrors = By.css('[data-testid="form-errors"]');
    this.tasksTable = By.css('[data-testid="tasks-table"]');
    this.taskRows = By.css('[data-testid="task-row"]');
    this.emptyState = By.css('[data-testid="empty-state"]');
  }

  async open() {
    await this.driver.get(`${BASE_URL}/tasks`);
  }

  async fillForm(title, description, dueDate) {
    const titleEl = await this.driver.findElement(this.titleInput);
    await titleEl.clear();
    await titleEl.sendKeys(title);

    const descEl = await this.driver.findElement(this.descriptionInput);
    await descEl.clear();
    await descEl.sendKeys(description);

    // El input date se completa vía JS para evitar problemas de formato
    // regional del navegador con sendKeys sobre inputs type="date".
    await this.driver.executeScript(
      `document.querySelector('[data-testid="task-duedate-input"]').value = arguments[0];`,
      dueDate
    );
  }

  async submitCreate() {
    await this.driver.findElement(this.createButton).click();
  }

  async createTask(title, description, dueDate) {
    await this.fillForm(title, description, dueDate);
    await this.submitCreate();
  }

  async getFormErrorsText() {
    const el = await this.driver.wait(until.elementLocated(this.formErrors), 5000);
    return el.getText();
  }

  async waitForTable() {
    await this.driver.wait(until.elementLocated(this.tasksTable), 5000);
  }

  async isEmptyStateVisible() {
    const els = await this.driver.findElements(this.emptyState);
    return els.length > 0;
  }

  async getTaskCount() {
    const rows = await this.driver.findElements(this.taskRows);
    return rows.length;
  }

  rowXPathByTitle(title) {
    return `//tr[@data-testid="task-row"][.//td[contains(text(), "${title}")]]`;
  }

  async getRowByTitle(title) {
    const xpath = this.rowXPathByTitle(title);
    await this.driver.wait(until.elementLocated(By.xpath(xpath)), 5000);
    return this.driver.findElement(By.xpath(xpath));
  }

  async clickEditForTitle(title) {
    const xpath = `${this.rowXPathByTitle(title)}//a[@data-testid="edit-task-link"]`;
    await this.driver.findElement(By.xpath(xpath)).click();
  }

  async deleteTaskAndAccept(title) {
    const xpath = `${this.rowXPathByTitle(title)}//button[@data-testid="delete-task-button"]`;
    await this.driver.findElement(By.xpath(xpath)).click();
    const alert = await this.driver.wait(until.alertIsPresent(), 3000);
    await alert.accept();
  }

  async deleteTaskAndCancel(title) {
    const xpath = `${this.rowXPathByTitle(title)}//button[@data-testid="delete-task-button"]`;
    await this.driver.findElement(By.xpath(xpath)).click();
    const alert = await this.driver.wait(until.alertIsPresent(), 3000);
    await alert.dismiss();
  }

  /** Elimina, vía la interfaz, todas las tareas visibles del usuario actual. */
  async deleteAllVisibleTasks() {
    for (let i = 0; i < 50; i++) {
      const rows = await this.driver.findElements(this.taskRows);
      if (rows.length === 0) break;

      const countBeforeDelete = rows.length;

      try {
        const deleteBtn = await rows[0].findElement(By.css('[data-testid="delete-task-button"]'));
        await deleteBtn.click();
        const alert = await this.driver.wait(until.alertIsPresent(), 3000);
        await alert.accept();
      } catch (err) {
        // La fila que agarramos ya fue eliminada por una vuelta anterior
        // del bucle (la tabla no desaparece del DOM, solo sus filas, así
        // que una referencia vieja puede quedar "stale"). Reintentamos.
        if (err.name === 'StaleElementReferenceError') continue;
        throw err;
      }

      // OJO: la tabla ([data-testid="tasks-table"]) nunca se elimina del
      // DOM, solo sus filas. Esperar a que "la tabla exista" se resuelve
      // casi instantáneo y no garantiza que la fila ya se haya borrado.
      // Por eso esperamos a que la CANTIDAD de filas realmente baje.
      await this.driver.wait(async () => {
        const current = await this.driver.findElements(this.taskRows);
        return current.length < countBeforeDelete;
      }, 5000, 'Se esperaba que la cantidad de tareas bajara tras eliminar');
    }
  }

  async pageContainsText(text) {
    const pageSource = await this.driver.getPageSource();
    return pageSource.includes(text);
  }

  /**
   * Envía un POST de eliminación directo al servidor para un id que no
   * existe o no pertenece al usuario en sesión, sin pasar por la UI.
   * Sirve para probar el caso límite "eliminar un id inexistente".
   */
  async deleteByIdViaFetch(id) {
    await this.driver.executeScript(
      `return fetch('/tasks/' + arguments[0] + '/delete', { method: 'POST', credentials: 'same-origin' });`,
      id
    );
  }
}

module.exports = { TasksPage, BASE_URL };
