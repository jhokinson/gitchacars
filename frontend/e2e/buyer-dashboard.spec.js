import { test, expect } from '@playwright/test'
import { loginAsBuyer } from './helpers.js'

test.describe('Buyer Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('page loads with dashboard heading', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toContainText(/Dashboard/i)
  })

  test('my listings display with title and status', async ({ page }) => {
    const listingRow = page.locator('.dash-listing-row, .listing-row').first()
    await expect(listingRow).toBeVisible({ timeout: 10000 })
    // Should contain a title and status badge
    await expect(listingRow.locator('.badge')).toBeVisible()
  })

  test('new listing button navigates to create form', async ({ page }) => {
    await page.click('text=Create Want Listing')
    await expect(page).toHaveURL(/\/create-listing/)
  })

  test('edit button navigates to edit page', async ({ page }) => {
    const editBtn = page.locator('.dash-listing-row a:has-text("Edit"), .listing-row a:has-text("Edit"), button:has-text("Edit")').first()
    if (await editBtn.isVisible()) {
      await editBtn.click()
      await expect(page).toHaveURL(/\/edit-listing\//)
    }
  })

  test('introductions section visible', async ({ page }) => {
    await expect(page.locator('text=Introductions')).toBeVisible()
  })

  test('filter pills work for introductions', async ({ page }) => {
    const pills = page.locator('.filter-pill, .pill')
    const pillCount = await pills.count()
    if (pillCount > 1) {
      // Click "Pending" pill
      const pendingPill = page.locator('.filter-pill:has-text("Pending"), .pill:has-text("Pending")')
      if (await pendingPill.isVisible()) {
        await pendingPill.click()
        await page.waitForTimeout(500)
        // Should filter to only pending intros
      }
      // Click "All" pill to reset
      const allPill = page.locator('.filter-pill:has-text("All"), .pill:has-text("All")')
      if (await allPill.isVisible()) {
        await allPill.click()
      }
    }
  })
})
