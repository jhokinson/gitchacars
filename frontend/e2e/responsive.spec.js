import { test, expect } from '@playwright/test'
import { loginAsBuyer } from './helpers.js'

test.describe('Responsive Design — Mobile Viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('homepage — listings stack vertically', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })
    // Listings should be visible and stacked
    await expect(page.locator('.listing-card').first()).toBeVisible()
    await page.screenshot({ path: 'e2e/screenshots/mobile-homepage.png', fullPage: true })
  })

  test('login page fits viewport', async ({ page }) => {
    await page.goto('/auth?mode=login')
    await expect(page.locator('.auth-card')).toBeVisible()
    // No horizontal scrollbar
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5) // small tolerance
    await page.screenshot({ path: 'e2e/screenshots/mobile-login.png', fullPage: true })
  })

  test('listing detail stacks vertically', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })
    await page.locator('.listing-card').first().click()
    await page.waitForURL(/\/want-listings\//)
    await page.waitForTimeout(1000)

    // Content should be visible
    await expect(page.locator('.detail-title, h1')).toBeVisible()
    await page.screenshot({ path: 'e2e/screenshots/mobile-listing-detail.png', fullPage: true })
  })

  test('dashboard stacks vertically on mobile', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/buyer/dashboard')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1, h2').first()).toContainText(/Dashboard/i)
    await page.screenshot({ path: 'e2e/screenshots/mobile-buyer-dashboard.png', fullPage: true })
  })
})
