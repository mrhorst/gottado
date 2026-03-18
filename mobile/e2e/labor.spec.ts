import { expect, test } from '@playwright/test'

const backendBaseUrl = 'http://127.0.0.1:3100'

test('manager can create a labor shift from the frontend', async ({ page, request }) => {
  const stamp = Date.now()
  const email = `labor-playwright-${stamp}@example.com`
  const password = 'password123'
  const name = `Labor User ${stamp}`
  const orgName = `Labor Org ${stamp}`
  const areaName = `Kitchen Ops ${stamp}`
  const teamName = `AM Kitchen Team ${stamp}`
  const shiftTitle = `Open kitchen line ${stamp}`

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
  const areaPayload = await createAreaResponse.json()

  const createTeamResponse = await request.post(`${backendBaseUrl}/api/teams`, {
    data: { name: teamName, description: 'Morning kitchen coverage' },
    headers: {
      Authorization: `Bearer ${loginPayload.token}`,
      'x-org-id': String(orgPayload.id),
    },
  })
  expect(createTeamResponse.ok()).toBeTruthy()
  const teamPayload = await createTeamResponse.json()

  const assignAreaTeamResponse = await request.put(
    `${backendBaseUrl}/api/sections/${areaPayload.addedSection.id}`,
    {
      data: { teamId: teamPayload.id },
      headers: {
        Authorization: `Bearer ${loginPayload.token}`,
        'x-org-id': String(orgPayload.id),
      },
    }
  )
  expect(assignAreaTeamResponse.ok()).toBeTruthy()

  await page.addInitScript(
    ({ token, orgId }) => {
      window.localStorage.setItem('auth_token', token)
      window.localStorage.setItem('activeOrgId', String(orgId))
    },
    { token: loginPayload.token as string, orgId: orgPayload.id as number }
  )

  await page.goto('/')
  await expect(page.getByText(orgName)).toBeVisible()

  await page.getByRole('tab', { name: /Labor/ }).click()
  await expect(page.getByRole('heading', { name: 'Labor' })).toBeVisible()

  await page.getByLabel('Create shift').click()
  await page.getByPlaceholder('e.g., Open kitchen line').fill(shiftTitle)
  await page
    .getByPlaceholder('Optional shift notes for the manager or lead.')
    .fill('Prep all stations before 8:30.')
  await page.getByText('Save Shift', { exact: true }).click()

  await expect(page).toHaveURL(/\/labor$/)
  await expect(page.getByText(shiftTitle)).toBeVisible()
  await expect(page.getByText(areaName)).toBeVisible()
})
