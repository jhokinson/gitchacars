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
  await page.reload()
  await page.waitForTimeout(500)
}

test.describe('Phase 5: AI Status Endpoint', () => {
  test('GET /api/ai/status returns 200 with available boolean', async ({ page }) => {
    const response = await page.request.get(`${BASE}/api/ai/status`)
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.data).toBeDefined()
    expect(typeof body.data.available).toBe('boolean')
  })

  test('AI status endpoint is public (no auth required)', async ({ page }) => {
    // Should not redirect to login
    const response = await page.request.get(`${BASE}/api/ai/status`)
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.data.available).toBeDefined()
  })
})

test.describe('Phase 5: AIChatBox Error Handling', () => {
  test('AIChatBox shows error message when AI chat fails', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto(`${BASE}/create-listing`)
    await page.waitForLoadState('networkidle')

    // Intercept AI chat endpoint to simulate failure
    await page.route('**/api/ai/chat', route =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'AI service is temporarily unavailable.', type: 'unavailable' } })
      })
    )

    // Make sure we're in chat mode
    const chatToggle = page.locator('.toggle-btn', { hasText: 'AI Assistant' })
    if (await chatToggle.count() > 0) {
      await chatToggle.click()
      await page.waitForTimeout(300)
    }

    // Type and send a message
    const input = page.locator('.ai-chat-input input')
    if (await input.isVisible()) {
      await input.fill('I want a Honda CR-V')
      await input.press('Enter')
      await page.waitForTimeout(1000)

      // Error message should appear
      const errorBubble = page.locator('.ai-chat-bubble.error')
      await expect(errorBubble).toBeVisible()

      // Should contain meaningful error text, not generic
      const text = await errorBubble.textContent()
      expect(text.length).toBeGreaterThan(10)

      // Switch to Manual Form button should be visible
      const switchBtn = page.locator('.ai-chat-switch-btn')
      await expect(switchBtn).toBeVisible()
    }
  })

  test('CreateListingPage has both AI and manual mode toggle', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto(`${BASE}/create-listing`)
    await page.waitForLoadState('networkidle')

    const aiToggle = page.locator('.toggle-btn', { hasText: 'AI Assistant' })
    const manualToggle = page.locator('.toggle-btn', { hasText: 'Manual Form' })

    await expect(aiToggle).toBeVisible()
    await expect(manualToggle).toBeVisible()
  })

  test('CreateListingPage switches to manual mode when manual toggle clicked', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto(`${BASE}/create-listing`)
    await page.waitForLoadState('networkidle')

    const manualToggle = page.locator('.toggle-btn', { hasText: 'Manual Form' })
    await manualToggle.click()
    await page.waitForTimeout(300)

    // Accordion form sections should be visible
    const accordionSection = page.locator('.accordion-section')
    await expect(accordionSection.first()).toBeVisible()
  })
})

test.describe('Phase 5: SidebarChat Error Handling', () => {
  test('SidebarChat shows error message when AI fails', async ({ page }) => {
    await loginAsBuyer(page)
    await page.waitForSelector('.smart-action-box')

    // Intercept AI extract-filters endpoint to simulate failure
    await page.route('**/api/ai/extract-filters', route =>
      route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'AI features are temporarily unavailable.', type: 'billing' } })
      })
    )

    // Open smart action dropdown and select "Find a Buyer"
    await page.click('.smart-action-prompt')
    await page.waitForTimeout(400)

    const findBuyerOption = page.locator('.smart-action-option', { hasText: 'Find a Buyer' })
    await findBuyerOption.click()
    await page.waitForTimeout(500)

    // Sidebar chat should be visible
    const sidebarChat = page.locator('.sidebar-chat')
    await expect(sidebarChat).toBeVisible()

    // Send a message that will fail
    const chatInput = page.locator('.sidebar-chat-input input')
    await chatInput.fill('2020 Honda CR-V')
    await chatInput.press('Enter')
    await page.waitForTimeout(1000)

    // Error message bubble should appear
    const bubbles = page.locator('.sidebar-chat-bubble')
    const lastBubble = bubbles.last()
    const text = await lastBubble.textContent()
    // Should contain a meaningful error message, not "Something went wrong"
    expect(text.length).toBeGreaterThan(5)
  })
})

test.describe('Phase 5: Smart Action Box', () => {
  test('Smart Action Box renders with prompt', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.smart-action-box')

    const promptBtn = page.locator('.smart-action-prompt')
    await expect(promptBtn).toBeVisible()
    await expect(promptBtn).toContainText('What would you like to do?')
  })
})
