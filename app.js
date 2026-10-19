(() => {
  const filters = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('#projects .project-card');
  function filter(category) {
    let count = 0;
    cards.forEach(card => { card.hidden = category !== 'All' && card.dataset.category !== category; if (!card.hidden) count++; });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    const output = document.getElementById('result-count');
    if (output) output.textContent = `${count} project${count === 1 ? '' : 's'}`;
  }
  filters.forEach(button => button.addEventListener('click', () => {filter(button.dataset.filter); const url = new URL(location.href); if (button.dataset.filter === 'All') url.searchParams.delete('category'); else url.searchParams.set('category', button.dataset.filter); history.replaceState(null, '', url); }));
  const selected = new URL(location.href).searchParams.get('category');
  if ([...filters].some(button => button.dataset.filter === selected)) filter(selected);
  const dialog = document.querySelector('#lightbox');
  if (!dialog) return;
  document.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => {
    const img = dialog.querySelector('img'); img.src = button.dataset.zoom; img.alt = button.dataset.caption;
    dialog.querySelector('p').textContent = button.dataset.caption;
    dialog.showModal(); document.body.classList.add('no-scroll');
  }));
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {if (event.target === dialog) dialog.close();});
  dialog.addEventListener('close', () => document.body.classList.remove('no-scroll'));
})();
