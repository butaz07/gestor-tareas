//Iba demasiado rapido la prueba con selenium asi que se le aplico esta medida para que vaya mas lento
const DELAY_MS = process.env.FAST === 'true' ? 0 : Number(process.env.SLOW_MO_MS || 700);

async function pause(driver) {
  if (DELAY_MS > 0) {
    await driver.sleep(DELAY_MS);
  }
}

module.exports = { pause };
