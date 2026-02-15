import { test, expect } from '@playwright/test'
import { loginAsSeller } from './helpers.js'

test.describe('Seller Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSeller(page)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('page loads with dashboard heading', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toContainText(/Dashboard/i)
  })

  test('my vehicles display with year/make/model/price', async ({ page }) => {
    const vehicleCard = page.locator('.vehicle-card').first()
    await expect(vehicleCard).toBeVisible({ timeout: 10000 })
    await expect(vehicleCard.locator('h4')).toBeVisible()
    await expect(vehicleCard.locator('.vehicle-card-price')).toBeVisible()
  })

  test('add vehicle button navigates to add form', async ({ page }) => {
    await page.click('text=Add to Inventory')
    await expect(page).toHaveURL(/\/add-vehicle/)
  })

  test('edit vehicle navigates to edit page', async ({ page }) => {
    const editBtn = page.locator('.vehicle-card a:has-text("Edit")').first()
    if (await editBtn.isVisible()) {
      await editBtn.click()
      await expect(page).toHaveURL(/\/edit-vehicle\//)
    }
  })

  test('view matches navigates to matches page', async ({ page }) => {
    const matchBtn = page.locator('.vehicle-card a:has-text("Find Buyers")').first()
    if (await matchBtn.isVisible()) {
      await matchBtn.click()
      await expect(page).toHaveURL(/\/vehicles\/.*\/matches/)
    }
  })

  test('sent introductions section visible', async ({ page }) => {
    await expect(page.locator('text=Sent Introductions')).toBeVisible()
  })
})
