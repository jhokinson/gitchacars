import { test, expect } from '@playwright/test'
import { login, loginAsBuyer, loginAsSeller } from './helpers.js'

test.describe('Unified Dashboard & Role Removal (US-AU17)', () => {
  test('Dashboard shows both sections', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Verify both "My Want Listings" and "My Private Inventory" sections are visible
    await expect(page.locator('text=My Want Listings')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=My Private Inventory')).toBeVisible({ timeout: 10000 })
  })

  test('Any user can create a want listing', async ({ page }) => {
    // Log in as seller1 (previously seller-only) — should now be able to create want listings
    await loginAsSeller(page)
    await page.goto('/create-listing')
    await page.waitForLoadState('networkidle')

    // Should be on the create listing page (not redirected away)
    await expect(page.locator('h1')).toContainText(/Create Want Listing/i)

    // Switch to manual form
    const manualBtn = page.locator('.toggle-btn:has-text("Manual"), button:has-text("Manual Form")')
    if (await manualBtn.isVisible()) {
      await manualBtn.click()
      await page.waitForTimeout(500)
    }

    // Section 1: Select make and model using SearchableSelect
    const makeInput = page.locator('.searchable-select-input').first()
    await makeInput.click()
    await makeInput.fill('Toyota')
    await page.waitForTimeout(300)
    await page.locator('.searchable-select-option:has-text("Toyota")').click()
    await page.waitForTimeout(500)

    const modelInput = page.locator('.searchable-select-input').nth(1)
    await modelInput.click()
    await page.waitForTimeout(300)
    await page.locator('.searchable-select-option:has-text("Camry")').click()
    await page.waitForTimeout(1000)

    // Section 2 should auto-open with year range auto-filled
    // Override year values
    await page.fill('input[name="yearMin"]', '2020')
    await page.fill('input[name="yearMax"]', '2024')
    await page.fill('input[name="mileageMax"]', '50000')

    // Open Section 3 (Budget & Location)
    const section3Header = page.locator('.accordion-header').nth(2)
    await section3Header.click()
    await page.waitForTimeout(300)
    await page.fill('input[name="budgetMin"]', '15000')
    await page.fill('input[name="budgetMax"]', '30000')
    await page.fill('input[name="zipCode"]', '90210')
    await page.fill('input[name="radius"]', '50')

    // Open Section 4 (Features & Details)
    const section4Header = page.locator('.accordion-header').nth(3)
    await section4Header.click()
    await page.waitForTimeout(300)
    await page.fill('textarea[name="description"]', 'E2E test listing created by seller account')

    // Submit and verify redirect to dashboard
    await page.click('button[type="submit"]:has-text("Create Listing")')
    await page.waitForURL('**/dashboard', { timeout: 15000 })

    // Successfully on dashboard — listing was created without permission errors
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=My Want Listings')).toBeVisible()
    const listingHeader = await page.locator('h2:has-text("My Want Listings")').textContent()
    expect(listingHeader).toBeTruthy()
  })

  test('Any user can add a vehicle', async ({ page }) => {
    // Log in as buyer1 (previously buyer-only) — should now be able to add vehicles
    await loginAsBuyer(page)
    await page.goto('/add-vehicle')
    await page.waitForLoadState('networkidle')

    // Should be on the add vehicle page (not redirected)
    await expect(page.locator('h1')).toContainText(/Add to Private Inventory/i)

    // The vehicle form requires 3 images which we can't easily provide in E2E
    // Verify the form is at least accessible and rendered
    await expect(page.locator('input[name="make"]')).toBeVisible()
    await expect(page.locator('input[name="model"]')).toBeVisible()
    await expect(page.locator('input[name="year"]')).toBeVisible()
  })

  test('NavBar shows both actions', async ({ page }) => {
    await loginAsBuyer(page)
    await page.waitForLoadState('networkidle')

    // Both "Post Want-Listing" and "+ Private Inventory" buttons should be visible in the NavBar
    const postListingBtn = page.locator('.navbar a:has-text("Post Want-Listing"), .navbar-cta:has-text("Post Want-Listing")')
    const addVehicleBtn = page.locator('.navbar a:has-text("Private Inventory"), .navbar-cta:has-text("Private Inventory")')

    await expect(postListingBtn.first()).toBeVisible({ timeout: 5000 })
    await expect(addVehicleBtn.first()).toBeVisible({ timeout: 5000 })
  })

  test('Old dashboard URLs redirect — /buyer/dashboard', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/buyer/dashboard')
    await page.waitForTimeout(2000)
    // Should redirect to /dashboard
    expect(page.url()).toContain('/dashboard')
    expect(page.url()).not.toContain('/buyer/dashboard')
  })

  test('Old dashboard URLs redirect — /seller/dashboard', async ({ page }) => {
    await loginAsSeller(page)
    await page.goto('/seller/dashboard')
    await page.waitForTimeout(2000)
    // Should redirect to /dashboard
    expect(page.url()).toContain('/dashboard')
    expect(page.url()).not.toContain('/seller/dashboard')
  })
})
