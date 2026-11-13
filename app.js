const screens = document.querySelectorAll('.screen');
const nav = document.getElementById('bottom-nav');
const noNav = ['welcome','walk1','walk2','walk3','signup','setup1','setup2','setup3','matches-loading'];
let loadTimer;

function show() {
  const id = (location.hash || '#welcome').slice(1);
  const target = document.getElementById(id) || document.getElementById('welcome');
  screens.forEach(s => { s.hidden = (s !== target); });

  const toast = document.getElementById('home-toast');
  if (toast && target.id !== 'home') toast.hidden = true;

  nav.hidden = noNav.includes(target.id);
  nav.querySelectorAll('a').forEach(a => {
    if (a.getAttribute('href') === '#' + target.id) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  // Loading screen moves on by itself (add ?hold to the address to keep it)
  clearTimeout(loadTimer);
  if (target.id === 'matches-loading' && !location.search.includes('hold')) {
    loadTimer = setTimeout(() => {
      if (location.hash === '#matches-loading') location.hash = '#matches';
    }, 3000);
  }

  const heading = target.querySelector('h1');
  if (heading) heading.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', show);
show();

// Forms that move to the next screen when submitted
document.querySelectorAll('form[data-next]').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (form.dataset.require) {
      const ok = form.querySelector(form.dataset.require + ' input:checked');
      const err = form.querySelector(form.dataset.error);
      if (!ok) {
        err.hidden = false;
        err.scrollIntoView({ block: 'nearest' });
        return;
      }
      err.hidden = true;
    }
    if (form.dataset.toast) {
      document.getElementById('home-toast-text').textContent = form.dataset.toast;
      document.getElementById('home-toast').hidden = false;
    }
    location.hash = form.dataset.next;
  });
});

// Module search: filter the list as the student types
const search = document.getElementById('module-search');
if (search) {
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    document.querySelectorAll('#module-list .option').forEach(o => {
      o.hidden = !o.textContent.toLowerCase().includes(q);
      if (!o.hidden) shown++;
    });
    document.getElementById('no-module').hidden = shown > 0;
  });
}

// Matches: filter chips
const chips = document.querySelectorAll('.chip');
const cards = document.querySelectorAll('#matches .card');
const count = document.getElementById('match-count');

function applyFilters() {
  const on = [...chips].filter(c => c.getAttribute('aria-pressed') === 'true').map(c => c.dataset.f);
  let n = 0;
  cards.forEach(card => {
    const hit = on.every(f => card.dataset.tags.split(' ').includes(f));
    card.hidden = !hit;
    if (hit) n++;
  });
  count.textContent = n + (n === 1 ? ' classmate found' : ' classmates found');
}
chips.forEach(c => c.addEventListener('click', () => {
  c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
  applyFilters();
}));
applyFilters();

// Request pop-up on the match profile
const reqDialog = document.getElementById('request-dialog');
const openReq = document.getElementById('open-request');
if (openReq) {
  openReq.addEventListener('click', () => reqDialog.showModal());
  document.getElementById('cancel-request').addEventListener('click', () => reqDialog.close());
  document.getElementById('send-request').addEventListener('click', () => {
    reqDialog.close();
    const banner = document.getElementById('sent-banner');
    banner.hidden = false;
    banner.scrollIntoView({ block: 'nearest' });
    openReq.disabled = true;
    openReq.textContent = 'Request sent';
  });
}

// Chat: add the typed message to the conversation
const chatForm = document.getElementById('chat-form');
if (chatForm) {
  chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    const p = document.createElement('p');
    p.className = 'bubble me';
    p.textContent = text;
    document.getElementById('chat-log').appendChild(p);
    input.value = '';
  });
}

// Study groups: join buttons
document.querySelectorAll('.join').forEach(b => {
  b.addEventListener('click', () => { b.disabled = true; b.textContent = 'Joined ✓'; });
});

// Accessibility settings
const optLarge = document.getElementById('opt-large');
const optCalm = document.getElementById('opt-calm');
if (optLarge) optLarge.addEventListener('change', e => document.documentElement.classList.toggle('large', e.target.checked));
if (optCalm) optCalm.addEventListener('change', e => document.documentElement.classList.toggle('calm', e.target.checked));