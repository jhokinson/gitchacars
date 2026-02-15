import { test, expect } from '@playwright/test'
import { loginAsBuyer } from './helpers.js'

test.describe('Form UX — SearchableSelect, AI Chat, and Manual Form (US-019)', () => {
  test('SearchableSelect dropdown is visible above other form elements', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/create-listing')
    await page.waitForLoadState('networkidle')

    // Switch to manual form
    await page.locator('.toggle-btn:has-text("Manual Form")').click()
    await expect(page.locator('form')).toBeVisible()

    // Click the Make dropdown
    const makeInput = page.locator('.searchable-select-input').first()
    await makeInput.click()
    await makeInput.fill('Hon')
    await page.waitForTimeout(300)

    // Dropdown should be visible
    const dropdown = page.locator('.searchable-select-dropdown').first()
    await expect(dropdown).toBeVisible({ timeout: 3000 })

    // Verify dropdown has non-zero height and is within viewport
    const dropdownBox = await dropdown.boundingBox()
    expect(dropdownBox).toBeTruthy()
    expect(dropdownBox.height).toBeGreaterThan(30)

    // Verify dropdown is not clipped — its bottom should be within the viewport
    const viewportHeight = await page.evaluate(() => window.innerHeight)
    expect(dropdownBox.y).toBeGreaterThan(0)
    expect(dropdownBox.y + dropdownBox.height).toBeLessThanOrEqual(viewportHeight + 200) // generous tolerance for scrolling

    // Verify we can actually click an option
    const hondaOption = dropdown.locator('.searchable-select-option:has-text("Honda")')
    await expect(hondaOption).toBeVisible()
    await hondaOption.click()

    // Model dropdown should now work too
    const modelInput = page.locator('.searchable-select-input').nth(1)
    await modelInput.click()
    await page.waitForTimeout(300)
    const modelDropdown = page.locator('.searchable-select-dropdown')
    await expect(modelDropdown).toBeVisible({ timeout: 3000 })
    const modelDropdownBox = await modelDropdown.boundingBox()
    expect(modelDropdownBox).toBeTruthy()
    expect(modelDropdownBox.height).toBeGreaterThan(30)
  })

  test('AI chat greeting is immediately visible on page load (no API call)', async ({ page }) => {
    // Track API calls to verify no greeting API call is made
    const apiCalls = []
    await page.route('**/api/ai/chat', (route) => {
      apiCalls.push(route.request().url())
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { reply: 'Mock response' } }),
      })
    })

    await loginAsBuyer(page)
    await page.goto('/create-listing')
    await page.waitForLoadState('networkidle')

    // AI Assistant should be active by default
    const chatToggle = page.locator('.toggle-btn.active:has-text("AI Assistant")')
    await expect(chatToggle).toBeVisible()

    // Greeting should be immediately visible
    const greeting = page.locator('.ai-chat-bubble.assistant').first()
    await expect(greeting).toBeVisible({ timeout: 3000 })

    // Greeting should contain the hardcoded text
    const text = await greeting.textContent()
    expect(text).toContain('dream car')

    // No API calls should have been made for the greeting
    expect(apiCalls.length).toBe(0)
  })

  test('AI chat error fallback shows switch-to-manual button', async ({ page }) => {
    // Mock API to fail
    await page.route('**/api/ai/chat', (route) => {
      route.fulfill({ status: 500, body: JSON.stringify({ message: 'Internal Server Error' }) })
    })

    await loginAsBuyer(page)
    await page.goto('/create-listing')

    // Wait for hardcoded greeting
    await expect(page.locator('.ai-chat-bubble.assistant').first()).toBeVisible({ timeout: 5000 })

    // Send a message to trigger the error
    const chatInput = page.locator('.ai-chat-input input')
    await chatInput.fill('I want a Honda CR-V')
    await chatInput.press('Enter')

    // Error bubble should appear
    const errorBubble = page.locator('.ai-chat-bubble.error')
    await expect(errorBubble).toBeVisible({ timeout: 10000 })
    await expect(errorBubble).toContainText('temporarily unavailable')

    // Switch to manual form button should be present
    const switchBtn = page.locator('.ai-chat-switch-btn, button:has-text("Switch to Manual Form")')
    await expect(switchBtn.first()).toBeVisible()

    // Clicking it should switch to manual mode
    await switchBtn.first().click()
    await expect(page.locator('form')).toBeVisible({ timeout: 3000 })
  })

  test('Manual form description textarea has character count indicator', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/create-listing')
    await page.waitForLoadState('networkidle')

    // Switch to manual form
    await page.locator('.toggle-btn:has-text("Manual Form")').click()
    await expect(page.locator('form')).toBeVisible()

    // Fill enough to open the details section
    // Select Honda
    const makeInput = page.locator('.searchable-select-input').first()
    await makeInput.click()
    await makeInput.fill('Honda')
    await page.waitForTimeout(300)
    await page.locator('.searchable-select-option:has-text("Honda")').click()
    await page.waitForTimeout(500)

    // Select CR-V
    const modelInput = page.locator('.searchable-select-input').nth(1)
    await modelInput.click()
    await page.waitForTimeout(300)
    await page.locator('.searchable-select-option:has-text("CR-V")').click()
    await page.waitForTimeout(1000)

    // Fill year & specs
    await page.fill('input[name="mileageMax"]', '50000')

    // Open Budget section
    await page.locator('.accordion-header:has-text("Budget & Location")').click()
    await page.waitForTimeout(300)
    await page.fill('input[name="budgetMin"]', '20000')
    await page.fill('input[name="budgetMax"]', '35000')
    await page.fill('input[name="zipCode"]', '90210')
    await page.fill('input[name="radius"]', '50')

    // Features & Details should auto-open
    await expect(page.locator('textarea[name="description"]')).toBeVisible({ timeout: 5000 })

    // Character count should show "0 / 500"
    const charCount = page.locator('.char-count')
    await expect(charCount).toBeVisible()
    await expect(charCount).toContainText('0 / 500')

    // Type some text and verify count updates
    await page.fill('textarea[name="description"]', 'Looking for a reliable Honda')
    await expect(charCount).toContainText('28 / 500')
  })

  test('Features & Details section auto-opens after Budget & Location is completed', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/create-listing')
    await page.waitForLoadState('networkidle')

    // Switch to manual form
    await page.locator('.toggle-btn:has-text("Manual Form")').click()
    await expect(page.locator('form')).toBeVisible()

    // Details section should NOT be open initially
    const detailsSection = page.locator('.accordion-section').nth(3)
    const detailsClass = await detailsSection.getAttribute('class')
    expect(detailsClass).not.toContain('open')

    // Select Honda CR-V
    const makeInput = page.locator('.searchable-select-input').first()
    await makeInput.click()
    await makeInput.fill('Honda')
    await page.waitForTimeout(300)
    await page.locator('.searchable-select-option:has-text("Honda")').click()
    await page.waitForTimeout(500)

    const modelInput = page.locator('.searchable-select-input').nth(1)
    await modelInput.click()
    await page.waitForTimeout(300)
    await page.locator('.searchable-select-option:has-text("CR-V")').click()
    await page.waitForTimeout(1000)

    // Fill year & specs
    await page.fill('input[name="mileageMax"]', '50000')

    // Open and fill Budget & Location
    await page.locator('.accordion-header:has-text("Budget & Location")').click()
    await page.waitForTimeout(300)
    await page.fill('input[name="budgetMin"]', '20000')
    await page.fill('input[name="budgetMax"]', '35000')
    await page.fill('input[name="zipCode"]', '90210')
    await page.fill('input[name="radius"]', '50')

    // Wait for auto-open — Features & Details should now be open
    await expect(detailsSection).toHaveClass(/open/, { timeout: 5000 })

    // Description textarea should be visible
    await expect(page.locator('textarea[name="description"]')).toBeVisible({ timeout: 3000 })

    // Title hint should also be visible
    const titleHint = page.locator('.form-hint')
    await expect(titleHint.first()).toBeVisible()
    await expect(titleHint.first()).toContainText('Tip')
  })
})
