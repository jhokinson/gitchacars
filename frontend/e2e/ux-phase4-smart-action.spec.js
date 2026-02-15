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

test.describe('Phase 4: Smart Action Box & Chat Flows', () => {
  test('Smart Action Box displays "What would you like to do?" prompt', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.smart-action-box')

    const promptBtn = page.locator('.smart-action-prompt')
    await expect(promptBtn).toBeVisible()
    await expect(promptBtn).toContainText('What would you like to do?')
  })

  test('clicking prompt opens dropdown with two options', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.smart-action-box')

    // Click the prompt
    await page.click('.smart-action-prompt')
    await page.waitForTimeout(400) // wait for animation

    // Two option cards should appear
    const options = page.locator('.smart-action-option')
    await expect(options).toHaveCount(2)

    // Check option text
    const firstText = await options.first().textContent()
    const secondText = await options.last().textContent()
    expect(firstText).toContain('Find a Buyer')
    expect(secondText).toContain('Post a Buyer Want Listing')
  })

  test('clicking outside dropdown closes it', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.smart-action-box')

    // Open dropdown
    await page.click('.smart-action-prompt')
    await page.waitForTimeout(400)
    await expect(page.locator('.smart-action-option').first()).toBeVisible()

    // Click outside
    await page.click('.filter-sidebar-header')
    await page.waitForTimeout(400)

    // Dropdown should be closed (hidden via max-height: 0)
    const dropdownOpen = await page.locator('.smart-action-dropdown.open').count()
    expect(dropdownOpen).toBe(0)
  })

  test('selecting "Find a Buyer" without auth redirects to login', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.smart-action-box')

    await page.click('.smart-action-prompt')
    await page.waitForTimeout(400)

    // Click "Find a Buyer" option
    const findBuyerOption = page.locator('.smart-action-option', { hasText: 'Find a Buyer' })
    await findBuyerOption.click()

    // Should redirect to auth page
    await page.waitForURL(/\/auth/, { timeout: 5000 })
    expect(page.url()).toContain('/auth')
  })

  test('selecting "Post a Buyer Want Listing" without auth redirects to login', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.smart-action-box')

    await page.click('.smart-action-prompt')
    await page.waitForTimeout(400)

    const postOption = page.locator('.smart-action-option', { hasText: 'Post a Buyer' })
    await postOption.click()

    await page.waitForURL(/\/auth/, { timeout: 5000 })
    expect(page.url()).toContain('/auth')
  })

  test('authenticated user: "Find a Buyer" opens sidebar chat', async ({ page }) => {
    await loginAsBuyer(page)
    await page.waitForSelector('.smart-action-box')

    await page.click('.smart-action-prompt')
    await page.waitForTimeout(400)

    const findBuyerOption = page.locator('.smart-action-option', { hasText: 'Find a Buyer' })
    await findBuyerOption.click()
    await page.waitForTimeout(500)

    // Sidebar chat should appear
    const sidebarChat = page.locator('.sidebar-chat')
    await expect(sidebarChat).toBeVisible()

    // Should have a greeting message
    const assistantBubble = page.locator('.sidebar-chat-bubble.assistant')
    await expect(assistantBubble.first()).toBeVisible()
  })

  test('authenticated user: "Post a Buyer Want Listing" opens sidebar chat', async ({ page }) => {
    await loginAsBuyer(page)
    await page.waitForSelector('.smart-action-box')

    await page.click('.smart-action-prompt')
    await page.waitForTimeout(400)

    const postOption = page.locator('.smart-action-option', { hasText: 'Post a Buyer' })
    await postOption.click()
    await page.waitForTimeout(500)

    // Sidebar chat should appear
    const sidebarChat = page.locator('.sidebar-chat')
    await expect(sidebarChat).toBeVisible()
  })

  test('sidebar chat has input field and send button', async ({ page }) => {
    await loginAsBuyer(page)
    await page.waitForSelector('.smart-action-box')

    await page.click('.smart-action-prompt')
    await page.waitForTimeout(400)

    const findBuyerOption = page.locator('.smart-action-option', { hasText: 'Find a Buyer' })
    await findBuyerOption.click()
    await page.waitForTimeout(500)

    // Chat input
    const chatInput = page.locator('.sidebar-chat-input input')
    await expect(chatInput).toBeVisible()

    // Send button
    const sendBtn = page.locator('.sidebar-chat-send')
    await expect(sendBtn).toBeVisible()
  })

  test('active mode shows header with close button', async ({ page }) => {
    await loginAsBuyer(page)
    await page.waitForSelector('.smart-action-box')

    await page.click('.smart-action-prompt')
    await page.waitForTimeout(400)

    const findBuyerOption = page.locator('.smart-action-option', { hasText: 'Find a Buyer' })
    await findBuyerOption.click()
    await page.waitForTimeout(500)

    // Active header should show
    const activeHeader = page.locator('.smart-action-active')
    await expect(activeHeader).toBeVisible()

    // Close button in active header
    const closeBtn = page.locator('.smart-action-active-close')
    await expect(closeBtn).toBeVisible()

    // Clicking close should remove chat
    await closeBtn.click()
    await page.waitForTimeout(300)
    await expect(page.locator('.sidebar-chat')).toHaveCount(0)
  })
})
