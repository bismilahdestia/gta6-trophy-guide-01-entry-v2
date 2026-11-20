// Leonida Trophy Atlas — the platinum roadmap, the missables view and Next Up.
const STAGES = [
  {
    n: 1,
    title: 'Stage 1 — Story',
    text: 'Play Chapters 1 to 4 and the final mission, in order. Keep a manual save at the start of each chapter: the set\u2019s only missable trophy lives here, and a missed meditation spot may not come back.',
    ids: null,
  },
  {
    n: 2,
    title: 'Stage 2 — 100% Completion',
    text: 'Work the checklist that feeds the 100% counter: the counts are 250 stunts, 42 shooting-range challenges, 14 drone races, 20 races, 50 challenges, 9 activity types, 3 card sets, 100 WAiNK locations, 100 vehicles, 52 areas, 8 garages, 10 Scooter Bros vehicles, $250,000 laundered and $100,000 spent.',
    ids: null,
  },
  {
    n: 3,
    title: 'Stage 3 — Clean-up',
    text: 'Finish the 8 stranger strands, the watch-list robberies and the world feats. Nothing here is missable — take it at your own pace — and the platinum pops when the last one lands.',
    ids: null,
  },
];

function liFor(t, state) {
  const li = document.createElement('li');
  if (state.earned.includes(t.id)) li.className = 'done';
  li.textContent = `${t.name} — ${t.grade}${t.count ? ` (${t.count.total} ${t.count.unit})` : ''}`;
  return li;
}

export function renderRoadmap(trophies, state) {
  const body = document.getElementById('roadmapBody');
  body.replaceChildren();
  for (const stage of STAGES) {
    const box = document.createElement('div');
    box.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = stage.title;
    const p = document.createElement('p');
    p.textContent = stage.text;
    const ul = document.createElement('ul');
    const items = trophies.filter((t) => t.stage === stage.n);
    for (const t of items) ul.append(liFor(t, state));
    const done = items.filter((t) => state.earned.includes(t.id)).length;
    const sum = document.createElement('p');
    sum.className = 'stage-sum';
    sum.textContent = `${done} of ${items.length} earned in this stage.`;
    box.append(h, p, ul, sum);
    body.append(box);
  }
}

export function renderMissables(trophies, state, { onSelect }) {
  const body = document.getElementById('missablesBody');
  body.replaceChildren();
  const missable = trophies.filter((t) => t.missable);
  const watch = trophies.filter((t) => t.kind.includes('watch'));
  for (const t of [...missable, ...watch]) {
    const card = document.createElement('div');
    card.className = 'miss-card';
    const head = document.createElement('div');
    head.className = 'mhead';
    const h = document.createElement('h3');
    h.textContent = t.name;
    const flag = document.createElement('span');
    flag.className = `flag ${t.missable ? 'missable' : 'watch'}`;
    flag.textContent = t.missable ? 'Missable' : 'Watch';
    const grade = document.createElement('span');
    grade.className = `grade ${t.grade}`;
    grade.textContent = t.grade;
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'reveal-btn';
    open.textContent = 'Open in Tracker';
    open.addEventListener('click', () => onSelect(t.id));
    head.append(h, flag, grade, open);
    card.append(head);
    const p = document.createElement('p');
    p.textContent = t.missable ? (t.missableNote ?? t.guide) : (t.watch ?? t.guide);
    card.append(p);
    const steps = document.createElement('ol');
    steps.className = 'steps';
    for (const s of t.steps) {
      const li = document.createElement('li');
      li.textContent = s;
      steps.append(li);
    }
    card.append(steps);
    body.append(card);
  }
}

export function renderNext(trophies, state, { onSelect }) {
  const body = document.getElementById('nextBody');
  body.replaceChildren();
  const earned = new Set(state.earned);
  const picks = [];
  const story = trophies.filter((t) => t.stage === 1 && !earned.has(t.id));
  if (story.length) picks.push([story[0], 'Story first — the chapter order keeps the platinum safe.']);
  const miss = trophies.find((t) => t.missable && !earned.has(t.id));
  if (miss) picks.push([miss, 'Before the story moves on — the set\u2019s only missable trophy.']);
  const counted = trophies
    .filter((t) => t.count && !earned.has(t.id) && (state.counters[t.id] ?? 0) > 0)
    .sort((a, b) => (state.counters[b.id] ?? 0) / b.count.total - (state.counters[a.id] ?? 0) / a.count.total);
  for (const t of counted.slice(0, 3)) {
    picks.push([t, `Closest to done — ${state.counters[t.id] ?? 0}/${t.count.total} ${t.count.unit} already logged.`]);
  }
  const rest = trophies.filter((t) => !earned.has(t.id) && !picks.some(([p]) => p.id === t.id));
  for (const t of rest.slice(0, Math.max(0, 8 - picks.length))) {
    picks.push([t, `Stage ${t.stage} — ${t.kind.map((k) => k[0].toUpperCase() + k.slice(1)).join(', ')}.`]);
  }
  for (const [t, why] of picks.slice(0, 8)) {
    const li = document.createElement('li');
    const b = document.createElement('strong');
    b.textContent = t.name;
    const span = document.createElement('span');
    span.className = 'why';
    span.textContent = ` — ${t.description} ${why}`;
    li.append(b, span);
    li.addEventListener('click', () => onSelect(t.id));
    li.style.cursor = 'pointer';
    body.append(li);
  }
}
