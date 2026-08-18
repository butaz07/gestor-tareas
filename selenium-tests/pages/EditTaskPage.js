const { By, until } = require('selenium-webdriver');

/**
 * Page Object de /tasks/:id/edit.
 */
class EditTaskPage {
  constructor(driver) {
    this.driver = driver;

    this.editForm = By.css('[data-testid="edit-task-form"]');
    this.titleInput = By.css('[data-testid="task-title-input"]');
    this.descriptionInput = By.css('[data-testid="task-description-input"]');
    this.dueDateInput = By.css('[data-testid="task-duedate-input"]');
    this.updateButton = By.css('[data-testid="update-task-button"]');
    this.formErrors = By.css('[data-testid="form-errors"]');
  }

  async waitUntilLoaded() {
    await this.driver.wait(until.elementLocated(this.editForm), 5000);
  }

  async setTitle(title) {
    const el = await this.driver.findElement(this.titleInput);
    await el.clear();
    await el.sendKeys(title);
  }

  async setDueDate(dueDate) {
    await this.driver.executeScript(
      `document.querySelector('[data-testid="task-duedate-input"]').value = arguments[0];`,
      dueDate
    );
  }

  async submit() {
    await this.driver.findElement(this.updateButton).click();
  }

  async getFormErrorsText() {
    const el = await this.driver.wait(until.elementLocated(this.formErrors), 5000);
    return el.getText();
  }
}

module.exports = { EditTaskPage };
