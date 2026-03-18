import { expect, test } from '@playwright/test'

const backendBaseUrl = 'http://127.0.0.1:3100'

test('manager can create, filter, and export cost records from the frontend', async ({
  page,
  request,
}) => {
  const stamp = Date.now()
  const email = `costs-playwright-${stamp}@example.com`
  const password = 'password123'
  const name = `Cost User ${stamp}`
  const orgName = `Cost Org ${stamp}`
  const areaName = `Kitchen Ops ${stamp}`
  const recordTitle = `Spoiled produce ${stamp}`

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

  const createAreaResponse = await request.post(`${backendBaseUrl}/api/sections`, {
    data: { name: areaName },
    headers: {
      Authorization: `Bearer ${loginPayload.token}`,
      'x-org-id': String(orgPayload.id),
    },
  })
  expect(createAreaResponse.ok()).toBeTruthy()

  await page.addInitScript(
    ({ token, orgId }) => {
      window.localStorage.setItem('auth_token', token)
      window.localStorage.setItem('activeOrgId', String(orgId))
    },
    { token: loginPayload.token as string, orgId: orgPayload.id as number }
  )

  await page.goto('/')
  await expect(page.getByText(orgName)).toBeVisible()

  await page.getByRole('tab', { name: /Costs/ }).click()
  await expect(page.getByRole('heading', { name: 'Costs' })).toBeVisible()

  await page.getByLabel('Create cost record').click()
  await page.getByPlaceholder('e.g., Spoiled produce').fill(recordTitle)
  await page.getByPlaceholder('e.g., 86.50').fill('86.50')
  await page.getByPlaceholder('Fresh Greens Co.').fill('Fresh Greens Co.')
  await page
    .getByPlaceholder('Describe what happened or what was purchased.')
    .fill('Walk-in cooler issue overnight.')
  await page.getByText('Save Record', { exact: true }).click()

  await expect(page).toHaveURL(/\/costs$/)
  await expect(page.getByText(recordTitle)).toBeVisible()
  await expect(page.getByText('Fresh Greens Co.')).toBeVisible()
  await page.getByLabel('Filter costs by Waste').click()

  const downloadPromise = page.waitForEvent('download')
  await page.getByLabel('Export cost records').click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toContain('cost-records')
})
