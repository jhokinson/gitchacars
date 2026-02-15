// Shared E2E test utilities for GitchaCars

const BASE = 'http://localhost:3001'

const TEST_ACCOUNTS = {
  buyer: { email: 'buyer1@example.com', password: 'password123' },
  buyer2: { email: 'buyer2@example.com', password: 'password123' },
  seller: { email: 'seller1@example.com', password: 'password123' },
  seller2: { email: 'seller2@example.com', password: 'password123' },
  admin: { email: 'jhokinson@gmail.com', password: 'password123' },
}

/**
 * Log in via API and set token in localStorage (fast, no UI interaction).
 * Use this for tests that don't specifically test the login UI.
 */
export async function login(page, email, password) {
  const response = await page.request.post(`${BASE}/api/auth/login`, {
    data: { email, password }
  })
  const body = await response.json()
  const token = body.data.token
  const user = body.data.user
  // Navigate first so we have a page context for localStorage
  await page.goto(BASE)
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  }, { token, user })
  // Reload so React picks up the auth state
  await page.reload()
  await page.waitForTimeout(500)
}

/**
 * Log in via the auth page UI form.
 * Navigates to /auth, fills credentials, submits, and waits for navigation away.
 */
export async function loginViaUI(page, email, password) {
  await page.goto('/auth?mode=login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 10000 })
}

/** Log in as buyer1@example.com */
export async function loginAsBuyer(page) {
  await login(page, TEST_ACCOUNTS.buyer.email, TEST_ACCOUNTS.buyer.password)
}

/** Log in as seller1@example.com */
export async function loginAsSeller(page) {
  await login(page, TEST_ACCOUNTS.seller.email, TEST_ACCOUNTS.seller.password)
}

/** Log in as admin jhokinson@gmail.com */
export async function loginAsAdmin(page) {
  await login(page, TEST_ACCOUNTS.admin.email, TEST_ACCOUNTS.admin.password)
}

/** Log out by clicking the avatar dropdown and selecting logout */
export async function logout(page) {
  await page.click('.avatar-dropdown')
  await page.click('text=Logout')
  await page.waitForURL('**/auth**')
}

/** Wait for network to be idle (no pending requests for 500ms) */
export async function waitForApi(page) {
  await page.waitForLoadState('networkidle')
}

export { TEST_ACCOUNTS }
