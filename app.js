/**
 * FitLink Global — Affiliate Onboarding
 * app.js — Application logic & UI rendering
 *
 * Depends on: data.js (T, PARTNERS must be loaded first)
 *
 * Sections: 0=Welcome 1=Story 2=Portfolio 3=Strategies 4=Roadmap 5=Manifesto
 */

let lang = 'es';
let curSection = 0;
let curCat = 'hardware';
let curRM = 0;
const TOTAL = 6;

/* LANG */
function setLang(l, btn) {
  lang = l;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyTranslations();
  rebuildCurrentSection();
}

function t(key) { return T[lang][key] || T.es[key] || key; }

function applyTranslations() {
  document.querySelectorAll('[data-t]').forEach(el => {
    const key = el.getAttribute('data-t');
    const val = T[lang][key];
    if (val && el.tagName !== 'INPUT') el.innerHTML = val;
  });
  document.getElementById('btn-prev').textContent = t('nav_prev');
  document.getElementById('btn-next').textContent = t('nav_next');
  document.getElementById('sec-name').textContent = t('sec_names')[curSection];
}

function rebuildCurrentSection() {
  if (curSection === 1) buildTimeline();
  if (curSection === 2) { buildCatBar(); buildGrid(curCat); }
  if (curSection === 3) buildStrategies();
  if (curSection === 4) { buildRMTabs(); renderRM(curRM); buildPrincs(); }
  if (curSection === 5) buildManifesto();
}

/* NAVIGATION */
function buildNavProgress() {
  const c = document.getElementById('nav-progress');
  c.innerHTML = '';
  for (let i = 0; i < TOTAL; i++) {
    const d = document.createElement('div');
    d.className = 'np' + (i === curSection ? ' active' : '');
    d.onclick = () => goTo(i);
    c.appendChild(d);
  }
}

function showSection(n) {
  for (let i = 0; i < TOTAL; i++) {
    const el = document.getElementById('s' + i);
    if (el) el.style.display = 'none';
  }
  curSection = n;
  const el = document.getElementById('s' + n);
  if (!el) return;
  el.style.display = 'block';
  void el.offsetWidth;
  el.querySelectorAll('.fade-up').forEach(e => { e.style.animation = 'none'; void e.offsetWidth; e.style.animation = ''; });
  document.getElementById('btn-prev').disabled = n === 0;
  document.getElementById('btn-next').disabled = n === TOTAL - 1;
  document.getElementById('sec-num').textContent = String(n + 1).padStart(2, '0') + ' / 0' + TOTAL;
  document.getElementById('sec-name').textContent = t('sec_names')[n];
  buildNavProgress();
  document.getElementById('scroll').scrollTo({ top: 0, behavior: 'smooth' });
  // build on first show
  if (n === 1) buildTimeline();
  if (n === 2) { buildCatBar(); buildGrid(curCat); }
  if (n === 3) buildStrategies();
  if (n === 4) { buildRMTabs(); renderRM(0); buildPrincs(); }
  if (n === 5) { buildManifesto(); setTimeout(revealManifesto, 400); }
}

function navigate(dir) {
  const next = curSection + dir;
  if (next < 0 || next >= TOTAL) return;
  showSection(next);
}

function goTo(n) { showSection(n); }

/* -----------------------------------------------
   S1: TIMELINE
----------------------------------------------- */
function buildTimeline() {
  const wrap = document.getElementById('tl-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  T[lang].tl.forEach(item => {
    wrap.innerHTML += `
      <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-year">${item.y}</div>
        <div class="tl-title">${item.t}</div>
        <div class="tl-body">${item.b}</div>
      </div>`;
  });
}

/* -----------------------------------------------
   S2: PARTNERS
----------------------------------------------- */
function buildCatBar() {
  const bar = document.getElementById('cat-bar');
  if (!bar) return;
  bar.innerHTML = '';
  [
    { key: 'hardware', icon: '', tk: 'cat_hw', count: PARTNERS.hardware.length },
    { key: 'software', icon: '', tk: 'cat_sw', count: PARTNERS.software.length },
    { key: 'services', icon: '', tk: 'cat_sv', count: PARTNERS.services.length },
  ].forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (c.key === curCat ? ' active' : '');
    btn.innerHTML = `${c.icon} ${t(c.tk)} <span class="cat-count">(${c.count})</span>`;
    btn.onclick = () => { curCat = c.key; buildCatBar(); buildGrid(c.key); };
    bar.appendChild(btn);
  });
}

