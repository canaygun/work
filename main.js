/* Davranış kodu. İçerik ve eşikler için config.js'e bak. */
(() => {
  const S = window.SITE, $ = (s, r = document) => r.querySelector(s), html = document.documentElement;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width:820px)');
  if (rm) html.classList.add('rm');
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  // Bir bölümün (sabitlenen sahne dahil) 0→1 scroll ilerlemesi
  const progress = s => { const r = s.getBoundingClientRect(), d = r.height - innerHeight; return d > 0 ? clamp(-r.top / d) : 0; };

  /* ---------- 1 · INTRO (kare = scroll) ---------- */
  const intro = $('#intro'), stage = $('.stage', intro), cv = $('#seq'), ctx = cv.getContext('2d'), openEl = $('.open');
  const N = S.frames.count; intro.style.height = S.introVH + 'vh';
  let base = mobile.matches ? S.frames.mobile : S.frames.desktop, imgs = [], cur = 0, target = 0, lastKey = '', running = false;
  const src = i => base + String(i).padStart(S.frames.pad, '0') + S.frames.ext;

  function frameAt(p) {
    const m = S.map;
    for (let k = 1; k < m.length; k++) if (p <= m[k][0]) {
      const [p0, f0] = m[k - 1], [p1, f1] = m[k];
      return p1 === p0 ? f1 : f0 + (f1 - f0) * (p - p0) / (p1 - p0);
    }
    return m[m.length - 1][1];
  }
  // Yüklenmemiş karede boşluk/flaş olmasın: en yakın yüklü kareyi kullan
  function best(i) {
    for (let d = 0; d < N; d++) for (const j of [i - d, i + d]) { const im = imgs[j]; if (im && im.complete && im.naturalWidth) return im; }
    return null;
  }
  function cover(im, alpha) {
    const cw = cv.width, ch = cv.height, s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.globalAlpha = alpha; ctx.drawImage(im, -(w - cw) * S.focus.x, -(h - ch) * S.focus.y, w, h);
  }
  function draw(force) {
    const f = frameAt(cur), a = Math.floor(f), t = f - a, key = a + ':' + t.toFixed(2);
    openEl.style.opacity = rm ? 1 : 1 - clamp(cur / S.open.fadeOutAt);
    if (!force && key === lastKey) return; lastKey = key;
    stage.style.background = f > 90 ? '#000' : '#fff';
    const A = best(a); if (!A) return;
    cover(A, 1);
    const B = t > .02 && a < N - 1 ? best(a + 1) : null;       // kareler arası çapraz geçiş
    if (B && B !== A) cover(B, t);
    ctx.globalAlpha = 1;
  }
  function tick() {
    const d = target - cur;
    if (Math.abs(d) > .0004) { cur += d * .16; draw(); requestAnimationFrame(tick); } else { cur = target; draw(); running = false; }
  }
  const kick = () => { if (!running) { running = true; requestAnimationFrame(tick); } };
  function sizeCanvas() {
    const r = stage.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); draw(true);
  }
  function loadFrames() {
    const start = Math.round(frameAt(cur)), total = rm ? 1 : N;       // ilk görüntü önce, sonra yakından uzağa
    const order = [...Array(N).keys()].sort((a, b) => Math.abs(a - start) - Math.abs(b - start)).slice(0, total);
    let k = 0;
    const next = () => {
      if (k >= order.length) return;
      const i = order[k++], im = new Image(); im.decoding = 'async';
      im.onload = im.onerror = () => { if (Math.abs(i - frameAt(cur)) <= 2) draw(true); next(); };
      im.src = src(i); imgs[i] = im;
    };
    for (let c = 0; c < 6; c++) next();
  }

  /* ---------- 2 · DÖRT PROJE ---------- */
  const pSec = $('#projects'), pStage = $('.stage', pSec), P = S.projects;
  pSec.style.height = P.length * 100 + 'vh';
  P.forEach(p => {
    const art = el('article', 'proj ' + (p.layout === 'imgR' ? 'imgR' : 'imgL'));
    const media = el('div', 'ph');
    if (p.img) { const im = new Image(); im.src = p.img; im.alt = p.title.replace('\n', ' '); im.loading = 'lazy'; media.append(im); }
    else media.textContent = 'Image ' + (p.short || p.title);
    const txt = el('div', 'txt'), h = el('h2');
    p.title.split('\n').forEach((t, k) => { if (k) h.append(el('br')); h.append(t); });
    const tags = el('div', 'tags'); p.tags.forEach(t => tags.append(el('span', 'tag', t)));
    const a = el('a', 'pill', 'See details →'); a.href = p.href; a.dataset.case = '1';
    txt.append(h, tags, el('p', '', p.text), a);
    art.append(...(p.layout === 'imgR' ? [txt, media] : [media, txt]));
    pStage.append(art);
  });
  function updateProjects() {
    if (rm) return;
    const r = pSec.getBoundingClientRect(), vis = r.top < innerHeight * .55 && r.bottom > innerHeight * .45;
    const idx = Math.round(progress(pSec) * (P.length - 1));
    [...pStage.children].forEach((e, i) => { e.classList.toggle('is-active', vis && i === idx); e.classList.toggle('is-past', vis && i < idx); });
  }

  /* ---------- 3 · GALERİ (7 kart, 3:4, yelpaze) ---------- */
  const gSec = $('#gallery'), fan = $('#fan'), cards = [];
  for (let n = 1; n <= S.gallery.count; n++) {
    const c = el('div', 'card rv'), inn = el('div', 'card-in'), url = S.gallery.images[n - 1];
    if (url) { const im = new Image(); im.src = url; im.alt = 'Work ' + n; im.loading = 'lazy'; inn.append(im); } else inn.textContent = n;
    c.style.zIndex = 8 - n; c.append(inn); fan.append(c); cards.push(c);
  }
  let G = {};
  const flat = () => mobile.matches || rm;
  function geom() {
    const st = $('.stage', gSec), W = st.clientWidth, H = st.clientHeight, cw = Math.min(W * .18, H * .325);
    fan.style.setProperty('--cw', cw + 'px'); G = { W, H, cw, ch: cw * 4 / 3 }; layoutGallery();
  }
  function layoutGallery() {
    cards.forEach(c => c.classList.toggle('rv', flat()));
    if (flat()) { cards.forEach(c => { c.style.transform = ''; c.style.opacity = ''; }); return; }
    const p = progress(gSec), { W, H, cw, ch } = G, n = cards.length;
    cards.forEach((c, i) => {
      const th = ((n + 1) / 2 - (i + 1)) * S.gallery.angle, rad = th * Math.PI / 180;
      const x = W / 2 + W * .34 * Math.sin(rad), y = H * .78 - H * .47 * Math.cos(rad);
      const t = clamp((p * 1.1 + .05 - i * .11) / .11);                       // kartlar sırayla açılır
      c.style.opacity = t;
      c.style.transform = `translate(${x - cw / 2}px,${y - ch / 2 + (1 - t) * H * .55}px) rotate(${th}deg)`;
    });
  }

  /* ---------- Bulanıktan netleşme (footer, başlıklar, mobil kartlar) ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
  document.querySelectorAll('.rv').forEach(e => io.observe(e));
  cards.forEach(c => io.observe(c));

  /* ---------- Case study paneli: sağdan girer, geri tuşuyla sağa çıkar ---------- */
  const panel = $('#panel'), homeTitle = document.title; let opener = null;
  async function openCase(href, push) {
    try {
      const r = await fetch(href); if (!r.ok) throw 0;
      const doc = new DOMParser().parseFromString(await r.text(), 'text/html'), m = doc.querySelector('main.case'); if (!m) throw 0;
      panel.replaceChildren(document.importNode(m, true)); document.title = doc.title;
    } catch (e) { location.href = href; return; }          // file:// gibi durumlarda normal sayfa geçişi
    panel.scrollTop = 0; html.classList.add('locked'); panel.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => { panel.classList.add('open'); const b = $('.case-back', panel); if (b) b.focus({ preventScroll: true }); });
    if (push) history.pushState({ case: href }, '', href);
  }
  function closeCase() {
    panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); html.classList.remove('locked'); document.title = homeTitle;
    if (opener) { opener.focus({ preventScroll: true }); opener = null; }
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-case]');
    if (a) { e.preventDefault(); opener = a; openCase(a.getAttribute('href'), true); return; }
    if (e.target.closest('#panel .case-back')) { e.preventDefault(); history.back(); }
  });
  addEventListener('popstate', e => (e.state && e.state.case) ? openCase(e.state.case, false) : closeCase());
  addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('open')) history.back(); });

  /* ---------- Başlat ---------- */
  function update() { target = rm ? 0 : progress(intro); kick(); updateProjects(); layoutGallery(); }
  let ticking = false;
  addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); }, { passive: true });
  let rt; addEventListener('resize', () => {
    clearTimeout(rt); rt = setTimeout(() => {
      const nb = mobile.matches ? S.frames.mobile : S.frames.desktop;
      if (nb !== base) { base = nb; imgs = []; loadFrames(); }        // ekran sınıfı değişti: doğru kare setine geç
      sizeCanvas(); geom(); update();
    }, 100);
  });
  cur = target = rm ? 0 : progress(intro);                              // yenilemede mevcut scroll konumuna eşle
  sizeCanvas(); loadFrames(); geom(); update();
})();
