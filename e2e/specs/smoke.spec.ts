import { expect, test } from '@playwright/test';

test.describe('Smoke', () => {
  test('la Home carga con su título y sin errores de JS', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));

    await page.goto('/');

    await expect(page).toHaveTitle(/Lugabiz/);
    await expect(page.locator('#root')).not.toBeEmpty();
    expect(pageErrors).toEqual([]);
  });

  test('una ruta inexistente no deja la pantalla en blanco', async ({ page }) => {
    await page.goto('/ruta-que-no-existe');
    await expect(page.locator('#root')).not.toBeEmpty();
  });
});
