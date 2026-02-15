/**
 * Smoke tests for deployed GitchaCars.
 *
 * Prerequisites:
 *   - Backend running (or deployed) with Neon DB connectivity
 *   - Frontend built with VITE_DEMO_PASSWORD=gitcha
 *     Local:  cd frontend && VITE_DEMO_PASSWORD=gitcha npm run build
 *     Render: env var set automatically via render.yaml
 *
 * Run locally:
 *   cd frontend && npx playwright test e2e/smoke-deploy.spec.js
 *
 * Run against deployed URL:
 *   cd frontend && BASE_URL=https://gitchacars.onrender.com npx playwright test e2e/smoke-deploy.spec.js
 */

import { test, expect } from '@playwright/test'

const DEMO_PASSWORD = 'gitcha'

/** Helper: unlock the demo gate so subsequent actions can reach the app. */
async function unlockDemoGate(page) {
  await page.goto('/')
  const gateVisible = await page.locator('.demo-gate').isVisible().catch(() => false)
  if (gateVisible) {
    await page.locator('.demo-gate-input').fill(DEMO_PASSWORD)
    await page.locator('.demo-gate-btn').click()
    // Wait for gate to fade out and app to render
    await page.waitForSelector('.demo-gate', { state: 'hidden', timeout: 5000 }).catch(() => {})
    await page.waitForTimeout(600)
  }
}

// ─── US-009: Health Check Endpoint ──────────────────────────────────

test('health check endpoint returns ok', async ({ request }) => {
  const response = await request.get('/api/health')
  expect(response.status()).toBe(200)
  const body = await response.json()
  expect(body).toEqual({ status: 'ok' })
})

// ─── US-010: Demo Gate Flow ─────────────────────────────────────────

test.describe('demo gate', () => {
  test.use({ storageState: { cookies: [], origins: [] } }) // fresh localStorage

  test('blocks access until correct password is entered', async ({ page }) => {
    // Navigate — gate should appear
    await page.goto('/')
    await expect(page.locator('.demo-gate')).toBeVisible()
    await expect(page.locator('.demo-gate-subtitle')).toContainText('Private Demo')

    // Wrong password → error
    await page.locator('.demo-gate-input').fill('wrong')
    await page.locator('.demo-gate-btn').click()
    await expect(page.locator('.demo-gate-error')).toContainText('Incorrect password')

    // Correct password → gate disappears
    await page.locator('.demo-gate-input').fill(DEMO_PASSWORD)
    await page.locator('.demo-gate-btn').click()
    await page.waitForSelector('.demo-gate', { state: 'hidden', timeout: 5000 }).catch(() => {})
    await page.waitForTimeout(600)

    // App content should be visible (navbar)
    await expect(page.locator('nav').first()).toBeVisible({ timeout: 5000 })

    // Refresh — gate should NOT reappear (localStorage persistence)
    await page.reload()
    await page.waitForTimeout(1000)
    await expect(page.locator('.demo-gate')).not.toBeVisible()
  })
})

// ─── US-011: Authentication Flow ────────────────────────────────────

test('user can log in with test credentials', async ({ page }) => {
  // Pass the demo gate first
  await unlockDemoGate(page)

  // Navigate to login
  await page.goto('/auth?mode=login')
  await page.waitForTimeout(500)

  // Fill credentials
  await page.locator('input[type="email"]').fill('buyer1@example.com')
  await page.locator('input[type="password"]').fill('password123')
  await page.locator('button[type="submit"]').click()

  // Wait for navigation away from auth page
  await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 10000 })

  // Should see logged-in UI (avatar dropdown or dashboard content)
  const loggedIn = page.locator('.avatar-dropdown, .dashboard, [data-testid="user-menu"]')
  await expect(loggedIn.first()).toBeVisible({ timeout: 5000 })
})

// ─── US-012: Homepage Content Loads ─────────────────────────────────

test('homepage displays want listings from database', async ({ page }) => {
  // Pass the demo gate first
  await unlockDemoGate(page)

  // Navigate to homepage
  await page.goto('/')
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(1000)

  // Either listing cards are visible, or an empty-state message is shown
  const listings = page.locator('.listing-card, .want-listing-card, [class*="listing"]')
  const emptyState = page.locator('.empty-state, [class*="empty"], [class*="no-listings"]')

  const hasListings = await listings.first().isVisible().catch(() => false)
  const hasEmpty = await emptyState.first().isVisible().catch(() => false)

  expect(hasListings || hasEmpty).toBe(true)
})
