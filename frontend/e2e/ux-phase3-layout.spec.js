import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3001'

test.describe('US-010: Price Range Filter & NavBar Alignment', () => {
  test('Price Range filter has no nested border', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.filter-sidebar')

    // Open Price Range section if not open
    const priceToggle = page.locator('.filter-section-toggle', { hasText: 'Price Range' })
    const isOpen = await priceToggle.evaluate(el => el.classList.contains('open'))
    if (!isOpen) await priceToggle.click()
    await page.waitForTimeout(300)

    const border = await page.$eval('.range-slider-input-group', el =>
      getComputedStyle(el).borderStyle
    )
    expect(border).toBe('none')
  })

  test('RangeSlider inputs are visible inside price filter', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.filter-sidebar')

    const priceToggle = page.locator('.filter-section-toggle', { hasText: 'Price Range' })
    const isOpen = await priceToggle.evaluate(el => el.classList.contains('open'))
    if (!isOpen) await priceToggle.click()
    await page.waitForTimeout(300)

    const inputs = page.locator('.range-slider-input')
    await expect(inputs.first()).toBeVisible()
    const count = await inputs.count()
    expect(count).toBe(2)
  })

  test('NavBar max-width matches layout max-width', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 720 })
    await page.goto(BASE)
    await page.waitForSelector('.navbar')

    const navMaxWidth = await page.$eval('.navbar', el =>
      getComputedStyle(el).maxWidth
    )
    // Both should be 1200px
    expect(parseInt(navMaxWidth)).toBe(1200)
  })

  test('NavBar width aligns with content area on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 720 })
    await page.goto(BASE)
    await page.waitForSelector('.navbar')
    await page.waitForSelector('.layout')

    const navRect = await page.$eval('.navbar', el => {
      const rect = el.getBoundingClientRect()
      return { left: rect.left, right: rect.right }
    })
    const layoutRect = await page.$eval('.layout', el => {
      const rect = el.getBoundingClientRect()
      return { left: rect.left, right: rect.right }
    })

    // Edges should be within 40px tolerance
    expect(Math.abs(navRect.left - layoutRect.left)).toBeLessThan(40)
    expect(Math.abs(navRect.right - layoutRect.right)).toBeLessThan(40)
  })
})
