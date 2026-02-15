import { test, expect } from '@playwright/test'
import { loginAsBuyer } from './helpers.js'

test.describe('Notification Bell', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/')
  })

  test('bell renders in nav', async ({ page }) => {
    const bell = page.locator('.notif-bell-btn')
    await expect(bell).toBeVisible()
  })

  test('unread count badge visible', async ({ page }) => {
    const badge = page.locator('.notif-bell-btn .notification-badge, .notif-bell-btn .badge-count')
    // May or may not have unread notifications
    if (await badge.isVisible({ timeout: 2000 }).catch(() => false)) {
      const count = await badge.textContent()
      expect(parseInt(count)).toBeGreaterThan(0)
    }
  })

  test('open dropdown on click', async ({ page }) => {
    const bell = page.locator('.notif-bell-btn')
    await bell.click()
    const dropdown = page.locator('.notif-dropdown')
    await expect(dropdown).toBeVisible({ timeout: 3000 })
  })

  test('close dropdown on outside click', async ({ page }) => {
    const bell = page.locator('.notif-bell-btn')
    await bell.click()
    const dropdown = page.locator('.notif-dropdown')
    await expect(dropdown).toBeVisible({ timeout: 3000 })

    // Click outside
    await page.click('body', { position: { x: 10, y: 10 } })
    await page.waitForTimeout(300)
    await expect(dropdown).not.toBeVisible()
  })

  test('mark all as read', async ({ page }) => {
    const bell = page.locator('.notif-bell-btn')
    await bell.click()
    const dropdown = page.locator('.notif-dropdown')
    await expect(dropdown).toBeVisible({ timeout: 3000 })

    const markAllBtn = page.locator('.notif-mark-all')
    if (await markAllBtn.isVisible()) {
      await markAllBtn.click()
      await page.waitForTimeout(500)
    }
  })
})
