# Octopus

An [Orca](https://github.com/stablyai/orca) sidebar panel for round-based multi-agent
collaboration. It shows the members of a run, a **Data Flow** map between the actors and the
shared parts (Brief, Task board, Plan approval, Team board, File claims), and a feed of the
latest flows. Clicking a part, a flow, or *All flows (68)* opens a detail drawer.

Octopus reads **your real focused Orca workspace first**: `workspace.readContext`,
`workspace.list` and `agents.list` feed the members, task board, approvals, team board and file
claims. When Orca has no workspace open it falls back to a bundled demo run (`RTEAMDEM01`), so
the panel is never blank. The mapping lives in `src/live.ts`; swap it for another source and the
panel HTML does not change.

- Directory page: https://orca.dev/plugins/SteinLabz/octopus
- License: MIT

## Install

From the directory page above, once the `v1.1.0` release is indexed, copy the install URL and
paste it into Orca. Or install straight from GitHub:

```sh
orca plugin install SteinLabz/octopus --json
```

Orca asks for approval before running it: the plugin runs a trusted worker and subscribes to
agent and workspace status changes so the panel can refresh. It requests only `agent:read` and
`workspace:read`. No network calls, no analytics, no secrets. Requires Orca 1.4.260+.

## What the data looks like

`team.data` returns the `Snapshot` from `src/snapshot.ts` plus `generatedAt`. In live mode
`src/live.ts` fills it from Orca: agents → members/actors, worktrees → Task board and File
claims, unread workspaces and blocked agents → Plan approval, agent state changes → Team board
and flows. Times are relative offsets (`agoMs`) so the panel can tick them live:

```ts
{
  title, team, active, round, plansNeedApproval,
  run, lead, language, created, lastChangeMs, runningForMs,
  whyIntro, why,
  members:  [{ name, meta, status, icon, color }],
  actors:   [{ name, sub, state, color, icon }],
  parts:    [{ id, name, color, icon, meta, last, agoMs, barPct?, dot?, detail, bullets }],
  wiring:   { '<actor name>': ['brief', 'board', 'approval', 'teamboard', 'claims'] },
  hot:      ['tester>teamboard', ...],   // flows with an animated dot (last 30 s)
  flows:    [{ part, actor, text, agoMs, detail? }],
  allFlows: 68
}
```

Part ids: `brief`, `board`, `approval`, `teamboard`, `claims`.

## Layout

```
orca-plugin.json        manifest (panel + worker, metadata, cover/screenshot)
assets/                 icon, cover and screenshot for the directory page
panel/index.html        the complete UI: inline CSS, SVG wiring, interactions, demo fallback
src/snapshot.ts         fallback demo run and the shared types
src/live.ts             maps the real Orca workspace into the Snapshot
src/worker.ts           serves team.data (live, then demo), posts team.updated
src/protocol.ts         panel <-> worker request/event contract
src/worker.test.ts      worker test (orca/testing)
src/panel.check.ts      panel check scenario
```

## Develop

```sh
orca plugin validate .
orca plugin test .
orca plugin check .
orca plugin dev watch .    # loads the folder into Orca and prints reloads/logs; Ctrl-C unloads
orca plugin open local.octopus --panel team-run
```

Useful commands:

```sh
orca plugin dev request . team.data --json    # inspect the live snapshot
orca plugin logs local.octopus --json
orca plugin inspect . --json                  # contributions and access
orca plugin shot local.octopus --panel team-run --json
```

## Standalone preview

`panel/index.html` also works on its own: with no Orca runtime it falls back to the embedded
demo snapshot, so the whole dashboard renders in any browser.

```sh
start panel/index.html          # Windows
open panel/index.html           # macOS
xdg-open panel/index.html       # Linux
```

## Release

The directory page picks up a release from a `vX.Y.Z` git tag:

```sh
orca plugin validate .
git tag -a v1.1.0 -m v1.1.0
git push origin v1.1.0
```

Then check https://orca.dev/plugins/SteinLabz/octopus (the indexer runs every 30 minutes and
GitHub search can take a few more minutes to see a new topic).

## License

MIT — see [LICENSE](LICENSE).
