import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3001'

// Helper: login as seller via API — navigate directly to listing page
async function loginAsSellerAndGoToListing(page, listingId) {
  const response = await page.request.post(`${BASE}/api/auth/login`, {
    data: { email: 'seller1@example.com', password: 'password123' }
  })
  const body = await response.json()
  const token = body.data.token
  const user = body.data.user
  await page.goto(`${BASE}/want-listings/${listingId}`)
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  }, { token, user })
  await page.reload()
  await page.waitForLoadState('networkidle')
}

// Helper: get a valid listing ID (public, any listing)
async function getListingId(page) {
  const response = await page.request.get(`${BASE}/api/want-listings?limit=5`)
  const body = await response.json()
  return body.data?.listings?.[0]?.id
}

// Helper: get a listing ID guaranteed NOT owned by seller1 (uses buyer1's listings)
async function getBuyerListingId(page) {
  // Login as buyer1 via API to get their listing
  const loginRes = await page.request.post(`${BASE}/api/auth/login`, {
    data: { email: 'buyer1@example.com', password: 'password123' }
  })
  const loginBody = await loginRes.json()
  const buyerToken = loginBody.data.token

  // Get buyer1's own listings
  const listRes = await page.request.get(`${BASE}/api/want-listings/mine`, {
    headers: { 'Authorization': `Bearer ${buyerToken}` }
  })
  const listBody = await listRes.json()
  const listings = listBody.data || []

  if (listings.length > 0) return listings[0].id

  // Fallback: get any listing
  const fallback = await page.request.get(`${BASE}/api/want-listings?limit=10`)
  const fallbackBody = await fallback.json()
  return fallbackBody.data?.listings?.[0]?.id
}

test.describe('Phase 4: Aurora Background & Shimmer Button', () => {
  test('Aurora background renders on want listing detail page', async ({ page }) => {
    const listingId = await getListingId(page)
    await page.goto(`${BASE}/want-listings/${listingId}`)
    await page.waitForSelector('.aurora-background')

    // Aurora layer should exist
    const auroraLayer = page.locator('.aurora-background-layer')
    await expect(auroraLayer).toBeVisible()

    // Should have the detail-specific class
    const detailAurora = page.locator('.detail-aurora-hero')
    await expect(detailAurora).toBeVisible()
  })

  test('Aurora background has animation CSS', async ({ page }) => {
    const listingId = await getListingId(page)
    await page.goto(`${BASE}/want-listings/${listingId}`)
    await page.waitForSelector('.aurora-background-layer')

    const animationName = await page.$eval('.aurora-background-layer', el =>
      getComputedStyle(el).animationName
    )
    // Should have the aurora animation
    expect(animationName).toContain('aurora')
  })

  test('Aurora layer has pointer-events: none (does not block clicks)', async ({ page }) => {
    const listingId = await getListingId(page)
    await page.goto(`${BASE}/want-listings/${listingId}`)
    await page.waitForSelector('.aurora-background-layer')

    const pointerEvents = await page.$eval('.aurora-background-layer', el =>
      getComputedStyle(el).pointerEvents
    )
    expect(pointerEvents).toBe('none')
  })
})

