// Leonida Trophy Atlas — the checklist and the trophy detail panel.
const revealed = new Set();

const KIND_NAMES = {
  story: 'Story', missable: 'Missable', watch: 'Watch',
  collectibles: 'Collectibles', activities: 'Activities', world: 'World', online: 'Online',
};

function kindLine(t) {
  const kinds = t.kind.map((k) => KIND_NAMES[k] ?? k).join(' · ');
  return `${kinds} · Stage ${t.stage}`;
}

function isMasked(t, state) {
  return t.hidden && state.spoiler && !state.earned.includes(t.id) && !revealed.has(t.id);
}

function gradeChip(grade) {
  const s = document.createElement('span');
  s.className = `grade ${grade}`;
  s.textContent = grade;
  return s;
}

export function renderList(trophies, state, filtered, { onSelect, onToggle }) {
  const list = document.getElementById('trophyList');
  document.getElementById('listCount').textContent = `${filtered.length} trophies`;
  list.replaceChildren();
  if (!filtered.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No trophies match these filters.';
    list.append(li);
    return;
  }
  for (const t of filtered) {
    const li = document.createElement('li');
    const earned = state.earned.includes(t.id);
    li.className = (state.selected === t.id ? 'selected' : '') + (earned ? ' earned' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned;
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('click', (e) => { e.stopPropagation(); onToggle(t.id); });
    li.append(box);
    const row = document.createElement('div');
    row.className = 'trow';
    const name = document.createElement('div');
    name.className = 'tname';
    name.textContent = isMasked(t, state) ? 'Hidden Trophy' : t.name;
    row.append(name);
    const kind = document.createElement('div');
    kind.className = 'tkind';
    kind.textContent = isMasked(t, state) ? 'Spoiler Shielded' : kindLine(t);
    row.append(kind);
    const meta = document.createElement('div');
    meta.className = 'tmeta';
    if (t.missable) {
      const f = document.createElement('span');
      f.className = 'flag missable';
      f.textContent = 'Missable';
      meta.append(f);
    } else if (t.kind.includes('watch')) {
      const f = document.createElement('span');
      f.className = 'flag watch';
      f.textContent = 'Watch';
      meta.append(f);
    }
    if (t.hidden && !state.earned.includes(t.id)) {
      const f = document.createElement('span');
      f.className = 'flag secret';
      f.textContent = 'Secret';
      meta.append(f);
    }
    if (t.count) {
      const c = document.createElement('span');
      c.className = 'tcount';
      c.textContent = `${state.counters[t.id] ?? 0}/${t.count.total}`;
      meta.append(c);
    }
    meta.append(gradeChip(t.grade));
    if (isMasked(t, state)) {
      const r = document.createElement('button');
      r.type = 'button';
      r.className = 'reveal-btn';
      r.textContent = 'Reveal';
      r.addEventListener('click', (e) => { e.stopPropagation(); revealed.add(t.id); onSelect(t.id); });
      meta.append(r);
    }
    row.append(meta);
    li.append(row);
    li.addEventListener('click', () => onSelect(t.id));
    list.append(li);
  }
}

function citeSteps(ol, steps) {
  for (const step of steps) {
    const li = document.createElement('li');
    for (const part of step.split(/(\[\d+\])/g)) {
      const m = part.match(/^\[(\d+)\]$/);
      if (m) {
        const s = document.createElement('span');
        s.className = 'cite';
        s.textContent = part;
        li.append(s);
      } else if (part) {
        li.append(document.createTextNode(part));
      }
    }
    ol.append(li);
  }
}

function section(title) {
  const h = document.createElement('h3');
  h.textContent = title;
  return h;
}

export function renderDetail(trophies, sources, state, { onToggle, onCounter, onNote }) {
  const panel = document.getElementById('detail');
  panel.replaceChildren();
  const t = trophies.find((x) => x.id === state.selected) ?? trophies[0];
  if (!t) return;
  const earned = state.earned.includes(t.id);
  const masked = isMasked(t, state);

  const crumb = document.createElement('div');
  crumb.className = 'crumb';
  crumb.textContent = `Trophy Guide / #${String(t.id).padStart(2, '0')}`;
  panel.append(crumb);

  const h = document.createElement('h2');
  h.textContent = masked ? 'Hidden Trophy' : t.name;
  panel.append(h);

  const chips = document.createElement('div');
  chips.className = 'chips-row';
  chips.append(gradeChip(t.grade));
  if (t.missable) {
    const f = document.createElement('span');
    f.className = 'flag missable';
    f.textContent = 'Missable';
    chips.append(f);
  }
  if (!masked) {
    const stage = document.createElement('span');
    stage.className = 'flag secret';
    stage.textContent = `Stage ${t.stage}`;
    chips.append(stage);
  }
  const mark = document.createElement('button');
  mark.type = 'button';
  mark.className = 'mark-btn' + (earned ? ' earned' : '');
  mark.textContent = earned ? '✓ Earned' : 'Mark Earned';
  mark.addEventListener('click', () => onToggle(t.id));
  chips.append(mark);
  panel.append(chips);

  if (masked) {
    const p = document.createElement('p');
    p.textContent = 'Spoiler Shielded — this trophy is hidden on PlayStation until earned. Its name, description and guide stay masked so the story stays unspoiled.';
    panel.append(p);
    const r = document.createElement('button');
    r.type = 'button';
    r.className = 'reveal-btn';
    r.textContent = 'Reveal this trophy';
    r.addEventListener('click', () => { revealed.add(t.id); renderDetail(trophies, sources, state, { onToggle, onCounter, onNote }); });
    panel.append(r);
    return;
  }

  panel.append(section('Official PS5 Description'));
  const desc = document.createElement('p');
  desc.textContent = t.description;
  panel.append(desc);

  if (t.count) {
    panel.append(section('PSN Progress Counter'));
    const counter = document.createElement('div');
    counter.className = 'counter';
    const value = state.counters[t.id] ?? 0;
    const minus = document.createElement('button');
    minus.type = 'button';
    minus.textContent = '−';
    minus.setAttribute('aria-label', 'Decrease counter');
    minus.addEventListener('click', () => onCounter(t.id, Math.max(0, value - 1)));
    const val = document.createElement('strong');
    val.textContent = `${value} / ${t.count.total}`;
    const plus = document.createElement('button');
    plus.type = 'button';
    plus.textContent = '+';
    plus.setAttribute('aria-label', 'Increase counter');
    plus.addEventListener('click', () => onCounter(t.id, Math.min(t.count.total, value + 1)));
    const unit = document.createElement('span');
    unit.className = 'unit';
    unit.textContent = `${t.count.unit} · manual tally`;
    counter.append(minus, val, plus, unit);
    panel.append(counter);
  }

  if (t.missable && t.missableNote) {
    const warn = document.createElement('div');
    warn.className = 'warn';
    warn.append(section('Missable: When & Why'));
    const p = document.createElement('p');
    p.textContent = t.missableNote;
    warn.append(p);
    panel.append(warn);
  } else if (t.watch) {
    const warn = document.createElement('div');
    warn.className = 'warn';
    warn.append(section('Watch: What Can Go Wrong'));
    const p = document.createElement('p');
    p.textContent = t.watch;
    warn.append(p);
    panel.append(warn);
  }

  panel.append(section('How to Unlock'));
  const ol = document.createElement('ol');
  ol.className = 'steps';
  citeSteps(ol, t.steps);
  panel.append(ol);

  panel.append(section('Strategy & Location'));
  const guide = document.createElement('p');
  guide.textContent = t.guide;
  panel.append(guide);

  panel.append(section('Cited Sources'));
  const grid = document.createElement('div');
  grid.className = 'sources';
  t.sources.forEach((key, i) => {
    const s = sources[key];
    if (!s) return;
    const box = document.createElement('div');
    box.className = 'source';
    const label = document.createElement('div');
    label.textContent = `[${i + 1}] ${s.name}`;
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.url;
    const ret = document.createElement('div');
    ret.className = 'ret';
    ret.textContent = `Retrieved ${s.retrieved ?? '2026-11-20'}`;
    box.append(label, a, ret);
    grid.append(box);
  });
  panel.append(grid);

  panel.append(section('Personal Note'));
  const note = document.createElement('textarea');
  note.className = 'note-input';
  note.value = state.notes[t.id] ?? '';
  note.placeholder = 'Your own note — where you are, what to try next…';
  note.setAttribute('aria-label', 'Personal note for this trophy');
  note.addEventListener('change', () => onNote(t.id, note.value));
  panel.append(note);
}
