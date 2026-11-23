// Worker for the Team mode panel. It serves the run snapshot and tells open
// panels when to refresh. Swap SNAPSHOT for a live source when wiring a real
// team runtime; the panel contract stays the same.
import type { OrcaWorkerApi } from 'orca/worker'
import { SNAPSHOT } from './snapshot'

export default function activate(orca: OrcaWorkerApi): void {
  orca.log('Octopus monitor activado')

  orca.panels.handle('team.data', async () => ({
    ...SNAPSHOT,
    generatedAt: Date.now(),
  }))

  let notifyTimer: ReturnType<typeof setTimeout> | null = null
  const changed = () => {
    if (notifyTimer) clearTimeout(notifyTimer)
    notifyTimer = setTimeout(() => orca.panels.post('team.updated', { at: Date.now() }), 400)
  }
  for (const event of ['agent.status.changed', 'workspace.changed'] as const) {
    orca.events.on(event, changed)
  }

  setInterval(() => orca.panels.post('team.updated', { at: Date.now() }), 30000).unref?.()
}