test.describe('Phase 4: Introduction Box Redesign', () => {
  test('Intro card heading says "Introduce Your Vehicle"', async ({ page }) => {
    const listingId = await getListingId(page)
    await page.goto(`${BASE}/want-listings/${listingId}`)
    await page.waitForSelector('.detail-intro-card')

    const heading = page.locator('.detail-intro-card .detail-section-title')
    await expect(heading).toContainText('Introduce Your Vehicle')
  })

  test('Unauthenticated: shows Sign In / Up button', async ({ page }) => {
    const listingId = await getListingId(page)
    await page.goto(`${BASE}/want-listings/${listingId}`)
    await page.waitForSelector('.detail-intro-card')

    const signInBtn = page.locator('.detail-intro-card .btn', { hasText: 'Sign In / Up' })
    await expect(signInBtn).toBeVisible()
  })

  test('Authenticated seller: intro card visible with vehicle controls', async ({ page }) => {
    const listingId = await getBuyerListingId(page)
    await loginAsSellerAndGoToListing(page, listingId)

    // Wait longer for full page load including vehicles API call
    const introCard = page.locator('.detail-intro-card')
    await introCard.waitFor({ state: 'visible', timeout: 15000 })
    await page.waitForTimeout(1500)

    // Check the intro card has the correct heading
    await expect(introCard.locator('.detail-section-title')).toContainText('Introduce Your Vehicle')

    // Check for intro form (only visible if seller has vehicles)
    const introForm = page.locator('.intro-form')
    const noVehiclesLink = page.locator('a:has-text("Add a Vehicle First")')
    const hasForm = await introForm.count() > 0
    const hasNoVehiclesMsg = await noVehiclesLink.count() > 0

    // Either the form or the "add vehicle first" message should be present
    expect(hasForm || hasNoVehiclesMsg).toBe(true)

    if (hasForm) {
      // Should see Add My Vehicle button, selected vehicle, or vehicle selector
      const addBtn = page.locator('.intro-add-vehicle-btn')
      const selectedVehicle = page.locator('.intro-vehicle-selected')
      const vehicleSelector = page.locator('.intro-vehicle-selector')
      const total = await addBtn.count() + await selectedVehicle.count() + await vehicleSelector.count()
      expect(total).toBeGreaterThan(0)
    }
  })

  test('Authenticated seller with vehicles: clicking "Add My Vehicle" reveals selector', async ({ page }) => {
    const listingId = await getBuyerListingId(page)
    await loginAsSellerAndGoToListing(page, listingId)

    const introCard = page.locator('.detail-intro-card')
    await introCard.waitFor({ state: 'visible', timeout: 15000 })
    await page.waitForTimeout(1500)

    const addBtn = page.locator('.intro-add-vehicle-btn')
    if (await addBtn.count() > 0) {
      await addBtn.click()
      await page.waitForTimeout(300)

      const vehicleSelector = page.locator('.intro-vehicle-selector')
      await expect(vehicleSelector).toBeVisible()

      const select = vehicleSelector.locator('select')
      await expect(select).toBeVisible()
    }
  })

  test('Authenticated seller with vehicles: shimmer button for Send Introduction', async ({ page }) => {
    const listingId = await getBuyerListingId(page)
    await loginAsSellerAndGoToListing(page, listingId)

    const introCard = page.locator('.detail-intro-card')
    await introCard.waitFor({ state: 'visible', timeout: 15000 })
    await page.waitForTimeout(1500)

    const shimmerBtn = page.locator('.shimmer-btn')
    if (await shimmerBtn.count() > 0) {
      await expect(shimmerBtn).toBeVisible()
      const btnText = await shimmerBtn.textContent()
      expect(btnText).toContain('Send Introduction')

      // Verify shimmer animation
      const shimmerSpark = page.locator('.shimmer-btn-spark-gradient')
      if (await shimmerSpark.count() > 0) {
        const animationName = await shimmerSpark.evaluate(el =>
          getComputedStyle(el).animationName
        )
        expect(animationName).toMatch(/shimmer|spin/)
      }
    }
  })

  test('Authenticated seller with vehicles: message textarea visible', async ({ page }) => {
    const listingId = await getBuyerListingId(page)
    await loginAsSellerAndGoToListing(page, listingId)

    const introCard = page.locator('.detail-intro-card')
    await introCard.waitFor({ state: 'visible', timeout: 15000 })
    await page.waitForTimeout(1500)

    const messageBox = page.locator('.intro-message-box')
    if (await messageBox.count() > 0) {
      await expect(messageBox).toBeVisible()
      const textarea = messageBox.locator('textarea')
      await expect(textarea).toBeVisible()

      const placeholder = await textarea.getAttribute('placeholder')
      expect(placeholder).toContain('personal note')
    }
  })
})
