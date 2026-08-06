/**
 * Pausa breve entre acciones para que el video demostrativo se vea claro.
 * Por defecto espera 700ms. Se puede ajustar o desactivar con variables de entorno:
 *
 *   $env:SLOW_MO_MS="1200"; npm test   -> pausas de 1.2s (más lento, ideal para grabar)
 *   $env:FAST="true"; npm test         -> sin pausas (ejecución rápida, para correr seguido)
 */
const DELAY_MS = process.env.FAST === 'true' ? 0 : Number(process.env.SLOW_MO_MS || 700);

async function pause(driver) {
  if (DELAY_MS > 0) {
    await driver.sleep(DELAY_MS);
  }
}

module.exports = { pause };
