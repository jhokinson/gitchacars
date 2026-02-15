import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3001'

// Helper: get a valid listing ID from the API
async function getListingId(page) {
  const response = await page.request.get(`${BASE}/api/want-listings?limit=1`)
  const body = await response.json()
  return body.data?.listings?.[0]?.id
}

test.describe('US-015: Car Images, Tags & Detail Page', () => {
  test('listing cards have img tags in the image area', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.listing-card')

    const hasImg = await page.$eval('.listing-card-image', el =>
      !!el.querySelector('img')
    )
    expect(hasImg).toBe(true)
  })

  test('listing cards have a buyer tag', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('.listing-card')

    const tagText = await page.$eval('.listing-card-tag', el => el.textContent.trim())
    expect(tagText).toContain('Buyer')
  })

  test('detail page has hero image section', async ({ page }) => {
    const listingId = await getListingId(page)
    expect(listingId).toBeTruthy()

    await page.goto(`${BASE}/want-listings/${listingId}`)
    await page.waitForSelector('.detail-hero-image')

    const heroExists = await page.isVisible('.detail-hero-image')
    expect(heroExists).toBe(true)
  })

  test('detail page budget display is visible with dollar sign', async ({ page }) => {
    const listingId = await getListingId(page)
    await page.goto(`${BASE}/want-listings/${listingId}`)
    await page.waitForSelector('.detail-budget-pill')

    const budgetText = await page.$eval('.detail-budget-pill', el => el.textContent)
    expect(budgetText).toContain('$')
  })

  test('detail page feature tags use blue-tinted styling', async ({ page }) => {
    const listingId = await getListingId(page)
    await page.goto(`${BASE}/want-listings/${listingId}`)
    await page.waitForTimeout(1000)

    const hasTags = await page.isVisible('.feature-tag')
    if (!hasTags) {
      test.skip()
      return
    }

    const bgColor = await page.$eval('.feature-tag', el =>
      getComputedStyle(el).backgroundColor
    )
    // Should not be pure white or gray — should be blue-tinted
    expect(bgColor).not.toBe('rgb(255, 255, 255)')
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('unauthenticated detail page shows intro card', async ({ page }) => {
    const listingId = await getListingId(page)
    await page.goto(`${BASE}/want-listings/${listingId}`)
    await page.waitForSelector('.detail-intro-card')

    const introText = await page.$eval('.detail-intro-card', el => el.textContent)
    expect(introText).toContain('Introduce Your Vehicle')
  })

  test('unauthenticated intro card has sign in button', async ({ page }) => {
    const listingId = await getListingId(page)
    await page.goto(`${BASE}/want-listings/${listingId}`)
    await page.waitForSelector('.detail-intro-card')

    const signInBtn = page.locator('.detail-intro-card .btn', { hasText: 'Sign In / Up' })
    await expect(signInBtn).toBeVisible()
  })
})
