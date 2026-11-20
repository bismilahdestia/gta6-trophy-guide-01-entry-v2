// Leonida Trophy Atlas — the entrypoint (Node 22, standard library only).
// The guide is plain static files in app/ (ES modules, CSS, JSON, no build
// step) that a browser opens at app/index.html, offline: it loads nothing
// over the network, and its trophy list and guides are app/data/trophies.json.
// This program hands the guide in: it copies app/ and screenshots/ from
// beside this file to /output and writes /output/dossier.json, the summary
// the judge reads (the screenshots, the first load's files and bytes, and
// the source), with the vendored make.fun library. Leave
// vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to
// be byte for byte what its own copy writes.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy the guide and its screenshots, then build the dossier from the
// result — the dossier is always written from what was just copied, so a
// run never reports on a stale tree.
function handIn() {
  mkdirSync(out, { recursive: true });
  cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
  const shots = join(here, 'screenshots');
  mkdirSync(join(out, 'screenshots'), { recursive: true });
  if (existsSync(shots)) cpSync(shots, join(out, 'screenshots'), { recursive: true });
  const shotCount = readdirSync(join(out, 'screenshots')).filter((f) => !f.startsWith('.')).length;
  if (shotCount === 0) console.error('warning: no screenshots in screenshots/ — the judge sees the guide through them');

  // The scorer's own caps: only text_max_bytes shapes the bytes; the others
  // refuse an entry the scorer would refuse (more than 4 screenshots or one
  // over 256 KiB; more than 993 files and directories in app/ or 48 MiB of
  // app files: app/ counts beside /output's own 1000-entry cap, its
  // screenshots/ and dossier.json).
  writeFileSync(
    join(out, 'dossier.json'),
    buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
  );
  console.error(`handed in: app/ + ${shotCount} screenshot(s) -> ${out}/dossier.json`);
}

handIn();
