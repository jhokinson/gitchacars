// @ts-check
import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3001'

test.describe('UX Phase 7 — NHTSA Vehicle Data', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE)
    await page.waitForTimeout(2000) // wait for API data to load
  })

  test('Make dropdown contains more than 71 options (NHTSA data)', async ({ page }) => {
    const makeSection = page.locator('.filter-section').first()
    const makeSelect = makeSection.locator('.filter-section-body select').first()
    const options = await makeSelect.locator('option').count()
    // car-info has 71 makes + 1 "Any" = 72. NHTSA should have significantly more
    expect(options).toBeGreaterThan(72)
  })

  test('McLaren has multiple models (car-info only has 1)', async ({ page }) => {
    const makeSection = page.locator('.filter-section').first()
    const makeSelect = makeSection.locator('.filter-section-body select').first()

    await makeSelect.selectOption('McLaren')
    await page.waitForTimeout(1500) // wait for models API

    const modelSelect = makeSection.locator('.filter-section-body select').nth(1)
    await expect(modelSelect).toBeVisible()
    const options = await modelSelect.locator('option').allTextContents()
    // Should have Any + multiple models (car-info only had MP4-12C)
    expect(options.length).toBeGreaterThan(2)
  })

  test('Rivian has models (car-info does not have Rivian)', async ({ page }) => {
    const makeSection = page.locator('.filter-section').first()
    const makeSelect = makeSection.locator('.filter-section-body select').first()

    // Check Rivian exists in the dropdown
    const makeOptions = await makeSelect.locator('option').allTextContents()
    expect(makeOptions.some(o => o === 'Rivian')).toBeTruthy()

    await makeSelect.selectOption('Rivian')
    await page.waitForTimeout(1500)

    const modelSelect = makeSection.locator('.filter-section-body select').nth(1)
    await expect(modelSelect).toBeVisible()
    const modelOptions = await modelSelect.locator('option').allTextContents()
    expect(modelOptions.length).toBeGreaterThan(1) // Any + at least 1 model
  })

  test('Toyota models include Camry, Corolla, RAV4', async ({ page }) => {
    const makeSection = page.locator('.filter-section').first()
    const makeSelect = makeSection.locator('.filter-section-body select').first()

    await makeSelect.selectOption('Toyota')
    await page.waitForTimeout(1500)

    const modelSelect = makeSection.locator('.filter-section-body select').nth(1)
    const options = await modelSelect.locator('option').allTextContents()
    expect(options.some(o => o === 'Camry')).toBeTruthy()
    expect(options.some(o => o === 'Corolla')).toBeTruthy()
    expect(options.some(o => o.toUpperCase().startsWith('RAV4') || o.toUpperCase() === 'RAV 4')).toBeTruthy()
  })

  test('Make dropdown shows options immediately (fallback loads fast)', async ({ page }) => {
    // On page load, make dropdown should have options right away (car-info fallback)
    const makeSection = page.locator('.filter-section').first()
    const makeSelect = makeSection.locator('.filter-section-body select').first()
    const options = await makeSelect.locator('option').count()
    expect(options).toBeGreaterThan(10)
  })
})
