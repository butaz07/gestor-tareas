const { By, until } = require('selenium-webdriver');

const BASE_URL = 'http://localhost:3000';

/**
 * Page Object de la pantalla de inicio de sesión.
 * Encapsula los selectores y las acciones posibles sobre /login,
 * para que las pruebas no dependan de selectores CSS sueltos.
 */
class LoginPage {
  constructor(driver) {
    this.driver = driver;
    this.usernameInput = By.css('[data-testid="username-input"]');
    this.passwordInput = By.css('[data-testid="password-input"]');
    this.loginButton = By.css('[data-testid="login-button"]');
    this.errorMessage = By.css('[data-testid="login-error"]');
  }

  async open() {
    await this.driver.get(`${BASE_URL}/login`);
  }

  async login(username, password) {
    await this.driver.findElement(this.usernameInput).sendKeys(username);
    await this.driver.findElement(this.passwordInput).sendKeys(password);
    await this.driver.findElement(this.loginButton).click();
  }

  async submitEmpty() {
    await this.driver.findElement(this.loginButton).click();
  }

  async getErrorText() {
    const el = await this.driver.wait(until.elementLocated(this.errorMessage), 5000);
    return el.getText();
  }

  async getCurrentUrl() {
    return this.driver.getCurrentUrl();
  }
}

module.exports = { LoginPage, BASE_URL };
