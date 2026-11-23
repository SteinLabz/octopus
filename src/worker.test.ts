import { assert, mockHost, mountWorker, test } from 'orca/testing'
import * as main from './worker'

test('builds the snapshot from the real focused workspace', async () => {
  const now = Date.now()
  const host = mockHost({
    results: {
      'workspace.readContext': {
        workspaceId: 'ws-1', branch: 'main', displayName: 'Jefe · Bots',
        terminals: [{ id: 't1', title: 'api' }, { id: 't2', title: 'tester' }],
      },
      'workspace.list': {
        workspaces: [
          { id: 'ws-1', kind: 'worktree', name: 'Jefe · Bots', branch: 'main',
            status: { state: 'working', unread: false, terminalCount: 2, lastActivityAt: now - 5000 } },
          { id: 'ws-2', kind: 'worktree', name: 'News', branch: 'feature/news',
            status: { state: 'inactive', unread: true, terminalCount: 0, lastActivityAt: now - 120000 } },
        ],
        truncated: false,
      },
      'agents.list': {
        agents: [
          { terminalId: 't1', title: 'api', agent: 'codex', state: 'working',
            stateStartedAt: now - 60000, task: { title: 'T4 boot script' } },
          { terminalId: 't2', title: 'tester', agent: 'gemini', state: 'blocked', stateStartedAt: now - 20000 },
        ],
      },
    },
  })

  const worker = await mountWorker(main, { host })
  const data: any = await worker.request('team.data')
  assert.equal(data.title, 'Jefe · Bots')
  assert.equal(data.team, 'Rama · main')
  assert.equal(data.members.length, 2)
  assert.equal(data.parts.length, 5)
  assert.equal(data.allFlows, data.flows.length)
  assert.ok(data.plansNeedApproval)
  assert.ok(data.generatedAt > 0)
  assert.deepEqual(worker.refusals, [])
  await worker.deactivate()
})

test('falls back to the demo run when Orca has no workspace', async () => {
  const host = mockHost({})
  const worker = await mountWorker(main, { host })
  const data: any = await worker.request('team.data')
  assert.equal(data.run, 'RTEAMDEM01')
  await worker.deactivate()
})
