import { test, expect } from '@playwright/test'
import { loginAsBuyer, loginAsAdmin } from './helpers.js'

test.describe('Admin Page', () => {
  test('access control — buyer cannot access admin', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/admin')
    // Should redirect away
    await expect(page).not.toHaveURL(/\/admin/)
  })

  test('admin page loads with tabs', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1, h2').first()).toContainText(/Admin/i)
    await expect(page.locator('text=Users')).toBeVisible()
    await expect(page.locator('text=Want Listings')).toBeVisible()
    await expect(page.locator('text=Vehicles')).toBeVisible()
  })

  test('users tab shows user table', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')

    // Users tab should be default
    const table = page.locator('table')
    await expect(table).toBeVisible({ timeout: 10000 })
    // Should have at least one user row
    const rows = page.locator('table tbody tr')
    await expect(rows.first()).toBeVisible()
  })

  test('search users filters results', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('.admin-search input, input[placeholder*="Search" i]')
    if (await searchInput.isVisible()) {
      await searchInput.fill('buyer1')
      await page.locator('.admin-search button, button:has-text("Search")').click()
      await page.waitForTimeout(1000)
      // Should show filtered results
      const rows = page.locator('table tbody tr')
      const count = await rows.count()
      expect(count).toBeGreaterThanOrEqual(1)
    }
  })

  test('want listings tab renders', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')

    await page.click('text=Want Listings')
    await page.waitForTimeout(1000)
    const table = page.locator('table')
    await expect(table).toBeVisible()
  })

  test('vehicles tab renders', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')

    await page.click('text=Vehicles')
    await page.waitForTimeout(1000)
    const table = page.locator('table')
    await expect(table).toBeVisible()
  })
})
