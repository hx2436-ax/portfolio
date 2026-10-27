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
  const image = dialog.querySelector('img');
  const caption = dialog.querySelector('p');
  const scroll = dialog.querySelector('.lightbox-scroll');
  const toolbar = document.createElement('div');
  toolbar.className = 'lightbox-controls';
  toolbar.innerHTML = '<button type="button" data-lightbox-prev aria-label="Previous image">← Previous</button><span data-lightbox-count role="status" aria-live="polite" aria-atomic="true"></span><button type="button" data-lightbox-next aria-label="Next image">Next →</button>';
  dialog.prepend(toolbar);
  const hint = document.createElement('p');
  hint.className = 'lightbox-hint';
  hint.id = 'lightbox-hint';
  hint.textContent = 'Click image to zoom · Use ← → to browse · Esc to close';
  dialog.setAttribute('aria-describedby', hint.id);
  dialog.append(hint);
  const previous = toolbar.querySelector('[data-lightbox-prev]');
  const next = toolbar.querySelector('[data-lightbox-next]');
  const count = toolbar.querySelector('[data-lightbox-count]');
  const error = document.createElement('p');
  error.className = 'lightbox-error';
  error.setAttribute('role', 'status');
  error.textContent = 'This image could not load. Close the viewer and try again.';
  error.hidden = true;
  scroll.append(error);
  let items = [], index = 0, onChange = null, opener = null;
  function show(i) {
    index = Math.max(0, Math.min(items.length - 1, i));
    const item = items[index];
    if (!item) return;
    image.classList.remove('is-full-size');
    image.setAttribute('aria-pressed', 'false');
    error.hidden = true;
    image.src = item.src;
    image.alt = item.caption || '';
    caption.textContent = item.caption || '';
    count.textContent = `${index + 1} / ${items.length}`;
    previous.disabled = index === 0;
    next.disabled = index === items.length - 1;
    scroll.scrollTop = scroll.scrollLeft = 0;
    if (onChange) onChange(index);
  }
  function open(detail) {
    if (!detail.items.length) return;
    items = detail.items;
    onChange = detail.onChange || null;
    opener = detail.opener || document.activeElement;
    show(detail.index || 0);
    dialog.showModal();
    document.body.classList.add('no-scroll');
    dialog.querySelector('.close').focus();
  }
  document.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => {
    const reader = button.closest('[data-reader]');
    if (reader) {
      const captions = JSON.parse(reader.dataset.captions);
      const select = reader.querySelector('[data-reader-select]');
      open({
        items: captions.map((text, i) => ({src: reader.dataset.prefix + String(i + 1).padStart(2, '0') + '.webp', caption: text})),
        index: Number(select.value), opener: button,
        onChange: i => { select.value = String(i); select.dispatchEvent(new Event('change')); }
      });
    } else {
      const buttons = [...document.querySelectorAll('[data-zoom]')].filter(el => !el.closest('[data-reader], details:not([open])'));
      open({items: buttons.map(el => ({src: el.dataset.zoom, caption: el.dataset.caption})), index: buttons.indexOf(button), opener: button});
    }
  }));
  document.addEventListener('portfolio:open-images', event => open(event.detail));
  previous.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  dialog.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|SELECT|TEXTAREA/.test(event.target.tagName)) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      show(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  image.addEventListener('error', () => { error.hidden = false; });
  image.addEventListener('load', () => { error.hidden = true; });
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {if (event.target === dialog) dialog.close();});
  dialog.addEventListener('close', () => {
    document.body.classList.remove('no-scroll');
    if (opener && opener.isConnected) opener.focus({preventScroll: true});
  });
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

