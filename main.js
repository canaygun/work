/* Davranış kodu. İçerik ve eşikler için config.js'e bak. */
(() => {
  const S = window.SITE, $ = (s, r = document) => r.querySelector(s), html = document.documentElement;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const portrait = matchMedia('(orientation:portrait) and (max-width:1100px)');   // dikey telefon + dikey tablet
  const lowRes = () => Math.min(innerWidth, innerHeight) <= 600;                  // telefon → hafif kare seti
  if (rm) html.classList.add('rm');
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const lines = (node, text) => text.split('\n').forEach((t, k) => { if (k) node.append(el('br')); node.append(t); });
  const progress = s => { const r = s.getBoundingClientRect(), d = r.height - innerHeight; return d > 0 ? clamp(-r.top / d) : 0; };
  const lerpKeys = (keys, p) => {                       // [[x,y],…] parçalı lineer
    for (let k = 1; k < keys.length; k++) if (p <= keys[k][0]) {
      const [x0, y0] = keys[k - 1], [x1, y1] = keys[k]; return x1 === x0 ? y1 : y0 + (y1 - y0) * (p - x0) / (x1 - x0);
    }
    return keys[keys.length - 1][1];
  };

  /* ---------- 1 · INTRO (kare = scroll) ---------- */
  const intro = $('#intro'), stage = $('.stage', intro), cv = $('#seq'), ctx = cv.getContext('2d'), openEl = $('.open'), beat = $('.beat');
  const N = S.frames.count; intro.style.height = S.introVH + 'vh';
  $('.b1', beat).textContent = S.beat.title; lines($('.b2', beat), S.beat.sub);
  if (rm) { intro.after(beat); beat.classList.add('static'); }           // hareket azaltma: metin akışta durur
  let base = lowRes() ? S.frames.mobile : S.frames.desktop, imgs = [], cur = 0, target = 0, lastKey = '', running = false;
  const src = i => base + String(i).padStart(S.frames.pad, '0') + S.frames.ext;
  const frameAt = p => lerpKeys(S.map, p);

  // Yüklenmemiş karede boşluk/flaş olmasın: en yakın yüklü kareyi kullan
  function best(i) {
    for (let d = 0; d < N; d++) for (const j of [i - d, i + d]) { const im = imgs[j]; if (im && im.complete && im.naturalWidth) return im; }
    return null;
  }
  function rectFor(im, fit) {
    const cw = cv.width, ch = cv.height, iw = im.naturalWidth, ih = im.naturalHeight, port = portrait.matches;
    const pc = S.portraitCover, fo = port ? pc : S.focus, z = port ? pc.zoom : 1;
    const sc = Math.max(cw / iw, ch / ih) * z, wc = iw * sc, hc = ih * sc, xc = -(wc - cw) * fo.x, yc = -(hc - ch) * fo.y;
    if (!port || fit >= 1) return [xc, yc, wc, hc];                             // tam ekran (cover)
    let hi = Math.min(ch * S.insetMaxHeight, cw * 2 * ih / iw), si = Math.max(hi / ih, cw / iw);   // altta yerleşik mod
    hi = ih * si; const wi = iw * si, xi = -(wi - cw) * S.insetFocusX, yi = ch - hi;
    return [xi + (xc - xi) * fit, yi + (yc - yi) * fit, wi + (wc - wi) * fit, hi + (hc - hi) * fit];
  }
  function paint(im, alpha, fit) { const [x, y, w, h] = rectFor(im, fit); ctx.globalAlpha = alpha; ctx.drawImage(im, x, y, w, h); }
  function draw(force) {
    const f = frameAt(cur), a = Math.floor(f), t = f - a, fit = lerpKeys(S.fit, cur), key = a + ':' + t.toFixed(2) + ':' + fit.toFixed(2);
    ctx.imageSmoothingQuality = 'high';
    const [o0, o1] = portrait.matches ? S.open.portrait : S.open.desktop;
    openEl.style.opacity = rm ? 1 : 1 - clamp((cur - o0) / (o1 - o0));
    if (!rm) {
      const b = clamp((cur - S.beat.range[0]) / (S.beat.range[1] - S.beat.range[0]));
      beat.style.opacity = b; beat.style.transform = `translateY(${(1 - b) * 5}vh)`; beat.style.filter = `blur(${(1 - b) * 14}px)`;
    }
    if (!force && key === lastKey) return; lastKey = key;
    stage.style.background = f > 86 ? '#000' : '#fff';
    const A = best(a); if (!A) return;
    ctx.fillStyle = f > 86 ? '#000' : '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
    paint(A, 1, fit);
    const bw = Math.max(S.blend, .001), w = clamp((t - (.5 - bw / 2)) / bw);   // çapraz geçiş yalnızca iki karenin ortasındaki dar bantta
    const B = w > 0 && a < N - 1 ? best(a + 1) : null;
    if (B && B !== A) paint(B, w, fit);
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
  P.forEach((p, i) => {
    const art = el('article', 'proj ' + (p.layout === 'imgR' ? 'imgR' : 'imgL'));
    const media = el('div', 'ph');
    if (p.img) { const im = new Image(); im.src = p.img; im.alt = p.alt || ''; im.decoding = 'async'; if (i > 0) im.loading = 'lazy'; media.append(im); }
    else media.textContent = 'Image ' + (p.short || p.title);
    const txt = el('div', 'txt'), h = el('h2'); lines(h, p.title);
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
  const gSec = $('#gallery'), gStage = $('.stage', gSec), fan = $('#fan'), gt = $('.gtitle'), cards = [], GL = S.gallery;
  for (let n = 1; n <= GL.count; n++) {
    const c = el('div', 'card'), inn = el('div', 'card-in'), url = GL.images[n - 1];
    if (url) { const im = new Image(); im.src = url; im.alt = GL.alts[n - 1] || 'Work ' + n; im.decoding = 'async'; inn.append(im); } else inn.textContent = n;
    c.style.zIndex = 8 - n; c.append(inn); fan.append(c); cards.push(c);
  }
  let G = {};
  function geom() {
    const W = gStage.clientWidth, H = gStage.clientHeight; G = { W, H };
    if (rm) return layoutGallery();
    if (portrait.matches) {                           // 9:16'lık sanal kutu, ekrana ortalı
      const u = Math.min(W, H * 9 / 16), vh = u * 16 / 9, x0 = (W - u) / 2, y0 = (H - vh) / 2;
      Object.assign(G, { u, vh, x0, y0, cw: GL.portrait.cardW * u });
      gt.style.setProperty('--u', u + 'px'); gt.style.top = (y0 + GL.portrait.titleTop * vh) + 'px'; gt.style.bottom = 'auto';
    } else {
      G.cw = Math.min(W * .18, H * .325); gt.style.removeProperty('top'); gt.style.removeProperty('bottom'); gt.style.removeProperty('--u');
    }
    fan.style.setProperty('--cw', G.cw + 'px'); layoutGallery();
  }
  function layoutGallery() {
    if (rm) return;
    const p = progress(gSec), { W, H, cw } = G, ch = cw * 4 / 3, n = cards.length;
    cards.forEach((c, i) => {
      let x, y, th;
      if (portrait.matches) { const [fx, fy, r] = GL.portrait.cards[i]; x = G.x0 + fx * G.u; y = G.y0 + fy * G.vh; th = r; }
      else { th = ((n + 1) / 2 - (i + 1)) * GL.angle; const rad = th * Math.PI / 180; x = W / 2 + W * .34 * Math.sin(rad); y = H * .78 - H * .47 * Math.cos(rad); }
      const t = clamp((p * 1.1 + .05 - i * .11) / .11);                       // kartlar sırayla açılır
      c.style.opacity = t;
      c.style.transform = `translate(${x - cw / 2}px,${y - ch / 2 + (1 - t) * H * .55}px) rotate(${th}deg)`;
    });
  }

  /* ---------- Bulanıktan netleşme (footer ve başlıklar) ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
  document.querySelectorAll('.rv').forEach(e => io.observe(e));
  if (rm) cards.forEach(c => { c.classList.add('rv'); io.observe(c); });

  /* ---------- Case study paneli: sağdan girer, geri tuşuyla sağa çıkar ---------- */
  const panel = $('#panel'), homeTitle = document.title; let opener = null;
  async function openCase(href, push) {
    try {
      const r = await fetch(href); if (!r.ok) throw 0;
      const doc = new DOMParser().parseFromString(await r.text(), 'text/html'), m = doc.querySelector('main.case'); if (!m) throw 0;
      panel.replaceChildren(document.importNode(m, true)); document.title = doc.title;
    } catch (e) { location.href = href; return; }          // file:// gibi durumlarda normal sayfa geçişi
    panel.scrollTop = 0; html.classList.add('locked'); panel.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => { panel.classList.add('is-open'); const b = $('.case-back', panel); if (b) b.focus({ preventScroll: true }); });
    if (push) history.pushState({ case: href }, '', href);
  }
  function closeCase() {
    panel.classList.remove('is-open'); panel.setAttribute('aria-hidden', 'true'); html.classList.remove('locked'); document.title = homeTitle;
    if (opener) { opener.focus({ preventScroll: true }); opener = null; }
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-case]');
    if (a) { e.preventDefault(); opener = a; openCase(a.getAttribute('href'), true); return; }
    if (e.target.closest('#panel .case-back')) { e.preventDefault(); history.back(); }
  });
  addEventListener('popstate', e => (e.state && e.state.case) ? openCase(e.state.case, false) : closeCase());
  addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('is-open')) history.back(); });

  /* ---------- Başlat ---------- */
  function update() { target = rm ? 0 : progress(intro); kick(); updateProjects(); layoutGallery(); }
  let ticking = false;
  addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); }, { passive: true });
  let rt, lw = innerWidth, lh = innerHeight; addEventListener('resize', () => {
    if (innerWidth === lw && Math.abs(innerHeight - lh) < 160) return;    // mobil adres çubuğu kayması: yeniden hesaplama yok
    clearTimeout(rt); rt = setTimeout(() => {
      lw = innerWidth; lh = innerHeight;
      const nb = lowRes() ? S.frames.mobile : S.frames.desktop;
      if (nb !== base) { base = nb; imgs = []; loadFrames(); }        // ekran sınıfı değişti: doğru kare setine geç
      sizeCanvas(); geom(); update();
    }, 100);
  });
  cur = target = rm ? 0 : progress(intro);                              // yenilemede mevcut scroll konumuna eşle
  sizeCanvas(); loadFrames(); geom(); update();
})();
