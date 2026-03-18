import { expect, test } from '@playwright/test'

const backendBaseUrl = 'http://127.0.0.1:3100'

test('manager can create a team from the frontend', async ({ page, request }) => {
  const stamp = Date.now()
  const email = `playwright-${stamp}@example.com`
  const password = 'password123'
  const name = `Playwright User ${stamp}`
  const orgName = `Playwright Org ${stamp}`
  const teamName = `Playwright Team ${stamp}`

  const signupResponse = await request.post(`${backendBaseUrl}/api/signup`, {
    data: { email, name, password },
  })
  expect(signupResponse.ok()).toBeTruthy()

  const loginResponse = await request.post(`${backendBaseUrl}/api/login`, {
    data: { email, password },
  })
  expect(loginResponse.ok()).toBeTruthy()
  const loginPayload = await loginResponse.json()

  const createOrgResponse = await request.post(`${backendBaseUrl}/api/orgs`, {
    data: { name: orgName },
    headers: {
      Authorization: `Bearer ${loginPayload.token}`,
    },
  })
  expect(createOrgResponse.ok()).toBeTruthy()
  const orgPayload = await createOrgResponse.json()

  await page.addInitScript(
    ({ token, orgId }) => {
      window.localStorage.setItem('auth_token', token)
      window.localStorage.setItem('activeOrgId', String(orgId))
    },
    { token: loginPayload.token as string, orgId: orgPayload.id as number }
  )

  await page.goto('/')

  await expect(page.getByText(`Playwright Org ${stamp}`)).toBeVisible()
  await page.getByRole('tab', { name: /Areas/ }).click()
  await page.getByText('Teams', { exact: true }).click()
  await expect(page.getByText('Manage ownership across areas without changing access control.')).toBeVisible()
  await page.getByLabel('Create team').click()
  await expect(page).toHaveURL(/\/areas\/teams\/new$/)

  await page.getByPlaceholder('e.g., AM Kitchen Team').fill(teamName)
  await page.getByPlaceholder('Morning kitchen crew').fill('Frontend-created ownership team')
  await page.getByText('Create Team', { exact: true }).click()

  await expect(page).toHaveURL(/\/areas\/teams$/)
  await expect(page.getByText(teamName)).toBeVisible()
})