/* Original September 2026 portfolio sheets, using existing page images. */
(() => {
  const archive = {"under-cantilever":{"title":"Under Cantilever","pages":[20,21,22,23,24,25]},"symphony":{"title":"Symphony of Wind, Light and Life","pages":[3,4,5,6,7]},"re-salting":{"title":"Re-Salting","pages":[8,9,10,11]},"sharing-above-park":{"title":"Sharing Above Park","pages":[12,13,14,15]},"a-home-for-us":{"title":"A Home for Us","pages":[16,17,18,19]},"texture-of-the-city":{"title":"Texture of the City","pages":[26]},"london-zines":{"title":"London, in Print","pages":[27]},"london-urban-studies":{"title":"London Urban Studies","pages":[27]},"black-citizen-brigade":{"title":"Black Citizen Brigade","pages":[28]},"i-over-x":{"title":"I over X","pages":[28]}};
  const slug = location.pathname.replace(/\/index\.html$/, '/').split('/').filter(Boolean).pop();
  if (slug === 'under-cantilever') {
    archive[slug] = {title: 'Under Cantilever', pages: [3,4,5,6,7,8], date: 'October 2026', imageBase: '/portfolio/assets/cantilever-202610/sheet-'};
  }
  const project = archive[slug];
  const anchor = document.querySelector('.next-project');
  if (!project || !anchor || document.getElementById('portfolio-original')) return;
  const reader = document.createElement('section');
  reader.id = 'portfolio-original';
  reader.className = 'portfolio-original';
  reader.setAttribute('aria-labelledby', 'portfolio-original-title');
  reader.innerHTML = '<div class="section-heading"><h2 id="portfolio-original-title">Original portfolio</h2><span class="eyebrow">September 2026</span></div><p class="original-note">Read the original portfolio layout. Select a page to enlarge.</p><div class="original-controls"><button type="button" data-previous aria-label="Previous portfolio page">← Previous</button><label>Page <select aria-label="Choose original portfolio page"></select></label><button type="button" data-next aria-label="Next portfolio page">Next →</button></div><figure><button type="button" class="original-sheet" aria-label="Enlarge portfolio page"><img loading="lazy" decoding="async" alt=""></button><figcaption aria-live="polite"></figcaption></figure><p class="original-error" role="status" hidden>This page could not load. Choose another page or open the page image below.</p><a class="original-open" target="_blank" rel="noopener noreferrer">Open page image</a>';
  if (project.date) {
    reader.querySelector('h2').textContent = 'Updated portfolio';
    reader.querySelector('.eyebrow').textContent = project.date;
    reader.querySelector('.original-note').textContent = 'Read the updated project layout. Select a page to enlarge.';
  }
  const pageSource = page => (project.imageBase || '/portfolio/assets/sheet-') + page + '.webp';
  anchor.before(reader);
  const select = reader.querySelector('select'), prev = reader.querySelector('[data-previous]'), next = reader.querySelector('[data-next]');
  const img = reader.querySelector('img'), caption = reader.querySelector('figcaption'), open = reader.querySelector('.original-open'), error = reader.querySelector('.original-error');
  project.pages.forEach((page,i) => { const option=document.createElement('option');option.value=i;option.textContent=page;select.append(option); });
  let index=0;
  function show(i) {
    index = Math.max(0, Math.min(project.pages.length-1,i));
    const page=project.pages[index];
    const src=pageSource(page);
    error.hidden=true;
    img.src=src;img.alt=project.title+' — original portfolio page '+page;
    caption.textContent=(index+1)+' / '+project.pages.length+' · Portfolio page '+page;
    open.href=src; select.value=index;
    prev.disabled=index===0;next.disabled=index===project.pages.length-1;
  }
  img.addEventListener('error',()=>{error.hidden=false;});
  img.addEventListener('load',()=>{error.hidden=true;});
  prev.addEventListener('click',()=>show(index-1));
  next.addEventListener('click',()=>show(index+1));
  select.addEventListener('change',()=>show(Number(select.value)));
  reader.addEventListener('keydown',e=>{
    if(e.target.tagName==='SELECT')return;
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(index+(e.key==='ArrowRight'?1:-1));}
  });
  let touch=null;
  reader.querySelector('.original-sheet').addEventListener('pointerdown',e=>{if(e.pointerType==='touch')touch={x:e.clientX,y:e.clientY};});
  reader.querySelector('.original-sheet').addEventListener('pointercancel',()=>{touch=null;});
  let swiped=false;
  reader.querySelector('.original-sheet').addEventListener('pointerup',e=>{
    swiped=false;
    if(touch){const dx=e.clientX-touch.x,dy=e.clientY-touch.y;if(Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)){show(index+(dx<0?1:-1));swiped=true;}touch=null;}
  });
  reader.querySelector('.original-sheet').addEventListener('click',()=>{
    if(swiped){swiped=false;return;}
    document.dispatchEvent(new CustomEvent('portfolio:open-images', {detail: {
      items: project.pages.map(page => ({src:pageSource(page),caption:project.title+' — original portfolio page '+page})),
      index, opener: reader.querySelector('.original-sheet'), onChange: show
    }}));
  });
  show(0);
})();
