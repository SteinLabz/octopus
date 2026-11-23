// Build the panel's Snapshot from the real Orca workspace the user is looking at.
// No invented data: every field comes from workspace.readContext, workspace.list,
// agents.list or their live events. Returns null when Orca has no workspace at all.
import type { OrcaWorkerApi } from 'orca/worker'
import type { Snapshot, Member, Actor, Part, Flow, PartId } from './snapshot'

const COLORS = ['#5b9cff', '#f0a24b', '#49c99a', '#ef6f8e', '#a78bfa', '#54c7ec']

type AgentState = 'working' | 'blocked' | 'waiting' | 'done'

function memberStatus(state: string): Member['status'] {
  if (state === 'working') return 'working'
  if (state === 'blocked') return 'needs-you'
  if (state === 'waiting') return 'idle'
  return 'replaced'
}

function actorState(state: string): Actor['state'] {
  if (state === 'working') return 'working'
  if (state === 'blocked') return 'needs-you'
  return 'idle'
}

function stateLabel(state: string): string {
  return { working: 'trabajando', blocked: 'bloqueado', waiting: 'esperando', done: 'terminado' }[state] ?? state
}

function since(ts?: number | null): number {
  return ts ? Math.max(0, Date.now() - ts) : 0
}

function shortName(value: string | null | undefined, fallback: string): string {
  return String(value || fallback).split('·')[0].trim().slice(0, 26) || fallback
}

/** Agents often have no title in Orca; disambiguate them by terminal/session id. */
function agentLabel(a: any, i: number): string {
  const title = String(a.title || '').trim()
  if (title) return shortName(title, title)
  const id = String(a.sessionId || a.terminalId || i + 1).replace(/[^a-zA-Z0-9]/g, '').slice(-4)
  return `${a.agent || 'agente'} · ${id}`
}

