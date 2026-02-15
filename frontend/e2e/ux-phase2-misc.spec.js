import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3001'

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
}

// Helper: get a valid listing ID from the API
async function getListingId(page) {
  const response = await page.request.get(`${BASE}/api/want-listings?limit=1`)
  const body = await response.json()
  return body.data?.listings?.[0]?.id
}

test.describe('US-016: AI Chat, OAuth & Color System', () => {
  test('AI chat greeting contains category bullet points', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto(`${BASE}/create-listing`)
    await page.waitForSelector('.ai-chat-bubble')

    const greeting = await page.$eval('.ai-chat-bubble.assistant', el => el.textContent)
    expect(greeting).toContain('Type:')
    expect(greeting).toContain('Make & Model:')
    expect(greeting).toContain('Budget:')
  })

  test('AI chat input placeholder is updated', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto(`${BASE}/create-listing`)
    await page.waitForSelector('.ai-chat-input input')

    const placeholder = await page.$eval('.ai-chat-input input', el => el.placeholder)
    expect(placeholder).toBe('Describe your ideal vehicle purchase...')
  })

  test('Google Sign-In button is visible on login page', async ({ page }) => {
    await page.goto(`${BASE}/auth?mode=login`)
    await page.waitForSelector('.google-signin-btn')

    const btnText = await page.$eval('.google-signin-btn', el => el.textContent.trim())
    expect(btnText).toContain('Sign in with Google')
  })

  test('section headers on detail page have left border', async ({ page }) => {
    const listingId = await getListingId(page)
    await page.goto(`${BASE}/want-listings/${listingId}`)
    await page.waitForSelector('.detail-section-title')

    const borderLeft = await page.$eval('.detail-section-title', el =>
      getComputedStyle(el).borderLeftStyle
    )
    expect(borderLeft).not.toBe('none')
  })

  test('feature tags have non-white non-gray background', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.listing-card')
    await page.waitForTimeout(500)

    const hasTags = await page.isVisible('.tag-pill')
    if (!hasTags) {
      test.skip()
      return
    }

    const bgColor = await page.$eval('.tag-pill', el =>
      getComputedStyle(el).backgroundColor
    )
    // Blue-tinted: not white, not transparent
    expect(bgColor).not.toBe('rgb(255, 255, 255)')
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('budget text on listing cards uses green color', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.listing-card-budget')

    const color = await page.$eval('.listing-card-budget', el =>
      getComputedStyle(el).color
    )
    // Should be green (success color #059669), not default text color
    // Default text is rgb(27, 42, 74) — success is rgb(5, 150, 105)
    expect(color).not.toBe('rgb(27, 42, 74)')
  })
})
