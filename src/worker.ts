// Worker for the Octopus panel. It prefers the real focused workspace from Orca
// and falls back to the bundled demo run when Orca has no workspace to read.
import type { OrcaWorkerApi } from 'orca/worker'
import { SNAPSHOT } from './snapshot'
import { buildLive } from './live'

export default function activate(orca: OrcaWorkerApi): void {
  orca.log('Octopus monitor activado')

  orca.panels.handle('team.data', async () => {
    let data = null
    try {
      data = await buildLive(orca)
    } catch (error) {
      orca.log('No se pudo leer el workspace en vivo: ' + String(error))
    }
    const payload = { ...(data ?? SNAPSHOT), generatedAt: Date.now() }
    // Guarantee a plain JSON value across the worker <-> panel boundary.
    return JSON.parse(JSON.stringify(payload))
  })

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
