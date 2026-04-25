/* ============================================================
   MAIN.JS — PC SANTINO PORTFOLIO
   Animaciones: scroll reveal, tilt 3D, nav scroll, tema
   ============================================================ */

/* ── 1. MODAL ───────────────────────────────────────────────── */
const btnAbrir   = document.getElementById('btn-diagnostico');
const btnCerrar  = document.getElementById('btn-cerrar');
const modal      = document.getElementById('modal-info');

btnAbrir.addEventListener('click', () => modal.showModal());
btnCerrar.addEventListener('click', () => modal.close());

// Cerrar al hacer clic en el backdrop
modal.addEventListener('click', (e) => {
  const r = modal.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right ||
      e.clientY < r.top  || e.clientY > r.bottom) {
    modal.close();
  }
});

/* ── 2. TEMA OSCURO / CLARO ─────────────────────────────────── */
const btnTema = document.getElementById('btn-tema');

// Leer preferencia guardada
const temaGuardado = localStorage.getItem('tema');
if (temaGuardado === 'claro') {
  document.body.classList.add('modo-claro');
  btnTema.textContent = '☀';
}

btnTema.addEventListener('click', () => {
  const esModoClaro = document.body.classList.toggle('modo-claro');
  btnTema.textContent = esModoClaro ? '☀' : '☽';
  localStorage.setItem('tema', esModoClaro ? 'claro' : 'oscuro');
});

/* ── 3. NAV — clase "scrolled" al bajar la página ───────────── */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

/* ── 4. SCROLL REVEAL — IntersectionObserver ────────────────── */
// Agrega la clase .visible cuando la tarjeta entra al viewport
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // solo una vez
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.tarjeta').forEach((card) => observer.observe(card));

/* ── 5. ANIMACIÓN DE TÍTULOS DE SECCIÓN ─────────────────────── */
// Los section-header también aparecen al entrar al viewport
const headerObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        headerObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('.section-header').forEach((el) => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(24px)';
  el.style.transition = 'opacity .65s cubic-bezier(.4,0,.2,1), transform .65s cubic-bezier(.4,0,.2,1)';
  headerObserver.observe(el);
});

document.querySelectorAll('.caja-destacada').forEach((el) => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(20px)';
  el.style.transition = 'opacity .6s cubic-bezier(.4,0,.2,1) .1s, transform .6s cubic-bezier(.4,0,.2,1) .1s';
  headerObserver.observe(el);
});

/* ── 6. EFECTO TILT 3D EN TARJETAS ──────────────────────────── */
// Las tarjetas se inclinan suavemente siguiendo el cursor
const MAX_TILT = 7; // grados máximos de inclinación

function applyTilt(card, e) {
  const rect   = card.getBoundingClientRect();
  const cx     = rect.left + rect.width  / 2;
  const cy     = rect.top  + rect.height / 2;
  const dx     = (e.clientX - cx) / (rect.width  / 2); // -1 a 1
  const dy     = (e.clientY - cy) / (rect.height / 2); // -1 a 1
  const rotY   =  dx * MAX_TILT;
  const rotX   = -dy * MAX_TILT;

  // Posición relativa del mouse para el efecto de brillo
  const mx = ((e.clientX - rect.left) / rect.width)  * 100;
  const my = ((e.clientY - rect.top)  / rect.height) * 100;

  card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
  card.style.setProperty('--mx', `${mx}%`);
  card.style.setProperty('--my', `${my}%`);
}

function resetTilt(card) {
  card.style.transform = '';
}

document.querySelectorAll('.tarjeta').forEach((card) => {
  card.addEventListener('mousemove', (e) => applyTilt(card, e));
  card.addEventListener('mouseleave', () => resetTilt(card));
});

/* ── 7. RIPPLE EN BOTONES ────────────────────────────────────── */
document.querySelectorAll('.boton-accion').forEach((btn) => {
  btn.addEventListener('click', function (e) {
    // No aplicar si el botón tiene un <a> hijo que manejará la navegación
    const ripple  = document.createElement('span');
    const rect    = btn.getBoundingClientRect();
    const size    = Math.max(rect.width, rect.height);
    const x       = e.clientX - rect.left - size / 2;
    const y       = e.clientY - rect.top  - size / 2;

    Object.assign(ripple.style, {
      position:     'absolute',
      width:        `${size}px`,
      height:       `${size}px`,
      left:         `${x}px`,
      top:          `${y}px`,
      borderRadius: '50%',
      background:   'rgba(255,255,255,0.15)',
      transform:    'scale(0)',
      animation:    'rippleAnim .5s ease-out forwards',
      pointerEvents:'none',
      zIndex:       '10',
    });

    // Agregar keyframe ripple si no existe
    if (!document.getElementById('ripple-style')) {
      const style = document.createElement('style');
      style.id    = 'ripple-style';
      style.textContent = `
        @keyframes rippleAnim {
          to { transform:scale(2.5); opacity:0; }
        }
      `;
      document.head.appendChild(style);
    }

    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

/* ── 8. SMOOTH SCROLL — offset para nav fijo ────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});