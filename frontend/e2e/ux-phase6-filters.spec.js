// @ts-check
import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3001'

test.describe('UX Phase 6 — Filter Sidebar Scroll & Reorder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE)
    await page.waitForTimeout(1000)
  })

  test('filter sidebar does not have position: sticky', async ({ page }) => {
    const sidebar = page.locator('.filter-sidebar').first()
    const position = await sidebar.evaluate(el => getComputedStyle(el).position)
    expect(position).not.toBe('sticky')
  })

  test('filter sidebar does not have overflow-y: auto or scroll', async ({ page }) => {
    const sidebar = page.locator('.filter-sidebar').first()
    const overflowY = await sidebar.evaluate(el => getComputedStyle(el).overflowY)
    expect(overflowY).not.toBe('auto')
    expect(overflowY).not.toBe('scroll')
  })

  test('first filter section is Make / Model', async ({ page }) => {
    const firstToggle = page.locator('.filter-section .filter-section-toggle').first()
    await expect(firstToggle).toContainText('Make / Model')
  })

  test('second filter section is Price Range', async ({ page }) => {
    const secondToggle = page.locator('.filter-section .filter-section-toggle').nth(1)
    await expect(secondToggle).toContainText('Price Range')
  })

  test('Price Range appears before Location in DOM', async ({ page }) => {
    const toggles = page.locator('.filter-section .filter-section-toggle')
    const texts = await toggles.allTextContents()
    const priceIndex = texts.findIndex(t => t.includes('Price Range'))
    const locationIndex = texts.findIndex(t => t.includes('Location'))
    expect(priceIndex).toBeLessThan(locationIndex)
  })

  test('Make / Model and Price Range are expanded by default; Vehicle Type is collapsed', async ({ page }) => {
    // Make / Model should have an open toggle and a visible section body
    const makeToggle = page.locator('.filter-section .filter-section-toggle').first()
    await expect(makeToggle).toHaveClass(/open/)

    // Price Range toggle
    const priceToggle = page.locator('.filter-section .filter-section-toggle').nth(1)
    await expect(priceToggle).toHaveClass(/open/)

    // Vehicle Type should NOT be open
    const toggles = page.locator('.filter-section .filter-section-toggle')
    const texts = await toggles.allTextContents()
    const typeIndex = texts.findIndex(t => t.includes('Vehicle Type'))
    const typeToggle = toggles.nth(typeIndex)
    const classes = await typeToggle.getAttribute('class')
    expect(classes).not.toContain('open')
  })

  test('all 8 filter sections are present', async ({ page }) => {
    const toggles = page.locator('.filter-section .filter-section-toggle')
    const texts = await toggles.allTextContents()
    const expected = ['Make / Model', 'Price Range', 'Year Range', 'Max Mileage', 'Location', 'Vehicle Type', 'Transmission', 'Drivetrain']
    for (const label of expected) {
      expect(texts.some(t => t.includes(label))).toBeTruthy()
    }
    // Should have exactly 8 filter sections
    expect(await toggles.count()).toBe(8)
  })
})
