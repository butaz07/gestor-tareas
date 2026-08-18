const { until } = require('selenium-webdriver');
const { LoginPage } = require('../pages/LoginPage');

const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'Admin123';

/**
 * Inicia sesión con las credenciales válidas y deja al driver
 * posicionado en /tasks, listo para las pruebas de CRUD.
 */
async function loginAsValidUser(driver) {
  const loginPage = new LoginPage(driver);
  await loginPage.open();
  await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
  await driver.wait(until.urlContains('/tasks'), 5000);
}

module.exports = { loginAsValidUser, VALID_USERNAME, VALID_PASSWORD };
