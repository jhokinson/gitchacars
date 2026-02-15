import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3001'

// Helper: get a valid listing ID from the API
async function getListingId(page) {
  const response = await page.request.get(`${BASE}/api/want-listings?limit=1`)
  const body = await response.json()
  return body.data?.listings?.[0]?.id
}

// Helper: login as buyer via API and set token
async function loginAsBuyer(page) {
  const response = await page.request.post(`${BASE}/api/auth/login`, {
    data: { email: 'buyer1@example.com', password: 'password123' }
  })
  const body = await response.json()
  const token = body.data.token
  const user = body.data.user
  await page.goto(BASE)
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  }, { token, user })
  await page.reload()
  await page.waitForTimeout(500)
}

test.describe('US-013: Introduction Box & AI Chat', () => {
  test('Unauthenticated user sees intro card with sign-in prompt', async ({ page }) => {
    const listingId = await getListingId(page)
    await page.goto(`${BASE}/want-listings/${listingId}`)
    await page.waitForSelector('.detail-intro-card')

    const introText = await page.$eval('.detail-intro-card', el => el.textContent)
    expect(introText).toContain('Introduce Your Vehicle')
    expect(introText).toContain('Sign in')
  })

  test('Unauthenticated intro card has Sign In / Up button', async ({ page }) => {
    const listingId = await getListingId(page)
    await page.goto(`${BASE}/want-listings/${listingId}`)
    await page.waitForSelector('.detail-intro-card')

    const signInBtn = page.locator('.detail-intro-card .btn', { hasText: 'Sign In / Up' })
    await expect(signInBtn).toBeVisible()

    // Button should link to auth page
    const href = await signInBtn.getAttribute('href')
    expect(href).toContain('/auth')
  })

  test('Intro card heading says Introduce Your Vehicle', async ({ page }) => {
    const listingId = await getListingId(page)
    await page.goto(`${BASE}/want-listings/${listingId}`)
    await page.waitForSelector('.detail-intro-card')

    const heading = page.locator('.detail-intro-card .detail-section-title')
    await expect(heading).toContainText('Introduce Your Vehicle')
  })

  test('AI chat page loads with greeting containing categories', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto(`${BASE}/create-listing`)
    await page.waitForSelector('.ai-chat-bubble', { timeout: 10000 })

    const greeting = await page.$eval('.ai-chat-bubble.assistant', el => el.textContent)
    expect(greeting).toContain('Type:')
    expect(greeting).toContain('Make & Model:')
    expect(greeting).toContain('Budget:')
  })

  test('AI chat input has correct placeholder', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto(`${BASE}/create-listing`)
    await page.waitForSelector('.ai-chat-input input', { timeout: 10000 })

    const placeholder = await page.$eval('.ai-chat-input input', el => el.placeholder)
    expect(placeholder).toBe('Describe your ideal vehicle purchase...')
  })
})
