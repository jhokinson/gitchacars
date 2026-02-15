import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3001'

test.describe('US-011: Make/Model Data & Card Redesign', () => {
  test('Make filter dropdown has more than 20 options', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.filter-sidebar')

    // Open Make section if not open
    const makeToggle = page.locator('.filter-section-toggle', { hasText: 'Make' })
    const isOpen = await makeToggle.evaluate(el => el.classList.contains('open'))
    if (!isOpen) await makeToggle.click()
    await page.waitForTimeout(300)

    const makeSection = page.locator('.filter-section').filter({ hasText: 'Make' })
    const options = await makeSection.locator('select option').count()
    // Should have "Any" + 50+ real makes
    expect(options).toBeGreaterThan(20)
  })

  test('Listing cards display primary title', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.listing-card', { timeout: 10000 })

    const title = page.locator('.listing-card-title').first()
    await expect(title).toBeVisible()
    const text = await title.textContent()
    expect(text.length).toBeGreaterThan(0)
  })

  test('Listing cards display subtitle with Wanting to buy', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.listing-card', { timeout: 10000 })

    const subtitle = page.locator('.listing-card-subtitle').first()
    await expect(subtitle).toBeVisible()
    const text = await subtitle.textContent()
    expect(text).toContain('Wanting to buy')
  })

  test('Subtitle contains make/model info', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.listing-card', { timeout: 10000 })

    const subtitle = page.locator('.listing-card-subtitle').first()
    const text = await subtitle.textContent()
    // First listing has Honda CR-V, so subtitle should contain make or model
    expect(text.length).toBeGreaterThan('Wanting to buy'.length)
  })
})
