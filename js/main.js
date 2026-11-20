(function () {
  'use strict';
  var D = window.BP;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;
  var root = document.documentElement;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  function safe(fn) { try { fn(); } catch (e) { if (window.console) console.error(e); } }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  /* ── failsafe: never leave the intro covering the page ── */
  var introEl = $('#intro');
  var introDone = false;
  function finishIntro() {
    if (introDone) return; introDone = true;
    introEl.classList.add('done');
    var name = $('.hero-name'); if (name) name.classList.add('in');
    $$('.hero .reveal').forEach(function (n, i) { n.style.setProperty('--d', (0.25 + i * 0.12) + 's'); n.classList.add('in'); });
    setTimeout(function () { introEl.style.display = 'none'; }, 1100);
  }
  setTimeout(finishIntro, 4500);

  /* ── intro counter ── */
  safe(function () {
    var c = $('#introCount');
    if (reduce) { c.textContent = '100'; finishIntro(); return; }
    var start = performance.now(), dur = 1300;
    (function tick(now) {
      var p = clamp((now - start) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
      c.textContent = String(Math.round(e * 100)).padStart(3, '0');
      if (p < 1) requestAnimationFrame(tick); else setTimeout(finishIntro, 220);
    })(start);
  });

  /* ── text splitting ── */
  safe(function () {
    $$('[data-split]').forEach(function (h) {
      var i = 0;
      $$('.line', h).forEach(function (line) {
        var txt = line.textContent; line.textContent = '';
        txt.split('').forEach(function (ch) {
          var s = el('span', 'ch', ch); s.style.setProperty('--i', i++); s.setAttribute('aria-hidden', 'true'); line.appendChild(s);
        });
      });
    });
    var st = $('#statement');
    if (st) {
      var words = st.textContent.trim().split(/\s+/); st.textContent = '';
      words.forEach(function (w, i) { var s = el('span', 'w', w); st.appendChild(s); if (i < words.length - 1) st.appendChild(document.createTextNode(' ')); });
      if (reduce) $$('.w', st).forEach(function (w) { w.classList.add('lit'); });
    }
    var big = $('[data-split-words]');
    if (big) {
      var bw = big.textContent.trim().split(/\s+/); big.setAttribute('aria-label', big.textContent.trim()); big.textContent = '';
      bw.forEach(function (w, i) {
        var o = el('span', 'w'); var inn = el('span', null, w); inn.style.transitionDelay = (i * 90) + 'ms'; inn.setAttribute('aria-hidden', 'true'); o.appendChild(inn); big.appendChild(o); big.appendChild(document.createTextNode(' '));
      });
    }
  });

  /* ── reveal on view ── */
  safe(function () {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach(function (n) { if (!n.closest('.hero')) io.observe(n); });
    var big = $('.big-cta'); if (big) io.observe(big);
  });

  /* ── theme ── */
  safe(function () {
    var btn = $('#themeBtn');
    function apply(t, persist) {
      root.dataset.theme = t;
      btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      var m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = t === 'dark' ? '#07080a' : '#efece4';
      if (window.BPGL) window.BPGL.setTheme(t);
      if (persist) { try { localStorage.setItem('bp-theme', t); } catch (e) {} }
      if (window.__constRedraw) window.__constRedraw();
    }
    window.__setTheme = function (t) { apply(t, true); };
    btn.addEventListener('click', function () { apply(root.dataset.theme === 'dark' ? 'light' : 'dark', true); });
    apply(root.dataset.theme === 'light' ? 'light' : 'dark', false);
  });

  /* ── nav: menu, scroll state, active link, transitions ── */
  var nav = $('#nav'), menu = $('#menu'), menuBtn = $('#menuBtn'), curtain = $('#curtain');
  function setMenu(open) {
    menu.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); document.body.classList.toggle('lock', open);
  }
  menuBtn.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });

  var navBusy = false;
  function goTo(hash) {
    var target = hash === '#top' ? document.body : $(hash);
    if (!target || navBusy) return;
    function jump() {
      root.style.scrollBehavior = 'auto';
      if (hash === '#top') window.scrollTo(0, 0); else target.scrollIntoView({ block: 'start' });
      root.style.scrollBehavior = '';
      if (history.pushState) history.pushState(null, '', hash === '#top' ? location.pathname : hash);
      var h = hash === '#top' ? $('#heroName') : $('h2', target); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }
    setMenu(false);
    if (reduce) { jump(); return; }
    navBusy = true; curtain.className = 'in';
    setTimeout(function () {
      jump(); curtain.className = 'out';
      setTimeout(function () { curtain.className = ''; navBusy = false; }, 700);
    }, 620);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-nav]'); if (!a) return;
    var h = a.getAttribute('href'); if (!h || h.charAt(0) !== '#') return;
    e.preventDefault(); goTo(h);
  });
  window.__goTo = goTo;

  safe(function () {
    var links = $$('#menu a'), map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { links.forEach(function (l) { l.classList.remove('on'); l.removeAttribute('aria-current'); }); var l = map[e.target.id]; if (l) { l.classList.add('on'); l.setAttribute('aria-current', 'true'); } }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  });

  /* ── scroll-linked effects (one rAF-throttled handler) ── */
  var statement = $('#statement'), sWords = statement ? $$('.w', statement) : [];
  var progress = $('#progress'), lastY = 0, ticking = false;
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    nav.classList.toggle('solid', y > 40);
    if (!document.body.classList.contains('lock')) nav.classList.toggle('hide', y > lastY && y > 400);
    lastY = y;
    if (statement && !reduce) {
      var r = statement.getBoundingClientRect();
      var p = clamp((innerHeight * 0.82 - r.top) / (r.height + innerHeight * 0.18), 0, 1);
      var n = Math.round(p * sWords.length);
      for (var i = 0; i < sWords.length; i++) sWords[i].classList.toggle('lit', i < n);
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  nav.addEventListener('focusin', function () { nav.classList.remove('hide'); });

  /* ── marquee (drifts, and responds to scroll) ── */
  safe(function () {
    var track = $('#marquee'); if (!track || reduce) return;
    Array.prototype.slice.call(track.children).forEach(function (c) { track.appendChild(c.cloneNode(true)); });
    var half = 0, vis = true, t0 = performance.now(), raf = 0;
    function measure() { half = track.scrollWidth / 2 + 22; }
    function loop(now) { raf = 0; if (!vis || document.hidden) return; var x = ((now - t0) * 0.035 + window.scrollY * 0.5) % half; track.style.transform = 'translate3d(' + (-x) + 'px,0,0)'; raf = requestAnimationFrame(loop); }
    function go() { if (!raf) raf = requestAnimationFrame(loop); }
    measure(); window.addEventListener('resize', measure); window.addEventListener('load', measure);
    new IntersectionObserver(function (e) { vis = e[0].isIntersecting; if (vis) go(); }).observe(track.parentNode);
    document.addEventListener('visibilitychange', go); go();
  });

  /* ── cursor + magnetic ── */
  safe(function () {
    if (!finePointer) return;
    var cur = $('#cursor'), dot = $('.c-dot'), ring = $('.c-ring'), lab = $('.c-ring span');
    root.classList.add('has-cursor');
    var x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0;
    window.addEventListener('pointermove', function (e) { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(move); }, { passive: true });
    function move() { rx += (x - rx) * 0.18; ry += (y - ry) * 0.18; dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)'; ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)'; raf = (Math.abs(x - rx) + Math.abs(y - ry) > 0.3) ? requestAnimationFrame(move) : 0; }
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest('[data-cursor]');
      if (t) { lab.textContent = t.getAttribute('data-cursor'); cur.classList.add('hot'); } else { cur.classList.remove('hot'); }
    });
    document.addEventListener('pointerdown', function () { cur.classList.add('press'); });
    document.addEventListener('pointerup', function () { cur.classList.remove('press'); });
    document.documentElement.addEventListener('pointerleave', function () { cur.style.opacity = 0; });
    document.documentElement.addEventListener('pointerenter', function () { cur.style.opacity = 1; });
    if (reduce) return;
    $$('[data-magnetic]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.28) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.4) + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1),background .35s,color .35s'; b.style.transform = ''; setTimeout(function () { b.style.transition = ''; }, 600); });
    });
  });

  /* ── project art (small abstract marks) ── */
  var ART = {
    offy: '<svg viewBox="0 0 125 100"><g fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="62" cy="50" r="10"/><circle cx="62" cy="50" r="22"/><circle cx="62" cy="50" r="34" stroke-dasharray="3 4"/><path d="M62 4v20M62 76v20M8 50h20M96 50h20"/></g></svg>',
    furn: '<svg viewBox="0 0 125 100"><g fill="none" stroke="currentColor" stroke-width="1.2"><path d="M62 14l36 20v32L62 86 26 66V34z"/><path d="M26 34l36 20 36-20M62 54v32"/></g></svg>',
    news: '<svg viewBox="0 0 125 100"><g fill="currentColor"><rect x="16" y="16" width="93" height="8"/><rect x="16" y="34" width="56" height="5" opacity=".6"/><rect x="16" y="46" width="56" height="5" opacity=".6"/><rect x="16" y="58" width="56" height="5" opacity=".6"/><rect x="80" y="34" width="29" height="29" opacity=".35"/><rect x="16" y="76" width="93" height="4" opacity=".4"/></g></svg>',
    code: '<svg viewBox="0 0 125 100"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M44 28L22 50l22 22M81 28l22 22-22 22M70 22L55 78"/></g></svg>',
    track: '<svg viewBox="0 0 125 100"><g fill="none" stroke="currentColor" stroke-width="1.2"><rect x="18" y="18" width="14" height="14"/><rect x="18" y="44" width="14" height="14"/><rect x="18" y="70" width="14" height="14"/><path d="M21 25l4 4 6-8" stroke-width="1.8"/><path d="M44 25h60M44 51h48M44 77h54" opacity=".6"/></g></svg>',
    term: '<svg viewBox="0 0 125 100"><g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="14" y="16" width="97" height="68" rx="4"/><path d="M26 38l12 8-12 8M46 56h24"/></g></svg>'
  };

  /* ── projects list ── */
  var list = $('#projects');
  safe(function () {
    D.projects.forEach(function (p, i) {
      var li = el('li', 'proj' + (p.flagship ? ' flag' : ''));
      var b = el('button', 'proj-btn'); b.type = 'button'; b.setAttribute('data-cursor', 'Open'); b.setAttribute('data-id', p.id);
      b.setAttribute('aria-label', 'Open case study: ' + p.name);
      b.appendChild(el('span', 'proj-no mono', String(i + 1).padStart(2, '0')));
      b.appendChild(el('span', 'proj-name', p.name));
      var m = el('span', 'proj-meta mono'); m.appendChild(el('span', null, p.kind)); m.appendChild(el('b', null, p.tag)); b.appendChild(m);
      var art = el('span', 'proj-art'); art.setAttribute('aria-hidden', 'true'); art.innerHTML = ART[p.art] || ''; li.appendChild(b); li.appendChild(art);
      b.addEventListener('click', function (e) { openCase(p.id, e.clientX ? e : null, b); });
      list.appendChild(li);
    });
  });

  /* ── case study overlay ── */
  var cs = $('#case'), csScroll = $('#caseScroll'), lastFocus = null, curId = null;
  cs.setAttribute('aria-hidden', 'true'); cs.setAttribute('inert', '');
  function fill(p, idx) {
    $('#caseIdx').textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(D.projects.length).padStart(2, '0');
    $('#caseKind').textContent = p.kind; $('#caseTitle').textContent = p.name; $('#caseLead').textContent = p.lead;
    var links = $('#caseLinks'); links.textContent = '';
    p.links.forEach(function (l, i) { var a = el('a', 'btn ' + (i === 0 ? 'btn-solid' : 'btn-line')); a.href = l[1]; a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('data-cursor', 'Open'); a.appendChild(el('span', null, l[0] + ' ↗')); links.appendChild(a); });
    var caps = $('#caseCaps'); caps.textContent = ''; p.caps.forEach(function (c) { caps.appendChild(el('li', null, c)); });
    var st = $('#caseStack'); st.textContent = ''; p.stack.forEach(function (s) { st.appendChild(el('span', 'chip', s)); });
    $('#caseSource').textContent = p.source;
    var arch = $('#caseArch'); arch.textContent = '';
    p.arch.forEach(function (a, i) { var li = el('li'); li.appendChild(el('span', 'n mono', String(i + 1).padStart(2, '0'))); li.appendChild(el('b', null, a[0])); li.appendChild(el('span', null, a[1])); arch.appendChild(li); });
    var nx = D.projects[(idx + 1) % D.projects.length]; $('#caseNextName').textContent = nx.name; $('#caseNext').setAttribute('data-id', nx.id);
    $('#caseNext').setAttribute('aria-label', 'Next project: ' + nx.name);
    csScroll.scrollTop = 0;
  }
  function openCase(id, ev, trigger) {
    var idx = D.projects.findIndex(function (p) { return p.id === id; }); if (idx < 0) return;
    if (curId == null) lastFocus = trigger || document.activeElement;
    fill(D.projects[idx], idx); curId = id;
    var cx = ev && ev.clientX ? ev.clientX : innerWidth / 2, cy = ev && ev.clientY ? ev.clientY : innerHeight / 2;
    cs.style.setProperty('--cx', cx + 'px'); cs.style.setProperty('--cy', cy + 'px');
    cs.removeAttribute('inert'); cs.setAttribute('aria-hidden', 'false'); cs.classList.add('open'); document.body.classList.add('lock');
    setTimeout(function () { $('#caseClose').focus({ preventScroll: true }); }, reduce ? 0 : 400);
  }
  function closeCase() {
    if (curId == null) return; curId = null;
    cs.classList.remove('open'); cs.setAttribute('aria-hidden', 'true'); cs.setAttribute('inert', ''); document.body.classList.remove('lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  window.__openCase = function (id) { openCase(id, null, $('#terminal')); };
  $('#caseClose').addEventListener('click', closeCase);
  $('#caseNext').addEventListener('click', function (e) { openCase(this.getAttribute('data-id'), e); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (curId != null) closeCase(); else if (menu.classList.contains('open')) { setMenu(false); menuBtn.focus(); } }
    if (e.key === 'Tab' && curId != null) {
      var f = $$('a[href],button:not([disabled])', cs).filter(function (n) { return n.offsetParent !== null; });
      if (!f.length) return; var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ── skills: list + constellation ── */
  var activeCat = null;
  safe(function () {
    var tabs = $('#catTabs'), out = $('#skillList');
    function mk(id, label) { var b = el('button', null, label); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('data-cat', id); b.addEventListener('click', function () { setCat(activeCat === id ? null : id); }); tabs.appendChild(b); }
    mk('all', 'All'); D.skills.forEach(function (c) { mk(c.id, c.label); });
    D.skills.forEach(function (c) {
      var g = el('div', 'skill-group'); g.setAttribute('data-cat', c.id);
      var h = el('h3', null, c.label); h.appendChild(el('span', null, String(c.items.length).padStart(2, '0'))); g.appendChild(h);
      var ul = el('ul'); c.items.forEach(function (i) { ul.appendChild(el('li', null, i)); }); g.appendChild(ul); out.appendChild(g);
    });
    window.__setCat = setCat;
    function setCat(id) {
      activeCat = (id === 'all') ? null : id;
      $$('button', tabs).forEach(function (b) { var on = (b.dataset.cat === 'all' && !activeCat) || b.dataset.cat === activeCat; b.setAttribute('aria-pressed', String(on)); });
      $$('.skill-group', out).forEach(function (g) {
        g.classList.toggle('dim', !!activeCat && g.dataset.cat !== activeCat);
        g.classList.toggle('selected', !!activeCat && g.dataset.cat === activeCat);
      });
      if (window.__constRedraw) window.__constRedraw();
    }
    setCat(null);
  });

  safe(function () {
    var cv = $('#constellation'); if (!cv) return;
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, nodes = [], hubs = [], mouse = { x: -999, y: -999 }, vis = false, raf = 0, hover = null;
    var col = {};
    function readCols() { var s = getComputedStyle(root); col.fg = s.getPropertyValue('--fg').trim(); col.acc = s.getPropertyValue('--acc').trim(); col.mut = s.getPropertyValue('--mut').trim(); col.line = s.getPropertyValue('--line').trim(); }
    function seed(i) { var x = Math.sin(i * 9301 + 49297) * 233280; return x - Math.floor(x); }
    function layout() {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = []; hubs = []; var n = D.skills.length, S = Math.min(W, H), R = S * 0.3, k = 0;
      var cxs = [[.27, .27], [.73, .27], [.70, .72], [.27, .72]]; /* quadrant anchors keep clusters apart */
      D.skills.forEach(function (c, ci) {
        var an = cxs[ci % cxs.length], hx = W * an[0], hy = H * an[1];
        var hub = { id: c.id, label: c.label, x: hx, y: hy, hx: hx, hy: hy, r: 7 }; hubs.push(hub);
        c.items.forEach(function (it, ii) {
          var m = c.items.length, aa = (ii / m) * Math.PI * 2 + ci * 0.7, rr = S * (ii % 2 ? 0.085 : 0.2); aa += (ii % 2 ? 0.35 : 0);
          nodes.push({ cat: c.id, label: it, hub: hub, ox: Math.cos(aa) * rr, oy: Math.sin(aa) * rr * 0.8, x: hx, y: hy, vx: 0, vy: 0, ph: seed(k + 3) * 6.28, r: 3, right: Math.cos(aa) >= 0 }); k++;
        });
      });
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      var small = W < 420; ctx.font = (small ? '10px ' : '11px ') + 'JetBrains Mono, ui-monospace, monospace'; ctx.textBaseline = 'middle';
      hover = null;
      nodes.forEach(function (n) {
        var tx = n.hub.x + n.ox + Math.sin(t * 0.0006 + n.ph) * 8, ty = n.hub.y + n.oy + Math.cos(t * 0.0007 + n.ph) * 8;
        tx = clamp(tx, n.right ? 18 : 128, W - (n.right ? 128 : 18)); ty = clamp(ty, 18, H - 40);
        var dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 90 && d > 0.1) { var f = (90 - d) / 90 * 2.2; n.vx += dx / d * f; n.vy += dy / d * f; }
        n.vx += (tx - n.x) * 0.04; n.vy += (ty - n.y) * 0.04; n.vx *= 0.82; n.vy *= 0.82; n.x += n.vx; n.y += n.vy;
        if (d < 22 && !hover) hover = n;
      });
      hubs.forEach(function (h) { var tx = h.hx + Math.sin(t * 0.0004 + h.hx) * 5, ty = h.hy + Math.cos(t * 0.0005 + h.hy) * 5; h.x += (tx - h.x) * 0.05; h.y += (ty - h.y) * 0.05; });
      /* links */
      nodes.forEach(function (n) {
        var on = !activeCat || n.cat === activeCat; ctx.globalAlpha = on ? 0.35 : 0.06; ctx.strokeStyle = on ? col.acc : col.line; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(n.hub.x, n.hub.y); ctx.lineTo(n.x, n.y); ctx.stroke();
      });
      /* cross-links */
      ctx.lineWidth = 1; for (var i = 0; i < hubs.length; i++) { var a = hubs[i], b = hubs[(i + 1) % hubs.length]; ctx.globalAlpha = activeCat ? 0.05 : 0.18; ctx.strokeStyle = col.fg; ctx.setLineDash([2, 6]); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      ctx.setLineDash([]);
      nodes.forEach(function (n) {
        var on = !activeCat || n.cat === activeCat, hv = hover === n;
        ctx.globalAlpha = on ? 1 : 0.18; ctx.fillStyle = (hv || (activeCat && on)) ? col.acc : col.fg;
        ctx.beginPath(); ctx.arc(n.x, n.y, hv ? 5 : n.r, 0, 6.283); ctx.fill();
        if (on && (hv || !small || activeCat)) { ctx.globalAlpha = hv ? 1 : (on ? 0.8 : 0.2); ctx.fillStyle = hv ? col.acc : col.fg; ctx.textAlign = n.right ? 'left' : 'right'; ctx.fillText(n.label, n.x + (n.right ? 9 : -9), n.y); ctx.textAlign = 'left'; }
      });
      hubs.forEach(function (h) {
        var on = !activeCat || h.id === activeCat; ctx.globalAlpha = on ? 1 : 0.25;
        ctx.strokeStyle = col.acc; ctx.lineWidth = 1.5; ctx.fillStyle = col.acc; ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, 6.283); ctx.stroke();
        ctx.beginPath(); ctx.arc(h.x, h.y, 2.5, 0, 6.283); ctx.fill();
        ctx.fillStyle = col.fg; ctx.font = '600 ' + (small ? 11 : 13) + 'px JetBrains Mono, ui-monospace, monospace'; ctx.fillText(h.label.toUpperCase(), h.x + 14, h.y - 14);
        ctx.font = (small ? '10px ' : '11px ') + 'JetBrains Mono, ui-monospace, monospace';
      });
      ctx.globalAlpha = 1; cv.style.cursor = hover ? 'pointer' : '';
    }
    function loop(t) { raf = 0; if (!vis || document.hidden) return; draw(t); raf = requestAnimationFrame(loop); }
    function go() { if (!raf && !reduce) raf = requestAnimationFrame(loop); }
    window.__constRedraw = function () { readCols(); if (W) draw(performance.now()); };
    cv.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    cv.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
    cv.addEventListener('click', function (e) {
      var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, best = null, bd = 30;
      hubs.forEach(function (h) { var d = Math.hypot(h.x - x, h.y - y); if (d < bd) { bd = d; best = h; } });
      nodes.forEach(function (n) { var d = Math.hypot(n.x - x, n.y - y); if (d < bd) { bd = d; best = { id: n.cat }; } });
      if (best && window.__setCat) window.__setCat(activeCat === best.id ? null : best.id);
    });
    readCols(); layout(); draw(performance.now());
    window.addEventListener('resize', function () { layout(); draw(performance.now()); });
    new IntersectionObserver(function (e) { vis = e[0].isIntersecting; if (vis) go(); }).observe(cv);
    document.addEventListener('visibilitychange', go);
  });

  /* ── terminal ── */
  safe(function () {
    var body = $('#termBody'), form = $('#termForm'), input = $('#termInput'), hist = [], hi = -1;
    var P = D.projects;
    function ln(text, cls) { var d = el('span', 'ln ' + (cls || 'out')); d.textContent = text; body.appendChild(d); return d; }
    function lk(label, url, pre) { var d = el('span', 'ln out'); if (pre) d.appendChild(document.createTextNode(pre)); var a = el('a', null, label); a.href = url; a.target = '_blank'; a.rel = 'noopener'; d.appendChild(a); body.appendChild(d); }
    function scrollEnd() { body.scrollTop = body.scrollHeight; }
    var secs = ['about', 'skills', 'work', 'lab', 'path', 'contact'];
    var cmds = {
      help: function () {
        [['help', 'list commands'], ['about', 'who I am'], ['skills', 'technology by discipline'], ['projects', 'list featured work'], ['open <project>', 'open a case study'], ['education', 'degree'], ['internship', 'experience'], ['links', 'GitHub, email and live projects'], ['contact', 'how to reach me'], ['goto <section>', 'jump to ' + secs.join(', ')], ['theme [dark|light]', 'change theme'], ['neofetch', 'a quick summary'], ['history · clear · date · echo', 'shell basics']].forEach(function (r) { ln('  ' + r[0].padEnd(24) + r[1]); });
      },
      about: function () { ln('Bharat Poojari — full-stack developer from Sirsi, Karnataka, India.'); ln('BCA graduate (9.02 CGPA). I build practical web applications, connecting responsive interfaces to useful backend workflows and data.'); ln('Interests: full-stack engineering, AI integration, frontend development, software products and developer tools.'); },
      whoami: function () { ln('bharat — full-stack developer · Sirsi, Karnataka · engineering ideas into reality'); },
      skills: function () { D.skills.forEach(function (c) { ln(c.label.padEnd(10) + c.items.join(' · ')); }); },
      projects: function () { P.forEach(function (p, i) { ln((i + 1) + '. ' + p.id.padEnd(12) + p.kind); }); ln("Type 'open <project>' to read a case study.", 'out'); },
      education: function () { ln('Bachelor of Computer Applications (BCA) — 9.02 CGPA'); },
      internship: function () { ln('Prompt Engineering — Web Development · ProEdge Learning'); },
      links: function () { lk(D.github, D.github, 'github     '); lk(D.email, 'mailto:' + D.email, 'email      '); P.forEach(function (p) { if (p.links[0] && /vercel\.app/.test(p.links[0][1])) lk(p.links[0][1].replace(/^https?:\/\//, ''), p.links[0][1], p.id.padEnd(11)); }); },
      contact: function () { lk(D.email, 'mailto:' + D.email, 'email me at '); ln('Or use the form in the Contact section — try: goto contact'); },
      neofetch: function () {
        ['  ┌─┐  bharat@portfolio', '  │B│  ──────────────────', '  └─┘  role      full-stack developer', '       base      Sirsi, Karnataka, IN', '       degree    BCA · 9.02 CGPA', '       flagships OffyAI, Furniqo', '       stack     React · TypeScript · Node · PHP · MySQL', '       focus     AI integration · dev tools'].forEach(function (l) { ln(l, 'hl'); });
      },
      date: function () { ln(new Date().toString()); },
      history: function () { if (!hist.length) ln('(empty)'); hist.slice().reverse().forEach(function (h, i) { ln('  ' + (i + 1) + '  ' + h); }); },
      clear: function () { body.textContent = ''; },
      echo: function (a) { ln(a.join(' ')); },
      sudo: function () { ln('bharat is not in the sudoers file. This incident will be reported to… nobody. Nice try.'); },
      theme: function (a) {
        var t = (a[0] || '').toLowerCase(), cur = root.dataset.theme;
        if (!t || t === 'toggle') t = cur === 'dark' ? 'light' : 'dark';
        if (t !== 'dark' && t !== 'light') { ln('usage: theme [dark|light]'); return; }
        window.__setTheme(t); ln('theme → ' + t);
      },
      goto: function (a) { var s = (a[0] || '').replace('#', ''); if (secs.indexOf(s) < 0 && s !== 'top') { ln('usage: goto <' + secs.join('|') + '>'); return; } ln('→ ' + s); setTimeout(function () { window.__goTo('#' + s); }, 200); },
      open: function (a) {
        var id = (a[0] || '').toLowerCase(); var p = P.filter(function (x) { return x.id === id || x.name.toLowerCase() === id; })[0];
        if (!p) { ln('usage: open <' + P.map(function (x) { return x.id; }).join('|') + '>'); return; }
        ln('opening ' + p.name + '…'); setTimeout(function () { window.__openCase(p.id); }, 250);
      }
    };
    cmds.ls = function () { ln(secs.join('  ') + '  top'); };
    cmds.cat = function (a) { if (a[0] === 'about' || a[0] === 'about.txt') cmds.about(); else ln('cat: ' + (a[0] || '') + ': try “about”'); };
    var names = Object.keys(cmds);
    function run(raw) {
      var line = raw.trim(); var d = el('span', 'ln cmd'); var pr = el('span', 'pr', 'bharat@portfolio'); d.appendChild(pr); d.appendChild(document.createTextNode(':~$ ' + raw)); body.appendChild(d);
      if (!line) { scrollEnd(); return; }
      hist.unshift(line); hi = -1;
      var parts = line.split(/\s+/), c = parts[0].toLowerCase();
      if (cmds[c]) cmds[c](parts.slice(1)); else ln('command not found: ' + c + " — type 'help'");
      scrollEnd();
    }
    ln("Welcome. Type 'help' to see what I can do.", 'hl'); ln('');
    form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; run(v); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp') { e.preventDefault(); if (hi < hist.length - 1) { hi++; input.value = hist[hi]; } }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (hi > 0) { hi--; input.value = hist[hi]; } else { hi = -1; input.value = ''; } }
      else if (e.key === 'Tab') {
        e.preventDefault(); var v = input.value, parts = v.split(/\s+/);
        if (parts.length === 1) { var m = names.filter(function (n) { return n.indexOf(parts[0]) === 0; }); if (m.length === 1) input.value = m[0] + ' '; else if (m.length > 1) ln(m.join('  ')); }
        else if (parts[0] === 'open') { var mm = P.filter(function (p) { return p.id.indexOf(parts[1] || '') === 0; }); if (mm.length === 1) input.value = 'open ' + mm[0].id; }
        else if (parts[0] === 'goto') { var ms = secs.filter(function (s) { return s.indexOf(parts[1] || '') === 0; }); if (ms.length === 1) input.value = 'goto ' + ms[0]; }
      }
      else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); cmds.clear(); }
    });
    $('#terminal').addEventListener('click', function (e) { if (!window.getSelection().toString() && e.target.tagName !== 'A') input.focus({ preventScroll: true }); });
    var chips = $('#termChips');
    ['help', 'about', 'projects', 'open offyai', 'open furniqo', 'theme light'].forEach(function (c) {
      var b = el('button', 'chip', c); b.type = 'button'; b.addEventListener('click', function () { run(c); input.focus({ preventScroll: true }); }); chips.appendChild(b);
    });
  });

  /* ── contact form ── */
  safe(function () {
    var f = $('#contactForm'), note = $('#formNote');
    function setErr(id, msg) { var fi = $('#' + id), box = fi.closest('.field'); $('.err[data-for="' + id + '"]').textContent = msg || ''; box.classList.toggle('bad', !!msg); fi.setAttribute('aria-invalid', msg ? 'true' : 'false'); }
    function setStatus(message, state) {
      note.textContent = message;
      if (state) note.dataset.state = state; else note.removeAttribute('data-state');
    }
    f.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (f.getAttribute('aria-busy') === 'true') return;
      var n = $('#fName').value.trim(), m = $('#fEmail').value.trim(), g = $('#fMsg').value.trim(), ok = true, first = null;
      setErr('fName', n ? '' : 'Please tell me your name.'); if (!n) { ok = false; first = first || $('#fName'); }
      var em = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m); setErr('fEmail', em ? '' : 'Please enter a valid email address.'); if (!em) { ok = false; first = first || $('#fEmail'); }
      setErr('fMsg', g.length >= 10 ? '' : 'A little more detail, please (10+ characters).'); if (g.length < 10) { ok = false; first = first || $('#fMsg'); }
      if (!ok) { first.focus(); setStatus('Please fix the highlighted fields.', 'error'); return; }
      var submit = $('#submitBtn'), submitLabel = submit.querySelector('span'), originalLabel = submitLabel.textContent;
      f.setAttribute('aria-busy', 'true');
      submit.disabled = true;
      submitLabel.textContent = 'Sending...';
      setStatus('Sending your message...', 'sending');
      try {
        var response = await fetch(f.action, {
          method: 'POST',
          body: new FormData(f),
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) {
          setStatus('Your message could not be sent (HTTP ' + response.status + '). Please try again or email ' + D.email + '.', 'error');
          return;
        }
        f.reset();
        setStatus('Thanks — your message has been sent. I’ll get back to you soon.', 'success');
      } catch (error) {
        console.error('Form submission error:', error);
        setStatus('A network error prevented sending. Please try again or email ' + D.email + '.', 'error');
      } finally {
        f.removeAttribute('aria-busy');
        submit.disabled = false;
        submitLabel.textContent = originalLabel;
      }
    });
    $('#copyMail').addEventListener('click', function () {
      function done() { setStatus('Copied ' + D.email + ' to your clipboard.', 'success'); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(D.email).then(done, fallback); else fallback();
      function fallback() { var t = el('textarea'); t.value = D.email; t.style.position = 'fixed'; t.style.opacity = 0; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); done(); } catch (e) { setStatus('Email: ' + D.email); } t.remove(); }
    });
    $('#year').textContent = new Date().getFullYear();
  });
})();
