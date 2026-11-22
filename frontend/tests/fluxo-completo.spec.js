import { test, expect } from '@playwright/test'

test('Fluxo completo - login, cadastro, gargalo e anexo', async ({
  page,
}) => {

  // LOGIN

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

  // CADASTRO

  await page.goto('/cadastro')

  const timestamp = Date.now()

  await page
    .locator('#orgaoSolicitante')
    .fill(`Teste Playwright ${timestamp}`)

  await page
    .locator('#tipoOcorrencia')
    .fill('Teste Automatizado')

  await page
    .locator('#dataEntrada')
    .fill('2026-11-22')

  await page
    .locator('#prazoResposta')
    .fill('2026-12-31')

  await page
    .locator('#municipio')
    .fill('Recife')

  await page
    .locator('#bairro')
    .fill('Boa Viagem')

  await page
    .locator('#descricao')
    .fill(
      'Demanda criada automaticamente pelo Playwright',
    )

  await page
    .getByRole('button', {
      name: 'Cadastrar demanda',
    })
    .click()

  await expect(page)
    .toHaveURL(/demandas/)

  // ABRIR DEMANDA CRIADA

  await page
    .getByText(`Teste Playwright ${timestamp}`)
    .click()

  // REGISTRAR GARGALO

  await page
    .locator('#descricaoGargalo')
    .fill(
      'Gargalo criado automaticamente pelo teste',
    )

  await page
    .getByRole('button', {
      name: 'Registrar gargalo',
    })
    .click()

  await expect(
    page.getByText(
      'Gargalo registrado com sucesso.',
    ),
  ).toBeVisible()

  // ANEXAR DOCUMENTO

  await page
  .locator('#arquivoDocumento')
  .setInputFiles('./tests/arquivo-teste.txt')

  await page
    .locator('#tipoDocumento')
    .selectOption('Relatório')

  await page
    .locator('#descricaoDocumento')
    .fill(
      'Documento enviado automaticamente pelo Playwright',
    )

  await page
    .getByRole('button', {
      name: 'Anexar documento',
    })
    .click()

  await page.waitForTimeout(3000)
})