(function(){
"use strict";

var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- Year ---------------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------- Nav scroll state + progress ---------------- */
var nav = document.getElementById('siteNav');
var progress = document.getElementById('scrollProgress');
var toTop = document.getElementById('toTop');
var ticking = false;

function onScroll(){
  var y = window.scrollY || window.pageYOffset;
  nav.classList.toggle('scrolled', y > 24);

  var h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';

  toTop.classList.toggle('show', y > 700);
  ticking = false;
}

window.addEventListener('scroll', function(){
  if(!ticking){ ticking = true; requestAnimationFrame(onScroll); }
}, {passive:true});
onScroll();

toTop.addEventListener('click', function(){
  window.scrollTo({top:0, behavior: reduceMotion ? 'auto' : 'smooth'});
});

/* ---------------- Mobile menu ---------------- */
var burger = document.getElementById('burgerBtn');
var menu = document.getElementById('mobileMenu');

function setMenu(open){
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.classList.toggle('open', open);
  document.body.classList.toggle('no-scroll', open);
}

burger.addEventListener('click', function(){
  setMenu(burger.getAttribute('aria-expanded') !== 'true');
});
menu.querySelectorAll('[data-mnav]').forEach(function(a){
  a.addEventListener('click', function(){ setMenu(false); });
});
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape' && menu.classList.contains('open')) setMenu(false);
});
window.addEventListener('resize', function(){
  if(window.innerWidth > 860 && menu.classList.contains('open')) setMenu(false);
});

/* ---------------- Reveal on scroll ---------------- */
var revealEls = document.querySelectorAll('.reveal');

if(reduceMotion || !('IntersectionObserver' in window)){
  revealEls.forEach(function(el){ el.classList.add('in'); });
} else {
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting) return;
      var el = entry.target;
      var siblings = Array.prototype.slice.call(
        el.parentElement ? el.parentElement.children : []
      ).filter(function(n){ return n.classList && n.classList.contains('reveal'); });
      var i = siblings.indexOf(el);
      el.style.transitionDelay = (i > 0 ? Math.min(i, 6) * 70 : 0) + 'ms';
      el.classList.add('in');
      io.unobserve(el);
    });
  }, {threshold:0.12, rootMargin:'0px 0px -60px 0px'});

  revealEls.forEach(function(el){ io.observe(el); });
}

/* ---------------- Counters ---------------- */
function runCounter(el){
  var target = parseFloat(el.getAttribute('data-target')) || 0;
  var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);

  if(reduceMotion){
    el.textContent = target.toFixed(decimals);
    return;
  }

  var duration = 1500;
  var start = null;

  function step(ts){
    if(start === null) start = ts;
    var p = Math.min((ts - start) / duration, 1);
    var eased = 1 - Math.pow(1 - p, 3);
    el.textContent = (target * eased).toFixed(decimals);
    if(p < 1) requestAnimationFrame(step);
    else el.textContent = target.toFixed(decimals);
  }
  requestAnimationFrame(step);
}

var counters = document.querySelectorAll('.count');
if(!('IntersectionObserver' in window)){
  counters.forEach(runCounter);
} else {
  var cio = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting) return;
      runCounter(entry.target);
      cio.unobserve(entry.target);
    });
  }, {threshold:0.5});
  counters.forEach(function(el){ cio.observe(el); });
}

/* ---------------- Active nav link ---------------- */
var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
var navLinks = Array.prototype.slice.call(document.querySelectorAll('.primary-links a[data-nav]'));

function setActive(){
  var y = window.scrollY + (window.innerHeight * 0.32);
  var currentId = '';

  sections.forEach(function(sec){
    if(sec.offsetTop <= y) currentId = sec.id;
  });

  navLinks.forEach(function(a){
    a.classList.toggle('active', a.getAttribute('href') === '#' + currentId);
  });
}
window.addEventListener('scroll', function(){
  if(!ticking) requestAnimationFrame(setActive);
}, {passive:true});
setActive();

/* ---------------- Timeline rail fill ---------------- */
var timeline = document.getElementById('timeline');
var railFill = document.getElementById('railFill');

if(timeline && railFill){
  function fillRail(){
    var rect = timeline.getBoundingClientRect();
    var vh = window.innerHeight;
    var total = rect.height;
    var visible = Math.min(Math.max(vh * 0.62 - rect.top, 0), total);
    railFill.style.height = total > 0 ? (visible / total) * 100 + '%' : '0%';
  }
  window.addEventListener('scroll', fillRail, {passive:true});
  window.addEventListener('resize', fillRail);
  fillRail();
}

/* ---------------- Project filters ---------------- */
var chips = document.querySelectorAll('.chip');
var projects = document.querySelectorAll('.proj');

chips.forEach(function(chip){
  chip.addEventListener('click', function(){
    var filter = chip.getAttribute('data-filter');

    chips.forEach(function(c){
      var on = c === chip;
      c.classList.toggle('active', on);
      c.setAttribute('aria-selected', String(on));
    });

    projects.forEach(function(p){
      var match = filter === 'all' || p.getAttribute('data-cat') === filter;
      p.classList.toggle('hide', !match);
    });
  });
});

/* ---------------- Project card cursor glow ---------------- */
if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
  projects.forEach(function(p){
    p.addEventListener('pointermove', function(e){
      var r = p.getBoundingClientRect();
      p.style.setProperty('--px', (e.clientX - r.left) + 'px');
      p.style.setProperty('--py', (e.clientY - r.top) + 'px');
    });
  });
}

