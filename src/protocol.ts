// Panel <-> worker contract.
export type { Snapshot, PartId, Member, Part, Flow, Actor } from './snapshot'

declare module 'orca' {
  interface PluginRequests {
    'team.data': {
      output: import('./snapshot').Snapshot & { generatedAt: number }
    }
  }
  interface PluginPanelEvents {
    'team.updated': { at: number }
  }
}
