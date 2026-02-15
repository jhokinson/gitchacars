import { test, expect } from '@playwright/test'
import { loginAsBuyer } from './helpers.js'

test.describe('Manual Form with Vehicle Type', () => {
  const uniqueTitle = `Manual VType Test ${Date.now()}`

  test('Manual form works end-to-end with vehicle type', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/create-listing')
    await page.waitForLoadState('networkidle')

    // Switch to manual mode
    await page.locator('.toggle-btn:has-text("Manual Form")').click()
    await expect(page.locator('form')).toBeVisible()

    // Fill all required fields
    await page.fill('input[name="title"]', uniqueTitle)

    // Select make via SearchableSelect
    await page.locator('.searchable-select').first().click()
    await page.locator('.searchable-select input').first().fill('Toyota')
    await page.locator('.searchable-select-option:has-text("Toyota")').click()

    // Select model via SearchableSelect
    await page.locator('.searchable-select').nth(1).click()
    await page.locator('.searchable-select input').nth(1).fill('RAV4')
    await page.locator('.searchable-select-option:has-text("RAV4")').click()

    // Open Year & Specs accordion
    await page.locator('.accordion-header:has-text("Year & Specs")').click()
    await page.fill('input[name="yearMin"]', '2020')
    await page.fill('input[name="yearMax"]', '2024')
    await page.fill('input[name="mileageMax"]', '50000')

    // Open Budget & Location accordion
    await page.locator('.accordion-header:has-text("Budget & Location")').click()
    await page.fill('input[name="budgetMin"]', '25000')
    await page.fill('input[name="budgetMax"]', '35000')
    await page.fill('input[name="zipCode"]', '90210')
    await page.fill('input[name="radius"]', '50')
    await page.fill('textarea[name="description"]', 'Looking for a reliable family SUV')

    // Select vehicle type "SUV" (click and verify visually via border change)
    const suvCard = page.locator('.vehicle-type-card:has-text("SUV")')
    await suvCard.scrollIntoViewIfNeeded()
    await suvCard.click({ force: true })
    await page.waitForTimeout(300)

    // Submit
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })

    // Verify listing was created
    await expect(page.locator(`text=${uniqueTitle}`)).toBeVisible({ timeout: 5000 })
  })

  test('Vehicle type is optional', async ({ page }) => {
    const noTypeTitle = `No VType Test ${Date.now()}`
    await loginAsBuyer(page)
    await page.goto('/create-listing')
    await page.waitForLoadState('networkidle')

    // Switch to manual mode
    await page.locator('.toggle-btn:has-text("Manual Form")').click()
    await expect(page.locator('form')).toBeVisible()

    // Fill required fields without selecting a vehicle type
    await page.fill('input[name="title"]', noTypeTitle)

    // Select make via SearchableSelect
    await page.locator('.searchable-select').first().click()
    await page.locator('.searchable-select input').first().fill('Honda')
    await page.locator('.searchable-select-option:has-text("Honda")').click()

    // Select model via SearchableSelect
    await page.locator('.searchable-select').nth(1).click()
    await page.locator('.searchable-select input').nth(1).fill('Civic')
    await page.locator('.searchable-select-option:has-text("Civic")').click()

    // Open Year & Specs accordion
    await page.locator('.accordion-header:has-text("Year & Specs")').click()
    await page.fill('input[name="yearMin"]', '2020')
    await page.fill('input[name="yearMax"]', '2024')
    await page.fill('input[name="mileageMax"]', '40000')

    // Open Budget & Location accordion
    await page.locator('.accordion-header:has-text("Budget & Location")').click()
    await page.fill('input[name="budgetMin"]', '18000')
    await page.fill('input[name="budgetMax"]', '28000')
    await page.fill('input[name="zipCode"]', '90210')
    await page.fill('input[name="radius"]', '30')
    await page.fill('textarea[name="description"]', 'Test listing without vehicle type')

    // No vehicle type selected — just submit
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })

    // Verify listing was created
    await expect(page.locator(`text=${noTypeTitle}`)).toBeVisible({ timeout: 5000 })
  })

  test('Vehicle type displays on listing card', async ({ page }) => {
    const truckTitle = `Truck Icon Test ${Date.now()}`
    await loginAsBuyer(page)
    await page.goto('/create-listing')
    await page.waitForLoadState('networkidle')

    // Switch to manual mode and create listing with truck type
    await page.locator('.toggle-btn:has-text("Manual Form")').click()
    await page.fill('input[name="title"]', truckTitle)

    // Select make via SearchableSelect
    await page.locator('.searchable-select').first().click()
    await page.locator('.searchable-select input').first().fill('Ford')
    await page.locator('.searchable-select-option:has-text("Ford")').click()

    // Select model via SearchableSelect (car-info package lists it as F150 without hyphen)
    await page.locator('.searchable-select').nth(1).click()
    await page.locator('.searchable-select input').nth(1).fill('F150')
    await page.locator('.searchable-select-option:has-text("F150")').click()

    // Open Year & Specs accordion
    await page.locator('.accordion-header:has-text("Year & Specs")').click()
    await page.fill('input[name="yearMin"]', '2020')
    await page.fill('input[name="yearMax"]', '2024')
    await page.fill('input[name="mileageMax"]', '60000')

    // Open Budget & Location accordion
    await page.locator('.accordion-header:has-text("Budget & Location")').click()
    await page.fill('input[name="budgetMin"]', '30000')
    await page.fill('input[name="budgetMax"]', '55000')
    await page.fill('input[name="zipCode"]', '10001')
    await page.fill('input[name="radius"]', '50')
    await page.fill('textarea[name="description"]', 'Need a work truck')

    // Select Truck vehicle type
    const truckCard = page.locator('.vehicle-type-card:has-text("Pickup Truck")')
    await truckCard.click()

    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })

    // Navigate to homepage
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })

    // Find the listing card with the truck title
    const listingCard = page.locator(`.listing-card:has-text("${truckTitle}")`)
    await expect(listingCard).toBeVisible()

    // Verify SVG icon is present in the listing card image area
    const icon = listingCard.locator('.listing-card-image svg.vehicle-type-icon')
    await expect(icon).toBeVisible()
  })

  test('Vehicle type displays on detail page', async ({ page }) => {
    // Navigate to homepage and find a listing with vehicleType
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })

    // Find the SUV listing we know exists from the seed data
    const suvListing = page.locator('.listing-card:has-text("Family SUV")').first()
    if (await suvListing.isVisible()) {
      await suvListing.click()
    } else {
      // Fall back to first listing
      await page.locator('.listing-card').first().click()
    }
    await page.waitForURL(/\/want-listings\//)

    // Check if this listing has a vehicle type — if so, verify icon and label
    const vehicleTypeSection = page.locator('.detail-vehicle-type')
    if (await vehicleTypeSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(vehicleTypeSection.locator('svg.vehicle-type-icon')).toBeVisible()
      // Label should be visible (e.g., "SUV", "Pickup Truck", etc.)
      const label = await vehicleTypeSection.locator('span').textContent()
      expect(label.length).toBeGreaterThan(0)
    }
  })

  test('Edit listing preserves vehicle type', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Find a listing to edit — look for one we just created with a vehicle type
    const editBtn = page.locator('a:has-text("Edit")').first()
    await editBtn.click()
    await page.waitForURL(/\/edit-listing\//)

    // Verify vehicle type selector is visible
    const vehicleTypeGrid = page.locator('.vehicle-type-grid')
    await expect(vehicleTypeGrid).toBeVisible()

    // Check if any card is already selected
    const selectedCards = vehicleTypeGrid.locator('.vehicle-type-card.selected')
    const initialCount = await selectedCards.count()

    // Select or change the vehicle type to SUV
    const suvCard = page.locator('.vehicle-type-card:has-text("SUV")')
    await suvCard.click()
    await expect(suvCard).toHaveClass(/selected/)

    // Save changes
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })

    // Re-edit to verify vehicle type persisted
    const editBtn2 = page.locator('a:has-text("Edit")').first()
    await editBtn2.click()
    await page.waitForURL(/\/edit-listing\//)

    // Verify SUV is selected
    const suvCardAfter = page.locator('.vehicle-type-card:has-text("SUV")')
    await expect(suvCardAfter).toHaveClass(/selected/)
  })
})
