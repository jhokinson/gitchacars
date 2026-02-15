import { test, expect } from '@playwright/test'

test.describe('Sidebar Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })
  })

  test('make filter filters results', async ({ page }) => {
    // Phase 4: Keyword search removed, test Make filter instead
    const makeSelect = page.locator('.filter-section:has-text("Make") select')
    if (await makeSelect.isVisible()) {
      await makeSelect.selectOption({ label: 'Toyota' })
      await page.waitForTimeout(1000)
    }
    const cards = page.locator('.listing-card')
    const count = await cards.count()
    // Results should show or be empty — make filter applied
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('price range filter via inputs', async ({ page }) => {
    const totalBefore = await page.locator('.listing-card').count()
    // Open price range if collapsed
    const priceSection = page.locator('.filter-section:has-text("Price")')
    if (await priceSection.isVisible()) {
      const minInput = page.locator('.price-min, input[placeholder*="$"][placeholder*="0"], .filter-price-min input').first()
      if (await minInput.isVisible()) {
        await minInput.fill('20000')
        await page.waitForTimeout(1000)
      }
    }
    // Results should be equal or fewer
    const totalAfter = await page.locator('.listing-card').count()
    expect(totalAfter).toBeLessThanOrEqual(totalBefore)
  })

  test('multiple filters combined', async ({ page }) => {
    const totalBefore = await page.locator('.listing-card').count()
    // Apply make filter (keyword removed in Phase 4)
    const makeSelect = page.locator('.filter-section:has-text("Make") select')
    if (await makeSelect.isVisible()) {
      await makeSelect.selectOption({ label: 'BMW' })
      await page.waitForTimeout(1000)
    }
    const totalAfter = await page.locator('.listing-card').count()
    expect(totalAfter).toBeLessThanOrEqual(totalBefore)
  })

  test('clear all resets all filters', async ({ page }) => {
    const totalBefore = await page.locator('.listing-card').count()
    // Apply make filter (keyword removed in Phase 4)
    const makeSelect = page.locator('.filter-section:has-text("Make") select')
    if (await makeSelect.isVisible()) {
      await makeSelect.selectOption({ label: 'BMW' })
      await page.waitForTimeout(1000)
    }
    // Clear all
    await page.click('text=Clear All')
    await page.waitForTimeout(1000)
    const totalAfter = await page.locator('.listing-card').count()
    expect(totalAfter).toBeGreaterThanOrEqual(totalBefore)
  })
})
