// The demo run shown by the panel, reproduced from the reference design.
// Times are relative offsets in milliseconds so the panel can tick them live.

export type PartId = 'brief' | 'board' | 'approval' | 'teamboard' | 'claims'

export interface Member {
  name: string
  meta: string
  status: 'working' | 'replaced' | 'idle' | 'needs-you'
  icon: 'bot' | 'terminal'
  color: string
}

export interface Part {
  id: PartId
  name: string
  color: string
  icon: string
  meta: string
  last: string
  agoMs: number
  barPct?: number
  dot?: boolean
  detail: string
  bullets: string[]
}

export interface Flow {
  part: PartId
  actor: string
  text: string
  agoMs: number
  detail?: string
  actorColor: string
}

export interface Actor {
  name: string
  sub: string
  state: 'lead' | 'working' | 'idle' | 'needs-you'
  color: string
  icon: 'bot' | 'terminal' | 'crown'
}

export interface Snapshot {
  /** 'live' when built from Orca's focused workspace, 'demo' for the bundled fallback. */
  source: 'live' | 'demo'
  title: string
  team: string
  active: boolean
  round: string
  plansNeedApproval: boolean
  run: string
  lead: string
  language: string
  created: string
  lastChangeMs: number
  runningForMs: number
  whyIntro: string
  why: string
  members: Member[]
  actors: Actor[]
  parts: Part[]
  // Which parts each actor talks to. Colours come from the actor.
  wiring: Record<string, PartId[]>
  hot: string[]
  flows: Flow[]
  allFlows: number
}

