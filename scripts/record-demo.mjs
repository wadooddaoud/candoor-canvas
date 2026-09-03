import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const outputDir = path.resolve('video', 'work')
await mkdir(outputDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
  recordVideo: { dir: outputDir, size: { width: 1920, height: 1080 } },
})
await context.addInitScript(() => {
  const registry = {}
  Object.defineProperty(window, '__canvasTools', { value: registry })
  Object.defineProperty(document, 'modelContext', {
    value: { registerTool: (tool) => { registry[tool.name] = tool; return Promise.resolve() } },
  })
})

const page = await context.newPage()
await page.goto('https://candoor-canvas.vercel.app', { waitUntil: 'networkidle' })
await page.mouse.move(1660, 130)
await page.waitForTimeout(7000)

await page.evaluate(() => document.querySelector('.workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
await page.waitForTimeout(4500)
await page.evaluate(async () => {
  const tools = window.__canvasTools
  await tools.get_canvas_state.execute({}, { signal: new AbortController().signal })
  await tools.diagnose_resume_bullet.execute({ bulletId: 'b1', issueType: 'missing_metric', feedback: 'Quantify adoption, delivery speed, or reliability so the platform impact is visible.' }, { signal: new AbortController().signal })
})
await page.waitForTimeout(9000)

await page.evaluate(async () => {
  await window.__canvasTools.propose_bullet_rewrite.execute({ bulletId: 'b1', newText: 'Owned the roadmap for an internal AI platform adopted by 18 engineering teams, cutting model deployment time by 42% in two quarters.', rationale: 'Adds adoption scale, a measurable outcome, and an executive-ready time horizon.' }, { signal: new AbortController().signal })
})
await page.waitForTimeout(12000)
const accept = page.getByRole('button', { name: /accept rewrite/i })
await accept.hover()
await page.waitForTimeout(1300)
await accept.click()
await page.waitForTimeout(7500)
await page.getByRole('button', { name: /transparent rubric/i }).click()
await page.waitForTimeout(6000)

await page.evaluate(() => document.querySelector('#advisors')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
await page.waitForTimeout(5500)
await page.evaluate(async () => {
  await window.__canvasTools.match_candoor_advisors.execute({ targetRole: 'Senior Product Manager, AI Platform', targetCompany: 'OpenAI', focusArea: 'Executive storytelling' }, { signal: new AbortController().signal })
})
await page.waitForTimeout(10500)
await page.mouse.move(430, 740, { steps: 22 })
await page.waitForTimeout(2500)
await page.evaluate(async () => {
  await window.__canvasTools.stage_candoor_handoff.execute({ advisorId: 'maya-chen', sessionTopic: 'Executive storytelling for a Senior Product Manager, AI Platform role', auditSummary: 'One evidence-rich rewrite accepted. The impact score improved deterministically; two bullets still need sharper scope and outcomes.' }, { signal: new AbortController().signal })
})
await page.waitForTimeout(15000)

await context.close()
await browser.close()
// Playwright finalizes the recording when the context closes and writes it into
// outputDir. Keep the script side-effect free so it can be rerun without trying
// to access a closed page/video handle.
console.log(`Demo recording written to ${outputDir}`)
