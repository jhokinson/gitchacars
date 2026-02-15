// @ts-check
import { test, expect } from '@playwright/test'
import { loginAsSeller } from './helpers.js'

const BASE = 'http://localhost:3001'

async function openSidebarChat(page) {
  // First open the SmartActionBox dropdown
  await page.locator('.smart-action-prompt').first().click()
  await page.waitForTimeout(300)
  // Then click "Find a Buyer" option
  await page.locator('.smart-action-option-title', { hasText: 'Find a Buyer' }).first().click()
  await page.waitForTimeout(500)
}

test.describe('UX Phase 6 — Sidebar Chat Sizing', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSeller(page)
    await page.goto(BASE)
    await page.waitForTimeout(1000)
  })

  test('open sidebar chat and verify textarea element', async ({ page }) => {
    await openSidebarChat(page)

    // Input should be a textarea, not an input
    const textarea = page.locator('.sidebar-chat-input textarea')
    await expect(textarea).toBeVisible()

    const input = page.locator('.sidebar-chat-input input')
    await expect(input).toHaveCount(0)
  })

  test('textarea has rows attribute of 2', async ({ page }) => {
    await openSidebarChat(page)

    const textarea = page.locator('.sidebar-chat-input textarea')
    const rows = await textarea.getAttribute('rows')
    expect(rows).toBe('2')
  })

  test('messages container has max-height >= 300px', async ({ page }) => {
    await openSidebarChat(page)

    const messages = page.locator('.sidebar-chat-messages')
    const maxHeight = await messages.evaluate(el => {
      const style = getComputedStyle(el)
      return parseFloat(style.maxHeight)
    })
    expect(maxHeight).toBeGreaterThanOrEqual(300)
  })

  test('chat bubble font-size is approximately 14px (font-sm)', async ({ page }) => {
    await openSidebarChat(page)

    const bubble = page.locator('.sidebar-chat-bubble').first()
    const fontSize = await bubble.evaluate(el => {
      return parseFloat(getComputedStyle(el).fontSize)
    })
    // font-sm is typically 14px, allow some tolerance
    expect(fontSize).toBeGreaterThanOrEqual(13)
    expect(fontSize).toBeLessThanOrEqual(15)
  })

  test('send button has width >= 34px', async ({ page }) => {
    await openSidebarChat(page)

    const sendBtn = page.locator('.sidebar-chat-input button')
    const width = await sendBtn.evaluate(el => {
      return parseFloat(getComputedStyle(el).width)
    })
    expect(width).toBeGreaterThanOrEqual(34)
  })
})
