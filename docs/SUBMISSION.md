# Devpost submission draft

## Project name

Candoor Canvas

## Tagline

AI finds the signal. You decide what ships. Humans take it further.

## Inspiration

Career advice is usually split across disconnected moments: a generic AI rewrite, a private document, and a human conversation that starts without context. We wanted to show what becomes possible when a website is not merely readable by an agent, but actively collaborates with it while keeping the person in control.

## What it does

Candoor Canvas turns a resume into a shared career workspace. A browser agent can inspect the candidate’s live goal and evidence, place a diagnosis directly beside a weak bullet, and propose a before/after rewrite without silently changing anything. The candidate accepts the edit and sees a transparent, deterministic impact score update. The agent then ranks fictional demo advisors for the remaining gap and stages a structured handoff brief with the full audit trail.

The complete loop is understandable in under 30 seconds and runnable in under 90 seconds.

## How we built it

The app is React and TypeScript with a single typed reducer as its source of truth. Human controls and six imperative WebMCP tools dispatch the same actions. Strict JSON Schemas and Zod runtime validation reject unexpected input. Resume scoring is local and deterministic across five visible factors: action, quantified evidence, scope, outcome, and target-role relevance. Advisor matching is also deterministic and returns explicit ranking reasons.

The tools register only when the native `document.modelContext.registerTool` API exists. There is no production polyfill. An `AbortController` unregisters tools during cleanup. The entire product is static and self-contained, with no API keys, authentication, database, or production dependency.

## How we used WebMCP

- `get_canvas_state` gives the agent an accurate, versioned view of the workspace.
- `diagnose_resume_bullet` creates visible, typed feedback.
- `propose_bullet_rewrite` stages a diff and preserves human approval.
- `apply_bullet_rewrite` applies only a pending proposal and recalculates score.
- `match_candoor_advisors` visibly reorders advisor cards with reasons.
- `stage_candoor_handoff` opens a reviewable local brief with no external write.

WebMCP is essential here because the agent is not operating a hidden parallel workflow. Its actions are legible in the same interface the candidate is using, and every consequential change is inspectable.

## Challenges

The hardest design problem was balancing agent agency with human authorship. A resume is personal and high-stakes, so we separated diagnosis, proposal, and acceptance into explicit states. The score cannot be supplied by a tool and cannot change on a proposal; it changes only when accepted text changes. We also designed a meaningful handoff without touching authenticated advisor or booking infrastructure.

## Accomplishments

- A coherent six-tool WebMCP workflow rather than isolated commands.
- One reducer synchronizing human and agent actions.
- Transparent scoring and matching with deterministic test coverage.
- A polished responsive interface that fully works without WebMCP.
- Strict isolation from Candoor production systems and private data.
- Fictional, visibly labeled advisor profiles with generated editorial portraits.

## What we learned

Agent-native design is less about adding a chat box and more about making state, intent, and approval boundaries explicit. The best interaction was the simplest: let the agent identify and prepare the work, let the human choose what becomes true, and preserve that context for the expert who comes next.

## What’s next

With user consent, the same `AdvisorRecord[]` adapter could read approved public directory data and the staged brief could flow into an authenticated Candoor session. The current submission deliberately stops before those production boundaries.

## Testing instructions

1. Open the live URL in a WebMCP-enabled Chrome or ChatGPT built-in browser.
2. Copy the judge prompt from the top of the page and send it to the agent.
3. When the rewrite appears, click **Accept rewrite**.
4. Let the agent rank advisors and stage the handoff.
5. Open **See transparent rubric** or **Reset demo** to repeat.

For manual-only testing, click **Diagnose**, **Draft rewrite**, and **Accept rewrite**, then **Match advisors** and **Stage advisor brief**.
