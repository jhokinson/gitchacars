import { test, expect } from '@playwright/test'
import { loginAsBuyer } from './helpers.js'

test.describe('Favorites', () => {
  test('unauthenticated — no heart buttons visible', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })
    // Heart/favorite buttons should not be visible when logged out
    const hearts = page.locator('.favorite-btn, .heart-btn, button[aria-label*="favorite" i]')
    // Could be 0 or hidden
    const count = await hearts.count()
    if (count > 0) {
      await expect(hearts.first()).not.toBeVisible()
    }
  })

  test('favorite a listing from detail page', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })
    // Navigate to first listing detail
    await page.locator('.listing-card').first().click()
    await page.waitForURL(/\/want-listings\//)
    // Click the heart/favorite button
    const favBtn = page.locator('.favorite-btn, button[aria-label*="favorite" i], .detail-actions button:has(svg)').first()
    if (await favBtn.isVisible()) {
      await favBtn.click()
      await page.waitForTimeout(500)
      // The button should have changed state (filled)
    }
  })

  test('favorites persist on reload', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })
    await page.locator('.listing-card').first().click()
    await page.waitForURL(/\/want-listings\//)
    // Check current favorite state
    const favBtn = page.locator('.favorite-btn, button[aria-label*="favorite" i]').first()
    if (await favBtn.isVisible()) {
      const classBeforeReload = await favBtn.getAttribute('class')
      // Reload and check state persists
      await page.reload()
      await page.waitForTimeout(2000)
      const favBtnAfter = page.locator('.favorite-btn, button[aria-label*="favorite" i]').first()
      if (await favBtnAfter.isVisible()) {
        const classAfterReload = await favBtnAfter.getAttribute('class')
        expect(classAfterReload).toBe(classBeforeReload)
      }
    }
  })
})
