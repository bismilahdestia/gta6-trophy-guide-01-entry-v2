// Leonida Trophy Atlas — boot, state, routing, export/import.
// The tracker UI lives in tracker.js; the roadmap, missables and next-up
// views live in roadmap.js. This file owns the save and the page.
import { renderDetail, renderList } from './tracker.js';
import { renderMissables, renderNext, renderRoadmap } from './roadmap.js';

const KEY = 'leonida-trophy-atlas-v2';
const POINTS = { platinum: 300, gold: 90, silver: 30, bronze: 15 };
const params = new URLSearchParams(location.search);
const DEMO = params.get('demo') === '1';

// A built-in demo save for screenshots: 9 earned, counters part-way.
// It never touches localStorage and shows a DEMO SAVE chip.
const DEMO_SAVE = {
  earned: [2, 3, 8, 9, 10, 16, 21, 30, 35],
  counters: { 28: 6, 30: 3, 31: 24, 32: 12, 35: 57 },
  notes: { 28: '6 spots logged so far — keep a manual save per chapter until all 18 are checked.' },
  spoiler: true,
  selected: 28,
};

export function loadState() {
  if (DEMO) return structuredClone(DEMO_SAVE);
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (raw && Array.isArray(raw.earned)) {
      return {
        earned: raw.earned,
        counters: raw.counters ?? {},
        notes: raw.notes ?? {},
        spoiler: raw.spoiler !== false,
        selected: raw.selected ?? 1,
      };
    }
  } catch { /* a corrupt save starts fresh */ }
  return { earned: [], counters: {}, notes: {}, spoiler: true, selected: 1 };
}

export function saveState(state) {
  if (DEMO) return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function pointsFor(trophies, earned) {
  return earned.reduce((sum, id) => {
    const t = trophies.find((x) => x.id === id);
    return sum + (t ? POINTS[t.grade] : 0);
  }, 0);
}

export function gradeCounts(trophies, earned) {
  const out = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of trophies) {
    out[t.grade][1] += 1;
    if (earned.includes(t.id)) out[t.grade][0] += 1;
  }
  return out;
}

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const sources = doc.sources;
const state = loadState();
window.__atlas = { trophies, sources, state };

const KIND_LABELS = [
  ['all', 'All'], ['story', 'Story'], ['missable', 'Missable'], ['watch', 'Watch'],
  ['collectibles', 'Collectibles'], ['activities', 'Activities'], ['world', 'World'],
  ['online', 'Online'], ['secret', 'Secret'],
];

let kindFilter = 'all';
let gradeFilter = 'all';
let statusFilter = 'any';
let query = '';

function kindCount(kind) {
  if (kind === 'all') return trophies.length;
  if (kind === 'secret') return trophies.filter((t) => t.hidden).length;
  return trophies.filter((t) => t.kind.includes(kind)).length;
}

