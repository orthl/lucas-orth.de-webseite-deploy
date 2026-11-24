/* lucas-orth.de – shared page script (built into site/site.js, loaded with defer on every page except /me/) */
(() => {
  const d = document.documentElement, en = d.lang === 'en';
  const L = en
    ? { motionOn: 'Resume animations', motionOff: 'Pause animations', menuOpen: 'Open menu', menuClose: 'Close menu',
        hello: 'Computer scientist from Saarland ', src: 'Reading the source? Then we will get along. Write to me: info@lucas-orth.de\nTip: ↑ ↑ ↓ ↓ ← → ← → B A' }
    : { motionOn: 'Animationen einschalten', motionOff: 'Animationen anhalten', menuOpen: 'Menü öffnen', menuClose: 'Menü schließen',
        hello: 'Informatiker aus dem Saarland ', src: 'Sie lesen Quelltext? Dann passen wir zusammen. Schreiben Sie mir: info@lucas-orth.de\nTipp: ↑ ↑ ↓ ↓ ← → ← → B A' };
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const still = () => d.classList.contains('no-motion');

  /* for the curious: a hello in the console */
  console.log('%c Lucas Orth %c ' + L.hello, 'background:#2446d8;color:#fff;font:600 14px sans-serif;padding:6px 8px;border-radius:6px 0 0 6px', 'background:#141414;color:#fff;font:14px sans-serif;padding:6px 8px;border-radius:0 6px 6px 0');
  console.log(L.src);

  /* konami code */
  const toast = document.getElementById('toast');
  if (toast) {
    const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']; let k = 0;
    addEventListener('keydown', e => { k = (e.key === seq[k] || e.key.toLowerCase() === seq[k]) ? k + 1 : (e.key === seq[0] ? 1 : 0); if (k === seq.length) { k = 0; unlock() } });
    function unlock() {
      toast.classList.add('is-on'); setTimeout(() => toast.classList.remove('is-on'), 6000);
      if (reduced()) return;
      for (let i = 0; i < 18; i++) {
        const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('class', 'burst-star'); s.innerHTML = '<use href="#star"/>';
        s.style.left = innerWidth / 2 + 'px'; s.style.top = innerHeight - 90 + 'px'; document.body.appendChild(s);
        const a = Math.random() * Math.PI * 2, r = 120 + Math.random() * 220;
        s.animate([{ transform: 'translate(0,0) scale(.4) rotate(0deg)', opacity: 1 }, { transform: `translate(${Math.cos(a) * r}px,${Math.sin(a) * r - 140}px) scale(1) rotate(${Math.random() * 360}deg)`, opacity: 0 }], { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.2,1)' }).onfinish = () => s.remove();
      }
    }
  }

  /* motion switch (phone menu) and the band's pause button */
  const mt = document.getElementById('motion-toggle'), bp = document.querySelector('.band__pause');
  const cards = [...document.querySelectorAll('.stack .field')];
  const syncMt = () => { const l = still() ? L.motionOn : L.motionOff; const s = mt && mt.querySelector('span'); if (s) s.textContent = l; if (bp) bp.setAttribute('aria-label', l) };
  const setMotion = off => { d.classList.toggle('no-motion', off); try { localStorage.setItem('motion', off ? 'off' : 'on') } catch (e) { } syncMt(); if (off) cards.forEach(c => { c.style.transform = ''; c.style.filter = '' }) };
  syncMt();
  if (mt) mt.addEventListener('click', () => setMotion(!still()));
  if (bp) bp.addEventListener('click', () => setMotion(!still()));
  requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('ready')));

  /* phone menu */
  const nav = document.getElementById('nav'), t = nav && nav.querySelector('.nav__toggle');
  if (t) {
    const set = o => { nav.classList.toggle('is-open', o); t.setAttribute('aria-expanded', o); t.setAttribute('aria-label', o ? L.menuClose : L.menuOpen); if (o) { const f = nav.querySelector('#menu a'); if (f) f.focus() } };
    t.addEventListener('click', () => set(!nav.classList.contains('is-open')));
    nav.querySelectorAll('.nav__links a').forEach(a => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { set(false); t.focus() } });
    document.addEventListener('click', e => { if (nav.classList.contains('is-open') && !nav.contains(e.target)) set(false) });
  }

  /* references: arrow buttons scroll the strip */
  const rs = document.getElementById('ref-scroll');
  if (rs) document.querySelectorAll('.refs-nav button').forEach(b => b.addEventListener('click', () => {
    const c = rs.querySelector('.ref'); rs.scrollBy({ left: (c ? c.offsetWidth + 24 : 360) * Number(b.dataset.dir), behavior: reduced() ? 'auto' : 'smooth' });
  }));

  const io = 'IntersectionObserver' in window;
  /* the marquee band only runs while it is on screen */
  const band = document.querySelector('.band');
  if (band && io) new IntersectionObserver(es => band.classList.toggle('is-off', !es[0].isIntersecting)).observe(band);

  /* touch devices have no hover: play the project and report loops once when they scroll into view */
  if (io && matchMedia('(hover: none)').matches) {
    const tio = new IntersectionObserver(es => es.forEach(e => {
      const el = e.target;
      if (e.intersectionRatio >= .6 && !el.dataset.played) { el.dataset.played = '1'; el.classList.add('in-view'); setTimeout(() => el.classList.remove('in-view'), 3200) }
      else if (e.intersectionRatio === 0) delete el.dataset.played;
    }), { threshold: [0, .6] });
    document.querySelectorAll('.repo,.pub-lead').forEach(el => tio.observe(el));
  }

  /* business fields stack while scrolling: the covered card shrinks a little (only while the stack is on screen) */
  if (!cards.length || reduced()) return;
  let tick = false, active = !io;
  const upd = () => {
    tick = false; if (still()) return;
    cards.forEach((c, i) => {
      const n = cards[i + 1]; if (!n) { c.style.transform = ''; c.style.filter = ''; return }
      const top = parseFloat(getComputedStyle(c).top) || 0, hh = c.offsetHeight;
      const p = Math.min(1, Math.max(0, (top + hh - n.getBoundingClientRect().top) / hh));
      c.style.transform = p > 0 ? `scale(${1 - p * .06})` : ''; c.style.filter = p > 0 ? `brightness(${1 - p * .08})` : '';
    });
  };
  if (io) new IntersectionObserver(es => { active = es[0].isIntersecting; if (active) upd() }).observe(document.querySelector('.stack'));
  addEventListener('scroll', () => { if (active && !tick) { tick = true; requestAnimationFrame(upd) } }, { passive: true });
  addEventListener('resize', upd); upd();
})();
