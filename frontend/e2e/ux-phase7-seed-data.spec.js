// @ts-check
import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3001'

test.describe('UX Phase 7 — Seed Data Diversity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE)
    await page.waitForTimeout(2000)
  })

  test('homepage loads at least 10 want listings', async ({ page }) => {
    const countText = page.locator('.home-content-count')
    await expect(countText).toBeVisible()
    const text = await countText.textContent()
    // Extract total from "Showing X of Y listings"
    const match = text.match(/of (\d+) listings/)
    expect(match).toBeTruthy()
    const total = parseInt(match[1])
    expect(total).toBeGreaterThanOrEqual(10)
  })

  test('listings contain at least 3 different makes', async ({ page }) => {
    // Load all listings by scrolling / checking cards
    const cards = page.locator('.home-listing-feed .scroll-reveal')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)

    // Get listing card text content to find unique makes
    const allText = await cards.allTextContents()
    const makes = ['Toyota', 'Honda', 'Ford', 'BMW', 'Ferrari', 'Porsche', 'Lamborghini', 'Tesla', 'Chevrolet', 'Nissan', 'Mazda', 'RAM', 'Range Rover', 'Rivian']
    const foundMakes = makes.filter(make => allText.some(t => t.includes(make)))
    expect(foundMakes.length).toBeGreaterThanOrEqual(3)
  })

  test('at least one listing mentions exotic cars', async ({ page }) => {
    const allText = await page.locator('.home-listing-feed').textContent()
    const hasExotic = allText.includes('Ferrari') || allText.includes('Porsche') || allText.includes('Lamborghini')
    expect(hasExotic).toBeTruthy()
  })

  test('at least one listing mentions classic cars', async ({ page }) => {
    // Check via API since homepage pagination may not show all listings
    const response = await page.request.get(`${BASE}/api/want-listings?limit=20`)
    const body = await response.json()
    const listings = body.data.listings
    const hasClassic = listings.some(l => {
      const text = (l.title + ' ' + (l.description || '')).toLowerCase()
      return text.includes('mustang') || text.includes('chevelle') || text.includes('1967') || text.includes('1970') || text.includes('1965') || text.includes('1969')
    })
    expect(hasClassic).toBeTruthy()
  })

  test('listings have substantial descriptions (not one-liners)', async ({ page }) => {
    // Check via API that descriptions are longer than 50 chars
    const response = await page.request.get(`${BASE}/api/want-listings?limit=15`)
    const body = await response.json()
    const listings = body.data.listings
    expect(listings.length).toBeGreaterThan(0)
    const longDescriptions = listings.filter(l => l.description && l.description.length > 50)
    expect(longDescriptions.length).toBeGreaterThanOrEqual(listings.length * 0.8) // at least 80% have substantial descriptions
  })
})
