/* ============================================================
   ROOTA — UX CASE STUDY · interactions
   ============================================================ */
(function () {
  'use strict';
  function res(id, path){ return (window.__resources && window.__resources[id]) || path; }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Abstract typewriter ---------- */
  var absType = document.getElementById('abs-type');
  if (absType) {
    var absFull = absType.getAttribute('data-text') || '';
    var absRest = document.getElementById('abs-rest');
    var caretHTML = '<span class="type-caret"></span>';
    var absDone = function () { absType.innerHTML = absFull + caretHTML; if (absRest) absRest.classList.add('in'); };
    if (reduce) { absDone(); }
    else {
      var ai = 0, askip = false, astarted = false;
      var atick = function () {
        if (askip) { absDone(); return; }
        if (ai <= absFull.length) {
          absType.innerHTML = absFull.slice(0, ai) + caretHTML;
          ai++;
          setTimeout(atick, 15 + Math.random() * 26);
        } else if (absRest) { absRest.classList.add('in'); }
      };
      var aio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting && !astarted) { astarted = true; atick(); aio.disconnect(); } });
      }, { threshold: 0.35 });
      aio.observe(absType);
      var absSec = document.getElementById('abstract');
      if (absSec) absSec.addEventListener('click', function () { if (ai <= absFull.length) askip = true; });
    }
  }

  /* ---------- Reading progress (rAF-throttled) ---------- */
  var progress = document.querySelector('.progress');
  var progTicking = false;
  function updateProgress() {
    progTicking = false;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
    if (progress) progress.style.width = (pct * 100) + '%';
  }
  function onScroll() {
    if (!progTicking) { progTicking = true; requestAnimationFrame(updateProgress); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  updateProgress();

  /* ---------- Scroll-spy nav ---------- */
  var links = [].slice.call(document.querySelectorAll('.nav__links a'));
  var map = {};
  links.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var el = document.getElementById(id);
    if (el) map[id] = a;
  });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        links.forEach(function (l) { l.classList.remove('is-active'); });
        var a = map[e.target.id];
        if (a) {
          a.classList.add('is-active');
          var bar = a.parentElement;
          if (bar) {
            var t = a.offsetLeft - bar.clientWidth / 2 + a.clientWidth / 2;
            bar.scrollTo({ left: Math.max(0, t), behavior: 'smooth' });
          }
        }
      }
    });
  }, { rootMargin: '-50% 0px -45% 0px', threshold: 0 });
  Object.keys(map).forEach(function (id) { spy.observe(document.getElementById(id)); });

  /* ---------- Reveal + charts + counters ---------- */
  function animateBars(scope) {
    [].slice.call(scope.querySelectorAll('.bar__fill')).forEach(function (f) {
      var w = f.getAttribute('data-w');
      if (w) requestAnimationFrame(function(){ f.style.width = w + '%'; });
    });
  }
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = target + suffix; return; }
    var dur = 1100, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var revObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        animateBars(e.target);
        [].slice.call(e.target.querySelectorAll('[data-count]')).forEach(countUp);
        revObs.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  [].slice.call(document.querySelectorAll('.reveal')).forEach(function (el) { revObs.observe(el); });
  // counters not inside a .reveal
  [].slice.call(document.querySelectorAll('[data-count]')).forEach(function (el) {
    if (!el.closest('.reveal')) revObs.observe(el);
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = lb && lb.querySelector('img');
  var lbCap = lb && lb.querySelector('.lightbox__cap');
  function openLb(src, cap) {
    if (!lb) return;
    lbImg.src = src; lbCap.textContent = cap || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    if (!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function(){ lbImg.src = ''; }, 200);
  }
  if (lb) {
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lightbox__close')) closeLb();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });
  }
  document.addEventListener('click', function (e) {
    var z = e.target.closest('[data-zoom]');
    if (!z) return;
    var img = z.tagName === 'IMG' ? z : z.querySelector('img');
    if (!img) return;
    var cap = z.getAttribute('data-cap') || img.getAttribute('alt') || '';
    openLb(img.getAttribute('data-full') || img.src, cap);
  });

  /* ---------- Affinity board ⇄ themes toggle ---------- */
  var affinity = document.querySelector('.affinity');
  if (affinity) {
    var tabs = [].slice.call(affinity.querySelectorAll('.affinity__tab'));
    var panels = [].slice.call(affinity.querySelectorAll('.affinity__panel'));
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var view = tab.getAttribute('data-view');
        tabs.forEach(function (t) { t.classList.toggle('is-on', t === tab); });
        panels.forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== view; });
      });
    });
  }

  /* ---------- Interactive priority matrix ---------- */
  var matrix = document.querySelector('.matrix');
  if (matrix) {
    var tip = matrix.querySelector('.matrix__tip');
    var dots = [].slice.call(matrix.querySelectorAll('.dot'));
    function showTip(dot) {
      dots.forEach(function (d) { d.classList.remove('active'); });
      dot.classList.add('active');
      var hmw = tip.querySelector('.tip-hmw');
      if (hmw) hmw.textContent = dot.getAttribute('data-hmw') ? 'HMW ' + dot.getAttribute('data-hmw') : '';
      tip.querySelector('b').textContent = dot.getAttribute('data-name');
      tip.querySelector('span').textContent = dot.getAttribute('data-desc');
      var b = parseFloat(dot.style.bottom);
      var l = parseFloat(dot.style.left);
      tip.style.left = Math.min(Math.max(l, 18), 82) + '%';
      if (b > 50) {
        tip.style.top = 'calc(' + (100 - b) + '% + 24px)';
        tip.style.bottom = 'auto';
      } else {
        tip.style.bottom = 'calc(' + b + '% + 24px)';
        tip.style.top = 'auto';
      }
      tip.classList.add('show');
    }
    dots.forEach(function (dot) {
      dot.addEventListener('mouseenter', function () { showTip(dot); });
      dot.addEventListener('click', function () { showTip(dot); });
    });
    matrix.addEventListener('mouseleave', function () {
      tip.classList.remove('show');
      dots.forEach(function (d) { d.classList.remove('active'); });
    });
  }

  /* ---------- Interactive scenario player ---------- */
  var sim = document.getElementById('sim');
  if (sim) {
    var SCENES = [
      {
        img: res('sc2','assets/screens/s2.png'),
        step: 'Scene 1 of 4 · Arriving',
        narr: 'You arrive at Riverside Park with your child. Families are gathered near the BBQ area — some setting up, others chatting. You don\u2019t know anyone yet.',
        q: 'What do you do first?',
        choices: ['Walk over and smile at people', 'Find a quiet spot to observe first', 'Let your child lead toward the other kids']
      },
      {
        img: res('sc3','assets/screens/s3.png'),
        step: 'Scene 2 of 4 · First contact',
        narr: 'Food is nearly ready. A parent you haven\u2019t met turns to you with a friendly smile \u2014 \u201CFirst time here?\u201D',
        q: 'How do you respond?',
        choices: ['\u201CYes! Any tips for a first-timer?\u201D', '\u201CYeah, just checking it out\u201D', 'Look toward your child and smile shyly']
      },
      {
        img: res('sc4','assets/screens/s4.png'),
        step: 'Scene 3 of 4 · At the grill',
        narr: 'The host is serving food from the grill and gestures toward the spread of dishes on the picnic table.',
        q: 'How do you respond?',
        choices: ['Thank them and ask what they recommend', 'Take a small portion and say thank you', 'Politely decline and say you\u2019ll eat later']
      },
      {
        img: res('sc5','assets/screens/s5.png'),
        step: 'Scene 4 of 4 · Leaving',
        narr: 'A few hours have passed. Your child is getting tired and other families start to pack up and say goodbye.',
        q: 'What do you do?',
        choices: ['Say a warm goodbye to the people you met', 'Wave generally and leave quietly', 'Ask if there\u2019ll be another BBQ soon']
      }
    ];
    var RECAP = {
      img: 'assets/screens/s6.png',
      title: 'Natural Connector',
      text: 'You walked in like you belonged \u2014 and by the end, you did. By rehearsing the social moments before arriving, families trade the fear of the unknown for a plan they\u2019ve already practised.'
    };
    var phoneImg = sim.querySelector('.sim__phone img');
    var side = sim.querySelector('.sim__side');
    var idx = 0, score = 0;
    var WEIGHTS = [[2,1,0],[2,1,0],[2,1,0],[2,1,0]];
    var OUTCOMES = [
      { min: 7, img: res('outNatural','assets/sim/natural-connector.png'), title: 'Confident Connector', text: 'You walked in like you belonged, and by the end, you did. You took initiative from the first moment, opened conversations with warmth, and left with real connections.' },
      { min: 5, img: res('outCareful','assets/sim/careful-warm.png'), title: 'Careful but Warm', text: 'You took your time, and that is completely okay. You stayed present, responded warmly when others reached out, and found your rhythm as the day went on.' },
      { min: 3, img: res('outObserver','assets/sim/observer.png'), title: 'Careful Observer', text: 'You showed up, and that is already the hardest part. You kept your family comfortable and learned how the group works. Try one small action next time: a smile at one person.' },
      { min: 0, img: res('outFirst','assets/sim/first-steps.png'), title: 'First Steps', text: 'Every expert was once a beginner, and you have taken step one. You stayed even when it felt uncomfortable, kept your child happy, and now know what to expect next time.' }
    ];
    function pickOutcome(){ for (var i=0;i<OUTCOMES.length;i++){ if (score>=OUTCOMES[i].min) return OUTCOMES[i]; } return OUTCOMES[OUTCOMES.length-1]; }

    function preload(src){ var i = new Image(); i.src = src; }
    SCENES.forEach(function(s){ preload(s.img); }); OUTCOMES.forEach(function(o){ preload(o.img); });

    function dotsHtml(active, total) {
      var h = '<div class="sim__dots">';
      for (var i = 0; i < total; i++) h += '<i class="' + (i <= active ? 'on' : '') + '"></i>';
      return h + '</div>';
    }
    function swapImg(src) {
      if (reduce) { phoneImg.src = src; return; }
      phoneImg.style.opacity = 0;
      setTimeout(function () { phoneImg.src = src; phoneImg.style.opacity = 1; }, 200);
    }
    function renderScene(i) {
      var s = SCENES[i];
      swapImg(s.img);
      var letters = ['A', 'B', 'C'];
      var html = dotsHtml(i, SCENES.length);
      html += '<p class="sim__step">' + s.step + '</p>';
      html += '<p class="sim__narr">' + s.narr + '</p>';
      html += '<p class="sim__q">' + s.q + '</p>';
      html += '<div class="sim__choices">';
      s.choices.forEach(function (c, n) {
        html += '<button class="sim__choice" data-next="1" data-score="' + (WEIGHTS[i] ? WEIGHTS[i][n] : 0) + '"><span class="k">' + letters[n] + '</span><span>' + c + '</span></button>';
      });
      html += '</div>';
      html += '<p class="sim__hint">Any choice moves the story on \u2014 there are no wrong answers, just a rehearsal.</p>';
      side.innerHTML = html;
    }
    function renderRecap() {
      var o = pickOutcome();
      swapImg(o.img);
      var html = dotsHtml(SCENES.length, SCENES.length);
      html += '<p class="sim__step">Simulation complete · your result</p>';
      html += '<div class="sim__recap"><h4>' + o.title + '</h4><p>' + o.text + '</p>';
      html += '<p class="sim__score">You scored ' + score + '/8 — one of four possible endings. Replay and try a different approach.</p>';
      html += '<button class="sim__restart" data-restart>\u21BA  Replay the simulation</button></div>';
      side.innerHTML = html;
    }
    sim.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-next]');
      if (btn) {
        score += parseInt(btn.getAttribute('data-score'), 10) || 0;
        idx++;
        if (idx >= SCENES.length) renderRecap(); else renderScene(idx);
      } else if (e.target.closest('[data-restart]')) {
        idx = 0; score = 0; renderScene(0);
      }
    });
    renderScene(0);
  }

  /* ---------- Kids Mode storybook ---------- */
  var sb = document.getElementById('storybook');
  if (sb) {
    var PAGES = ['cover','p1','p2','p3','p4','p5','end'].map(function(n){ return res('kid_'+n, 'assets/kids/' + n + '.png'); });
    var stage = document.getElementById('sb-stage');
    var pageImg = document.getElementById('sb-page');
    var prevBtn = document.getElementById('sb-prev');
    var nextBtn = document.getElementById('sb-next');
    var dotsWrap = document.getElementById('sb-dots');
    var hint = document.getElementById('sb-hint');
    var last = PAGES.length - 1;
    var cur = 0;
    PAGES.forEach(function(s){ var im = new Image(); im.src = s; });
    PAGES.forEach(function(_, i){
      var d = document.createElement('i');
      d.addEventListener('click', function(){ go(i); });
      dotsWrap.appendChild(d);
    });
    var dots = [].slice.call(dotsWrap.children);
    function setHint() {
      if (!hint) return;
      if (cur === 0) hint.textContent = 'Tap \u201CRead the Story\u201D to begin';
      else if (cur === last) hint.textContent = 'The end \u2014 read again, or back to the cover';
      else hint.textContent = 'Page ' + cur + ' of ' + (last - 1);
    }
    function render() {
      if (reduce) { pageImg.src = PAGES[cur]; }
      else { pageImg.style.opacity = 0; setTimeout(function(){ pageImg.src = PAGES[cur]; pageImg.style.opacity = 1; }, 160); }
      stage.classList.toggle('is-cover', cur === 0);
      stage.classList.toggle('is-end', cur === last);
      prevBtn.disabled = cur === 0;
      nextBtn.disabled = cur === last;
      dots.forEach(function(d, i){ d.classList.toggle('on', i === cur); });
      setHint();
    }
    function go(i) { cur = Math.max(0, Math.min(last, i)); render(); }
    prevBtn.addEventListener('click', function(e){ e.stopPropagation(); go(cur - 1); });
    nextBtn.addEventListener('click', function(e){ e.stopPropagation(); go(cur + 1); });
    stage.addEventListener('click', function(e){
      var hot = e.target.closest('.sb__hot');
      if (hot) {
        var act = hot.getAttribute('data-act');
        if (act === 'menu') go(0); else go(1);
        return;
      }
      if (cur === 0) { go(1); return; }
      if (cur === last) return;
      var r = stage.getBoundingClientRect();
      if ((e.clientX - r.left) < r.width * 0.35) go(cur - 1); else go(cur + 1);
    });
    render();
  }

  /* ---------- Prototype boards accordion ---------- */
  var accs = [].slice.call(document.querySelectorAll('#design .acc'));
  if (accs.length) {
    var openAcc = function (acc) {
      var panel = acc.querySelector('.acc__panel');
      acc.classList.add('open');
      acc.querySelector('.acc__head').setAttribute('aria-expanded', 'true');
      panel.style.overflow = 'hidden';
      panel.style.maxHeight = panel.scrollHeight + 'px';
      var done = function () { if (acc.classList.contains('open')) { panel.style.maxHeight = 'none'; panel.style.overflow = 'visible'; } panel.removeEventListener('transitionend', done); };
      panel.addEventListener('transitionend', done);
    };
    var closeAcc = function (acc) {
      if (!acc.classList.contains('open')) return;
      var panel = acc.querySelector('.acc__panel');
      acc.querySelector('.acc__head').setAttribute('aria-expanded', 'false');
      panel.style.overflow = 'hidden';
      panel.style.maxHeight = panel.scrollHeight + 'px';
      requestAnimationFrame(function () { requestAnimationFrame(function () { panel.style.maxHeight = '0px'; }); });
      acc.classList.remove('open');
    };
    accs.forEach(function (acc) {
      var head = acc.querySelector('.acc__head');
      var panel = acc.querySelector('.acc__panel');
      if (acc.classList.contains('open')) { panel.style.maxHeight = 'none'; panel.style.overflow = 'visible'; head.setAttribute('aria-expanded', 'true'); }
      else head.setAttribute('aria-expanded', 'false');
      head.addEventListener('click', function () {
        var isOpen = acc.classList.contains('open');
        accs.forEach(function (a) { if (a !== acc) closeAcc(a); });
        if (isOpen) closeAcc(acc); else openAcc(acc);
      });
    });
  }
})();
