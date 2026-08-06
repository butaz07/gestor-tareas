const { By, until } = require('selenium-webdriver');

const BASE_URL = 'http://localhost:3000';
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'Admin123';

/**
 * Inicia sesión con las credenciales válidas y deja al driver
 * posicionado en /tasks, listo para las pruebas de CRUD.
 */
async function loginAsValidUser(driver) {
  await driver.get(`${BASE_URL}/login`);
  await driver.findElement(By.css('[data-testid="username-input"]')).sendKeys(VALID_USERNAME);
  await driver.findElement(By.css('[data-testid="password-input"]')).sendKeys(VALID_PASSWORD);
  await driver.findElement(By.css('[data-testid="login-button"]')).click();
  await driver.wait(until.urlContains('/tasks'), 5000);
}

module.exports = { loginAsValidUser, BASE_URL, VALID_USERNAME, VALID_PASSWORD };
