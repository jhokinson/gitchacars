import { test, expect } from '@playwright/test'
import { loginAsBuyer } from './helpers.js'

/**
 * Helper to mock the AI chat endpoint with a predictable response.
 * We intercept /api/ai/chat to avoid depending on a live Anthropic API key.
 */
async function mockAIChat(page, reply) {
  await page.route('**/api/ai/chat', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { reply } }),
    })
  })
}

/**
 * Mock that returns a response with extracted listing JSON data.
 * Note: The greeting is now hardcoded in state (no API call), so the first
 * API call will be the user's message, not a greeting.
 */
async function mockAIChatWithExtraction(page) {
  await page.route('**/api/ai/chat', (route) => {
    // Every API call responds with extracted data (greeting is hardcoded, no API call)
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          reply:
            'Great choice! Here are the details I extracted from our conversation:\n\n```json\n{"title":"Looking for a 2020-2024 Honda CR-V","make":"Honda","model":"CR-V","yearMin":2020,"yearMax":2024,"budgetMin":25000,"budgetMax":35000,"mileageMax":50000,"zipCode":"90210","radiusMiles":50,"description":"Looking for a reliable Honda CR-V for family use","vehicleType":"suv","transmission":"automatic"}\n```\n\nDoes this look right?',
        },
      }),
    })
  })
}

