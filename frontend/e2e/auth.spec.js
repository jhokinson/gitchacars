import { test, expect } from '@playwright/test'
import { login, loginAsBuyer, logout } from './helpers.js'

test.describe('Authentication Flows', () => {
  test('login — success as buyer', async ({ page }) => {
    await page.goto('/auth?mode=login')
    await page.fill('input[type="email"]', 'buyer1@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 10000 })
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('h1, h2').first()).toContainText(/Dashboard/i)
  })

  test('login — wrong password shows error', async ({ page }) => {
    await page.goto('/auth?mode=login')
    await page.fill('input[type="email"]', 'buyer1@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('.auth-error, [role="alert"]')).toBeVisible({ timeout: 10000 })
  })

  test('login — empty fields shows validation', async ({ page }) => {
    await page.goto('/auth?mode=login')
    await page.click('button[type="submit"]')
    // HTML5 validation prevents submission — should stay on login
    await expect(page).toHaveURL(/\/auth/)
  })

  test('register — success', async ({ page }) => {
    const uniqueEmail = `testuser_${Date.now()}@example.com`
    await page.goto('/auth?mode=register')
    await page.click('.role-card:first-child')
    await page.fill('input[placeholder*="First"]', 'Test')
    await page.fill('input[placeholder*="Last"]', 'User')
    await page.fill('input[type="email"]', uniqueEmail)
    await page.locator('input[type="password"]').first().fill('password123')
    await page.locator('input[type="password"]').nth(1).fill('password123')
    await page.click('button[type="submit"]')
    await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 10000 })
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('register — duplicate email shows error', async ({ page }) => {
    await page.goto('/auth?mode=register')
    await page.click('.role-card:first-child')
    await page.fill('input[placeholder*="First"]', 'Dup')
    await page.fill('input[placeholder*="Last"]', 'User')
    await page.fill('input[type="email"]', 'buyer1@example.com')
    await page.locator('input[type="password"]').first().fill('password123')
    await page.locator('input[type="password"]').nth(1).fill('password123')
    await page.click('button[type="submit"]')
    await expect(page.locator('.auth-error, [role="alert"]')).toBeVisible({ timeout: 5000 })
  })

  test('register — password mismatch shows error', async ({ page }) => {
    await page.goto('/auth?mode=register')
    await page.click('.role-card:first-child')
    await page.fill('input[placeholder*="First"]', 'Mis')
    await page.fill('input[placeholder*="Last"]', 'Match')
    await page.fill('input[type="email"]', `mismatch_${Date.now()}@example.com`)
    await page.locator('input[type="password"]').first().fill('password123')
    await page.locator('input[type="password"]').nth(1).fill('differentpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('.form-error, [role="alert"]')).toBeVisible({ timeout: 5000 })
  })

  test('logout redirects to login', async ({ page }) => {
    await loginAsBuyer(page)
    await logout(page)
    await expect(page).toHaveURL(/\/auth/)
  })

  test('protected route redirects to login when logged out', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth/)
  })

  test('old dashboard URLs redirect to unified dashboard', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/seller/dashboard')
    // Old URLs redirect to unified /dashboard
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
