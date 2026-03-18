import { expect, test } from '@playwright/test'

const backendBaseUrl = 'http://127.0.0.1:3100'

test('manager can create a custom log type and add an entry from the frontend', async ({
  page,
  request,
}) => {
  const stamp = Date.now()
  const email = `logbook-playwright-${stamp}@example.com`
  const password = 'password123'
  const name = `Logbook User ${stamp}`
  const orgName = `Logbook Org ${stamp}`
  const logTypeTitle = `Dining Room Reports ${stamp}`
  const entryTitle = 'Lunch Rush'
  const entryBody = 'Strong lunch sales and two guest recovery issues handled.'

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
  await expect(page.getByText(orgName)).toBeVisible()

  await page.getByRole('tab', { name: /Logbook/ }).click()
  await expect(page.getByRole('heading', { name: 'Manager Logbook' })).toBeVisible()

  await page.getByLabel('Create log type').click()
  await page.getByPlaceholder('e.g., Dining Room Reports').fill(logTypeTitle)
  await page.getByPlaceholder('Front-of-house manager notes').fill('FOH manager shift notes')
  await page.getByText('Create Log Type', { exact: true }).click()

  await expect(page.getByText(logTypeTitle)).toBeVisible()
  await page.getByText(logTypeTitle, { exact: true }).click()

  await page.getByLabel('Create log entry').click()
  await page.getByPlaceholder('e.g., Lunch Rush').fill(entryTitle)
  await page
    .getByPlaceholder('Add the details managers need to keep the shift moving.')
    .fill(entryBody)
  await page.getByText('Save Entry', { exact: true }).click()

  await expect(page.getByText(entryTitle, { exact: true })).toBeVisible()
  await expect(page.getByText(entryBody).last()).toBeVisible()
})
