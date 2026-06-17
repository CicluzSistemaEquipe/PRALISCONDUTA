import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const screenshotDir = 'test-results/visual'

async function expectAppShell(page: Page) {
  await expect(page.locator('.app-shell, [data-testid="story-player"]').first()).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
}

async function capture(page: Page, name: string) {
  mkdirSync(screenshotDir, { recursive: true })
  await page.screenshot({ path: `${screenshotDir}/${name}.png`, fullPage: true })
}

test.describe('Pralis visual smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('pralis_dev', '1')
      localStorage.setItem('pralis:onboarding_seen', '1')
    })
  })

  test('home, lis e perfil renderizam sem overflow mobile', async ({ page }) => {
    for (const [route, name] of [
      ['/feed', 'feed-mobile'],
      ['/lis', 'lis-mobile'],
      ['/perfil', 'perfil-mobile'],
    ] as const) {
      await page.goto(route)
      await expectAppShell(page)
      await capture(page, name)
    }
  })

  test('módulo e quiz renderizam no fluxo mobile', async ({ page }) => {
    await page.goto('/modulo/boas-vindas')
    await expectAppShell(page)
    await capture(page, 'module-start-mobile')

    await page.getByRole('button', { name: /próximo/i }).click()
    await expectAppShell(page)
    await capture(page, 'module-after-next-mobile')
  })
})
