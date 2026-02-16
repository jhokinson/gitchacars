// E2E Tests: CustomSelect Component + FilterSidebar
import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3001'

test.describe('CustomSelect Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE)
    await page.waitForLoadState('networkidle')
  })

  test('FilterSidebar Make dropdown opens and closes', async ({ page }) => {
    // Make section should be open by default
    const makeSection = page.locator('.filter-section').first()
    const customSelect = makeSection.locator('.custom-select').first()

    // Click trigger to open
    await customSelect.locator('.custom-select-trigger').click()
    await expect(customSelect.locator('.custom-select-dropdown')).toBeVisible()

    // Click trigger again to close
    await customSelect.locator('.custom-select-trigger').click()
    await expect(customSelect.locator('.custom-select-dropdown')).not.toBeVisible()
  })

  test('CustomSelect closes on Escape key', async ({ page }) => {
    const customSelect = page.locator('.filter-sidebar .custom-select').first()
    await customSelect.locator('.custom-select-trigger').click()
    await expect(customSelect.locator('.custom-select-dropdown')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(customSelect.locator('.custom-select-dropdown')).not.toBeVisible()
  })

  test('CustomSelect closes on click outside', async ({ page }) => {
    const customSelect = page.locator('.filter-sidebar .custom-select').first()
    await customSelect.locator('.custom-select-trigger').click()
    await expect(customSelect.locator('.custom-select-dropdown')).toBeVisible()

    // Click on the page body outside
    await page.locator('.filter-sidebar-header h3').click()
    await expect(customSelect.locator('.custom-select-dropdown')).not.toBeVisible()
  })

  test('Make dropdown is searchable and filters options', async ({ page }) => {
    const customSelect = page.locator('.filter-sidebar .custom-select').first()
    await customSelect.locator('.custom-select-trigger').click()

    // Should have a search input
    const searchInput = customSelect.locator('.custom-select-search-input')
    await expect(searchInput).toBeVisible()

    // Type to filter
    await searchInput.fill('Toy')

    // Should show Toyota in filtered results
    const options = customSelect.locator('.custom-select-option')
    const count = await options.count()
    expect(count).toBeGreaterThan(0)

    // At least one option should contain "Toy"
    const firstOptionText = await options.first().textContent()
    expect(firstOptionText.toLowerCase()).toContain('toy')
  })

  test('Keyboard navigation works (arrow keys + Enter)', async ({ page }) => {
    const customSelect = page.locator('.filter-sidebar .custom-select').first()
    await customSelect.locator('.custom-select-trigger').click()
    await expect(customSelect.locator('.custom-select-dropdown')).toBeVisible()

    // Press ArrowDown to highlight first option
    await page.keyboard.press('ArrowDown')
    const highlighted = customSelect.locator('.custom-select-option.highlighted')
    await expect(highlighted).toBeVisible()

    // Press Enter to select
    await page.keyboard.press('Enter')

    // Dropdown should close and value should be selected
    await expect(customSelect.locator('.custom-select-dropdown')).not.toBeVisible()
    const trigger = customSelect.locator('.custom-select-trigger .custom-select-value')
    const text = await trigger.textContent()
    expect(text).not.toBe('Any Make')
  })

  test('Selecting a make shows model dropdown', async ({ page }) => {
    const makeSelect = page.locator('.filter-sidebar .custom-select').first()
    await makeSelect.locator('.custom-select-trigger').click()

    // Search for Toyota and select it
    const searchInput = makeSelect.locator('.custom-select-search-input')
    await searchInput.fill('Toyota')
    await page.waitForTimeout(200)

    const toyotaOption = makeSelect.locator('.custom-select-option', { hasText: 'Toyota' }).first()
    if (await toyotaOption.isVisible()) {
      await toyotaOption.click()

      // Model dropdown should now appear
      await page.waitForTimeout(500)
      const modelSelect = page.locator('.filter-section').first().locator('.custom-select').nth(1)
      await expect(modelSelect).toBeVisible()
    }
  })

  test('Year/Mileage/Radius selects work', async ({ page }) => {
    // Open Year section
    await page.locator('.filter-section-toggle', { hasText: 'Year Range' }).click()
    await page.waitForTimeout(200)

    // Year selects should be visible
    const yearSelects = page.locator('.filter-row .custom-select')
    const count = await yearSelects.count()
    expect(count).toBe(2)

    // Open mileage section
    await page.locator('.filter-section-toggle', { hasText: 'Max Mileage' }).click()
    await page.waitForTimeout(200)

    // Mileage select should be visible
    const mileageSelect = page.locator('.filter-section').filter({ hasText: 'Max Mileage' }).locator('.custom-select')
    await expect(mileageSelect).toBeVisible()
  })

  test('FilterSidebar has shadow styling', async ({ page }) => {
    const sidebar = page.locator('.filter-sidebar')
    const shadow = await sidebar.evaluate(el => getComputedStyle(el).boxShadow)
    expect(shadow).not.toBe('none')
  })

  test('Filter count badge appears when filter is active', async ({ page }) => {
    // Select a make
    const makeSelect = page.locator('.filter-sidebar .custom-select').first()
    await makeSelect.locator('.custom-select-trigger').click()

    // Select first non-Any option
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)

    // Check for filter count badge
    const badge = page.locator('.filter-count-badge').first()
    await expect(badge).toBeVisible()
  })

  test('Per-section clear button resets section filters', async ({ page }) => {
    // Select a make first
    const makeSelect = page.locator('.filter-sidebar .custom-select').first()
    await makeSelect.locator('.custom-select-trigger').click()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)

    // Per-section clear button should appear
    const clearBtn = page.locator('.filter-section-clear').first()
    if (await clearBtn.isVisible()) {
      await clearBtn.click()
      await page.waitForTimeout(300)

      // Make should be reset — shows placeholder or "Any" label
      const trigger = makeSelect.locator('.custom-select-value')
      const text = await trigger.textContent()
      expect(text === 'Any Make' || text === 'Any').toBeTruthy()
    }
  })
})
