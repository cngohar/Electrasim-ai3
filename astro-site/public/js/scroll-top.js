(() => {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener(
    'scroll',
    () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    },
    { passive: true },
  );
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
