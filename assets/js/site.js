/* Uno — portfolio behaviour: skeleton images, scroll reveals, drawer, filters, lightbox, contact form */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      var body = form.message.value + '\n\n— ' + form.name.value + ' (' + form.email.value + ')';
      window.location.href = 'mailto:' + form.dataset.to +
        '?subject=' + encodeURIComponent('Portfolio enquiry from ' + form.name.value) +
        '&body=' + encodeURIComponent(body);
      note.textContent = 'Opening your email app…';
    });
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
