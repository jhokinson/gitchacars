import { test, expect } from '@playwright/test'
import { loginAsBuyer } from './helpers.js'

test.describe('UI Animations & Visual Polish (US-020)', () => {
  test('Scroll-reveal — cards have opacity 1 after scrolling into viewport', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })

    // Cards in viewport should be revealed (opacity 1) after animation completes
    const firstCard = page.locator('.scroll-reveal').first()
    await expect(firstCard).toBeVisible()

    // Wait for reveal animation to complete (0.5s transition + buffer)
    await page.waitForTimeout(800)
    const opacity = await firstCard.evaluate((el) => window.getComputedStyle(el).opacity)
    expect(parseFloat(opacity)).toBe(1)

    // If there are cards below the fold, scroll to them
    const cardCount = await page.locator('.scroll-reveal').count()
    if (cardCount > 3) {
      // Scroll to the bottom of the feed
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      // Wait for IntersectionObserver to fire + animation to complete
      await page.waitForTimeout(1200)

      // Last card should now be revealed
      const lastCard = page.locator('.scroll-reveal').last()
      const lastOpacity = await lastCard.evaluate((el) => window.getComputedStyle(el).opacity)
      expect(parseFloat(lastOpacity)).toBeGreaterThanOrEqual(0.9)
    }
  })

  test('NavBar hides on scroll down, reappears on scroll up', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.navbar', { timeout: 5000 })

    // Navbar should initially be visible
    const navbar = page.locator('.navbar')
    await expect(navbar).toBeVisible()

    // Verify it does not have the hidden class initially
    let navClass = await navbar.getAttribute('class')
    expect(navClass).not.toContain('navbar-hidden')

    // Scroll down past the threshold (60px)
    await page.evaluate(() => window.scrollTo(0, 200))
    await page.waitForTimeout(500)

    // Navbar should now have the hidden class
    navClass = await navbar.getAttribute('class')
    expect(navClass).toContain('navbar-hidden')

    // Scroll back up
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)

    // Navbar should reappear (no hidden class)
    navClass = await navbar.getAttribute('class')
    expect(navClass).not.toContain('navbar-hidden')
  })

  test('Page content is visible after navigation (page-fade-in)', async ({ page }) => {
    await page.goto('/auth?mode=login')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Main content should be fully visible (opacity 1)
    const main = page.locator('main, .auth-card, .login-page').first()
    await expect(main).toBeVisible()
    const opacity = await main.evaluate((el) => window.getComputedStyle(el).opacity)
    expect(parseFloat(opacity)).toBe(1)

    // Navigate to register
    await page.goto('/auth?mode=register')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    const registerContent = page.locator('.auth-card, .register-page').first()
    await expect(registerContent).toBeVisible()
    const registerOpacity = await registerContent.evaluate((el) => window.getComputedStyle(el).opacity)
    expect(parseFloat(registerOpacity)).toBe(1)
  })

  test('Card hover — listing card has elevated box-shadow on hover', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })

    const card = page.locator('.listing-card').first()
    await expect(card).toBeVisible()

    // Get initial box-shadow
    const initialShadow = await card.evaluate((el) => window.getComputedStyle(el).boxShadow)

    // Hover over the card
    await card.hover()
    await page.waitForTimeout(350) // wait for transition (0.25s)

    // Get hovered box-shadow
    const hoveredShadow = await card.evaluate((el) => window.getComputedStyle(el).boxShadow)

    // Shadow should change on hover (either different value or 'none' → something)
    expect(hoveredShadow).not.toBe(initialShadow)
  })

  test('Mobile viewport (375px) — no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })

    // Test homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    let bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(380) // small tolerance

    // Test dashboard
    await loginAsBuyer(page)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(380)

    // Test create listing
    await page.goto('/create-listing')
    await page.waitForLoadState('networkidle')
    bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(380)
  })

  test('Visual regression screenshots — re-capture with updated UI', async ({ page }) => {
    const screenshotDir = 'e2e/screenshots'

    // Mobile homepage
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })
    await page.screenshot({ path: `${screenshotDir}/mobile-homepage.png`, fullPage: true })

    // Mobile login
    await page.goto('/auth?mode=login')
    await page.waitForSelector('.auth-card', { timeout: 5000 })
    await page.screenshot({ path: `${screenshotDir}/mobile-login.png`, fullPage: true })

    // Desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 })

    // Mobile buyer dashboard
    await page.setViewportSize({ width: 375, height: 667 })
    await loginAsBuyer(page)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `${screenshotDir}/mobile-buyer-dashboard.png`, fullPage: true })
  })
})
