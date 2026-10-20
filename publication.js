document.querySelectorAll('.bcb-reader').forEach(reader => {
 const select=reader.querySelector('[data-reader-select]');
 reader.querySelectorAll('[data-publication-page]').forEach(button=>button.addEventListener('click',()=>{select.value=button.dataset.publicationPage;select.dispatchEvent(new Event('change'));}));
 reader.addEventListener('keydown',event=>{if(/SELECT|INPUT|TEXTAREA/.test(event.target.tagName))return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();reader.querySelector(event.key==='ArrowLeft'?'[data-reader-prev]':'[data-reader-next]').click();}});
});
