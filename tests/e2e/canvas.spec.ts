import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('complete manual collaboration loop', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /your career story/i })).toBeVisible()
  const before = Number(await page.locator('.score-orbit strong').textContent())
  await page.getByRole('button', { name: /diagnose/i }).first().click()
  await page.getByRole('button', { name: /draft rewrite/i }).click()
  await page.getByRole('button', { name: /accept rewrite/i }).click()
  await expect(page.getByText(/cutting model deployment time by 42%/i)).toBeVisible()
  const after = Number(await page.locator('.score-orbit strong').textContent())
  expect(after).toBeGreaterThan(before)
  await page.getByRole('button', { name: /match advisors/i }).click()
  await page.getByRole('button', { name: /stage advisor brief/i }).click()
  await expect(page.getByRole('dialog')).toContainText('Maya Chen')
  await expect(page.getByRole('dialog')).toContainText('no booking created')
  expect(errors).toEqual([])
})

test('registers and executes six synchronized WebMCP tools', async ({ page }) => {
  await page.addInitScript(() => {
    const registry: Record<string, unknown> = {}
    Object.defineProperty(window, '__canvasTools', { value: registry })
    Object.defineProperty(document, 'modelContext', {
      value: {
        registerTool: (tool: { name: string }) => { registry[tool.name] = tool; return Promise.resolve() },
      },
    })
  })
  await page.goto('/')
  await page.waitForFunction(() => Object.keys((window as unknown as { __canvasTools: Record<string, unknown> }).__canvasTools).length === 6)
  const result = await page.evaluate(async () => {
    type Tool = { execute: (input: Record<string, unknown>, options: { signal: AbortSignal }) => Promise<unknown> | unknown }
    const tools = (window as unknown as { __canvasTools: Record<string, Tool> }).__canvasTools
    const options = { signal: new AbortController().signal }
    const before = await tools.get_canvas_state.execute({}, options) as { data: { score: { total: number } } }
    await tools.diagnose_resume_bullet.execute({ bulletId: 'b1', issueType: 'missing_metric', feedback: 'Quantify adoption and the operational result for executive readers.' }, options)
    await tools.propose_bullet_rewrite.execute({ bulletId: 'b1', newText: 'Owned the AI platform roadmap for 18 teams, reducing deployment time by 42%.', rationale: 'Adds quantified adoption, scope, and operational impact.' }, options)
    const applied = await tools.apply_bullet_rewrite.execute({ bulletId: 'b1' }, options) as { data: { afterScore: number } }
    return { names: Object.keys(tools), before: before.data.score.total, after: applied.data.afterScore }
  })
  expect(result.names).toHaveLength(6)
  expect(result.after).toBeGreaterThan(result.before)
  await expect(page.getByTestId('bullet-b1')).toContainText('reducing deployment time by 42%')
})

test('has no serious accessibility violations', async ({ page }) => {
  await page.goto('/')
  const scan = await new AxeBuilder({ page }).analyze()
  expect(scan.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([])
})
