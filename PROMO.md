# Promo kit · Octopus

## Links

- **Repo:** https://github.com/SteinLabz/octopus
- **Orca plugin directory:** https://orca.dev/plugins/SteinLabz/octopus
- **Install URL (pinned):** `https://github.com/steinlabz/octopus#v1.3.0`
- **License:** MIT · **Requires:** Orca 1.4.260+

## Install

```sh
orca plugin install SteinLabz/octopus --json
```

Or in Orca: **Settings → Plugins → Add plugin → From a Git URL…** and paste the install URL
above. Approve `agent:read` and `workspace:read`; that is all it asks for.

## Brief

**EN** — Octopus is a read-only sidebar panel for Orca that turns the workspace you are focused
on into one screen: which agents are working, which worktrees exist, what needs your review, and
how activity flows between them. It reads Orca directly — no API key, no config file, no network
calls. When no workspace is focused it clearly says **DEMO** instead of pretending the data is
real. Focus a workspace, open an agent, refresh, and you get **LIVE** data.

**ES** — Octopus es un panel lateral de solo lectura para Orca que convierte el workspace que
tienes enfocado en una sola pantalla: qué agentes están trabajando, qué worktrees existen, qué
necesita tu revisión y cómo fluye la actividad entre ellos. Lee Orca directamente: sin API key,
sin configuración y sin llamadas de red. Si no hay un workspace enfocado, muestra **DEMO** en vez
de fingir que los datos son reales.

## Four screenshots

| # | Promo image | What it shows |
| --- | --- | --- |
| 1 | [01-live-dashboard.png](assets/promo/01-live-dashboard.png) | Real focused workspace in Orca: LIVE badge, agent, branch, worktrees, approvals and flows. |
| 2 | [02-full-dashboard.png](assets/promo/02-full-dashboard.png) | Full dashboard: members, the five parts, the Data Flow map and Latest flows. |
| 3 | [03-part-detail.png](assets/promo/03-part-detail.png) | Clicking a part opens a detail drawer with the underlying records. |
| 4 | [04-built-in-guide.png](assets/promo/04-built-in-guide.png) | The built-in **?** guide: usage, LIVE/DEMO, configuration and troubleshooting. |

Raw URLs for embedding:

```text
https://raw.githubusercontent.com/SteinLabz/octopus/main/assets/promo/01-live-dashboard.png
https://raw.githubusercontent.com/SteinLabz/octopus/main/assets/promo/02-full-dashboard.png
https://raw.githubusercontent.com/SteinLabz/octopus/main/assets/promo/03-part-detail.png
https://raw.githubusercontent.com/SteinLabz/octopus/main/assets/promo/04-built-in-guide.png
```

## Suggested X thread (EN)

**1/5**
> I built a small Orca plugin called Octopus.
>
> It turns the workspace you're focused on into one screen: which agents are working, which
> worktrees exist, what needs your review, and how activity flows between them.
>
> Read-only. No API key. No config. Open source (MIT). 🧵
>
> https://github.com/SteinLabz/octopus

**2/5 — image 01**
> Real data, not a mockup.
>
> It reads Orca directly: `workspace.readContext`, `workspace.list` and `agents.list`. Focus a
> workspace, open an agent, press Refresh — the badge turns LIVE green.
>
> No workspace focused? It says DEMO explicitly.

**3/5 — image 02**
> Five parts, one glance:
> · Brief → workspace, branch, terminals
> · Task board → worktrees and states
> · Plan approval → blocked agents + unread
> · Team board → agents and tasks
> · File claims → branches held

**4/5 — image 03**
> Every part and every flow is clickable. Tap it and the drawer shows the real records behind
> the card. "All flows (N)" gives you the whole snapshot.

**5/5 — image 04**
> There's a built-in **?** guide so users never guess: what it does, how to get LIVE data, how to
> configure it (focus decides the source; you can also ask an agent), and what to do if it still
> says DEMO.
>
> Install: `orca plugin install SteinLabz/octopus`
>
> Directory: https://orca.dev/plugins/SteinLabz/octopus
>
> #Orca #OpenSource #DevTools #AIAgents

## Suggested single post (ES)

> Octopus es un plugin open source para Orca que te muestra, en un solo panel, tus agentes
> reales, tus worktrees, qué necesita tu revisión y los flujos entre ellos. Sin API key, sin
> configuración, solo lectura. Si no hay workspace enfocado, dice DEMO — nunca te engaña.
>
> https://github.com/SteinLabz/octopus
>
> #Orca #OpenSource #AgentesIA
