import { test, expect } from '@playwright/test'
import { loginAsBuyer, loginAsSeller, loginAsAdmin, login } from './helpers.js'

const screenshotDir = 'e2e/screenshots'

test.describe('Visual Regression Screenshots', () => {
  test('homepage — unauthenticated', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })
    await page.screenshot({ path: `${screenshotDir}/homepage-unauth.png`, fullPage: true })
  })

  test('homepage — authenticated as buyer', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })
    await page.screenshot({ path: `${screenshotDir}/homepage-buyer.png`, fullPage: true })
  })

  test('login page', async ({ page }) => {
    await page.goto('/auth?mode=login')
    await page.waitForSelector('.auth-card', { timeout: 5000 })
    await page.screenshot({ path: `${screenshotDir}/login.png`, fullPage: true })
  })

  test('register page', async ({ page }) => {
    await page.goto('/auth?mode=register')
    await page.waitForSelector('.auth-card', { timeout: 5000 })
    await page.screenshot({ path: `${screenshotDir}/register.png`, fullPage: true })
  })

  test('want listing detail page', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })
    await page.locator('.listing-card').first().click()
    await page.waitForURL(/\/want-listings\//)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: `${screenshotDir}/listing-detail.png`, fullPage: true })
  })

  test('buyer dashboard', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `${screenshotDir}/buyer-dashboard.png`, fullPage: true })
  })

  test('seller dashboard', async ({ page }) => {
    await loginAsSeller(page)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `${screenshotDir}/seller-dashboard.png`, fullPage: true })
  })

  test('vehicle matches page', async ({ page }) => {
    await loginAsSeller(page)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    const matchBtn = page.locator('.vehicle-card a:has-text("Find Buyers")').first()
    if (await matchBtn.isVisible()) {
      await matchBtn.click()
      await page.waitForURL(/\/vehicles\/.*\/matches/)
      await page.waitForLoadState('networkidle')
      await page.screenshot({ path: `${screenshotDir}/vehicle-matches.png`, fullPage: true })
    }
  })

  test('introductions page', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/introductions')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `${screenshotDir}/introductions.png`, fullPage: true })
  })

  test('messages page', async ({ page }) => {
    await loginAsBuyer(page)
    await page.goto('/messages')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `${screenshotDir}/messages.png`, fullPage: true })
  })

  test('admin page — users tab', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `${screenshotDir}/admin-users.png`, fullPage: true })
  })

  test('admin page — want listings tab', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    await page.click('text=Want Listings')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: `${screenshotDir}/admin-listings.png`, fullPage: true })
  })

  test('admin page — vehicles tab', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    await page.click('text=Vehicles')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: `${screenshotDir}/admin-vehicles.png`, fullPage: true })
  })

  test('mobile homepage (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })
    await page.screenshot({ path: `${screenshotDir}/mobile-homepage.png`, fullPage: true })
  })

  test('mobile listing detail (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForSelector('.listing-card', { timeout: 10000 })
    await page.locator('.listing-card').first().click()
    await page.waitForURL(/\/want-listings\//)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: `${screenshotDir}/mobile-listing-detail.png`, fullPage: true })
  })
})