function buildGrid(cat) {
  const grid = document.getElementById('p-grid');
  if (!grid) return;
  grid.innerHTML = '';
  PARTNERS[cat].forEach(p => {
    const card = document.createElement('div');
    card.className = 'p-card';
    const tagline = lang === 'en' ? p.tagline : lang === 'de' ? p.taglineDe : p.taglineEs;
    const catIconMap = {
      hardware:'<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
      software:'<svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
      services:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>',
    };
    const iconSvg = catIconMap[p.cat] || catIconMap.hardware;
    card.innerHTML = `
      <div class="p-icon">${iconSvg}</div>
      <div class="p-tag-chip">${p.tag}</div>
      <div class="p-name">${p.name}</div>
      <div class="p-tagline">${tagline}</div>
      <div class="p-arrow"><svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg></div>`;
    card.onclick = () => openModal(p);
    grid.appendChild(card);
  });
}

/* MODAL */
function openModal(p) {
  document.getElementById('m-emoji').textContent = p.name.charAt(0);
  document.getElementById('m-name').textContent = p.name;
  document.getElementById('m-tag').textContent = p.tag;

  const desc  = lang === 'en' ? p.descEn  : lang === 'de' ? p.descDe  : p.descEs;
  const ideal = lang === 'en' ? p.idealEn : lang === 'de' ? p.idealDe : p.idealEs;
  const pitch = lang === 'en' ? p.pitchEn : lang === 'de' ? p.pitchDe : p.pitchEs;
  const objs  = p.objEs || [];
  const combo = lang === 'en' ? (p.comboEn || p.comboEs) : p.comboEs;

  let html = '';

  // Description
  html += `<div class="modal-section">
    <div class="modal-label">${t('modal_desc')}</div>
    <div class="modal-desc">${desc}</div>
  </div>`;

  // Ideal clients
  html += `<div class="modal-section">
    <div class="modal-label">${t('modal_ideal')}</div>
    <div class="chip-row">${ideal.map(i => `<span class="ideal-chip">${i}</span>`).join('')}</div>
  </div>`;

  // Products
  if (p.products && p.products.length) {
    html += `<div class="modal-section">
      <div class="modal-label">${t('modal_prods')}</div>
      <div class="prod-grid">
        ${p.products.map(pr => `
          <div class="prod-item">
            <div class="prod-icon"><svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:var(--gold);stroke-width:1.6;fill:none;stroke-linecap:round;stroke-linejoin:round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>
            <div><div class="prod-name">${pr.name}</div><div class="prod-desc">${pr.desc}</div></div>
          </div>`).join('')}
      </div>
    </div>`;
  }

  // Pitch
  html += `<div class="modal-section">
    <div class="modal-label">${t('modal_pitch')}</div>
    <div class="pitch-box"><div class="pitch-quote">"${pitch}"</div></div>
  </div>`;

  // Objections
  if (objs.length) {
    html += `<div class="modal-section">
      <div class="modal-label">${t('modal_obj')}</div>
      ${objs.map(o => `
        <div class="obj-box">
          <div class="obj-q">${o.q}</div>
          <div class="obj-a">${o.a}</div>
        </div>`).join('')}
    </div>`;
  }

  // Combo
  if (combo) {
    html += `<div class="modal-section">
      <div class="modal-label">${t('modal_combo')}</div>
      <div class="combo-box">
        <div class="combo-label">COMBO</div>
        <div class="combo-text">${combo}</div>
      </div>
    </div>`;
  }

  html += `<div class="swipe-hint">${t('swipe_hint')}</div>`;

  document.getElementById('m-body').innerHTML = html;
  document.getElementById('modal-bg').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-bg').classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalBg(e) {
  if (e.target === document.getElementById('modal-bg')) closeModal();
}

