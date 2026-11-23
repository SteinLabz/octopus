# Octopus

A sidebar panel for [Orca](https://github.com/stablyai/orca) that turns the workspace you are
focused on into one screen: **who is working, which worktrees exist, what needs your review, and
how activity flows between them.**

It reads Orca directly (`workspace.readContext`, `workspace.list`, `agents.list` and live agent /
workspace events). No API key, no account, no config file, no network calls.

- Directory page: https://orca.dev/plugins/SteinLabz/octopus
- Promo kit (links, brief, 4 screenshots, X thread): [PROMO.md](PROMO.md)
- License: MIT

---

## 1. What is it for?

When several agents and worktrees are open, it is easy to lose track of the state of the work.
Octopus gives you a single, glanceable answer to:

- Which agents are working, blocked, waiting or already done.
- Which worktrees exist, which ones are active and which have messages waiting for you.
- What the most recent activity was and which part of the work it touched.
- Where a detail lives: task, plan, board post or branch.

It is a **read-only monitor**. Octopus never launches agents, changes files, sends messages or
makes decisions for you.

## 2. What you can do with it

- **See your real agents** in the focused workspace, with their CLI, state and dispatched task.
- **Spot what needs you**: blocked agents and worktrees with unread messages are collected in
  *Plan approval*, and the header badge turns on.
- **See every worktree** with its Git branch, state and unread flag in *Task board* and
  *File claims*.
- **Follow a live Data Flow map**: coloured lines connect each actor to the part it last wrote
  into; a moving dot means the flow happened in the last 30 seconds.
- **Open details**: click any part (*Brief*, *Task board*, *Plan approval*, *Team board*,
  *File claims*), any item in *Latest flows*, or **All flows** to see the underlying records in a
  drawer.
- **Refresh manually** at any time. The panel also refreshes itself when an agent changes state
  or the focused workspace changes.
- **Read the built-in guide**: press the **?** button in the header. It explains every part, the
  LIVE/DEMO indicator, the four steps to real data and the configuration options.

## 3. Quick start: real data, not a mockup

Octopus always tells you which data you are looking at:

| Indicator | Meaning |
| --- | --- |
| **LIVE**, green dot beside *DATA FLOW* | Real data from your focused Orca workspace. The title is your workspace name and the badge shows its branch. |
| **DEMO**, amber dot + banner | Bundled example run. Nothing is being read from your machine yet. |

To go from DEMO to LIVE:

1. Open a **workspace** in Orca — a Git worktree under one of your projects, or a folder
   workspace. Settings and full-page tabs do not count.
2. Have at least one **agent** open in it (a chat or a terminal).
3. **Click that workspace in Orca's left sidebar.** This is the step people miss: Octopus follows
   the *focused* workspace, not the most recently used one.
4. Press **Refresh** in Octopus. The badge turns green and the header shows your workspace.

Nothing else is needed: no API key, no config file, no extra permission. The two permissions you
already approved on install (`agent:read` and `workspace:read`) are enough.

## 4. How to read the panel

**Header** — workspace name, its Git branch, number of agents, and the "needs approval" badge
when something is waiting on you.

**Fuente de datos** — says whether the source is your live workspace or the demo snapshot.

**Members** — one card per agent in the focused workspace: name, CLI, state and current task.

**Data Flow** — the main map:

- **Left:** actors (your agents).
- **Right:** the five parts of the collaboration.
- **Lines:** the latest flow from that actor into that part, coloured per actor.
- **Moving dot:** that flow happened within the last 30 seconds.

**The five parts**

| Part | What it shows with real data |
| --- | --- |
| Brief | Focused workspace name, Git branch and terminal count. |
| Task board | All worktrees with their state and unread flag, plus an activity bar. |
| Plan approval | Blocked agents and worktrees with unread messages — what Orca marks as "needs you". |
| Team board | Agents with their live state and dispatched task. |
| File claims | The Git branch held by each worktree. |

**Latest flows** — the newest signals, newest first, coloured by the part they touched. Click one
to see its message and open the related part.

**All flows (N)** — every recorded signal for this snapshot, in one drawer.

## 5. Configuration

**There is no settings page. Focus is the configuration.** Octopus always reads the workspace
that Orca currently has in focus, so changing what you look at is done from Orca's sidebar.

- **Permissions** — Settings → Plugins → Octopus. It asks only for `agent:read` and
  `workspace:read`. If either is disabled, the panel falls back to DEMO.
- **With an agent** — you can ask the agent that is already working in Orca, for example:

  > Focus the `news` workspace in Orca, open an agent in it, then refresh the Octopus panel.

  Octopus will pick up that workspace on the next refresh or event.
- **Without an agent** — click the workspace in Orca's left sidebar, open an agent there, press
  **Refresh** in Octopus.
- **Advanced / developers** — the mapping from Orca data to the panel lives in `src/live.ts`.
  Replace `buildLive()` with another source and the HTML panel does not change. In a development
  folder the plugin reloads on save.
- **Installed vs development copy** — the installed plugin is `steinlabz.octopus`; a local
  development folder appears as `local.octopus` and overrides the installed copy with the same key.

## 6. Install and commands

From the directory page, copy the install URL, or install from GitHub:

```sh
orca plugin install SteinLabz/octopus --json
```

Useful commands:

```sh
orca plugin open local.octopus --panel team-run    # open the panel
orca plugin dev request . team.data --json         # inspect the snapshot the panel receives
orca plugin logs local.octopus --json              # check for read errors
orca plugin list --json                            # status, version, permissions
```

Standalone preview: open `panel/index.html` in any browser. Without Orca it shows the bundled DEMO
snapshot, including the same amber banner.

## 7. Troubleshooting

| Symptom | What to do |
| --- | --- |
| Still shows DEMO | Focus a workspace in Orca's sidebar, open an agent in it, press Refresh. |
| Title is "Workspace de Orca" | No workspace is focused; click one in the sidebar. |
| Members says "sin agentes" | Open a chat or terminal agent in the focused workspace. |
| LIVE but stale | Press Refresh; the panel also reloads on `agent.status.changed` and `workspace.changed`. |
| Read error | Run `orca plugin logs local.octopus --json`. |
| Unknown method warning | Update Orca to 1.4.260+ (the minimum this version supports). |

## 8. Reference (developers)

`team.data` returns a `Snapshot` plus `generatedAt`. In live mode `src/live.ts` fills it from
Orca; without a workspace it falls back to `SNAPSHOT` from `src/snapshot.ts`. Times are relative
offsets (`agoMs`) so the panel can tick them live.

```ts
{
  source: 'live' | 'demo',
  title, team, active, round, plansNeedApproval,
  run, lead, language, created, lastChangeMs, runningForMs,
  whyIntro, why,
  members:  [{ name, meta, status, icon, color }],
  actors:   [{ name, sub, state, color, icon }],
  parts:    [{ id, name, color, icon, meta, last, agoMs, barPct?, dot?, detail, bullets }],
  wiring:   { '<actor name>': ['brief', 'board', 'approval', 'teamboard', 'claims'] },
  hot:      ['<actor>><part>', ...],   // flows with an animated dot (last 30 s)
  flows:    [{ part, actor, text, agoMs, detail? }],
  allFlows: number
}
```

Part ids: `brief`, `board`, `approval`, `teamboard`, `claims`.

```
orca-plugin.json        manifest (panel, worker, metadata, cover/screenshot)
assets/                 icon, cover and screenshot for the directory page
panel/index.html        complete UI, help guide, demo fallback
src/snapshot.ts         fallback demo snapshot and shared types
src/live.ts             maps the real Orca workspace into the Snapshot
src/worker.ts           serves team.data, posts team.updated
src/protocol.ts         panel <-> worker contract
src/worker.test.ts      worker tests (orca/testing)
src/panel.check.ts      panel check scenario
```

```sh
orca plugin validate .
orca plugin test .
orca plugin check .
orca plugin dev watch .
```

Release: bump `version` in `orca-plugin.json`, commit, then tag and push `vX.Y.Z`. The directory
indexer runs every 30 minutes.

## License

MIT — see [LICENSE](LICENSE).
