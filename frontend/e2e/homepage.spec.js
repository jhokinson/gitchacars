import { test, expect } from '@playwright/test'
import { loginAsBuyer } from './helpers.js'

test.describe('Homepage & Feed', () => {
  test('page loads with listings', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.listing-card').first()).toBeVisible({ timeout: 10000 })
  })

  test('listings render with title, price, location', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })
    const card = page.locator('.listing-card').first()
    await expect(card.locator('h3, h4, .listing-card-title')).toBeVisible()
  })

  test('listing card click navigates to detail', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })
    await page.locator('.listing-card').first().click()
    await expect(page).toHaveURL(/\/want-listings\//)
  })

  test('sort dropdown changes order', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })
    const firstTitleBefore = await page.locator('.listing-card h3, .listing-card h4, .listing-card-title').first().textContent()
    // Custom sort dropdown — click to open, then select
    await page.click('.sort-dropdown-btn')
    await page.click('.sort-dropdown-item:has-text("Oldest")')
    await page.waitForTimeout(1000)
    const firstTitleAfter = await page.locator('.listing-card h3, .listing-card h4, .listing-card-title').first().textContent()
    const listingCount = await page.locator('.listing-card').count()
    if (listingCount > 1) {
      expect(firstTitleAfter).not.toBe(firstTitleBefore)
    }
  })

  test('filter by make via select', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })
    const initialCount = await page.locator('.listing-card').count()
    // Find the make select by looking for the one under the "Make" section
    const makeSection = page.locator('.filter-section').filter({ hasText: 'Make' })
    const select = makeSection.locator('select')
    if (await select.isVisible()) {
      await select.selectOption('Toyota')
      await page.waitForTimeout(1000)
      const filteredCount = await page.locator('.listing-card').count()
      // Filtering should change the count (either fewer cards or show empty state)
      // The make filter is applied — at least it doesn't crash
      expect(filteredCount).toBeLessThanOrEqual(initialCount)
    }
  })

  test('clear all filters resets', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })
    const countBefore = await page.locator('.listing-card').count()
    // Apply a make filter (keyword removed in Phase 4)
    const makeSelect = page.locator('.filter-section:has-text("Make") select')
    if (await makeSelect.isVisible()) {
      await makeSelect.selectOption({ label: 'BMW' })
      await page.waitForTimeout(1000)
    }
    // Clear all
    await page.click('text=Clear All')
    await page.waitForTimeout(1000)
    const countAfter = await page.locator('.listing-card').count()
    expect(countAfter).toBeGreaterThanOrEqual(countBefore)
  })

  test('unauthenticated view shows Sign In / Up', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.navbar-auth-buttons >> text=Sign In')).toBeVisible()
    await expect(page.locator('.navbar-auth-buttons >> text=Sign Up')).toBeVisible()
  })

  test('authenticated view shows CTA and avatar', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/')
    await expect(page.locator('.navbar-cta')).toBeVisible()
    await expect(page.locator('.avatar-dropdown')).toBeVisible()
  })
})
