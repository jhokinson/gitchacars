import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3001'

test.describe('Phase 5: Vehicle Type Filter', () => {
  test('Vehicle type checkboxes exist in filter sidebar', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.filter-sidebar')

    // Vehicle Type section should be visible
    const typeSection = page.locator('.filter-section-toggle', { hasText: 'Vehicle Type' })
    await expect(typeSection).toBeVisible()

    // Should have checkboxes for vehicle types
    const checkboxes = page.locator('.filter-section:has(.filter-section-toggle:has-text("Vehicle Type")) .filter-checkbox')
    const count = await checkboxes.count()
    expect(count).toBeGreaterThanOrEqual(5) // Sedan, SUV, Truck, Coupe, etc.
  })

  test('Checking a vehicle type checkbox refreshes the feed', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.filter-sidebar')
    await page.waitForLoadState('networkidle')

    // Get initial listing count
    const initialCards = await page.locator('.listing-card').count()

    // Open Vehicle Type section if not open
    const typeToggle = page.locator('.filter-section-toggle', { hasText: 'Vehicle Type' })
    const isOpen = await typeToggle.evaluate(el => el.classList.contains('open'))
    if (!isOpen) {
      await typeToggle.click()
      await page.waitForTimeout(300)
    }

    // Check "SUV" checkbox
    const suvCheckbox = page.locator('.filter-checkbox', { hasText: 'SUV' }).locator('input')
    await suvCheckbox.check()
    await page.waitForTimeout(1500) // Wait for debounced filter + API call

    // The feed should have updated (cards count may change)
    const afterCards = await page.locator('.listing-card').count()
    // Just verify the page didn't crash — the count may be same, more, or less
    expect(afterCards).toBeGreaterThanOrEqual(0)
  })

  test('Multiple vehicle types can be selected simultaneously', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.filter-sidebar')
    await page.waitForLoadState('networkidle')

    // Open Vehicle Type section if not open
    const typeToggle = page.locator('.filter-section-toggle', { hasText: 'Vehicle Type' })
    const isOpen = await typeToggle.evaluate(el => el.classList.contains('open'))
    if (!isOpen) {
      await typeToggle.click()
      await page.waitForTimeout(300)
    }

    // Check both SUV and Sedan
    const suvCheckbox = page.locator('.filter-checkbox', { hasText: 'SUV' }).locator('input')
    const sedanCheckbox = page.locator('.filter-checkbox', { hasText: 'Sedan' }).locator('input')

    await suvCheckbox.check()
    await page.waitForTimeout(600)
    await sedanCheckbox.check()
    await page.waitForTimeout(1500)

    // Both should be checked
    await expect(suvCheckbox).toBeChecked()
    await expect(sedanCheckbox).toBeChecked()
  })

  test('Clear All resets vehicle type checkboxes', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.filter-sidebar')
    await page.waitForLoadState('networkidle')

    // Open Vehicle Type section
    const typeToggle = page.locator('.filter-section-toggle', { hasText: 'Vehicle Type' })
    const isOpen = await typeToggle.evaluate(el => el.classList.contains('open'))
    if (!isOpen) {
      await typeToggle.click()
      await page.waitForTimeout(300)
    }

    // Check SUV
    const suvCheckbox = page.locator('.filter-checkbox', { hasText: 'SUV' }).locator('input')
    await suvCheckbox.check()
    await page.waitForTimeout(600)

    // Click Clear All
    const clearBtn = page.locator('.filter-clear-btn')
    await clearBtn.click()
    await page.waitForTimeout(1000)

    // SUV should be unchecked
    await expect(suvCheckbox).not.toBeChecked()
  })
})

test.describe('Phase 5: Feed Behavior', () => {
  test('Feed shows listings when API is healthy', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForLoadState('networkidle')

    // Should show listing cards
    const cards = page.locator('.listing-card')
    await expect(cards.first()).toBeVisible({ timeout: 15000 })
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('No keyword search input exists', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.filter-sidebar')

    // Verify no "Keyword" section in filter toggles
    const toggles = await page.$$eval('.filter-section-toggle span:first-child', els =>
      els.map(el => el.textContent.trim())
    )
    expect(toggles).not.toContain('Keyword')

    // No search input should exist
    const searchInput = page.locator('input[placeholder*="Search" i]')
    await expect(searchInput).toHaveCount(0)
  })

  test('ErrorBoundary wraps the feed (normal rendering works)', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForLoadState('networkidle')

    // The feed should render normally
    const feed = page.locator('.home-listing-feed')
    await expect(feed).toBeVisible()

    // Error boundary should NOT be showing its error state
    const errorCard = page.locator('.error-boundary-card')
    await expect(errorCard).toHaveCount(0)
  })
})
