(() => {
  const button = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-mobile-menu');
  if (!button || !menu) return;

  const close = () => {
    menu.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
  };

  button.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
})();
