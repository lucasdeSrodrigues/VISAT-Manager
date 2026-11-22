import { test, expect } from '@playwright/test'

test('Login como Gestor', async ({ page }) => {
  await page.goto('/')

  await page
    .locator('input[value="gestor"]')
    .check({ force: true })

  await page
    .getByPlaceholder('Digite seu e-mail')
    .fill('gestor@visat.com')

  await page
    .getByPlaceholder('Digite sua senha')
    .fill('Gestor@123')

  await page
    .getByRole('button', {
      name: /Entrar como Gestor/i,
    })
    .click()

  await expect(page)
    .toHaveURL(/dashboard/, {
      timeout: 15000,
    })
})
   

test('Login como Inspetor', async ({ page }) => {
  await page.goto('/')

  await page
    .getByPlaceholder('Digite seu e-mail')
    .fill('inspetor@visat.com')

  await page
    .getByPlaceholder('Digite sua senha')
    .fill('Inspetor@123')

  await page
    .getByRole('button')
    .click()

  await expect(page)
    .toHaveURL(/dashboard/)
})