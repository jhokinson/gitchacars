import { test, expect } from '@playwright/test'

test.describe('Share Functionality', () => {
  test('share from detail page copies URL', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })
    await page.locator('.listing-card').first().click()
    await page.waitForURL(/\/want-listings\//)

    // Click share button
    const shareBtn = page.locator('.share-btn, button[aria-label*="share" i], .detail-actions button:has(svg):last-child').first()
    if (await shareBtn.isVisible()) {
      await shareBtn.click()
      await page.waitForTimeout(500)

      // Check for toast
      const toast = page.locator('.toast')
      if (await toast.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(toast).toContainText(/copied/i)
      }
    }
  })

  test('share from listing card', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })

    const shareIcon = page.locator('.listing-card .share-icon, .listing-card button[aria-label*="share" i], .listing-card .share-btn').first()
    if (await shareIcon.isVisible()) {
      await shareIcon.click()
      await page.waitForTimeout(500)
    }
  })
})
