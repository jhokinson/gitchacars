import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3001'

test.describe('US-012: Consolidated Auth Page', () => {
  test('NavBar shows single Sign In / Up button for unauthenticated users', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.navbar')

    const signInBtn = page.locator('text=Sign In / Up')
    await expect(signInBtn).toBeVisible()

    // Should NOT have separate Login/Register
    await expect(page.locator('.navbar-link:has-text("Login")')).not.toBeVisible()
    await expect(page.locator('.navbar >> text=Register')).not.toBeVisible()
  })

  test('Clicking Sign In / Up navigates to /auth', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.navbar')

    await page.click('text=Sign In / Up')
    await expect(page).toHaveURL(/\/auth/)
  })

  test('Auth page defaults to sign-in mode', async ({ page }) => {
    await page.goto(`${BASE}/auth`)
    await page.waitForSelector('.auth-tab')

    // Sign In tab should be active
    const signInTab = page.locator('.auth-tab.active')
    await expect(signInTab).toContainText('Sign In')

    // Form fields
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('Toggle to Sign Up shows registration fields', async ({ page }) => {
    await page.goto(`${BASE}/auth`)
    await page.waitForSelector('.auth-tab')

    // Click Sign Up tab
    await page.click('.auth-tab:has-text("Sign Up")')
    await page.waitForTimeout(300)

    // Registration fields should be visible
    await expect(page.locator('input[name="firstName"]')).toBeVisible()
    await expect(page.locator('input[name="lastName"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })

  test('Old /login route redirects to /auth?mode=login', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await expect(page).toHaveURL(/\/auth\?mode=login/)
  })

  test('Old /register route redirects to /auth?mode=register', async ({ page }) => {
    await page.goto(`${BASE}/register`)
    await expect(page).toHaveURL(/\/auth\?mode=register/)
  })

  test('Successful login redirects to dashboard', async ({ page }) => {
    await page.goto(`${BASE}/auth?mode=login`)
    await page.fill('input[type="email"]', 'buyer1@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 10000 })
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
