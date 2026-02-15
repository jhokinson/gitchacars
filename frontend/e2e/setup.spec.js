import { test, expect } from '@playwright/test'

test('server is running and homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/GitchaCars/)
  await expect(page.locator('.listing-card').first()).toBeVisible({ timeout: 10000 })
})
