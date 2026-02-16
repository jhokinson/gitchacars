// @ts-check
import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3001'

test.describe('UX Phase 7 — Sidebar Height Fix', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE)
    await page.waitForTimeout(1000)
  })

  test('filter sidebar does not have overflow-y auto or scroll', async ({ page }) => {
    const sidebar = page.locator('.filter-sidebar').first()
    const overflowY = await sidebar.evaluate(el => getComputedStyle(el).overflowY)
    expect(overflowY).not.toBe('auto')
    expect(overflowY).not.toBe('scroll')
  })

  test('home-sidebar-desktop has no max-height or overflow constraints', async ({ page }) => {
    const sidebarDesktop = page.locator('.home-sidebar-desktop').first()
    const maxHeight = await sidebarDesktop.evaluate(el => getComputedStyle(el).maxHeight)
    const overflow = await sidebarDesktop.evaluate(el => getComputedStyle(el).overflow)
    // maxHeight should be "none" (no constraint)
    expect(maxHeight).toBe('none')
    // overflow should be visible or not set to hidden/auto/scroll
    expect(overflow).not.toBe('hidden')
    expect(overflow).not.toBe('auto')
    expect(overflow).not.toBe('scroll')
  })

  test('expanding all filter sections - sidebar has no hidden overflow', async ({ page }) => {
    // Click all collapsed section toggles to expand everything
    const toggles = page.locator('.filter-section-toggle')
    const count = await toggles.count()
    for (let i = 0; i < count; i++) {
      const toggle = toggles.nth(i)
      const classes = await toggle.getAttribute('class')
      if (!classes.includes('open')) {
        await toggle.click()
        await page.waitForTimeout(100)
      }
    }
    await page.waitForTimeout(300)

    // Sidebar scrollHeight should equal clientHeight (no hidden overflow)
    const sidebar = page.locator('.filter-sidebar').first()
    const { scrollHeight, clientHeight } = await sidebar.evaluate(el => ({
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }))
    // They should be equal or very close (within 2px for rounding)
    expect(Math.abs(scrollHeight - clientHeight)).toBeLessThanOrEqual(2)
  })

  test('page has vertical scrollbar when all sections expanded', async ({ page }) => {
    // Expand all sections
    const toggles = page.locator('.filter-section-toggle')
    const count = await toggles.count()
    for (let i = 0; i < count; i++) {
      const toggle = toggles.nth(i)
      const classes = await toggle.getAttribute('class')
      if (!classes.includes('open')) {
        await toggle.click()
        await page.waitForTimeout(100)
      }
    }
    await page.waitForTimeout(300)

    // Page should be scrollable (document height > viewport height)
    const isScrollable = await page.evaluate(() => {
      return document.documentElement.scrollHeight > window.innerHeight
    })
    expect(isScrollable).toBeTruthy()
  })
})