export const SNAPSHOT: Snapshot = {
  source: 'demo',
  title: 'Dark mode for the settings page',
  team: 'Team · MA-08',
  active: true,
  round: 'Round 2 of 2',
  plansNeedApproval: true,
  run: 'RTEAMDEM01',
  lead: 'Orchestrator',
  language: 'English',
  created: 'Nov 21, 04:24 PM',
  lastChangeMs: 9000,
  runningForMs: 20 * 60 * 1000,
  whyIntro: 'Why this mode',
  why: 'Several roles touch shared files (API, UI, styles); they need a shared board and review.',

  members: [
    { name: 'api', meta: 'api · codex · gpt-5.1-codex', status: 'working', icon: 'bot', color: '#f0a24b' },
    { name: 'ui', meta: 'ui · claude · haiku', status: 'replaced', icon: 'bot', color: '#d98a5b' },
    { name: 'tester', meta: 'tester · gemini · gemini-2.5-pro', status: 'idle', icon: 'terminal', color: '#4c8bf5' },
    { name: 'ui 2', meta: 'ui · claude · sonnet', status: 'needs-you', icon: 'bot', color: '#e07a5f' },
  ],

  actors: [
    { name: 'Orchestrator', sub: 'lead', state: 'lead', color: '#4c8bf5', icon: 'crown' },
    { name: 'api', sub: 'working', state: 'working', color: '#f0a24b', icon: 'bot' },
    { name: 'tester', sub: 'idle', state: 'idle', color: '#49c99a', icon: 'terminal' },
    { name: 'ui 2', sub: 'needs you', state: 'needs-you', color: '#ef6f8e', icon: 'bot' },
  ],

  parts: [
    {
      id: 'brief',
      name: 'Brief',
      color: '#a78bfa',
      icon: 'doc',
      meta: 'confirmed · 4 acceptance criteria',
      last: 'brief sent to ui 2',
      agoMs: 10 * 60 * 1000,
      detail: 'The shared brief is confirmed and has 4 acceptance criteria. It was sent to ui 2, who is now drafting the plan for T2.',
      bullets: ['Scope: settings page dark mode', '4 acceptance criteria confirmed', 'Delivered to ui 2'],
    },
    {
      id: 'board',
      name: 'Task board',
      color: '#4c8bf5',
      icon: 'board',
      meta: '2 in progress · 1 to do · 2 done',
      last: 'api took T4',
      agoMs: 2 * 60 * 1000,
      barPct: 40,
      detail: 'Five tasks in the round: 2 in progress, 1 to do and 2 done. api just picked up T4 (boot script + cookie fallback).',
      bullets: ['T4 · api · in progress', 'T2 · ui 2 · in progress', 'T3 · to do', 'T0 / T1 · done'],
    },
    {
      id: 'approval',
      name: 'Plan approval',
      color: '#f5a623',
      icon: 'shield',
      meta: '1 waiting · 3 approved · 0 sent back',
      last: 'Orchestrator approved the plan of T4',
      agoMs: 36000,
      detail: 'Plans are reviewed before work starts. The Orchestrator approved T4 with a note to add a test for the cookie fallback; T2 is still waiting.',
      bullets: ['T4 · approved (with note)', 'T2 · waiting for approval', '3 approved · 0 sent back'],
    },
    {
      id: 'teamboard',
      name: 'Team board',
      color: '#49c99a',
      icon: 'chat',
      meta: '7 posts',
      last: 'tester posted #7',
      agoMs: 9000,
      dot: true,
      detail: 'Shared message board for the round. tester posted update #7: fixtures are being drafted while T2 is pending.',
      bullets: ['#7 · tester · update', '#6 · api · T4 status', '#5 · Orchestrator · review note'],
    },
    {
      id: 'claims',
      name: 'File claims',
      color: '#ef6f8e',
      icon: 'lock',
      meta: '3 paths held',
      last: 'tester was refused src/boot.ts',
      agoMs: 19000,
      dot: true,
      detail: 'Exclusive write locks on shared files. api holds src/boot.ts and index.html; tester was refused src/boot.ts.',
      bullets: ['src/boot.ts · api', 'index.html · api', 'styles.css · ui 2', 'tester → src/boot.ts · refused'],
    },
  ],

  wiring: {
    Orchestrator: ['brief', 'board', 'approval', 'teamboard', 'claims'],
    api: ['board', 'approval', 'teamboard', 'claims'],
    tester: ['board', 'approval', 'teamboard', 'claims'],
    'ui 2': ['brief', 'board', 'approval', 'teamboard', 'claims'],
  },

  hot: ['tester>teamboard', 'api>claims', 'Orchestrator>approval', 'api>board'],

  flows: [
    {
      part: 'teamboard', actor: 'tester', agoMs: 9000, actorColor: '#49c99a',
      text: 'tester posted #7',
      detail: 'update: Waiting for T2 before I write the E2E test; drafting the fixtures meanwhile.',
    },
    {
      part: 'claims', actor: 'tester', agoMs: 19000, actorColor: '#49c99a',
      text: 'tester was refused src/boot.ts',
      detail: 'held by api',
    },
    { part: 'claims', actor: 'api', agoMs: 27000, actorColor: '#f0a24b', text: 'api claimed index.html' },
    {
      part: 'approval', actor: 'Orchestrator', agoMs: 36000, actorColor: '#4c8bf5',
      text: 'Orchestrator approved the plan of T4',
      detail: 'Yes. Add a test for the cookie fallback.',
    },
    {
      part: 'approval', actor: 'api', agoMs: 60000, actorColor: '#f0a24b',
      text: 'api submitted a plan for T4',
      detail: 'Move the boot script into <head> before the stylesheet link, and read the cookie mirror so it works before JS bulids load.',
    },
    { part: 'claims', actor: 'api', agoMs: 120000, actorColor: '#f0a24b', text: 'api claimed src/boot.ts' },
    { part: 'board', actor: 'api', agoMs: 120000, actorColor: '#f0a24b', text: 'api took T4' },
    { part: 'approval', actor: 'Orchestrator', agoMs: 120000, actorColor: '#4c8bf5', text: 'orchestrator told that the plan of T2 waits' },
    {
      part: 'approval', actor: 'ui 2', agoMs: 120000, actorColor: '#ef6f8e',
      text: 'ui 2 submitted a plan for T2',
      detail: 'A segmented control (Light / Dark / System) in Appearance; optimistic...',
    },
  ],

  allFlows: 68,
}