/* -----------------------------------------------
   S3: STRATEGIES
----------------------------------------------- */
function buildStrategies() {
  const list = document.getElementById('strat-list');
  if (!list) return;
  list.innerHTML = '';
  const stratIcons = [
    '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>',
    '<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    '<svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  ];
  T[lang].strats.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'strat-card';
    div.innerHTML = `
      <div class="strat-head" onclick="toggleStrat(${i})">
        <div class="strat-left">
          <div class="strat-ico">${stratIcons[i] || stratIcons[0]}</div>
          <div>
            <div class="strat-ttl">${s.ttl}</div>
            <div class="strat-sub">${s.sub}</div>
          </div>
        </div>
        <div class="strat-right">
          <span class="badge">${s.badge}</span>
          <div class="strat-arrow" id="sa-${i}"><svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 18l6-6-6-6" fill="none" stroke="currentColor"/></svg></div>
        </div>
      </div>
      <div class="strat-body" id="sb-${i}">
        <div class="strat-desc">${s.desc}</div>
        ${s.steps.map((st, j) => `<div class="step"><div class="step-n">${j+1}</div><div class="step-t">${st}</div></div>`).join('')}
        <div class="ex-box">
          <div class="ex-lbl">EJEMPLO</div>
          <div class="ex-txt">${s.ex}</div>
        </div>
      </div>`;
    list.appendChild(div);
  });
}

function toggleStrat(i) {
  const body = document.getElementById('sb-' + i);
  const arrow = document.getElementById('sa-' + i);
  const open = body.style.display === 'block';
  body.style.display = open ? 'none' : 'block';
  arrow.classList.toggle('open', !open);
}

/* -----------------------------------------------
   S4: ROADMAP
----------------------------------------------- */
function buildRMTabs() {
  const tabs = document.getElementById('rm-tabs');
  if (!tabs) return;
  tabs.innerHTML = '';
  T[lang].rm.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.className = 'rm-tab' + (i === curRM ? ' active' : '');
    btn.textContent = item.d;
    btn.onclick = () => { curRM = i; buildRMTabs(); renderRM(i); };
    tabs.appendChild(btn);
  });
}

function renderRM(i) {
  const card = document.getElementById('rm-card');
  if (!card) return;
  const item = T[lang].rm[i];
  const rmIcons = [
    '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.77 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.68 0h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 7a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 14z"/><path d="M15 2c2.4.7 4.3 2.6 5 5"/><path d="M15 6a4 4 0 0 1 3 3"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/></svg>',
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>',
  ];
  card.innerHTML = `
    <div class="rm-ico-box">${rmIcons[i] || rmIcons[0]}</div>
    <div class="rm-day">${item.d.toUpperCase()}</div>
    <div class="rm-ttl">${item.t}</div>
    <div class="rm-dsc">${item.b}</div>`;
}

function buildPrincs() {
  const grid = document.getElementById('princ-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const princIcons = [
    '<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    '<svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  ];
  T[lang].princs.forEach((p, i) => {
    grid.innerHTML += `
      <div class="princ">
        <div class="princ-ico">${princIcons[i] || princIcons[0]}</div>
        <div class="princ-ttl">${p.t}</div>
        <div class="princ-dsc">${p.d}</div>
      </div>`;
  });
}

/* -----------------------------------------------
   S5: MANIFESTO
----------------------------------------------- */
function buildManifesto() {
  const c = document.getElementById('m-lines');
  if (!c) return;
  c.innerHTML = '';
  T[lang].m_lines.forEach((line, i) => {
    c.innerHTML += `<div class="m-line" id="ml-${i}"><div class="m-dot"></div><div class="m-txt">${line}</div></div>`;
  });
}

function revealManifesto() {
  T[lang].m_lines.forEach((_, i) => {
    setTimeout(() => {
      const el = document.getElementById('ml-' + i);
      if (el) { el.classList.add('show'); el.style.animationDelay = '0s'; }
    }, i * 180);
  });
}

/* SWIPE */
let tx = 0, ty = 0;
const scrollEl = document.getElementById('scroll');
scrollEl.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
scrollEl.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - tx;
  const dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > Math.abs(dy) * 1.4 && Math.abs(dx) > 55) navigate(dx < 0 ? 1 : -1);
}, { passive: true });

/* INIT */
document.addEventListener('DOMContentLoaded', () => {
  buildNavProgress();
  showSection(0);
  applyTranslations();
});