/* ---------------- Page spotlight ---------------- */
var spot = document.getElementById('spotlight');
if(spot && window.matchMedia('(hover:hover) and (pointer:fine)').matches && !reduceMotion){
  window.addEventListener('pointermove', function(e){
    spot.style.setProperty('--mx', e.clientX + 'px');
    spot.style.setProperty('--my', e.clientY + 'px');
  }, {passive:true});
}

/* ---------------- Dragon cursor companion (segmented head / fins / spine chain) ---------------- */
var chainEl = document.getElementById('dragonChain');
var dgSvg   = document.getElementById('dragonSvg');
var dgTrail = document.getElementById('dgTrail');
var canHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

/* Responsive size factor: shrink the whole chain on small / phone screens
   (covers real touch devices as well as narrow desktop / devtools widths) */
function dgSizeFactor(){
  var w = window.innerWidth;
  if(w <= 480) return 0.4;
  if(w <= 860) return 0.6;
  if(w <= 1080) return 0.8;
  return 1;
}

if(chainEl && dgSvg && dgTrail && canHover && !reduceMotion){
  var dgNS = "http://www.w3.org/2000/svg";
  var dgXlink = "http://www.w3.org/1999/xlink";

  function sizeDgSvg(){
    dgSvg.setAttribute('viewBox', '0 0 ' + window.innerWidth + ' ' + window.innerHeight);
  }
  sizeDgSvg();
  window.addEventListener('resize', sizeDgSvg);

  var dgScale = dgSizeFactor();
  window.addEventListener('resize', function(){ dgScale = dgSizeFactor(); });

  var DN = 40;
  var dgElems = [];
  for(var di = 0; di < DN; di++) dgElems[di] = { use:null, x: window.innerWidth / 2, y: 0 };
  var dgPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var dgRadMax = Math.min(window.innerWidth, window.innerHeight) - 20;
  var dgFrm = Math.random();
  var dgRad = 0;
  var dgStarted = false;

  function dgPrepend(id, i){
    var el = document.createElementNS(dgNS, "use");
    dgElems[i].use = el;
    el.setAttributeNS(dgXlink, "xlink:href", "#" + id);
    dgTrail.prepend(el);
  }
  for(var di2 = 1; di2 < DN; di2++){
    if(di2 === 1) dgPrepend("dgHead", di2);
    else if(di2 === 8 || di2 === 14) dgPrepend("dgFins", di2);
    else dgPrepend("dgSpine", di2);
  }

  window.addEventListener('mousemove', function(e){
    dgPointer.x = e.clientX;
    dgPointer.y = e.clientY;
    dgRad = 0;
    if(!dgStarted){
      dgStarted = true;
      chainEl.classList.add('active');
    }
  }, {passive:true});

  document.addEventListener('mouseleave', function(){ chainEl.classList.remove('active'); });
  document.addEventListener('mouseenter', function(){ if(dgStarted) chainEl.classList.add('active'); });

  function dgRun(){
    requestAnimationFrame(dgRun);
    var e0 = dgElems[0];
    var ax = (Math.cos(3 * dgFrm) * dgRad * window.innerWidth) / window.innerHeight;
    var ay = (Math.sin(4 * dgFrm) * dgRad * window.innerHeight) / window.innerWidth;
    /* tighter head catch-up (was /10) keeps the lead segment from lagging
       far behind the pointer, which is what opened a gap on the inside
       of a tight curl */
    e0.x += (ax + dgPointer.x - e0.x) / 6;
    e0.y += (ay + dgPointer.y - e0.y) / 6;
    for(var i = 1; i < DN; i++){
      var e = dgElems[i];
      var ep = dgElems[i - 1];
      var a = Math.atan2(e.y - ep.y, e.x - ep.x);
      /* smaller lateral spread (100-i)/7 instead of /5, and a faster
         catch-up divisor (/3 instead of /4) pulls each link closer to
         the one ahead of it so the chain stays visually continuous
         even when it curls back on itself at full extension */
      e.x += (ep.x - e.x + (Math.cos(a) * (100 - i)) / 7) / 3;
      e.y += (ep.y - e.y + (Math.sin(a) * (100 - i)) / 7) / 3;
      var s = ((162 + 4 * (1 - i)) / 50) * dgScale;
      e.use.setAttributeNS(
        null,
        "transform",
        "translate(" + ((ep.x + e.x) / 2) + "," + ((ep.y + e.y) / 2) + ") rotate(" + ((180 / Math.PI) * a) + ") scale(" + s + "," + s + ")"
      );
    }
    if(dgRad < dgRadMax) dgRad++;
    dgFrm += 0.003;
    if(dgRad > 60){
      dgPointer.x += (window.innerWidth / 2 - dgPointer.x) * 0.05;
      dgPointer.y += (window.innerHeight / 2 - dgPointer.y) * 0.05;
    }
  }
  dgRun();
}

/* ---------------- Copy email ---------------- */
var copyBtn = document.getElementById('copyEmail');
if(copyBtn){
  copyBtn.addEventListener('click', function(e){
    e.preventDefault();
    e.stopPropagation();

    var email = 'mominislam.bd60@gmail.com';
    var done = function(){
      copyBtn.textContent = 'Copied ✓';
      setTimeout(function(){ copyBtn.textContent = 'Copy address'; }, 1900);
    };

    if(navigator.clipboard && window.isSecureContext){
      navigator.clipboard.writeText(email).then(done).catch(function(){ fallback(email, done); });
    } else {
      fallback(email, done);
    }
  });
}

function fallback(text, done){
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); done(); } catch(err) { /* no-op */ }
  document.body.removeChild(ta);
}

})();