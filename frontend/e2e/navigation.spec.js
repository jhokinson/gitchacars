import { test, expect } from '@playwright/test'
import { loginAsBuyer, loginAsSeller, loginAsAdmin } from './helpers.js'

test.describe('Navigation & Routing', () => {
  test('nav links — unauthenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.navbar-auth-buttons >> text=Sign In')).toBeVisible()
    await expect(page.locator('.navbar-auth-buttons >> text=Sign Up')).toBeVisible()
    // CTA is visible even when logged out
    await expect(page.locator('.navbar-cta')).toBeVisible()
  })

  test('nav links — buyer', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/')
    await expect(page.locator('.avatar-dropdown')).toBeVisible()
    // CTA should say Post Want Listing
    await expect(page.locator('.navbar-cta')).toBeVisible()
  })

  test('nav links — seller', async ({ page }) => {
    await loginAsSeller(page)
    await page.goto('/')
    await expect(page.locator('.avatar-dropdown')).toBeVisible()
    // CTA is same for all roles: Post Want Listing
    await expect(page.locator('.navbar-cta')).toBeVisible()
  })

  test('nav links — admin', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/')
    await expect(page.locator('.avatar-dropdown')).toBeVisible()
  })

  test('avatar dropdown shows menu items', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/')
    await page.click('.avatar-dropdown')
    await expect(page.locator('.avatar-menu')).toBeVisible()
    await expect(page.locator('.avatar-menu >> text=Dashboard')).toBeVisible()
    await expect(page.locator('.avatar-menu >> text=Logout')).toBeVisible()
  })

  test('deep linking — protected page after login', async ({ page }) => {
    // Try to go to dashboard without login — redirects to login
    await page.goto('/buyer/dashboard')
    await expect(page).toHaveURL(/\/auth/)

    // Now login
    await page.fill('input[type="email"]', 'buyer1@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 10000 })
  })

  test('SPA fallback for unknown routes', async ({ page }) => {
    await page.goto('/nonexistent-page')
    // SPA serves index.html for all routes
    await expect(page.locator('.navbar, nav')).toBeVisible()
  })

  test('breadcrumb on listing detail', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })
    await page.locator('.listing-card').first().click()
    await page.waitForURL(/\/want-listings\//)

    // Verify breadcrumb with Home link
    const breadcrumb = page.locator('.detail-breadcrumb')
    await expect(breadcrumb).toBeVisible()
    await expect(breadcrumb.locator('a:has-text("Home")')).toBeVisible()

    // Click Home breadcrumb
    await breadcrumb.locator('a:has-text("Home")').click()
    await expect(page).toHaveURL('/')
  })
})
