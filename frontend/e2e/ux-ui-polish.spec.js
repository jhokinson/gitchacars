// E2E Tests: Visual Polish (Shadows, Buttons, Depth)
import { test, expect } from '@playwright/test'
import { loginAsBuyer, loginAsSeller } from './helpers'

const BASE = 'http://localhost:3001'

test.describe('Visual Polish — Shadows & Depth', () => {
  test('Dashboard rows have default box-shadow', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto(`${BASE}/dashboard`)
    await page.waitForLoadState('networkidle')

    const row = page.locator('.dash-listing-row').first()
    if (await row.isVisible()) {
      const shadow = await row.evaluate(el => getComputedStyle(el).boxShadow)
      expect(shadow).not.toBe('none')
    }
  })

  test('IntroCard has default box-shadow', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto(`${BASE}/dashboard`)
    await page.waitForLoadState('networkidle')

    const card = page.locator('.intro-card').first()
    if (await card.isVisible()) {
      const shadow = await card.evaluate(el => getComputedStyle(el).boxShadow)
      expect(shadow).not.toBe('none')
    }
  })

  test('VehicleCard has default box-shadow', async ({ page }) => {
    await loginAsSeller(page)
    await page.goto(`${BASE}/dashboard`)
    await page.waitForLoadState('networkidle')

    const card = page.locator('.vehicle-card').first()
    if (await card.isVisible()) {
      const shadow = await card.evaluate(el => getComputedStyle(el).boxShadow)
      expect(shadow).not.toBe('none')
    }
  })

  test('Conversation rows have default box-shadow', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto(`${BASE}/messages`)
    await page.waitForLoadState('networkidle')

    const row = page.locator('.conversation-row').first()
    if (await row.isVisible()) {
      const shadow = await row.evaluate(el => getComputedStyle(el).boxShadow)
      expect(shadow).not.toBe('none')
    }
  })

  test('Detail page cards have elevated shadow', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForLoadState('networkidle')

    // Click first listing to go to detail page
    const firstListing = page.locator('.listing-card').first()
    if (await firstListing.isVisible()) {
      await firstListing.click()
      await page.waitForLoadState('networkidle')

      const card = page.locator('.detail-page .card').first()
      if (await card.isVisible()) {
        const shadow = await card.evaluate(el => getComputedStyle(el).boxShadow)
        expect(shadow).not.toBe('none')
      }
    }
  })

  test('Chat page has card container styling', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto(`${BASE}/messages`)
    await page.waitForLoadState('networkidle')

    // Navigate to a chat if available
    const chatLink = page.locator('.conversation-row').first()
    if (await chatLink.isVisible()) {
      await chatLink.click()
      await page.waitForLoadState('networkidle')

      const chatPage = page.locator('.chat-page')
      if (await chatPage.isVisible()) {
        const shadow = await chatPage.evaluate(el => getComputedStyle(el).boxShadow)
        expect(shadow).not.toBe('none')

        const border = await chatPage.evaluate(el => getComputedStyle(el).borderRadius)
        expect(border).not.toBe('0px')
      }
    }
  })
})

test.describe('Visual Polish — Button Hover States', () => {
  test('Primary button has hover transform', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForLoadState('networkidle')

    const btn = page.locator('.btn-primary').first()
    if (await btn.isVisible()) {
      await btn.hover()
      const transform = await btn.evaluate(el => getComputedStyle(el).transform)
      // Should have a translateY transform on hover
      expect(transform).not.toBe('none')
    }
  })

  test('Disabled buttons do not get hover effects', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForLoadState('networkidle')

    const disabledBtn = page.locator('.btn:disabled').first()
    if (await disabledBtn.isVisible()) {
      const opacity = await disabledBtn.evaluate(el => getComputedStyle(el).opacity)
      expect(parseFloat(opacity)).toBeLessThan(1)
    }
  })
})

test.describe('Visual Polish — Dashboard Sections', () => {
  test('Dashboard empty states have dashed border', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto(`${BASE}/dashboard`)
    await page.waitForLoadState('networkidle')

    const empty = page.locator('.dashboard-empty').first()
    if (await empty.isVisible()) {
      const borderStyle = await empty.evaluate(el => getComputedStyle(el).borderStyle)
      expect(borderStyle).toBe('dashed')
    }
  })

  test('Dashboard sections have top border dividers', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto(`${BASE}/dashboard`)
    await page.waitForLoadState('networkidle')

    const sections = page.locator('.dashboard-section')
    const count = await sections.count()
    if (count >= 2) {
      const border = await sections.nth(1).evaluate(el => getComputedStyle(el).borderTopStyle)
      expect(border).toBe('solid')
    }
  })

  test('No horizontal overflow on homepage', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForLoadState('networkidle')

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    expect(hasOverflow).toBe(false)
  })
})
