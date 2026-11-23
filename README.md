# Team Mode · Run Monitor

An [Orca](https://github.com/stablyai/orca) plugin that renders a live-looking dashboard for
round-based multi-agent collaboration: the members of a run, a **Data Flow** map between the
actors and the collaboration parts, the **Task board**, **Plan approval**, **Team board** and
**File claims**, plus a feed of the latest flows.

The UI is reproduced faithfully from the reference design and works in two ways:

- **Inside Orca** — the worker answers `team.data` and the panel refreshes on `team.updated`
  events (and every 35 s). Clicking a part, a flow, or *All flows (68)* opens a detail drawer.
- **Standalone** — open `panel/index.html` in any browser. It falls back to an embedded demo
  snapshot, so the whole dashboard still renders with no Orca runtime.

## Layout

```
orca-plugin.json        manifest (panel + worker, read capabilities)
panel/index.html        the complete UI: inline CSS, SVG wiring, interactions
src/snapshot.ts         demo run data and the shared types
src/worker.ts           serves team.data, posts team.updated
src/protocol.ts         panel <-> worker request/event contract
src/worker.test.ts      worker test (orca/testing)
src/panel.check.ts      panel check scenario
```

## Data contract

`team.data` returns the `Snapshot` from `src/snapshot.ts` plus `generatedAt`. Times are relative
offsets (`agoMs`) so the panel can tick them live. To wire a real team runtime, replace
`SNAPSHOT` in `src/worker.ts` with your own source — keep the shape and the panel does the rest:

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

## Develop

```sh
orca plugin validate .
orca plugin test .
orca plugin check .
orca plugin dev watch .    # loads the folder into Orca and prints reloads/logs; Ctrl-C unloads
orca plugin open local.team-mode-panel --panel team-run
```

The plugin needs approval because it runs a trusted worker and subscribes to agent/workspace
status changes. Grant it yourself in Orca's approval prompt.

Useful commands:

```sh
orca plugin dev request . team.data --json    # inspect the live snapshot
orca plugin logs local.team-mode-panel --json
orca plugin inspect . --json                  # contributions and access
```

## Standalone preview

```sh
# just open the file in a browser
start panel/index.html          # Windows
open panel/index.html           # macOS
xdg-open panel/index.html       # Linux
```

## License

MIT — see [LICENSE](LICENSE).
