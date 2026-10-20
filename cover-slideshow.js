(() => {
  const cover = document.querySelector('.entry-cover');
  if (!cover) return;
  const first = cover.querySelector('.entry-cover-image');
  const control = cover.querySelector('.entry-cover-toggle');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const slides = [first];
  let index = 0, timer = null, visible = true, ready = false;
  let paused = motion.matches;
  const sources = [
  [
    "watertown/staging.webp",
    "Fable of Watertown"
  ],
  [
    "summer/boardgame-hero.webp",
    "Gowanus Flow"
  ],
  [
    "summer/cargo-zine-13.webp",
    "Research + Zine"
  ],
  [
    "symphony-graffiti.webp",
    "Symphony of Wind, Light and Life"
  ],
  [
    "salt-site-axon.webp",
    "Re-Salting"
  ],
  [
    "sharing-site-axon.webp",
    "Sharing Above Park"
  ],
  [
    "home-model.webp",
    "A Home for Us"
  ],
  [
    "texture.webp",
    "Texture of the City"
  ],
  [
    "london/source-433.webp",
    "London, in Print"
  ],
  [
    "london/source-425.webp",
    "London Urban Studies"
  ],
  [
    "bcb/page-13.webp",
    "Black Citizen Brigade"
  ],
  [
    "i-over-x/study-06.webp",
    "I over X"
  ]
];
  function update() {
    clearInterval(timer);
    timer = null;
    control.textContent = paused ? 'Play' : 'Pause';
    control.setAttribute('aria-label', paused ? 'Play cover slideshow' : 'Pause cover slideshow');
    if (!ready || paused || !visible || document.hidden || slides.length < 2) return;
    timer = setInterval(() => {
      slides[index].classList.remove('is-active');
      index = (index + 1) % slides.length;
      slides[index].classList.add('is-active');
    }, 5000);
  }
  control.addEventListener('click', () => { paused = !paused; update(); });
  document.addEventListener('visibilitychange', update);
  motion.addEventListener('change', () => { paused = motion.matches; update(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      update();
    }, { threshold: 0 }).observe(cover);
  }
  control.hidden = false;
  update();
  async function prepare(source) {
    const img = new Image();
    img.className = 'entry-cover-image';
    img.alt = source[1];
    img.decoding = 'async';
    img.src = '/portfolio/assets/' + source[0];
    await Promise.race([
      img.decode(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Image load timeout')), 15000))
    ]);
    return img;
  }
  Promise.allSettled(sources.map(prepare)).then(results => {
    for (const result of results) {
      if (result.status !== 'fulfilled') continue;
      cover.insertBefore(result.value, cover.querySelector('.entry-cover-title'));
      slides.push(result.value);
    }
    ready = true;
    control.hidden = slides.length < 2;
    update();
  });
})();
