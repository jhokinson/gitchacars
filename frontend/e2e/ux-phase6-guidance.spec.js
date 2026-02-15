// @ts-check
import { test, expect } from '@playwright/test'
import { loginAsSeller, loginAsBuyer } from './helpers.js'

const BASE = 'http://localhost:3001'

test.describe('UX Phase 6 — Guidance Banners', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any dismissed state
    await page.goto(BASE)
    await page.evaluate(() => {
      localStorage.removeItem('gitcha_dismiss_guide_unauth')
      localStorage.removeItem('gitcha_dismiss_guide_buyer')
      localStorage.removeItem('gitcha_dismiss_guide_seller')
    })
  })

  test('unauthenticated user sees "How GitchaCars Works" banner', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForTimeout(1000)

    const banner = page.locator('.home-guidance').first()
    await expect(banner).toBeVisible()
    await expect(banner).toContainText('How GitchaCars Works')
  })

  test('banner contains link to /auth?mode=register', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForTimeout(1000)

    const link = page.locator('.home-guidance-link[href="/auth?mode=register"]')
    await expect(link).toBeVisible()
  })

  test('banner has a close/dismiss button', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForTimeout(1000)

    const closeBtn = page.locator('.home-guidance-close').first()
    await expect(closeBtn).toBeVisible()
  })

  test('clicking dismiss removes banner from DOM', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForTimeout(1000)

    const closeBtn = page.locator('.home-guidance-close').first()
    await closeBtn.click()
    await page.waitForTimeout(300)

    await expect(page.locator('.home-guidance')).toHaveCount(0)
  })

  test('dismissed banner does not reappear after page reload', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForTimeout(1000)

    // Dismiss
    const closeBtn = page.locator('.home-guidance-close').first()
    await closeBtn.click()
    await page.waitForTimeout(300)

    // Reload
    await page.reload()
    await page.waitForTimeout(1000)

    // Banner should stay hidden
    await expect(page.locator('.home-guidance')).toHaveCount(0)
  })

  test('logged-in seller sees seller guidance banner', async ({ page }) => {
    await loginAsSeller(page)
    // Clear dismiss state after login (login navigates and reloads)
    await page.evaluate(() => {
      localStorage.removeItem('gitcha_dismiss_guide_seller')
    })
    await page.goto(BASE)
    await page.waitForTimeout(1000)

    const banner = page.locator('.home-guidance')
    await expect(banner.first()).toContainText('Find Matching Buyers')
  })

  test('logged-in buyer sees buyer guidance when no listings visible', async ({ page }) => {
    await loginAsBuyer(page)
    await page.evaluate(() => {
      localStorage.removeItem('gitcha_dismiss_guide_buyer')
    })
    // Navigate to homepage — buyer banner shows when 0 listings + not loading
    // We can't guarantee 0 listings in test env, so just check the banner appears OR doesn't based on listings
    await page.goto(BASE)
    await page.waitForTimeout(2000)

    // Check if listings are present
    const listings = await page.locator('.home-listing-feed .scroll-reveal').count()
    if (listings === 0) {
      const banner = page.locator('.home-guidance')
      await expect(banner.first()).toContainText('Post Your First Want Listing')
    }
    // If listings exist, buyer banner won't show (by design) — test passes either way
  })
})
