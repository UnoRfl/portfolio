/* Uno — portfolio behaviour: skeleton images, scroll reveals, drawer, filters, lightbox, contact form */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal the crimson version of the home sketch only around the pointer.
  var hero = document.querySelector('.hero');
  if (hero) {
    var heroCopy = hero.querySelector('.hero-copy');
    var tintCopy = null;
    if (heroCopy) {
      tintCopy = heroCopy.cloneNode(true);
      tintCopy.classList.add('hero-copy-tint');
      tintCopy.setAttribute('aria-hidden', 'true');
      var tintActions = tintCopy.querySelector('.actions');
      if (tintActions) tintActions.remove();
      tintCopy.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.remove('reveal', 'in');
      });
      heroCopy.appendChild(tintCopy);
    }
    var moveHeroReveal = function (e) {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      var sketchRect = hero.querySelector('.hero-sketch-red').getBoundingClientRect();
      hero.style.setProperty('--sketch-x', (e.clientX - sketchRect.left) + 'px');
      hero.style.setProperty('--sketch-y', (e.clientY - sketchRect.top) + 'px');
      if (heroCopy) {
        var copyRect = heroCopy.getBoundingClientRect();
        heroCopy.style.setProperty('--text-x', (e.clientX - copyRect.left) + 'px');
        heroCopy.style.setProperty('--text-y', (e.clientY - copyRect.top) + 'px');
      }
    };
    hero.addEventListener('pointerenter', function (e) {
      moveHeroReveal(e);
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') hero.classList.add('is-red');
    });
    hero.addEventListener('pointermove', moveHeroReveal);
    hero.addEventListener('pointerleave', function () { hero.classList.remove('is-red'); });
  }

  // Knock the About lines out of register in a pointer-following circle.
  var portrait = document.querySelector('.portrait');
  if (portrait) {
    var movePortraitReveal = function (e) {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      var rect = portrait.getBoundingClientRect();
      portrait.style.setProperty('--portrait-x', (e.clientX - rect.left) + 'px');
      portrait.style.setProperty('--portrait-y', (e.clientY - rect.top) + 'px');
    };
    portrait.addEventListener('pointerenter', function (e) {
      movePortraitReveal(e);
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') portrait.classList.add('is-inverted');
    });
    portrait.addEventListener('pointermove', movePortraitReveal);
    portrait.addEventListener('pointerleave', function () { portrait.classList.remove('is-inverted'); });
  }

  // Keep the home sketch clear of the hero text: centered when there is room,
  // slid right (up to a margin from the border) when the copy would touch it,
  // and shrunk only once it cannot slide any further.
  var heroArt = document.querySelector('.hero-art');
  var contactArt = document.querySelectorAll('.contact-art');
  var wide = matchMedia('(min-width: 681px)');
  if (hero && heroArt) {
    var artImg = heroArt.querySelector('.hero-sketch-white img');
    var redImg = heroArt.querySelector('.hero-sketch-red img');
    var placeArt = function () {
      var artPics = heroArt.querySelectorAll('picture, .glitch');
      heroArt.querySelectorAll('.glitch:not(.glitch--hero-black)').forEach(function (l) { if (redImg.currentSrc) l.style.backgroundImage = 'url("' + redImg.currentSrc + '")'; });
      if (!wide.matches || !artImg.naturalWidth) {
        artPics.forEach(function (p) { p.style.inset = p.style.width = p.style.height = ''; });
        return;
      }
      var box = heroArt.getBoundingClientRect();
      var W = box.width, H = box.height;
      var ar = artImg.naturalWidth / artImg.naturalHeight;
      // horizontal share of the image the figure covers, measured from the artwork
      var f0 = ar > 1 ? 0.345 : 0.02, f1 = ar > 1 ? 0.655 : 0.98;
      var textRight = 0;
      var walker = document.createTreeWalker(heroCopy, NodeFilter.SHOW_TEXT);
      var range = document.createRange();
      var node;
      while ((node = walker.nextNode())) {
        if (!node.textContent.trim() || node.parentElement.closest('.hero-copy-tint')) continue;
        range.selectNodeContents(node);
        Array.prototype.forEach.call(range.getClientRects(), function (r) { textRight = Math.max(textRight, r.right - box.left); });
      }
      heroCopy.querySelectorAll('.btn').forEach(function (b) {
        if (!b.closest('.hero-copy-tint')) textRight = Math.max(textRight, b.getBoundingClientRect().right - box.left);
      });
      var minLeft = textRight + Math.max(24, W * 0.03);
      var maxRight = W - Math.max(32, W * 0.04);
      // full height first; only the black margins of the image may run past the box
      var dw = H * 0.89 * ar;
      var fw = dw * (f1 - f0);
      var figLeft = Math.max(W / 2 - fw / 2, minLeft);
      if (figLeft + fw > maxRight) {
        if (fw <= maxRight - minLeft) figLeft = maxRight - fw;
        else { fw = Math.max(maxRight - minLeft, 0); figLeft = minLeft; dw = fw / (f1 - f0); }
      }
      var dh = dw / ar;
      var inset = ((H - dh) / 2) + 'px auto auto ' + (figLeft - dw * f0) + 'px';
      artPics.forEach(function (p) { p.style.inset = inset; p.style.width = dw + 'px'; p.style.height = dh + 'px'; });
    };
    // runs again whenever the picture swaps between its portrait and landscape files
    artImg.addEventListener('load', placeArt);
    if (artImg.complete) placeArt();
    if (document.fonts) document.fonts.ready.then(placeArt);
    if ('ResizeObserver' in window) new ResizeObserver(placeArt).observe(hero);
    else addEventListener('resize', placeArt);
    // older iOS Safari only has addListener
    if (wide.addEventListener) wide.addEventListener('change', placeArt); else wide.addListener(placeArt);
    redImg.addEventListener('load', placeArt);
  }

  // The home sketch and About line art glitch in random strips.
  var glitch = function (host, style) {
    var heroRoles = ['red', 'black', 'deep'];
    var layers = [0, 1, 2].map(function (index) {
      var l = document.createElement('span');
      l.className = 'glitch';
      if (style === 'hero') l.className += ' glitch--hero-' + heroRoles[index];
      l.setAttribute('aria-hidden', 'true');
      host.appendChild(l);
      return l;
    });
    var rand = function (a, b) { return a + Math.random() * (b - a); };
    var onScreen = function () {
      var r = host.getBoundingClientRect();
      return !document.hidden && r.bottom > 0 && r.top < innerHeight;
    };
    var cut = function (l) {
      var w = l.offsetWidth, h = l.offsetHeight;
      var shape;
      if (Math.random() < 0.7) {
        // a band through a random point at a random angle
        var a = rand(-50, 50) * Math.PI / 180, t = rand(2, 34);
        var px = rand(0.15, 0.85) * w, py = rand(0.08, 0.92) * h, L = w + h;
        var dx = Math.cos(a) * L, dy = Math.sin(a) * L, nx = -Math.sin(a) * t, ny = Math.cos(a) * t;
        shape = [[px + dx + nx, py + dy + ny], [px - dx + nx, py - dy + ny], [px - dx - nx, py - dy - ny], [px + dx - nx, py + dy - ny]];
      } else {
        // a loose block
        var bx = rand(0, 0.7) * w, by = rand(0, 0.85) * h, bw = rand(0.2, 0.6) * w, bh = rand(6, 70);
        shape = [[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]];
      }
      l.style.webkitClipPath = l.style.clipPath = 'polygon(' + shape.map(function (pt) { return pt[0].toFixed(1) + 'px ' + pt[1].toFixed(1) + 'px'; }).join(',') + ')';
      l.style.transform = 'translate(' + rand(-18, 18).toFixed(1) + 'px,' + rand(-4, 4).toFixed(1) + 'px)';
      l.style.opacity = 1;
    };
    var burst = function () {
      if (!onScreen()) { setTimeout(burst, 1200); return; }
      var n = Math.random() < 0.55 ? 1 : Math.random() < 0.7 ? 2 : 3;
      var steps = 1 + Math.floor(rand(0, 4));
      var step = function (i) {
        layers.forEach(function (l, k) { if (k < n && Math.random() < 0.85) cut(l); else l.style.opacity = 0; });
        if (i < steps) setTimeout(step, rand(50, 160), i + 1);
        else setTimeout(function () {
          layers.forEach(function (l) { l.style.opacity = 0; });
          setTimeout(burst, rand(350, 2600));
        }, rand(80, 380));
      };
      step(1);
    };
    setTimeout(burst, rand(200, 900));
  };
  if (heroArt) {
    glitch(heroArt, 'hero');
    placeArt();
  }
  if (portrait) glitch(portrait);
  if (contactArt.length) {
    var contactHost = contactArt[0].parentElement;
    var contactForm = contactHost.querySelector('form');
    var contactMain = contactHost.closest('main');
    var contactWide = matchMedia('(min-width: 1280px)');
    var placeContactArt = function () {
      if (!contactForm || !contactMain || !contactWide.matches) {
        contactArt.forEach(function (art) {
          art.style.top = '';
          art.style.height = '';
          art.style.width = '';
          art.style.left = '';
          art.style.right = '';
        });
        return;
      }
      var formRect = contactForm.getBoundingClientRect();
      var hostRect = contactHost.getBoundingClientRect();
      var mainRect = contactMain.getBoundingClientRect();
      var artPad = Math.min(10, Math.max(4, document.documentElement.clientWidth * 0.006));
      var formGap = 24;
      contactArt.forEach(function (art) {
        var isLeft = art.classList.contains('contact-art--spartan');
        var gapWidth = isLeft ? formRect.left - mainRect.left : mainRect.right - formRect.right;
        var artWidth = Math.max(0, Math.min(300, gapWidth - formGap - artPad));
        art.style.width = artWidth + 'px';
        art.style.height = Math.min(780, gapWidth * 2.82) + 'px';
        art.style.left = isLeft ? (formRect.left - formGap - artWidth - hostRect.left) + 'px' : '';
        art.style.right = isLeft ? '' : (hostRect.right - formRect.right - formGap - artWidth) + 'px';
        art.style.top = (formRect.top - hostRect.top + (formRect.height - art.offsetHeight) / 2) + 'px';
      });
    };
    contactArt.forEach(function (art) { glitch(art); });
    placeContactArt();
    addEventListener('resize', placeContactArt);
    if ('ResizeObserver' in window && contactForm) new ResizeObserver(placeContactArt).observe(contactForm);
  }

  // Skeleton -> image: the shimmer stays until the real pixels have decoded
  document.querySelectorAll('.media img').forEach(function (img) {
    var box = img.closest('.media');
    var done = function () { box.classList.add('is-loaded'); };
    if (img.complete && img.naturalWidth) {
      (img.decode ? img.decode() : Promise.resolve()).then(done, done);
    } else {
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    }
  });

  // Reveal on scroll, staggered within each group
  var io = 'IntersectionObserver' in window && !reduced ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }) : null;
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    group.querySelectorAll(':scope > .reveal').forEach(function (el, i) {
      el.style.setProperty('--d', Math.min(i, 6) * 0.08 + 's');
    });
  });
  document.querySelectorAll('.reveal, .heat').forEach(function (el) {
    if (io) io.observe(el); else el.classList.add('in');
  });

  // Mobile drawer
  var drawer = document.getElementById('drawer');
  var openBtn = document.querySelector('[data-open-menu]');
  if (drawer && openBtn) {
    var closeBtn = drawer.querySelector('[data-close-menu]');
    var setOpen = function (open) {
      drawer.classList.toggle('open', open);
      drawer.setAttribute('aria-hidden', String(!open));
      openBtn.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      (open ? closeBtn : openBtn).focus();
    };
    openBtn.addEventListener('click', function () { setOpen(true); });
    closeBtn.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('open')) setOpen(false); });
  }

  // Work filters
  var pills = document.querySelectorAll('.pill[data-filter]');
  if (pills.length) {
    var cards = document.querySelectorAll('.work-grid .card');
    var count = document.querySelector('.count');
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var f = pill.dataset.filter;
        pills.forEach(function (p) { p.setAttribute('aria-pressed', String(p === pill)); });
        var shown = 0;
        cards.forEach(function (card) {
          var match = f === 'all' || card.dataset.cats.split(' ').indexOf(f) > -1;
          card.classList.remove('is-in');
          card.classList.toggle('is-out', !match);
          if (match) {
            card.classList.add('in');
            card.style.animationDelay = shown * 60 + 'ms';
            void card.offsetWidth;
            card.classList.add('is-in');
            shown++;
          }
        });
        if (count) count.textContent = String(shown).padStart(2, '0') + (shown === 1 ? ' project' : ' projects');
      });
    });
  }

  // Screenshot lightbox
  var lb = document.getElementById('lb');
  var shots = Array.prototype.slice.call(document.querySelectorAll('.shot'));
  if (lb && shots.length) {
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('[data-lb-cap]');
    var idx = 0;
    var last = null;
    var show = function (i) {
      idx = (i + shots.length) % shots.length;
      var s = shots[idx];
      lbImg.classList.add('swap');
      var next = new Image();
      next.onload = next.onerror = function () {
        lbImg.src = next.src;
        lbImg.alt = s.dataset.cap;
        lbImg.classList.remove('swap');
      };
      next.src = s.dataset.full;
      lbCap.textContent = s.dataset.cap + ' · ' + (idx + 1) + ' / ' + shots.length;
    };
    var open = function (i) { last = document.activeElement; show(i); lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; lb.querySelector('.lb-close').focus(); };
    var close = function () { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; if (last) last.focus(); };
    shots.forEach(function (s, i) { s.addEventListener('click', function () { open(i); }); });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('[data-prev]').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('[data-next]').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  // Contact: a static site has no server, so hand the message to the visitor's mail app
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('.form-note');
      if (!form.reportValidity()) return;
      var body = form.message.value + '\n\nFrom: ' + form.name.value + ' (' + form.email.value + ')';
      window.location.href = 'mailto:' + form.dataset.to +
        '?subject=' + encodeURIComponent('Portfolio enquiry from ' + form.name.value) +
        '&body=' + encodeURIComponent(body);
      note.textContent = 'Opening your email app…';
    });
  }

  // Topographic map: a lens follows the cursor and reveals the traces underneath.
  // Only transforms change per frame, and the loop stops once the lens settles.
  var topo = document.querySelector('.topo');
  if (topo && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var lens = topo.firstElementChild, field = lens.firstElementChild;
    var tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty, raf = 0;
    var ease = reduced ? 1 : 0.16;
    var step = function () {
      cx += (tx - cx) * ease; cy += (ty - cy) * ease;
      lens.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      field.style.transform = 'translate3d(' + (300 - cx) + 'px,' + (300 - cy) + 'px,0)';
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5 ? requestAnimationFrame(step) : 0;
    };
    addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      topo.classList.add('on');
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', function () { topo.classList.remove('on'); });
  }

  // Page transitions where cross-document View Transitions aren't supported
  if (!('onpagereveal' in window) && !reduced) {
    root.classList.add('fallback-vt');
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || a.origin !== location.origin || a.hash && a.pathname === location.pathname) return;
      e.preventDefault();
      root.classList.add('leaving');
      setTimeout(function () { location.href = a.href; }, 220);
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) root.classList.remove('leaving'); });
  }
})();
