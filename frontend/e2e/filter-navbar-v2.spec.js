import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3001'

test.describe('US-014: Filter Sidebar & NavBar Phase 2', () => {
  test('filter sections appear in correct order', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.filter-sidebar')

    const toggles = await page.$$eval('.filter-section-toggle span:first-child', els =>
      els.map(el => el.textContent.trim())
    )

    // Phase 4: Keyword removed, replaced by Smart Action Box
    expect(toggles[0]).toBe('Make')
    // Phase 4: Location moved up to position 2 (after Make), Drivetrain is last
    expect(toggles[1]).toBe('Location')
    expect(toggles[toggles.length - 1]).toBe('Drivetrain')
    // Vehicle specs come after location
    expect(toggles.indexOf('Make')).toBeLessThan(toggles.indexOf('Vehicle Type'))
    expect(toggles.indexOf('Vehicle Type')).toBeLessThan(toggles.indexOf('Price Range'))
  })

  test('distance dropdown contains industry-standard options', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.filter-sidebar')

    // Location is expanded by default in Phase 4 — ensure it's open
    const locationToggle = page.locator('.filter-section-toggle', { hasText: 'Location' })
    const isOpen = await locationToggle.evaluate(el => el.classList.contains('open'))
    if (!isOpen) await locationToggle.click()
    await page.waitForTimeout(300)

    // Get the radius select options
    const radiusSelect = page.locator('.filter-section-body select').last()
    const options = await radiusSelect.locator('option').allTextContents()

    expect(options).toContain('Nationwide')
    expect(options).toContain('25 miles')
    expect(options).toContain('50 miles')
    expect(options).toContain('100 miles')
    expect(options).toContain('250 miles')
    expect(options).toContain('500 miles')
    // Old small distances should not exist
    expect(options).not.toContain('5 miles')
    expect(options).not.toContain('10 miles')
  })

  test('selecting Nationwide sends empty radius', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.filter-sidebar')

    // Location is expanded by default in Phase 4 — ensure it's open
    const locationToggle = page.locator('.filter-section-toggle', { hasText: 'Location' })
    const isOpen = await locationToggle.evaluate(el => el.classList.contains('open'))
    if (!isOpen) await locationToggle.click()
    await page.waitForTimeout(300)

    const radiusSelect = page.locator('.filter-section-body select').last()
    await radiusSelect.selectOption('')
    const value = await radiusSelect.inputValue()
    expect(value).toBe('')
  })

  test('filter sidebar has no nested visible borders', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.filter-sidebar')

    const border = await page.$eval('.filter-sidebar', el =>
      getComputedStyle(el).border
    )
    // Should not have a visible border (either 'none' or '0px')
    expect(border).toMatch(/none|0px/)
  })

  test('NavBar has border-radius on desktop (floating pill)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto(BASE)
    await page.waitForSelector('.navbar')

    const borderRadius = await page.$eval('.navbar', el =>
      getComputedStyle(el).borderRadius
    )
    // Should have significant border-radius (at least 16px)
    const numericRadius = parseInt(borderRadius)
    expect(numericRadius).toBeGreaterThan(0)
  })

  test('NavBar CTAs are visible and clickable', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.navbar')

    const postCTA = page.locator('.navbar-cta-primary')
    await expect(postCTA).toBeVisible()
    await expect(postCTA).toContainText('Post Want-Listing')

    const inventoryCTA = page.locator('.navbar-cta-secondary')
    await expect(inventoryCTA).toBeVisible()
    await expect(inventoryCTA).toContainText('Private Inventory')
  })

  test('NavBar is narrower than viewport on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 720 })
    await page.goto(BASE)
    await page.waitForSelector('.navbar')

    const navWidth = await page.$eval('.navbar', el => el.getBoundingClientRect().width)
    const viewportWidth = page.viewportSize().width
    expect(navWidth).toBeLessThan(viewportWidth)
  })
})