function fmtDate(ts: number): string {
  try {
    return new Date(ts).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch {
    return '—'
  }
}

export async function buildLive(orca: OrcaWorkerApi): Promise<Snapshot | null> {
  let ctx: any = null
  let listed: any = null
  let agentList: any = null

  try { ctx = await orca.host.call('workspace.readContext') } catch { /* sin workspace enfocado */ }
  try { listed = await orca.host.call('workspace.list', { includeStatus: true }) } catch { /* host sin statuses */ }
  if (!ctx && !listed) return null

  const workspaces: any[] = (listed?.workspaces ?? []).filter((w: any) => w.kind === 'worktree')
  try {
    agentList = ctx?.workspaceId
      ? await orca.host.call('agents.list', { workspaceId: ctx.workspaceId })
      : await orca.host.call('agents.list')
  } catch { /* sin agentes en este workspace */ }

  const agents: any[] = agentList?.agents ?? []
  const terminals: any[] = ctx?.terminals ?? []
  const active = workspaces.filter(w => w.status?.state === 'working' || w.status?.state === 'active')
  const unread = workspaces.filter(w => w.status?.unread)
  const working = agents.filter(a => a.state === 'working')
  const blocked = agents.filter(a => a.state === 'blocked')
  const branches = workspaces.filter(w => w.branch)
  const labelOf = (a: any) => agentLabel(a, agents.indexOf(a))
  const runCode = String(ctx?.workspaceId || 'LOCAL').replace(/^(folder|repo):/i, '').slice(0, 6).toUpperCase() || 'LOCAL'

  const startedTimes = agents.map(a => a.stateStartedAt).filter((t: any) => typeof t === 'number')
  const activityTimes = workspaces.map(w => w.status?.lastActivityAt).filter((t: any) => typeof t === 'number')
  const oldestStart = startedTimes.length ? Math.min(...startedTimes) : Date.now()
  const lastActivity = activityTimes.length ? Math.max(...activityTimes) : Date.now()
  const latestWorkspace = [...workspaces].sort((a, b) => (b.status?.lastActivityAt ?? 0) - (a.status?.lastActivityAt ?? 0))[0]
  const latestAgent = [...agents].sort((a, b) => (b.stateStartedAt ?? 0) - (a.stateStartedAt ?? 0))[0]

  const displayName = ctx?.displayName || latestWorkspace?.name || 'Workspace de Orca'
  const branch = ctx?.branch || latestWorkspace?.branch || '—'

  const members: Member[] = agents.slice(0, 8).map((a: any, i: number) => ({
    name: agentLabel(a, i),
    meta: `${a.agent || 'agente'} · ${stateLabel(a.state)} · ${a.task?.title || 'sin tarea activa'}`,
    status: memberStatus(a.state),
    icon: a.agent === 'opencode' || a.agent === 'opencode2' ? 'terminal' : 'bot',
    color: COLORS[i % COLORS.length],
  }))
  if (!members.length) {
    members.push({
      name: 'Workspace',
      meta: 'sin agentes abiertos ahora mismo',
      status: 'idle',
      icon: 'terminal',
      color: COLORS[0],
    })
  }

  const actors: Actor[] = agents.slice(0, 4).map((a: any, i: number) => ({
    name: agentLabel(a, i),
    sub: stateLabel(a.state),
    state: actorState(a.state),
    color: COLORS[i % COLORS.length],
    icon: a.agent === 'opencode' || a.agent === 'opencode2' ? 'terminal' : 'bot',
  }))
  if (!actors.length) {
    actors.push({ name: 'Workspace', sub: 'sin agentes', state: 'idle', color: COLORS[0], icon: 'terminal' })
  }

  const parts: Part[] = [
    {
      id: 'brief', name: 'Brief', color: '#a78bfa', icon: 'doc',
      meta: `${displayName} · ${branch}`,
      last: `${terminals.length} terminal${terminals.length === 1 ? '' : 'es'} en el workspace`,
      agoMs: 0,
      detail: `Workspace enfocado de Orca: ${displayName}, rama ${branch}. Sus terminales y agentes son la fuente de este panel.`,
      bullets: terminals.length
        ? terminals.slice(0, 5).map((t: any) => t.title || t.id)
        : ['Sin terminales abiertas'],
    },
    {
      id: 'board', name: 'Task board', color: '#4c8bf5', icon: 'board',
      meta: `${workspaces.length} worktrees · ${active.length} activos · ${unread.length} sin leer`,
      last: latestWorkspace ? `${latestWorkspace.name} · ${latestWorkspace.branch || 'sin rama'}` : 'sin worktrees',
      agoMs: since(lastActivity),
      barPct: workspaces.length ? Math.round(active.length / workspaces.length * 100) : 0,
      detail: 'Los worktrees que Orca tiene abiertos, con su estado real y los que tienen mensajes sin leer.',
      bullets: workspaces.slice(0, 6).map((w: any) =>
        `${w.name} · ${w.status?.state || 'inactivo'}${w.status?.unread ? ' · sin leer' : ''}`),
    },
    {
      id: 'approval', name: 'Plan approval', color: '#f5a623', icon: 'shield',
      meta: `${unread.length + blocked.length} esperando tu revisión`,
      last: blocked[0] ? `${labelOf(blocked[0])} · bloqueado`
        : unread[0] ? `${unread[0].name} · sin leer` : 'nada pendiente',
      agoMs: blocked[0] ? since(blocked[0].stateStartedAt) : since(lastActivity),
      detail: 'Agentes bloqueados y workspaces con mensajes sin leer: lo que Orca marca como “needs you”.',
      bullets: (() => {
        const rows = [
          ...blocked.slice(0, 4).map((a: any) => `${labelOf(a)} · bloqueado`),
          ...unread.slice(0, 4).map((w: any) => `${w.name} · sin leer`),
        ].slice(0, 6)
        return rows.length ? rows : ['Todo al día']
      })(),
    },
    {
      id: 'teamboard', name: 'Team board', color: '#49c99a', icon: 'chat',
      meta: `${agents.length} agente${agents.length === 1 ? '' : 's'} · ${working.length} trabajando`,
      last: latestAgent
        ? `${labelOf(latestAgent)} · ${stateLabel(latestAgent.state)}`
        : 'sin actividad',
      agoMs: latestAgent ? since(latestAgent.stateStartedAt) : 0,
      dot: working.length > 0,
      detail: 'Los agentes reales del workspace enfocado, con su estado y la tarea que Orca les despachó.',
      bullets: agents.slice(0, 6).map((a: any) =>
        `${labelOf(a)} · ${stateLabel(a.state)}${a.task?.title ? ` · ${a.task.title}` : ''}`),
    },
    {
      id: 'claims', name: 'File claims', color: '#ef6f8e', icon: 'lock',
      meta: `${branches.length} rama${branches.length === 1 ? '' : 's'} en worktrees`,
      last: branches[0] ? `${branches[0].name} · ${branches[0].branch}` : 'sin ramas',
      agoMs: since(branches[0]?.status?.lastActivityAt ?? lastActivity),
      dot: unread.length > 0,
      detail: 'Cada worktree de Orca posee una rama de Git. Aquí están las que hay ahora mismo.',
      bullets: branches.slice(0, 6).map((w: any) => `${w.name} · ${w.branch}`),
    },
  ]

  const flows: Flow[] = []
  agents.forEach((a: any, i: number) => {
    flows.push({
      part: 'teamboard',
      actor: agentLabel(a, i),
      actorColor: COLORS[i % COLORS.length],
      text: `${a.agent || 'agente'} · ${stateLabel(a.state)}`,
      detail: a.task?.title || '',
      agoMs: since(a.stateStartedAt),
    })
  })
  workspaces.forEach((w: any) => {
    if (!w.status?.unread && w.status?.state !== 'working') return
    flows.push({
      part: w.status?.unread ? 'approval' : 'board',
      actor: 'Orca',
      actorColor: '#5b9cff',
      text: `${w.name} · ${w.status?.state || 'inactivo'}${w.status?.unread ? ' · sin leer' : ''}`,
      agoMs: since(w.status?.lastActivityAt),
    })
  })
  flows.sort((a, b) => a.agoMs - b.agoMs)

  const wiring: Record<string, PartId[]> = {}
  actors.forEach((a: Actor, i: number) => {
    const source = agents[i]
    wiring[a.name] = source?.state === 'working'
      ? ['brief', 'board', 'teamboard', 'claims']
      : source?.state === 'blocked'
        ? ['approval', 'teamboard', 'claims']
        : ['brief', 'board', 'teamboard']
  })

  const hot = flows.filter(f => f.agoMs < 30000).map(f => `${f.actor}>${f.part}`)

  return {
    title: displayName,
    team: branch !== '—' ? `Rama · ${branch}` : 'Workspace local',
    active: active.length > 0 || working.length > 0,
    round: `${agents.length} agente${agents.length === 1 ? '' : 's'}`,
    plansNeedApproval: unread.length > 0 || blocked.length > 0,
    run: runCode,
    lead: working[0] || agents[0] ? labelOf(working[0] || agents[0]) : '—',
    language: 'Español',
    created: startedTimes.length ? fmtDate(oldestStart) : '—',
    lastChangeMs: since(lastActivity),
    runningForMs: since(oldestStart),
    whyIntro: 'Fuente de datos',
    why: 'Datos reales del workspace enfocado de Orca: agentes, tareas, worktrees y estados en vivo.',
    members,
    actors,
    parts,
    wiring,
    hot,
    flows,
    allFlows: flows.length,
  }
}
