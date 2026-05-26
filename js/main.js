// Duplicate ticker items for seamless loop
(function() {
  const inner = document.getElementById('tickerInner');
  if(!inner) return;
  const clone = inner.innerHTML;
  inner.innerHTML = clone + clone;
})();

// Scroll reveal
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('vis') })
}, {threshold: 0.1});
document.querySelectorAll('.fu').forEach(el => obs.observe(el));

// Animated stat counters
function animateCount(el, target, suffix) {
  suffix = suffix || '';
  const dur = 1600;
  const start = performance.now();
  function update(t) {
    const p = Math.min((t - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 4);
    const val = Math.floor(target * ease);
    el.textContent = val + suffix;
    if(p < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting) {
      const el = e.target.querySelector('.stat-n');
      if(!el || el.dataset.animated) return;
      el.dataset.animated = '1';
      const txt = el.textContent;
      if(txt.includes('12')) animateCount(el, 12500, '+');
      else if(txt.includes('98')) animateCount(el, 98, '%');
      else if(txt.includes('50')) animateCount(el, 50, '+');
    }
  });
}, {threshold: 0.3});
document.querySelectorAll('.stat').forEach(el => statObs.observe(el));

// Nav scroll effect
const nav = document.querySelector('nav');
window.addEventListener('scroll', function() {
  if(window.scrollY > 60) {
    nav.style.background = 'rgba(255,255,255,0.97)';
    nav.style.boxShadow = '0 4px 32px rgba(91,33,245,0.12)';
  } else {
    nav.style.background = 'rgba(255,255,255,0.9)';
    nav.style.boxShadow = '0 1px 20px rgba(91,33,245,0.07)';
  }
}, {passive:true});

// Testimonials Carousel
(function() {
  const track = document.getElementById('testiTrack');
  const dots = document.querySelectorAll('.testi-dot');
  const prev = document.getElementById('testiPrev');
  const next = document.getElementById('testiNext');
  if (!track) return;
  const slides = track.querySelectorAll('.testi-slide');
  let cur = 0;
  let autoTimer;

  function goTo(idx) {
    cur = (idx + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + (cur * 100) + '%)';
    dots.forEach((d, i) => d.classList.toggle('active', i === cur));
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(cur + 1), 5000);
  }

  prev.addEventListener('click', () => { goTo(cur - 1); startAuto(); });
  next.addEventListener('click', () => { goTo(cur + 1); startAuto(); });
  dots.forEach(d => d.addEventListener('click', () => { goTo(+d.dataset.idx); startAuto(); }));

  // Touch / swipe support
  let startX = 0;
  track.parentElement.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, {passive:true});
  track.parentElement.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { goTo(dx < 0 ? cur + 1 : cur - 1); startAuto(); }
  });

  startAuto();
})();

// Magnetic buttons
document.querySelectorAll('.btn-pri, .btn-sec, .btn-w').forEach(function(btn) {
  btn.addEventListener('mousemove', function(e) {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width/2;
    const y = e.clientY - r.top - r.height/2;
    btn.style.transform = 'translateY(-2px) translate(' + (x*0.12) + 'px, ' + (y*0.12) + 'px)';
  });
  btn.addEventListener('mouseleave', function() {
    btn.style.transform = '';
  });
});

