import { test, expect } from '@playwright/test'
import { login, loginAsBuyer } from './helpers.js'

test.describe('Registration & Auth UX (US-AU18)', () => {
  test('Intent selector on register — three options visible', async ({ page }) => {
    await page.goto('/auth?mode=register')
    await page.waitForLoadState('networkidle')

    // Verify three intent options are visible (Buy, Sell, Both)
    const intentOptions = page.locator('.intent-options .role-card, .intent-selector .role-card')
    await expect(intentOptions).toHaveCount(3)

    // Check for specific text content
    await expect(page.locator('.role-card:has-text("buy a car"), .role-card:has-text("looking to buy")')).toBeVisible()
    await expect(page.locator('.role-card:has-text("sell a car"), .role-card:has-text("looking to sell")')).toBeVisible()
    await expect(page.locator('.role-card:has-text("Both")')).toBeVisible()

    // Verify helper text
    await expect(page.locator('.intent-helper')).toBeVisible()
  })

  test('Register with "Both" intent — redirects to dashboard', async ({ page }) => {
    await page.goto('/auth?mode=register')
    await page.waitForLoadState('networkidle')

    // Select "Both" intent
    await page.click('.role-card:has-text("Both")')
    await page.waitForTimeout(300)

    // Verify "Both" is selected (has active class)
    const bothCard = page.locator('.role-card:has-text("Both")')
    await expect(bothCard).toHaveClass(/active/)

    // Fill registration form
    const uniqueEmail = `both_user_${Date.now()}@example.com`
    await page.fill('input[name="firstName"]', 'Both')
    await page.fill('input[name="lastName"]', 'User')
    await page.fill('input[name="email"]', uniqueEmail)

    // Fill password fields (inside PasswordInput wrapper)
    const passwordInputs = page.locator('.password-input-wrapper input')
    await passwordInputs.first().fill('password123')
    await passwordInputs.nth(1).fill('password123')

    // Submit
    await page.click('button[type="submit"]:has-text("Create Account")')
    await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 15000 })

    // Should redirect to /dashboard
    expect(page.url()).toContain('/dashboard')

    // Dashboard should show both sections
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=My Want Listings')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=My Private Inventory')).toBeVisible({ timeout: 10000 })
  })

  test('Duplicate email shows friendly message', async ({ page }) => {
    await page.goto('/auth?mode=register')
    await page.waitForLoadState('networkidle')

    // Select an intent
    await page.click('.role-card:has-text("buy")')

    // Fill with existing email
    await page.fill('input[name="firstName"]', 'Dup')
    await page.fill('input[name="lastName"]', 'User')
    await page.fill('input[name="email"]', 'buyer1@example.com')

    const passwordInputs = page.locator('.password-input-wrapper input')
    await passwordInputs.first().fill('password123')
    await passwordInputs.nth(1).fill('password123')

    // Submit
    await page.click('button[type="submit"]:has-text("Create Account")')

    // Should show the duplicate email card (not just a generic error)
    const dupCard = page.locator('.duplicate-email-card')
    await expect(dupCard).toBeVisible({ timeout: 10000 })

    // Verify it contains the email and helpful message
    await expect(dupCard.locator('text=already exists')).toBeVisible()
    await expect(dupCard.locator('text=buyer1@example.com')).toBeVisible()
    await expect(dupCard.locator('text=/sign in instead/i')).toBeVisible()

    // Verify "Log In" button is present
    await expect(dupCard.locator('a:has-text("Sign In"), .btn:has-text("Sign In")')).toBeVisible()

    // Verify "Try a different email" option
    await expect(dupCard.locator('button:has-text("Try a different email")')).toBeVisible()
  })

  test('Duplicate email "Log In" link works — goes to login with email pre-filled', async ({ page }) => {
    await page.goto('/auth?mode=register')
    await page.waitForLoadState('networkidle')

    // Trigger duplicate email
    await page.click('.role-card:has-text("buy")')
    await page.fill('input[name="firstName"]', 'Dup')
    await page.fill('input[name="lastName"]', 'User')
    await page.fill('input[name="email"]', 'buyer1@example.com')

    const passwordInputs = page.locator('.password-input-wrapper input')
    await passwordInputs.first().fill('password123')
    await passwordInputs.nth(1).fill('password123')

    await page.click('button[type="submit"]:has-text("Create Account")')
    await expect(page.locator('.duplicate-email-card')).toBeVisible({ timeout: 10000 })

    // Click the "Sign In" button
    await page.click('.duplicate-email-card .btn:has-text("Sign In")')
    await page.waitForTimeout(500)

    // Verify switched to sign-in mode with email pre-filled
    expect(page.url()).toContain('/auth')
    expect(page.url()).toContain('mode=login')

    // Email input should be pre-filled
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toHaveValue('buyer1@example.com')
  })

  test('Password visibility toggle on login page', async ({ page }) => {
    await page.goto('/auth?mode=login')
    await page.waitForLoadState('networkidle')

    // The password field should be inside a PasswordInput wrapper
    const wrapper = page.locator('.password-input-wrapper')
    await expect(wrapper).toBeVisible()

    const passwordInput = wrapper.locator('input')
    const toggleBtn = wrapper.locator('.password-toggle')

    // Password should be hidden by default (type="password")
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Type a password
    await passwordInput.fill('mypassword')

    // Click the toggle to show password
    await toggleBtn.click()
    await expect(passwordInput).toHaveAttribute('type', 'text')

    // Toggle button should have "Hide password" aria-label
    await expect(toggleBtn).toHaveAttribute('aria-label', 'Hide password')

    // Click again to hide
    await toggleBtn.click()
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Toggle button should have "Show password" aria-label
    await expect(toggleBtn).toHaveAttribute('aria-label', 'Show password')
  })

  test('Register password toggles — both fields have independent toggles', async ({ page }) => {
    await page.goto('/auth?mode=register')
    await page.waitForLoadState('networkidle')

    // Should have two PasswordInput wrappers (password + confirm password)
    const wrappers = page.locator('.password-input-wrapper')
    await expect(wrappers).toHaveCount(2)

    const passwordWrapper = wrappers.nth(0)
    const confirmWrapper = wrappers.nth(1)

    const passwordInput = passwordWrapper.locator('input')
    const confirmInput = confirmWrapper.locator('input')
    const passwordToggle = passwordWrapper.locator('.password-toggle')
    const confirmToggle = confirmWrapper.locator('.password-toggle')

    // Both should start hidden
    await expect(passwordInput).toHaveAttribute('type', 'password')
    await expect(confirmInput).toHaveAttribute('type', 'password')

    // Toggle password only — confirm should remain hidden
    await passwordToggle.click()
    await expect(passwordInput).toHaveAttribute('type', 'text')
    await expect(confirmInput).toHaveAttribute('type', 'password')

    // Toggle confirm — both visible now
    await confirmToggle.click()
    await expect(passwordInput).toHaveAttribute('type', 'text')
    await expect(confirmInput).toHaveAttribute('type', 'text')

    // Toggle password back — confirm stays visible
    await passwordToggle.click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
    await expect(confirmInput).toHaveAttribute('type', 'text')
  })
})
