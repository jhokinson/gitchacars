import { test, expect } from '@playwright/test'

test.describe('Vehicle Type Icons Display', () => {
  test('Icons on homepage listing cards', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })

    // Find listing cards — each should have an SVG icon in the image area
    const cards = page.locator('.listing-card')
    const cardCount = await cards.count()
    expect(cardCount).toBeGreaterThan(0)

    // At least one card should have a vehicle-type-icon SVG
    const cardsWithIcon = page.locator('.listing-card .listing-card-image svg.vehicle-type-icon')
    const iconCount = await cardsWithIcon.count()
    expect(iconCount).toBeGreaterThan(0)
  })

  test('Null vehicle type shows generic icon (not blank)', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })

    // All listing cards should have an SVG icon — even those without vehicleType
    const allCards = page.locator('.listing-card')
    const totalCards = await allCards.count()

    for (let i = 0; i < totalCards; i++) {
      const card = allCards.nth(i)
      const icon = card.locator('.listing-card-image svg')
      await expect(icon).toBeVisible()
    }
  })

  test('Icon on detail page with vehicle type', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })

    // Find a listing with "Family SUV" which has vehicleType: "suv"
    const suvCard = page.locator('.listing-card:has-text("Family SUV")').first()
    if (await suvCard.isVisible()) {
      await suvCard.click()
      await page.waitForURL(/\/want-listings\//)

      // Verify the vehicle type section is displayed
      const vehicleType = page.locator('.detail-vehicle-type')
      await expect(vehicleType).toBeVisible()

      // Verify icon is present
      await expect(vehicleType.locator('svg.vehicle-type-icon')).toBeVisible()

      // Verify label text
      await expect(vehicleType.locator('span')).toHaveText('SUV')
    } else {
      // Fall back — click the first card and just verify the page loads
      await page.locator('.listing-card').first().click()
      await page.waitForURL(/\/want-listings\//)
      await expect(page.locator('.detail-title, h1').first()).toBeVisible()
    }
  })

  test('Icons are responsive at mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })

    // Verify listing cards render without overflow
    const cards = page.locator('.listing-card')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)

    // Check that icons are visible and not overflowing
    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = cards.nth(i)
      const icon = card.locator('.listing-card-image svg')
      await expect(icon).toBeVisible()

      // Verify the icon's bounding box is within the card's bounding box
      const cardBox = await card.boundingBox()
      const iconBox = await icon.boundingBox()
      expect(iconBox.x).toBeGreaterThanOrEqual(cardBox.x)
      expect(iconBox.x + iconBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 1) // 1px tolerance
    }
  })
})
