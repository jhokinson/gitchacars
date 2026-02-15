// @ts-check
import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3001'

test.describe('UX Phase 6 — Model Dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE)
    await page.waitForTimeout(1000)
  })

  test('no Model dropdown when no Make is selected', async ({ page }) => {
    // Make / Model section should be open with one select (Make)
    const makeSection = page.locator('.filter-section').first()
    const selects = makeSection.locator('.filter-section-body select')
    await expect(selects).toHaveCount(1)
  })

  test('selecting a Make shows a second select (Model dropdown)', async ({ page }) => {
    const makeSection = page.locator('.filter-section').first()
    const makeSelect = makeSection.locator('.filter-section-body select').first()

    // Select Toyota
    await makeSelect.selectOption('Toyota')
    await page.waitForTimeout(300)

    // Now there should be 2 selects
    const selects = makeSection.locator('.filter-section-body select')
    await expect(selects).toHaveCount(2)
  })

  test('Model dropdown first option is Any', async ({ page }) => {
    const makeSection = page.locator('.filter-section').first()
    const makeSelect = makeSection.locator('.filter-section-body select').first()

    await makeSelect.selectOption('Toyota')
    await page.waitForTimeout(300)

    const modelSelect = makeSection.locator('.filter-section-body select').nth(1)
    const firstOption = modelSelect.locator('option').first()
    await expect(firstOption).toHaveText('Any')
    expect(await firstOption.getAttribute('value')).toBe('')
  })

  test('Model dropdown contains expected models for Toyota', async ({ page }) => {
    const makeSection = page.locator('.filter-section').first()
    const makeSelect = makeSection.locator('.filter-section-body select').first()

    await makeSelect.selectOption('Toyota')
    await page.waitForTimeout(300)

    const modelSelect = makeSection.locator('.filter-section-body select').nth(1)
    const options = await modelSelect.locator('option').allTextContents()
    // Toyota should have Camry or Corolla
    const hasToyotaModel = options.some(o => o === 'Camry' || o === 'Corolla')
    expect(hasToyotaModel).toBeTruthy()
  })

  test('changing Make resets Model to Any', async ({ page }) => {
    const makeSection = page.locator('.filter-section').first()
    const makeSelect = makeSection.locator('.filter-section-body select').first()

    // Select Toyota then pick a model
    await makeSelect.selectOption('Toyota')
    await page.waitForTimeout(300)
    const modelSelect = makeSection.locator('.filter-section-body select').nth(1)
    // Select first non-Any model
    const options = await modelSelect.locator('option').allTextContents()
    if (options.length > 1) {
      await modelSelect.selectOption(options[1])
      await page.waitForTimeout(200)
    }

    // Change Make to Honda
    await makeSelect.selectOption('Honda')
    await page.waitForTimeout(300)

    // Model should be reset to Any (empty value)
    const newModelSelect = makeSection.locator('.filter-section-body select').nth(1)
    expect(await newModelSelect.inputValue()).toBe('')
  })

  test('changing Make back to Any hides Model dropdown', async ({ page }) => {
    const makeSection = page.locator('.filter-section').first()
    const makeSelect = makeSection.locator('.filter-section-body select').first()

    // Select Toyota
    await makeSelect.selectOption('Toyota')
    await page.waitForTimeout(300)
    await expect(makeSection.locator('.filter-section-body select')).toHaveCount(2)

    // Change back to Any
    await makeSelect.selectOption('')
    await page.waitForTimeout(300)
    await expect(makeSection.locator('.filter-section-body select')).toHaveCount(1)
  })

  test('Clear All resets both Make and Model', async ({ page }) => {
    const makeSection = page.locator('.filter-section').first()
    const makeSelect = makeSection.locator('.filter-section-body select').first()

    // Select Toyota
    await makeSelect.selectOption('Toyota')
    await page.waitForTimeout(300)

    // Click Clear All
    await page.click('.filter-clear-btn')
    await page.waitForTimeout(300)

    // Make should be back to Any
    expect(await makeSelect.inputValue()).toBe('')
    // Model dropdown should be hidden (only 1 select)
    await expect(makeSection.locator('.filter-section-body select')).toHaveCount(1)
  })
})
