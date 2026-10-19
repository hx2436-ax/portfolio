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

// Complete publications: page controls update both the preview and lightbox.
document.querySelectorAll('[data-reader]').forEach(reader => {
  const captions = JSON.parse(reader.dataset.captions);
  const select = reader.querySelector('[data-reader-select]');
  const previous = reader.querySelector('[data-reader-prev]');
  const next = reader.querySelector('[data-reader-next]');
  function show(index) {
    const i = Math.max(0, Math.min(captions.length - 1, index));
    const src = reader.dataset.prefix + String(i + 1).padStart(2, '0') + '.webp';
    const image = reader.querySelector('[data-reader-image]');
    image.src = src; image.alt = captions[i];
    const zoom = reader.querySelector('[data-zoom]');
    zoom.dataset.zoom = src; zoom.dataset.caption = captions[i];
    reader.querySelector('[data-reader-caption]').textContent = String(i + 1).padStart(2, '0') + ' / ' + captions[i];
    select.value = String(i); previous.disabled = i === 0; next.disabled = i === captions.length - 1;
  }
  previous.addEventListener('click', () => show(Number(select.value) - 1));
  next.addEventListener('click', () => show(Number(select.value) + 1));
  select.addEventListener('change', () => show(Number(select.value)));
  show(0);
});
// A second click opens booklet artwork at its full rendered size for reading.
const enlargedImage = document.querySelector('#lightbox img');
if (enlargedImage) {
  enlargedImage.tabIndex = 0;
  enlargedImage.setAttribute('role', 'button');
  enlargedImage.setAttribute('aria-label', 'Toggle full-size image');
  const toggle = () => { enlargedImage.classList.toggle('is-full-size'); enlargedImage.setAttribute('aria-pressed', String(enlargedImage.classList.contains('is-full-size'))); };
  enlargedImage.addEventListener('click', toggle);
  enlargedImage.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') {event.preventDefault(); toggle();} });
  document.querySelector('#lightbox').addEventListener('close', () => {enlargedImage.classList.remove('is-full-size');enlargedImage.setAttribute('aria-pressed','false');});
}
