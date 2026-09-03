import { useMemo, useState } from 'react'
import { ArrowRight, ArrowUpRight, Braces, Check, CircleCheck, Copy, RotateCcw, ShieldCheck, Sparkles, WandSparkles, X } from 'lucide-react'
import './App.css'
import { advisors } from './data/advisors'
import { guidedDemo, judgePrompt } from './data/demo'
import { scoreRules } from './lib/scoring'
import { useCanvasStore } from './state/canvas'
import { useCanvasTools } from './webmcp/useCanvasTools'

const toolNames = ['get_canvas_state', 'diagnose_resume_bullet', 'propose_bullet_rewrite', 'apply_bullet_rewrite', 'match_candoor_advisors', 'stage_candoor_handoff']

function App() {
  const { state, stateRef, act } = useCanvasStore()
  const [copied, setCopied] = useState<'prompt' | 'brief' | null>(null)
  const [rulesOpen, setRulesOpen] = useState(false)
  const webMcpAvailable = typeof document !== 'undefined' && Boolean(document.modelContext?.registerTool)
  useCanvasTools(stateRef, act)

  const rankedAdvisors = useMemo(() => state.advisorMatches.map((match) => ({
    ...match, advisor: advisors.find((advisor) => advisor.id === match.advisorId)!,
  })), [state.advisorMatches])

  const copyText = async (text: string, kind: 'prompt' | 'brief') => {
    await navigator.clipboard.writeText(text)
    setCopied(kind)
    window.setTimeout(() => setCopied(null), 1600)
  }

  const runGuidedStep = (bulletId: string) => {
    const bullet = state.bullets.find((item) => item.id === bulletId)!
    const guide = guidedDemo.find((item) => item.bulletId === bulletId)!
    if (!bullet.diagnosis && !bullet.proposal && !bullet.accepted) {
      act({ type: 'DIAGNOSE', actor: 'human', bulletId, issueType: guide.issueType, feedback: guide.feedback })
      return
    }
    if (!bullet.proposal && !bullet.accepted) act({ type: 'PROPOSE', actor: 'human', bulletId, newText: guide.newText, rationale: guide.rationale })
  }

  const stageSelected = () => {
    const advisorId = state.selectedAdvisorId ?? rankedAdvisors[0]?.advisorId
    if (!advisorId) return
    act({
      type: 'STAGE_HANDOFF', actor: 'human', advisorId,
      sessionTopic: `Executive storytelling for ${state.goal.targetRole}`,
      auditSummary: `${state.bullets.filter((bullet) => bullet.accepted).length} rewrite(s) accepted. Resume impact score is ${state.score.total}/100; remaining bullets need sharper evidence and scope.`,
    })
  }

  const briefText = state.handoff ? [
    `CANDOOR CANVAS HANDOFF — ${state.handoff.advisorName}`,
    `Topic: ${state.handoff.sessionTopic}`,
    `Impact score: ${state.handoff.score}/100`,
    `Audit: ${state.handoff.auditSummary}`,
    '', 'Agenda:', ...state.handoff.agenda.map((item, index) => `${index + 1}. ${item}`),
    '', 'Accepted changes:', ...state.handoff.acceptedChanges.map((item) => `• ${item.before}\n  → ${item.after}`),
    '', 'Remaining gaps:', ...state.handoff.remainingGaps.map((item) => `• ${item}`),
    '', 'Demo only — no booking or external write was created.',
  ].join('\n') : ''

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Candoor Canvas home"><span className="brand-mark" aria-hidden="true">C</span><span>Candoor <em>Canvas</em></span></a>
        <div className="topbar-actions">
          <div className={`protocol-status ${webMcpAvailable ? 'is-live' : ''}`} title={webMcpAvailable ? 'WebMCP is available in this browser' : 'Manual demo mode; WebMCP activates automatically in supported browsers'}>
            <span className="pulse" />{webMcpAvailable ? '6 tools live' : 'Manual mode'}
          </div>
          <button className="button button-ghost" onClick={() => act({ type: 'RESET', actor: 'human' })}><RotateCcw size={15} /> Reset demo</button>
        </div>
      </header>

      <main id="top">
        <section className="intro" aria-labelledby="page-title">
          <div className="eyebrow"><Sparkles size={14} /> Agent-native career intelligence</div>
          <h1 id="page-title">Your career story,<br /><span>made undeniable.</span></h1>
          <p className="intro-copy">A shared workspace where AI finds the evidence gap, you keep editorial control, and a human advisor takes it across the finish line.</p>
          <div className="judge-prompt">
            <div><Braces size={17} /><strong>Judge prompt</strong><span>Paste into ChatGPT while this page is open</span></div>
            <button aria-label="Copy judge prompt" onClick={() => copyText(judgePrompt, 'prompt')}>{copied === 'prompt' ? <Check size={17} /> : <Copy size={17} />}{copied === 'prompt' ? 'Copied' : 'Copy'}</button>
          </div>
        </section>

        <section className="workspace" aria-label="Career canvas workspace">
          <aside className="score-panel">
            <div className="panel-kicker">Live diagnostic</div>
            <div className="score-orbit" style={{ '--score': state.score.total } as React.CSSProperties}><div><strong>{state.score.total}</strong><span>/100</span></div></div>
            <h2>Impact signal</h2>
            <p>The score only changes when accepted resume evidence changes.</p>
            <button className="text-button" onClick={() => setRulesOpen((open) => !open)} aria-expanded={rulesOpen}>{rulesOpen ? 'Hide rubric' : 'See transparent rubric'} <ArrowRight size={14} /></button>
            <div className={`score-rules ${rulesOpen ? 'is-open' : ''}`}>
              {scoreRules.map((rule) => { const value = state.score[rule.key]; return <div className="rule" key={rule.key}><span>{rule.label}</span><b>{value}/{rule.max}</b><i><span style={{ width: `${(value / rule.max) * 100}%` }} /></i></div> })}
            </div>
            <div className="version-stamp">STATE VERSION <strong>v{state.version}</strong></div>
          </aside>

          <article className="resume-paper">
            <div className="paper-meta"><span>Candidate canvas</span><span>Live document · <b>{state.bullets.filter((bullet) => bullet.accepted).length}/3</b> strengthened</span></div>
            <div className="resume-header"><div className="monogram">JL</div><div><h2>{state.candidate.name}</h2><p>{state.candidate.title}</p></div></div>
            <div className="target-strip"><span>Target</span><strong>{state.goal.targetRole}</strong><i>{state.goal.targetCompany}</i></div>
            <div className="experience-heading"><span>Selected experience</span><b>01 — 03</b></div>
            <div className="bullet-list">
              {state.bullets.map((bullet, index) => (
                <section className={`bullet-card ${bullet.accepted ? 'is-accepted' : ''}`} key={bullet.id} data-testid={`bullet-${bullet.id}`}>
                  <div className="bullet-row">
                    <span className="bullet-index">0{index + 1}</span><p>{bullet.text}</p>
                    {bullet.accepted ? <span className="accepted-badge"><CircleCheck size={15} /> accepted</span> : <button className="micro-action" onClick={() => runGuidedStep(bullet.id)}><WandSparkles size={15} /> {bullet.diagnosis ? 'Draft rewrite' : 'Diagnose'}</button>}
                  </div>
                  {bullet.diagnosis && !bullet.proposal && <div className="diagnosis" role="status"><span>{bullet.diagnosis.issueType.replaceAll('_', ' ')}</span><p>{bullet.diagnosis.feedback}</p></div>}
                  {bullet.proposal && (
                    <div className="proposal" role="status">
                      <div className="proposal-label"><span>Agent proposal</span><small>Score stays {state.score.total} until you accept</small></div>
                      <div className="diff before"><b>Before</b><p>{bullet.text}</p></div>
                      <div className="diff after"><b>After</b><p>{bullet.proposal.newText}</p></div>
                      <p className="rationale">{bullet.proposal.rationale}</p>
                      <button className="button button-accept" onClick={() => act({ type: 'APPLY', actor: 'human', bulletId: bullet.id })}><Check size={16} /> Accept rewrite</button>
                    </div>
                  )}
                </section>
              ))}
            </div>
          </article>

          <aside className="activity-panel">
            <div className="activity-head"><div><span className="pulse is-blue" /><strong>Shared activity</strong></div><small>Human + agent</small></div>
            <div className="event-list" aria-live="polite">{state.events.slice(0, 7).map((item) => <div className="event" key={item.id}><span className={`event-actor actor-${item.actor}`}>{item.actor === 'agent' ? 'AI' : item.actor === 'human' ? 'YOU' : 'SYS'}</span><div><strong>{item.action}</strong><p>{item.detail}</p></div></div>)}</div>
            <div className="tool-registry"><span>WebMCP registry</span>{toolNames.map((name, index) => <div key={name}><b>0{index + 1}</b><code>{name}</code></div>)}</div>
          </aside>
        </section>

        <section className="advisors-section" id="advisors" aria-labelledby="advisor-title">
          <div className="section-intro">
            <div><span className="section-number">02</span><p className="panel-kicker">Human judgment, precisely routed</p><h2 id="advisor-title">Close the gap with<br />the right person.</h2></div>
            <div className="matching-control"><p>Ranked for <b>{state.goal.focusArea}</b> and <b>{state.goal.targetRole}</b>.</p><button className="button button-primary" onClick={() => act({ type: 'MATCH', actor: 'human', goal: state.goal })}><Sparkles size={16} /> Match advisors</button></div>
          </div>
          <div className="demo-disclaimer"><ShieldCheck size={16} /><span><strong>Demonstration directory.</strong> Every profile below is fictional and contains no private data or real employment claims.</span></div>
          <div className="advisor-grid">
            {rankedAdvisors.slice(0, 4).map((match, index) => (
              <article className={`advisor-card ${state.selectedAdvisorId === match.advisorId ? 'is-selected' : ''}`} key={match.advisorId}>
                <div className="advisor-rank">0{index + 1}</div><img src={match.advisor.avatar} alt={`Illustrated portrait of fictional advisor ${match.advisor.name}`} />
                <div className="advisor-card-body"><span className="demo-pill">DEMO PROFILE</span><h3>{match.advisor.name}</h3><p className="advisor-headline">{match.advisor.headline}</p><p className="advisor-org">{match.advisor.organization} · {match.advisor.pronouns}</p><div className="match-reason"><Sparkles size={14} /><span>{match.reasons[0]}</span></div><div className="advisor-tags">{match.advisor.expertise.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div><button onClick={() => act({ type: 'SELECT_ADVISOR', actor: 'human', advisorId: match.advisorId })}>{state.selectedAdvisorId === match.advisorId ? <><Check size={15} /> Selected</> : <>Choose advisor <ArrowRight size={15} /></>}</button></div>
              </article>
            ))}
          </div>
          <div className="handoff-banner"><div><span>03 · THE HANDOFF</span><h3>Context survives the transition.</h3><p>Package the diagnostic, accepted edits, and remaining gaps into a brief a human advisor can act on immediately.</p></div><button className="button button-light" onClick={stageSelected} disabled={!state.selectedAdvisorId}>Stage advisor brief <ArrowUpRight size={17} /></button></div>
        </section>
      </main>

      <footer><div className="brand"><span className="brand-mark">C</span><span>Candoor <em>Canvas</em></span></div><p>AI finds the signal. You decide what ships. Humans take it further.</p><span>WebMCP Challenge · 2026</span></footer>

      {state.handoff && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && act({ type: 'CLOSE_HANDOFF' })}>
          <section className="handoff-modal" role="dialog" aria-modal="true" aria-labelledby="handoff-title">
            <button className="modal-close" aria-label="Close handoff" onClick={() => act({ type: 'CLOSE_HANDOFF' })}><X size={20} /></button><div className="modal-kicker"><span className="pulse is-blue" /> Brief staged · no booking created</div>
            <h2 id="handoff-title">The context is ready<br />for {state.handoff.advisorName}.</h2><div className="brief-score"><span>Accepted impact score</span><strong>{state.handoff.score}<small>/100</small></strong></div><div className="brief-block"><span>Session topic</span><p>{state.handoff.sessionTopic}</p></div>
            <div className="brief-columns"><div><span>Working agenda</span><ol>{state.handoff.agenda.map((item) => <li key={item}>{item}</li>)}</ol></div><div><span>What travels with it</span><ul><li>{state.handoff.acceptedChanges.length} accepted rewrite(s)</li><li>{state.handoff.remainingGaps.length} remaining evidence gap(s)</li><li>Deterministic score + full audit summary</li></ul></div></div>
            <div className="brief-note"><ShieldCheck size={18} /><p>This preview stays in your browser. Candoor Canvas does not authenticate, book a session, or write to Candoor production.</p></div><div className="modal-actions"><button className="button button-primary" onClick={() => copyText(briefText, 'brief')}>{copied === 'brief' ? <Check size={16} /> : <Copy size={16} />}{copied === 'brief' ? 'Brief copied' : 'Copy brief'}</button><a className="button button-ghost" href="https://candoor.co" target="_blank" rel="noreferrer">Explore Candoor <ArrowUpRight size={16} /></a></div>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
