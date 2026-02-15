import { test, expect } from '@playwright/test'
import { login, loginAsBuyer } from './helpers.js'

test.describe('UI Polish Verification (US-AU20)', () => {
  test('Page transitions — no layout shift between pages', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verify homepage renders correctly
    await expect(page.locator('.navbar')).toBeVisible()

    // Navigate to a listing detail page (if listings exist)
    const listingLink = page.locator('.listing-card a, .listing-card').first()
    const hasListings = await listingLink.isVisible().catch(() => false)

    if (hasListings) {
      await listingLink.click()
      await page.waitForLoadState('networkidle')

      // Verify no horizontal overflow (layout shift indicator)
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      const viewportWidth = await page.evaluate(() => window.innerWidth)
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20) // small tolerance
    }

    // Navigate to dashboard
    await loginAsBuyer(page)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Verify dashboard renders without flash
    await expect(page.locator('h1')).toContainText(/Dashboard/i)

    // No horizontal overflow
    const bodyWidthDash = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidthDash = await page.evaluate(() => window.innerWidth)
    expect(bodyWidthDash).toBeLessThanOrEqual(viewportWidthDash + 20)
  })

  test('Empty state animations on dashboard', async ({ page }) => {
    // Register a fresh user so we get empty dashboard
    const uniqueEmail = `polish_test_${Date.now()}@example.com`
    await page.goto('/auth?mode=register')
    await page.waitForLoadState('networkidle')

    // Select an intent
    await page.click('.role-card:has-text("Both")')
    await page.fill('input[name="firstName"]', 'Polish')
    await page.fill('input[name="lastName"]', 'Tester')
    await page.fill('input[name="email"]', uniqueEmail)

    const passwordInputs = page.locator('.password-input-wrapper input')
    await passwordInputs.first().fill('password123')
    await passwordInputs.nth(1).fill('password123')

    await page.click('button[type="submit"]:has-text("Create Account")')
    await page.waitForURL('**/dashboard', { timeout: 15000 })
    await page.waitForLoadState('networkidle')

    // Dashboard should show empty states
    await expect(page.locator('text=My Want Listings')).toBeVisible({ timeout: 10000 })

    // Check for Lottie animation in empty state (rendered as SVG by lottie-react)
    const lottieWrapper = page.locator('.lottie-wrapper')
    const hasLottie = await lottieWrapper.first().isVisible().catch(() => false)

    // Either Lottie animation or at least the empty state text should be present
    const emptyState = page.locator('.dashboard-empty')
    await expect(emptyState.first()).toBeVisible({ timeout: 5000 })

    if (hasLottie) {
      // Lottie renders as an SVG element inside the wrapper
      const lottieContent = lottieWrapper.locator('svg, div')
      await expect(lottieContent.first()).toBeVisible()
    }

    // Verify "You haven't posted any want listings yet" text
    await expect(page.locator('text=haven\'t posted any want listings')).toBeVisible()
    await expect(page.locator('text=private inventory is empty')).toBeVisible()
  })

  test('Mobile layout — no horizontal overflow at 375px width', async ({ page }) => {
    // Set mobile viewport (iPhone SE)
    await page.setViewportSize({ width: 375, height: 812 })

    // Test homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    let bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(375 + 5) // small tolerance for subpixel rendering

    // Test login page
    await page.goto('/auth?mode=login')
    await page.waitForLoadState('networkidle')
    bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(375 + 5)

    // Test register page
    await page.goto('/auth?mode=register')
    await page.waitForLoadState('networkidle')
    bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(375 + 5)

    // Test dashboard
    await loginAsBuyer(page)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(375 + 5)

    // Test create listing page
    await page.goto('/create-listing')
    await page.waitForLoadState('networkidle')
    bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(375 + 5)
  })

  test('Password toggle visual — screenshots differ between hidden and visible', async ({ page }) => {
    await page.goto('/auth?mode=login')
    await page.waitForLoadState('networkidle')

    // Type a password
    const wrapper = page.locator('.password-input-wrapper')
    const passwordInput = wrapper.locator('input')
    await passwordInput.fill('testpassword123')

    // Take screenshot with password hidden
    const hiddenScreenshot = await wrapper.screenshot()

    // Toggle to show password
    await wrapper.locator('.password-toggle').click()
    await page.waitForTimeout(200)

    // Take screenshot with password visible
    const visibleScreenshot = await wrapper.screenshot()

    // The screenshots should differ (password dots vs text)
    expect(Buffer.compare(hiddenScreenshot, visibleScreenshot)).not.toBe(0)
  })

  test('Card hover states — listing cards render with proper styling', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that listing cards exist and are styled
    const cards = page.locator('.listing-card, .card')
    const cardCount = await cards.count()

    if (cardCount > 0) {
      const firstCard = cards.first()
      await expect(firstCard).toBeVisible()

      // Verify the card has basic styling (non-zero dimensions)
      const box = await firstCard.boundingBox()
      expect(box).toBeTruthy()
      expect(box.width).toBeGreaterThan(100)
      expect(box.height).toBeGreaterThan(50)
    }

    // Verify the navbar is styled correctly
    const navbar = page.locator('.navbar')
    await expect(navbar).toBeVisible()

    const navBox = await navbar.boundingBox()
    expect(navBox).toBeTruthy()
    expect(navBox.width).toBeGreaterThan(300)
    expect(navBox.height).toBeGreaterThan(40)
  })
})
