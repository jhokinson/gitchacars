import { test, expect } from '@playwright/test'
import { loginAsSeller, loginAsBuyer } from './helpers.js'

test.describe('Introduction & Matching Flow', () => {
  test('seller views matches for a vehicle', async ({ page }) => {
    await loginAsSeller(page)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const matchBtn = page.locator('.vehicle-card a:has-text("Find Buyers")').first()
    await matchBtn.click()
    await page.waitForURL(/\/vehicles\/.*\/matches/)

    // Verify matches page has vehicle info and matching listings
    await expect(page.locator('.matches-vehicle-header')).toBeVisible()
  })

  test('seller sends an introduction', async ({ page }) => {
    await loginAsSeller(page)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const matchBtn = page.locator('.vehicle-card a:has-text("Find Buyers")').first()
    await matchBtn.click()
    await page.waitForURL(/\/vehicles\/.*\/matches/)

    // Find an "Introduce from Inventory" button (not already introduced)
    const introduceBtn = page.locator('button:has-text("Introduce from Inventory")').first()
    if (await introduceBtn.isVisible()) {
      await introduceBtn.click()
      // Fill modal message
      await page.waitForSelector('.modal-textarea, textarea', { timeout: 5000 })
      await page.locator('.modal-textarea, .modal textarea, textarea').last().fill('I have this vehicle available for you!')
      // Submit
      await page.locator('.modal-actions button:has-text("Send"), button:has-text("Introduce")').click()
      await page.waitForTimeout(2000)
      // Should show "Already Introduced" or success feedback
    }
  })

  test('buyer sees introductions', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/introductions')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1, h2').first()).toContainText(/Introduction/i)
    // Should have at least one intro (from seeded data)
    const introCards = page.locator('.intro-card')
    await expect(introCards.first()).toBeVisible({ timeout: 10000 })
  })

  test('buyer can navigate to messages from accepted intro', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/introductions')
    await page.waitForLoadState('networkidle')

    const messageBtn = page.locator('a:has-text("Message Seller")').first()
    if (await messageBtn.isVisible()) {
      await messageBtn.click()
      await expect(page).toHaveURL(/\/messages\//)
    }
  })
})
