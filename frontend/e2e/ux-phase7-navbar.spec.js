// @ts-check
import { test, expect } from '@playwright/test'
import { loginAsBuyer } from './helpers.js'

const BASE = 'http://localhost:3001'

test.describe('UX Phase 7 — Navbar CTA & Open Access', () => {
  test('unauthenticated user sees Post Want Listing CTA button', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForTimeout(1000)

    const cta = page.locator('.navbar-cta').first()
    await expect(cta).toBeVisible()
    await expect(cta).toContainText('Post Want Listing')
  })

  test('unauthenticated user sees Dashboard and Add Vehicle nav links', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForTimeout(1000)

    const dashboardLink = page.locator('.navbar-link', { hasText: 'Dashboard' })
    await expect(dashboardLink).toBeVisible()

    const addVehicleLink = page.locator('.navbar-link', { hasText: 'Add Vehicle' })
    await expect(addVehicleLink).toBeVisible()
  })

  test('clicking Post Want Listing when logged out shows toast', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForTimeout(1000)

    const cta = page.locator('.navbar-cta').first()
    await cta.click()
    await page.waitForTimeout(500)

    // Toast should appear with "Sign in" text
    const toast = page.locator('.toast').first()
    await expect(toast).toBeVisible()
    await expect(toast).toContainText('Sign in')
  })

  test('clicking Dashboard when logged out shows toast with sign-in link', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForTimeout(1000)

    const dashboardLink = page.locator('.navbar-link', { hasText: 'Dashboard' })
    await dashboardLink.click()
    await page.waitForTimeout(500)

    const toast = page.locator('.toast').first()
    await expect(toast).toBeVisible()
    await expect(toast).toContainText('Sign in to access Dashboard')

    // Should contain a link to auth
    const link = toast.locator('a[href*="/auth"]')
    await expect(link).toBeVisible()
  })

  test('toast contains clickable link to /auth', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForTimeout(1000)

    const addVehicleLink = page.locator('.navbar-link', { hasText: 'Add Vehicle' })
    await addVehicleLink.click()
    await page.waitForTimeout(500)

    const toast = page.locator('.toast').first()
    const link = toast.locator('a[href*="/auth"]')
    await expect(link).toBeVisible()
    const href = await link.getAttribute('href')
    expect(href).toContain('/auth?mode=login')
  })

  test('logged-in user clicking Post Want Listing navigates to /create-listing', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto(BASE)
    await page.waitForTimeout(1000)

    const cta = page.locator('.navbar-cta').first()
    await cta.click()
    await page.waitForURL('**/create-listing**', { timeout: 5000 })
    expect(page.url()).toContain('/create-listing')
  })

  test('logged-in user clicking Dashboard navigates to /dashboard', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto(BASE)
    await page.waitForTimeout(1000)

    const dashboardLink = page.locator('.navbar-link', { hasText: 'Dashboard' })
    await dashboardLink.click()
    await page.waitForURL('**/dashboard**', { timeout: 5000 })
    expect(page.url()).toContain('/dashboard')
  })
})