function filteredTrophies() {
  const q = query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (kindFilter === 'secret' ? !t.hidden : kindFilter !== 'all' && !t.kind.includes(kindFilter)) return false;
    if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false;
    if (statusFilter === 'earned' && !state.earned.includes(t.id)) return false;
    if (statusFilter === 'todo' && state.earned.includes(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderStats() {
  const earned = state.earned.length;
  document.getElementById('progressText').textContent = `${earned} / ${trophies.length} · ${Math.round((earned / trophies.length) * 100)}%`;
  document.getElementById('progressBar').style.width = `${(earned / trophies.length) * 100}%`;
  document.getElementById('psnPoints').textContent = `${pointsFor(trophies, state.earned)} / 1350 pts`;
  const gc = gradeCounts(trophies, state.earned);
  document.getElementById('countPlat').textContent = `${gc.platinum[0]}/${gc.platinum[1]}`;
  document.getElementById('countGold').textContent = `${gc.gold[0]}/${gc.gold[1]}`;
  document.getElementById('countSilver').textContent = `${gc.silver[0]}/${gc.silver[1]}`;
  document.getElementById('countBronze').textContent = `${gc.bronze[0]}/${gc.bronze[1]}`;
  document.getElementById('demoChip').hidden = !DEMO;
  document.getElementById('noDemo').hidden = DEMO;
  const sb = document.getElementById('spoilerBtn');
  sb.textContent = `Spoiler Shield · ${trophies.filter((t) => t.hidden).length} Hidden`;
  sb.classList.toggle('on', state.spoiler);
}

function renderChips() {
  const box = document.getElementById('kindChips');
  box.replaceChildren();
  for (const [kind, label] of KIND_LABELS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (kindFilter === kind ? ' active' : '');
    b.textContent = `${label} ${kindCount(kind)}`;
    b.addEventListener('click', () => { kindFilter = kind; renderAll(); });
    box.append(b);
  }
}

export function renderAll() {
  renderStats();
  renderChips();
  renderList(trophies, state, filteredTrophies(), {
    onSelect: (id) => { state.selected = id; saveState(state); renderAll(); },
    onToggle: (id) => {
      const i = state.earned.indexOf(id);
      if (i === -1) state.earned.push(id); else state.earned.splice(i, 1);
      saveState(state); renderAll();
    },
  });
  renderDetail(trophies, sources, state, {
    onToggle: (id) => {
      const i = state.earned.indexOf(id);
      if (i === -1) state.earned.push(id); else state.earned.splice(i, 1);
      saveState(state); renderAll();
    },
    onCounter: (id, value) => { state.counters[id] = value; saveState(state); renderAll(); },
    onNote: (id, text) => { state.notes[id] = text; saveState(state); },
  });
  renderRoadmap(trophies, state);
  renderMissables(trophies, state, {
    onSelect: (id) => { state.selected = id; saveState(state); setView('tracker'); renderAll(); },
  });
  renderNext(trophies, state, {
    onSelect: (id) => { state.selected = id; saveState(state); setView('tracker'); renderAll(); },
  });
}

export function setView(name) {
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.view === name));
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${name}`));
}

function route() {
  const hash = location.hash.replace(/^#\/?/, '');
  const [view, arg] = hash.split('/');
  if (view === 'trophy' && arg) {
    const id = Number(arg);
    if (trophies.some((t) => t.id === id)) state.selected = id;
    setView('tracker');
  } else if (['tracker', 'roadmap', 'missables', 'next'].includes(view)) {
    setView(view);
  } else {
    setView('tracker');
  }
}

document.querySelectorAll('#tabs button').forEach((b) => {
  b.addEventListener('click', () => { location.hash = `#/${b.dataset.view}`; });
});
document.getElementById('spoilerBtn').addEventListener('click', () => {
  state.spoiler = !state.spoiler; saveState(state); renderAll();
});
document.getElementById('search').addEventListener('input', (e) => { query = e.target.value; renderAll(); });
document.getElementById('gradeFilter').addEventListener('change', (e) => { gradeFilter = e.target.value; renderAll(); });
document.getElementById('statusFilter').addEventListener('change', (e) => { statusFilter = e.target.value; renderAll(); });

function download(filename, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

document.getElementById('exportBtn').addEventListener('click', () => {
  download('trophy-progress.json', JSON.stringify({
    game: 'Grand Theft Auto VI', platform: 'PlayStation 5',
    earned: state.earned, counters: state.counters, notes: state.notes,
    exported: new Date().toISOString(),
  }, null, 2));
});
document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (Array.isArray(data.earned)) {
      state.earned = data.earned.filter((id) => trophies.some((t) => t.id === id));
      state.counters = data.counters ?? {};
      state.notes = data.notes ?? {};
      saveState(state); renderAll();
    }
  } catch { alert('That file is not a valid progress export.'); }
  e.target.value = '';
});
document.getElementById('backupBtn').addEventListener('click', () => {
  download('trophy-progress-backup.json', JSON.stringify({
    game: 'Grand Theft Auto VI', platform: 'PlayStation 5',
    earned: state.earned, counters: state.counters, notes: state.notes,
    exported: new Date().toISOString(),
  }, null, 2));
});

window.addEventListener('hashchange', () => { route(); renderAll(); });
route();
renderAll();
// Screenshots wait for this flag before shooting.
requestAnimationFrame(() => setTimeout(() => { window.__shotReady = true; }, 120));
