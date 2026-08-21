/**
 * Schematic activator — 700 bytes of "only animate what is on screen".
 *
 * Every looping animation in global.css ships `animation-play-state: paused`.
 * This flips `.is-live` on a section while it intersects the viewport, so a
 * long page never pays for pulses the reader cannot see. Elements are
 * unobserved once they have gone live and come back — the observer stays
 * cheap even on the 100-post blog index.
 */
(() => {
  if (!('IntersectionObserver' in window)) {
    // No observer: just run everything. Correctness beats cleverness.
    for (const el of document.querySelectorAll('[data-live]')) el.classList.add('is-live');
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-live', entry.isIntersecting);
      }
    },
    { rootMargin: '120px 0px' },
  );

  for (const el of document.querySelectorAll('[data-live]')) io.observe(el);
})();
