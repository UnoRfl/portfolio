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

  // Invert the About artwork's colors in a pointer-following spotlight.
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
