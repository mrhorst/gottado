import { expect, test } from '@playwright/test'

const backendBaseUrl = 'http://127.0.0.1:3100'

test('manager can create an issue from the frontend', async ({ page, request }) => {
  const stamp = Date.now()
  const email = `issues-playwright-${stamp}@example.com`
  const password = 'password123'
  const name = `Issue User ${stamp}`
  const orgName = `Issue Org ${stamp}`
  const areaName = `Dining Room ${stamp}`
  const issueTitle = `Guest complaint ${stamp}`

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

  await page.getByRole('tab', { name: /Issues/ }).click()
  await expect(page.getByRole('heading', { name: 'Issues' })).toBeVisible()

  await page.getByLabel('Create issue').click()
  await page.getByPlaceholder('e.g., Guest complaint about cold food').fill(issueTitle)
  await page
    .getByPlaceholder('Capture what happened and what follow-up is needed.')
    .fill('Table 12 received entrees below temp and asked for manager.')
  await page.getByText('Save Issue', { exact: true }).click()

  await expect(page).toHaveURL(/\/issues$/)
  await expect(page.getByText(issueTitle)).toBeVisible()
  await expect(page.getByText(areaName)).toBeVisible()
})
