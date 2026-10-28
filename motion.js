(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('.motion-toggle');
  let paused = false;
  const allowed = () => !paused && !reduce.matches;
  const running = new Set();
  function animate(element, frames, options) {
    if (!allowed() || !element.animate) return;
    const animation = element.animate(frames, {duration:700,easing:'cubic-bezier(.16,1,.3,1)',...options});
    running.add(animation);
    animation.finished.then(()=>running.delete(animation)).catch(()=>running.delete(animation));
    return animation;
  }
  function updateMotion() {
    const off = !allowed();
    document.body.classList.toggle('motion-off',off);
    toggle.setAttribute('aria-pressed',String(off));
    toggle.textContent = reduce.matches ? 'Movimiento reducido' : paused ? 'Activar animaciones' : 'Pausar animaciones';
    if(off) running.forEach(a=>a.cancel());
  }
  toggle.addEventListener('click',()=>{paused=!paused;updateMotion();});
  reduce.addEventListener('change',updateMotion);
  updateMotion();
  // El contenido siempre está visible en el HTML, incluso sin JavaScript.
  document.querySelectorAll('.hero-copy .overline,.hero-copy h1 span,.hero-intro,.read-link').forEach((el,i)=>{
    animate(el,[{opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'translateY(0)'}],{duration:800,delay:80+i*85,fill:'backwards'});
  });
  animate(document.querySelector('.hero-photo'),[{opacity:0,transform:'scale(1.045)'},{opacity:1,transform:'scale(1)'}],{duration:1350});
  if('IntersectionObserver' in window) {
    const images = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        animate(entry.target,[{clipPath:'inset(0 0 100% 0)',transform:'translateY(24px)'},{clipPath:'inset(0 0 0% 0)',transform:'translateY(0)'}],{duration:950});
        images.unobserve(entry.target);
      });
    },{threshold:.12});
    document.querySelectorAll('.photo .image-button').forEach(el=>images.observe(el));
    const titles=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        animate(entry.target,[{opacity:.2,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:650});
        titles.unobserve(entry.target);
      });
    },{threshold:.4});
    document.querySelectorAll('article h2,.next-topic h2').forEach(el=>titles.observe(el));
    const links=[...document.querySelectorAll('.index nav a')];
    const current=id=>links.forEach(a=>{if(a.hash==='#'+id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    const observer=new IntersectionObserver(entries=>{const item=entries.find(e=>e.isIntersecting);if(item)current(item.target.id);},{rootMargin:'-100px 0px -50% 0px'});
    document.querySelectorAll('article h2[id]').forEach(el=>observer.observe(el));
    links.forEach(a=>a.addEventListener('click',()=>current(a.hash.slice(1))));
  }
  // Desplazamiento suave con ratón; navegación de teclado inmediata.
  document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
    const target=document.getElementById(link.hash.slice(1));
    if(!target || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)return;
    event.preventDefault();
    target.scrollIntoView({behavior:allowed()&&event.detail>0?'smooth':'instant',block:'start'});
    try{history.replaceState(null,'',link.hash);}catch{}
    if(event.detail===0){if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}
  }));
  const dialog=document.querySelector('.lightbox');
  const content=dialog.querySelector('.lightbox-content');
  document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{
    const image=new Image();image.src=button.dataset.image;image.alt=button.dataset.caption;
    const caption=document.createElement('p');caption.textContent=button.dataset.caption;
    content.replaceChildren(image,caption);
    dialog.showModal();
    animate(dialog,[{opacity:0,transform:'translateY(12px) scale(.975)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:280});
  }));
  dialog.querySelector('.close-lightbox').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  window.addEventListener('beforeprint',()=>running.forEach(a=>a.cancel()));
})();
