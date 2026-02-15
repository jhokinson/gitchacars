import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3001'

test.describe('Phase 4: Filter Sidebar Layout & NavBar Fixes', () => {
  test('filter sidebar has no independent scroll (no overflow-y auto)', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.filter-sidebar')

    const overflowY = await page.$eval('.filter-sidebar', el =>
      getComputedStyle(el).overflowY
    )
    // Should NOT be 'auto' or 'scroll' — should flow with page
    expect(overflowY).not.toBe('auto')
    expect(overflowY).not.toBe('scroll')
  })

  test('filter sidebar has no max-height constraint', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.filter-sidebar')

    const maxHeight = await page.$eval('.filter-sidebar', el =>
      getComputedStyle(el).maxHeight
    )
    // Should be 'none' or very large — no viewport constraint
    expect(maxHeight === 'none' || parseInt(maxHeight) > 5000).toBeTruthy()
  })

  test('filter sections in correct Phase 4 order', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.filter-sidebar')

    const toggles = await page.$$eval('.filter-section-toggle span:first-child', els =>
      els.map(el => el.textContent.trim())
    )

    // Phase 4 order: Make, Location, Vehicle Type, Year Range, Price Range, Max Mileage, Transmission, Drivetrain
    expect(toggles[0]).toBe('Make')
    expect(toggles[1]).toBe('Location')
    expect(toggles[2]).toBe('Vehicle Type')
    expect(toggles[3]).toBe('Year Range')
    expect(toggles[4]).toBe('Price Range')
    expect(toggles[5]).toBe('Max Mileage')
    expect(toggles[6]).toBe('Transmission')
    expect(toggles[7]).toBe('Drivetrain')
  })

  test('Location filter is expanded by default', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.filter-sidebar')

    const locationToggle = page.locator('.filter-section-toggle', { hasText: 'Location' })
    const isOpen = await locationToggle.evaluate(el => el.classList.contains('open'))
    expect(isOpen).toBe(true)

    // Location body should be visible
    const zipInput = page.locator('input[placeholder="Zip code"]')
    await expect(zipInput).toBeVisible()
  })

  test('no Keyword search section exists', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.filter-sidebar')

    const toggles = await page.$$eval('.filter-section-toggle span:first-child', els =>
      els.map(el => el.textContent.trim())
    )
    expect(toggles).not.toContain('Keyword')

    // No search input should exist
    const searchInput = page.locator('input[placeholder*="Search" i]')
    await expect(searchInput).toHaveCount(0)
  })

  test('NavBar "Private Inventory" has only one plus icon (no text plus)', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.navbar')

    const ctaText = await page.$eval('.navbar-cta-secondary .navbar-cta-label', el =>
      el.textContent.trim()
    )
    // Should be "Private Inventory" without leading "+"
    expect(ctaText).toBe('Private Inventory')
    expect(ctaText).not.toContain('+')
  })

  test('filter sidebar is sticky on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto(BASE)
    await page.waitForSelector('.filter-sidebar')

    const position = await page.$eval('.filter-sidebar', el =>
      getComputedStyle(el).position
    )
    expect(position).toBe('sticky')
  })

  test('Smart Action Box appears above filter sections', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.filter-sidebar')

    const smartActionBox = page.locator('.smart-action-box')
    await expect(smartActionBox).toBeVisible()

    // Smart action box should be inside filter sidebar
    const isInsideSidebar = await smartActionBox.evaluate(el =>
      el.closest('.filter-sidebar') !== null
    )
    expect(isInsideSidebar).toBe(true)
  })
})
