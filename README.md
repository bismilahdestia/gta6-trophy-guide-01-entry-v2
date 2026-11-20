# gta6-trophy-guide-01-entry-v2

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/bismilahdestia/gta6-trophy-guide-01-entry-v2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/bismilahdestia/gta6-trophy-guide-01-entry-v2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Atlas — an offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden), built for the [make.fun GTA 6 Trophy Guide bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **Every trophy, with its official name, description and grade** exactly as PlayStation publishes them (Exophase / PSNProfiles, 20 Nov 2026).
- **A guide in our own words for each trophy** — what to do, where and how, when it can be missed — with its sources named beside it. Where a method is not confirmed, the guide says what the official description implies instead of inventing a location.
- **A tracker**: tick trophies off, progress saves in the browser (localStorage), export to a file and import it back; per-trophy progress counters for the counted trophies (18 meditation spots, 250 stunts, 100 vehicles and more); filters by kind (story, missable, watch, collectibles, activities, world, online, secret) and by grade and status; a spoiler setting that hides story trophy names and descriptions until they are earned.
- **A roadmap to the platinum** in three stages (story → 100% completion → clean-up), with the 100% checklist numbers and the warnings that protect a run.
- **Missables & Next Up**: the set's one missable trophy and its seven watch-list trophies, each with what can go wrong; and a next-up list that puts the story first, the missable second, then the nearest progress counters.

## Run it

Static files, no build step, no network requests at runtime:

```sh
node serve.ts
# open http://localhost:8080
```

Or open `app/index.html` from any static file server with `app/` at its root. Add `?demo=1` to load a demo save (9 trophies earned, counters part-way) instead of your own save.

## Layout

- `app/index.html` — the page shell
- `app/style.css` — the look (original dark design, system fonts, no external assets)
- `app/app.js` — boot: loads the data, owns the save, wires the tabs, filters, export/import and hash routes
- `app/tracker.js` — the checklist UI and the trophy detail panel (guide, cited steps, sources, personal note)
- `app/roadmap.js` — the platinum roadmap, the missables view and the next-up list
- `app/data/trophies.json` — the 55 trophies with guides, steps, counts and sources
- `main.ts` — the make.fun entrypoint: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — real renders of the guide in a browser

## Screenshots

Real renders of the guide in desktop Chrome (1280×800, taken headlessly):

1. `1-cover.jpg` — the checklist with the missable trophy's guide open, cited steps and sources beside it
2. `2-roadmap.jpg` — the roadmap to the platinum
3. `3-missable.jpg` — the missables and watch list
4. `4-tracker.jpg` — the tracker at work: spoiler shield off, filters and progress counters

## Sources

- [Exophase — GTA 6 trophies](https://www.exophase.com/game/grand-theft-auto-vi-ps5/trophies/) (official names/descriptions/grades)
- [PSNProfiles — GTA 6 trophies](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi-ps5/trophies/) (official names/descriptions/grades)
- [PowerPyx — GTA 6 Trophy Guide & Roadmap](https://www.powerpyx.com/gta-6-trophy-guide-roadmap/)
- [Planet GTA 6 — GTA 6 Trophies](https://www.planetgta6.com/en/gta-6-trophies/)

Fan-made guide, not affiliated with Rockstar Games. It uses no Rockstar logo, artwork or screenshots.

## License

MIT — see [LICENSE](LICENSE).

---

<sub>Entered on [make.fun](https://make.fun/?ref=ej1cw7nv&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
