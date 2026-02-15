import { test, expect } from '@playwright/test'
import { loginAsBuyer, loginAsSeller, login, TEST_ACCOUNTS } from './helpers.js'

test.describe('NavBar CTA — Post Want-Listing for All Users', () => {
  test('CTA visible when logged out', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const cta = page.locator('a.navbar-cta:has-text("Post Want-Listing")')
    await expect(cta).toBeVisible()
  })

  test('CTA redirects to login with redirect param when logged out', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const cta = page.locator('a.navbar-cta:has-text("Post Want-Listing")')
    await cta.click()

    await expect(page).toHaveURL(/\/auth\?mode=login.*redirect=.*create-listing/)
  })

  test('Login redirect flow — lands on create-listing after login', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Click Post Want-Listing while logged out
    const cta = page.locator('a.navbar-cta:has-text("Post Want-Listing")')
    await cta.click()

    // Should be on login page with redirect param
    await expect(page).toHaveURL(/\/auth\?mode=login.*redirect=/)

    // Log in as buyer
    await page.fill('input[type="email"]', TEST_ACCOUNTS.buyer.email)
    await page.fill('input[type="password"]', TEST_ACCOUNTS.buyer.password)
    await page.click('button[type="submit"]')

    // Should redirect to create-listing, not default dashboard
    await page.waitForURL('**/create-listing', { timeout: 10000 })
    await expect(page).toHaveURL(/\/create-listing/)
  })

  test('CTA visible for sellers', async ({ page }) => {
    await loginAsSeller(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const cta = page.locator('a.navbar-cta:has-text("Post Want-Listing")')
    await expect(cta).toBeVisible()
  })

  test('CTA visible for buyers and navigates to create-listing', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const cta = page.locator('a.navbar-cta:has-text("Post Want-Listing")')
    await expect(cta).toBeVisible()

    await cta.click()
    await page.waitForURL('**/create-listing', { timeout: 10000 })
    await expect(page).toHaveURL(/\/create-listing/)
  })
})
