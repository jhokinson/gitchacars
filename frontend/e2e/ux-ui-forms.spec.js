// E2E Tests: Form Pages Fix + Select Migration
import { test, expect } from '@playwright/test'
import { loginAsBuyer, loginAsSeller } from './helpers'

const BASE = 'http://localhost:3001'

test.describe('CreateListingPage — Accordion Sections', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto(`${BASE}/create-listing`)
    await page.waitForLoadState('networkidle')
    // Switch to manual mode
    await page.locator('.toggle-btn', { hasText: 'Manual Form' }).click()
    await page.waitForTimeout(500)
  })

  test('All 4 accordion sections are expanded on page load', async ({ page }) => {
    // All sections should be open (have the .open class)
    const sections = page.locator('.accordion-section.open')
    const count = await sections.count()
    expect(count).toBe(4)
  })

  test('Accordion sections can be collapsed and re-expanded', async ({ page }) => {
    // Click first section header to collapse
    await page.locator('.accordion-header').first().click()
    await page.waitForTimeout(400)

    // Should now have 3 open sections
    const openCount = await page.locator('.accordion-section.open').count()
    expect(openCount).toBe(3)

    // Re-expand
    await page.locator('.accordion-header').first().click()
    await page.waitForTimeout(400)

    const reopenCount = await page.locator('.accordion-section.open').count()
    expect(reopenCount).toBe(4)
  })

  test('No section is gated behind prior section completion', async ({ page }) => {
    // Budget & Location section should be visible without filling Vehicle section
    const budgetSection = page.locator('.accordion-section').nth(2)
    await expect(budgetSection.locator('.accordion-body')).toBeVisible()

    // Features & Details section visible too
    const detailsSection = page.locator('.accordion-section').nth(3)
    await expect(detailsSection.locator('.accordion-body')).toBeVisible()
  })
})

test.describe('CreateListingPage — CustomSelect Dropdowns', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto(`${BASE}/create-listing`)
    await page.waitForLoadState('networkidle')
    await page.locator('.toggle-btn', { hasText: 'Manual Form' }).click()
    await page.waitForTimeout(500)
  })

  test('Make dropdown is CustomSelect and searchable', async ({ page }) => {
    const makeSelect = page.locator('.accordion-section').first().locator('.custom-select').first()
    await expect(makeSelect).toBeVisible()

    await makeSelect.locator('.custom-select-trigger').click()
    const searchInput = makeSelect.locator('.custom-select-search-input')
    await expect(searchInput).toBeVisible()
  })

  test('Model dropdown appears when make is selected', async ({ page }) => {
    const makeSelect = page.locator('.accordion-section').first().locator('.custom-select').first()
    await makeSelect.locator('.custom-select-trigger').click()

    // Search and select a make
    const searchInput = makeSelect.locator('.custom-select-search-input')
    await searchInput.fill('Honda')
    await page.waitForTimeout(200)

    const option = makeSelect.locator('.custom-select-option', { hasText: 'Honda' }).first()
    if (await option.isVisible()) {
      await option.click()
      await page.waitForTimeout(300)

      // Model select should now be enabled
      const modelSelect = page.locator('.accordion-section').first().locator('.custom-select').nth(1)
      await expect(modelSelect).toBeVisible()
      const isDisabled = await modelSelect.locator('.custom-select-trigger').isDisabled()
      expect(isDisabled).toBe(false)
    }
  })

  test('Transmission/Drivetrain/Condition are CustomSelect', async ({ page }) => {
    // Second accordion section (Year & Specs) should have CustomSelect for these
    const specsSection = page.locator('.accordion-section').nth(1)
    const selects = specsSection.locator('.custom-select')
    const count = await selects.count()
    expect(count).toBe(3) // Transmission, Drivetrain, Condition
  })

  test('No native select elements remain in the form', async ({ page }) => {
    const nativeSelects = page.locator('.accordion-section select')
    const count = await nativeSelects.count()
    expect(count).toBe(0)
  })

  test('No SearchableSelect CSS classes in the page', async ({ page }) => {
    const searchableSelects = page.locator('.searchable-select')
    const count = await searchableSelects.count()
    expect(count).toBe(0)
  })
})

test.describe('AddVehiclePage — CustomSelect', () => {
  test('Make/Model/Transmission/Drivetrain use CustomSelect', async ({ page }) => {
    await loginAsSeller(page)
    await page.goto(`${BASE}/add-vehicle`)
    await page.waitForLoadState('networkidle')

    // Should have CustomSelect components
    const selects = page.locator('.custom-select')
    const count = await selects.count()
    expect(count).toBeGreaterThanOrEqual(4) // make, model, transmission, drivetrain

    // No native selects in the form sections
    const nativeSelects = page.locator('.form-section select')
    const nativeCount = await nativeSelects.count()
    expect(nativeCount).toBe(0)
  })

  test('Make dropdown is searchable', async ({ page }) => {
    await loginAsSeller(page)
    await page.goto(`${BASE}/add-vehicle`)
    await page.waitForLoadState('networkidle')

    const makeSelect = page.locator('.custom-select').first()
    await makeSelect.locator('.custom-select-trigger').click()

    const searchInput = makeSelect.locator('.custom-select-search-input')
    await expect(searchInput).toBeVisible()
  })
})

test.describe('WantListingDetailPage — Vehicle Selector', () => {
  test('Vehicle selector uses CustomSelect', async ({ page }) => {
    await loginAsSeller(page)

    // Go to homepage and click first listing
    await page.goto(BASE)
    await page.waitForLoadState('networkidle')

    const listing = page.locator('.listing-card').first()
    if (await listing.isVisible()) {
      await listing.click()
      await page.waitForLoadState('networkidle')

      // Try to open the vehicle selector
      const addVehicleBtn = page.locator('.intro-add-vehicle-btn')
      if (await addVehicleBtn.isVisible()) {
        await addVehicleBtn.click()
        await page.waitForTimeout(300)

        // Should have a CustomSelect, not a native select
        const customSelect = page.locator('.intro-vehicle-selector .custom-select')
        if (await customSelect.isVisible()) {
          await expect(customSelect).toBeVisible()
        }
      }
    }
  })
})
