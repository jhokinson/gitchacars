import { test, expect } from '@playwright/test'
import { loginAsBuyer } from './helpers.js'

test.describe('Want Listing CRUD', () => {
  const uniqueTitle = `Test Listing ${Date.now()}`

  test('create listing with all fields', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/create-listing')

    // Switch to manual mode
    await page.locator('.toggle-btn:has-text("Manual Form")').click()
    await expect(page.locator('form')).toBeVisible()

    // Fill vehicle preferences
    await page.fill('input[name="title"]', uniqueTitle)

    // Select make via SearchableSelect
    await page.locator('.searchable-select').first().click()
    await page.locator('.searchable-select input').first().fill('Honda')
    await page.locator('.searchable-select-option:has-text("Honda")').click()

    // Select model via SearchableSelect
    await page.locator('.searchable-select').nth(1).click()
    await page.locator('.searchable-select input').nth(1).fill('CR-V')
    await page.locator('.searchable-select-option:has-text("CR-V")').click()

    // Open Year & Specs accordion
    await page.locator('.accordion-header:has-text("Year & Specs")').click()
    await page.fill('input[name="yearMin"]', '2020')
    await page.fill('input[name="yearMax"]', '2024')
    await page.fill('input[name="mileageMax"]', '50000')

    // Open Budget & Location accordion
    await page.locator('.accordion-header:has-text("Budget & Location")').click()
    await page.fill('input[name="budgetMin"]', '20000')
    await page.fill('input[name="budgetMax"]', '35000')
    await page.fill('input[name="zipCode"]', '90210')
    await page.fill('input[name="radius"]', '50')

    // Features & Details auto-opens when budget section is complete — wait for description textarea to be visible
    await expect(page.locator('textarea[name="description"]')).toBeVisible({ timeout: 5000 })

    // Select feature tags
    const featureTags = page.locator('.tag-pill')
    if (await featureTags.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await featureTags.nth(0).click() // Leather Seats
      await featureTags.nth(2).click() // Backup Camera
      await featureTags.nth(3).click() // Navigation
    }

    // Fill description
    await page.fill('textarea[name="description"], textarea', 'Looking for a well-maintained Honda CR-V')

    // Submit
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })

    // Verify new listing appears
    await expect(page.locator(`text=${uniqueTitle}`)).toBeVisible({ timeout: 5000 })
  })

  test('view listing detail shows all data', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })
    await page.locator('.listing-card').first().click()
    await page.waitForURL(/\/want-listings\//)

    // Verify key sections
    await expect(page.locator('.detail-title, h1').first()).toBeVisible()
    await expect(page.locator('.detail-body')).toBeVisible()
  })

  test('edit listing updates title', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Click edit on first listing
    const editBtn = page.locator('a:has-text("Edit")').first()
    await editBtn.click()
    await page.waitForURL(/\/edit-listing\//)

    // Change title
    const titleInput = page.locator('input[name="title"]')
    const originalTitle = await titleInput.inputValue()
    const updatedTitle = originalTitle + ' Updated'
    await titleInput.fill(updatedTitle)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })

    // Verify updated title
    await expect(page.locator(`text=${updatedTitle}`)).toBeVisible({ timeout: 5000 })

    // Revert the title
    const editBtn2 = page.locator('a:has-text("Edit")').first()
    await editBtn2.click()
    await page.waitForURL(/\/edit-listing\//)
    await page.locator('input[name="title"]').fill(originalTitle)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
  })

  test('validation — empty required fields', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/create-listing')
    // Switch to manual mode first — default is chat mode
    await page.locator('.toggle-btn:has-text("Manual Form")').click()
    await expect(page.locator('form')).toBeVisible()
    await page.click('button[type="submit"]')
    // Should stay on the page
    await expect(page).toHaveURL(/\/create-listing/)
  })
})