test.describe('AI Chat Listing Creation Flow', () => {
  test('Chat loads with AI greeting', async ({ page }) => {
    // No API mock needed — greeting is hardcoded in state (no API call on mount)
    await loginAsBuyer(page)
    await page.goto('/create-listing')
    await page.waitForLoadState('networkidle')

    // Verify AI Assistant toggle is active by default
    const chatToggle = page.locator('.toggle-btn.active:has-text("AI Assistant")')
    await expect(chatToggle).toBeVisible()

    // Greeting is immediately visible (hardcoded, no API call)
    const assistantBubble = page.locator('.ai-chat-bubble.assistant').first()
    await expect(assistantBubble).toBeVisible({ timeout: 10000 })
    const text = await assistantBubble.textContent()
    expect(text.length).toBeGreaterThan(10)
    expect(text).toContain('dream car')
  })

  test('User can send a message and get AI response', async ({ page }) => {
    await mockAIChatWithExtraction(page)
    await loginAsBuyer(page)
    await page.goto('/create-listing')

    // Wait for initial AI greeting
    await expect(page.locator('.ai-chat-bubble.assistant').first()).toBeVisible({ timeout: 10000 })

    // Type a message
    const chatInput = page.locator('.ai-chat-input input')
    await chatInput.fill("I'm looking for a Honda CR-V, 2020-2024, budget $25,000-$35,000")
    await chatInput.press('Enter')

    // Verify user message appears
    const userBubble = page.locator('.ai-chat-bubble.user')
    await expect(userBubble.first()).toBeVisible()
    await expect(userBubble.first()).toContainText('Honda CR-V')

    // Wait for AI response (second assistant message)
    const assistantBubbles = page.locator('.ai-chat-bubble.assistant')
    await expect(assistantBubbles).toHaveCount(2, { timeout: 10000 })
  })

  test('Listing preview updates with extracted data', async ({ page }) => {
    await mockAIChatWithExtraction(page)
    await loginAsBuyer(page)
    await page.goto('/create-listing')

    // Wait for initial AI greeting
    await expect(page.locator('.ai-chat-bubble.assistant').first()).toBeVisible({ timeout: 10000 })

    // Send a message to trigger extraction
    const chatInput = page.locator('.ai-chat-input input')
    await chatInput.fill("I want a 2020-2024 Honda CR-V, budget $25,000 to $35,000, max 50,000 miles, zip code 90210")
    await chatInput.press('Enter')

    // Wait for AI response with extraction
    await expect(page.locator('.ai-chat-bubble.assistant').nth(1)).toBeVisible({ timeout: 10000 })

    // The listing preview should update with extracted data
    const preview = page.locator('.listing-preview')
    await expect(preview).toBeVisible()

    // Progress should increase since fields were populated
    const progressText = preview.locator('.listing-preview-progress-text')
    await expect(progressText).toBeVisible()
    // Should show some fields filled
    const text = await progressText.textContent()
    const match = text.match(/(\d+) of/)
    expect(parseInt(match[1])).toBeGreaterThan(0)
  })

  test('Can submit listing from chat', async ({ page }) => {
    await mockAIChatWithExtraction(page)
    await loginAsBuyer(page)
    await page.goto('/create-listing')

    // Wait for greeting
    await expect(page.locator('.ai-chat-bubble.assistant').first()).toBeVisible({ timeout: 10000 })

    // Send message to trigger data extraction
    const chatInput = page.locator('.ai-chat-input input')
    await chatInput.fill("I want a 2020-2024 Honda CR-V, budget $25k-$35k, 50k miles, zip 90210")
    await chatInput.press('Enter')

    // Wait for extraction response
    await expect(page.locator('.ai-chat-bubble.assistant').nth(1)).toBeVisible({ timeout: 10000 })

    // Wait a moment for state to update
    await page.waitForTimeout(500)

    // The Create Listing button should become enabled
    const createBtn = page.locator('button:has-text("Create Listing")')
    await expect(createBtn).toBeVisible()
    await expect(createBtn).toBeEnabled({ timeout: 5000 })

    // Click create
    await createBtn.click()
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })
  })

  test('Toggle to manual mode shows form', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/create-listing')
    await page.waitForLoadState('networkidle')

    // Click Manual Form toggle
    const manualToggle = page.locator('.toggle-btn:has-text("Manual Form")')
    await manualToggle.click()

    // Verify form is visible
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[name="title"]')).toBeVisible()
    await expect(page.locator('.searchable-select').first()).toBeVisible()
    await expect(page.locator('.searchable-select').nth(1)).toBeVisible()
  })

  test('Toggle back to chat shows chat interface', async ({ page }) => {
    await mockAIChatWithExtraction(page)
    await loginAsBuyer(page)
    await page.goto('/create-listing')

    // Wait for initial AI greeting
    await expect(page.locator('.ai-chat-bubble.assistant').first()).toBeVisible({ timeout: 10000 })

    // Switch to manual mode
    await page.locator('.toggle-btn:has-text("Manual Form")').click()
    await expect(page.locator('form')).toBeVisible()

    // Switch back to chat mode
    await page.locator('.toggle-btn:has-text("AI Assistant")').click()

    // Chat interface should be visible with the AI chat area
    await expect(page.locator('.ai-chat')).toBeVisible()
    await expect(page.locator('.ai-chat-input input')).toBeVisible()

    // An assistant message should appear (re-greeting)
    await expect(page.locator('.ai-chat-bubble.assistant').first()).toBeVisible({ timeout: 10000 })
  })

  test('Error handling — displays error in chat on failure', async ({ page }) => {
    // Greeting is hardcoded (no API call), so all API calls will fail
    await page.route('**/api/ai/chat', (route) => {
      route.fulfill({ status: 500, body: JSON.stringify({ message: 'Internal Server Error' }) })
    })

    await loginAsBuyer(page)
    await page.goto('/create-listing')

    // Wait for hardcoded greeting
    await expect(page.locator('.ai-chat-bubble.assistant').first()).toBeVisible({ timeout: 10000 })

    // Send a message that will trigger the error
    const chatInput = page.locator('.ai-chat-input input')
    await chatInput.fill('Test error handling')
    await chatInput.press('Enter')

    // Verify error message appears
    const errorBubble = page.locator('.ai-chat-bubble.error')
    await expect(errorBubble).toBeVisible({ timeout: 10000 })
    await expect(errorBubble).toContainText('temporarily unavailable')
  })
})
