/* Woodl case kit: custom selects, toasts, exclusive smooth FAQ, US phone mask, split before/after cards.
   Each site sets its accent through CSS variables: --kit-accent, --kit-accent-ink, --kit-ink, --kit-line, --kit-radius. */
(function(){
  'use strict';
  const $ = (s, r=document) => r.querySelector(s), $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- toasts ---------- */
  let stack;
  const ICONS = {
    ok:'<path d="M20 6 9 17l-5-5"/>',
    err:'<path d="M12 8v5M12 16.5v.5"/><circle cx="12" cy="12" r="9"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.5"/>'
  };
  function toast(title, text, type){
    type = type || 'ok';
    if(!stack){ stack = document.createElement('div'); stack.className = 'kit-toasts'; stack.setAttribute('aria-live','polite'); document.body.appendChild(stack); }
    const t = document.createElement('div');
    t.className = 'kit-toast kit-' + type;
    t.innerHTML = `<span class="kit-ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${ICONS[type]||ICONS.ok}</svg></span><div><b></b><span></span></div><button type="button" aria-label="Dismiss">×</button>`;
    $('b', t).textContent = title; $('div span', t).textContent = text || '';
    stack.appendChild(t);
    requestAnimationFrame(() => t.classList.add('in'));
    const kill = () => { t.classList.remove('in'); setTimeout(() => t.remove(), 400); };
    $('button', t).onclick = kill;
    setTimeout(kill, 5200);
  }
  window.KitToast = toast;

  /* ---------- custom select (enhances <select data-kit>) ---------- */
  let openOne = null;
  function enhanceSelect(sel){
    if(sel.dataset.kitDone) return; sel.dataset.kitDone = 1;
    const wrap = document.createElement('div'); wrap.className = 'kit-sel';
    sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(sel);
    sel.classList.add('kit-native'); sel.tabIndex = -1; sel.setAttribute('aria-hidden','true');
    const id = 'ks' + Math.random().toString(36).slice(2,8);
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'kit-sel-btn';
    btn.setAttribute('aria-haspopup','listbox'); btn.setAttribute('aria-expanded','false'); btn.setAttribute('aria-controls', id);
    const lbl = sel.id && $(`label[for="${sel.id}"]`); if(lbl){ lbl.addEventListener('click', e => { e.preventDefault(); btn.focus(); }); btn.setAttribute('aria-label', lbl.textContent.trim()); }
    else if(sel.getAttribute('aria-label')) btn.setAttribute('aria-label', sel.getAttribute('aria-label'));
    const list = document.createElement('ul'); list.className = 'kit-sel-list'; list.id = id; list.setAttribute('role','listbox');
    wrap.appendChild(btn); wrap.appendChild(list);
    let active = -1;
    const opts = () => [...sel.options].filter(o => !o.disabled || o.value);
    const render = () => {
      const cur = sel.options[sel.selectedIndex];
      const ph = !cur || (cur.disabled && !cur.value) || cur.value === '';
      btn.innerHTML = `<span class="${ph?'kit-ph':''}"></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
      $('span', btn).textContent = cur ? cur.textContent : (sel.dataset.placeholder || 'Choose');
      list.innerHTML = '';
      [...sel.options].forEach((o, i) => {
        if(o.disabled && !o.value) return;
        const li = document.createElement('li'); li.setAttribute('role','option'); li.dataset.i = i; li.textContent = o.textContent;
        li.setAttribute('aria-selected', i === sel.selectedIndex && !ph ? 'true' : 'false'); list.appendChild(li);
      });
    };
    const items = () => $$('li', list);
    const setActive = n => { const it = items(); if(!it.length) return; active = (n + it.length) % it.length; it.forEach((x,k) => x.classList.toggle('act', k === active)); it[active].scrollIntoView({block:'nearest'}); };
    const open = () => { if(openOne && openOne !== close) openOne(); render(); wrap.classList.add('open'); btn.setAttribute('aria-expanded','true');
      const r = btn.getBoundingClientRect(); wrap.classList.toggle('up', innerHeight - r.bottom < 260 && r.top > 260);
      const it = items(); const s = it.findIndex(x => x.getAttribute('aria-selected') === 'true'); setActive(s < 0 ? 0 : s); openOne = close; };
    const close = () => { wrap.classList.remove('open'); btn.setAttribute('aria-expanded','false'); if(openOne === close) openOne = null; };
    const pick = li => { sel.selectedIndex = +li.dataset.i; sel.dispatchEvent(new Event('change', {bubbles:true})); wrap.classList.remove('err'); render(); close(); btn.focus(); };
    btn.addEventListener('click', () => wrap.classList.contains('open') ? close() : open());
    list.addEventListener('click', e => { const li = e.target.closest('li'); if(li) pick(li); });
    list.addEventListener('mousemove', e => { const li = e.target.closest('li'); if(li) setActive(items().indexOf(li)); });
    btn.addEventListener('keydown', e => {
      const isOpen = wrap.classList.contains('open');
      if(['ArrowDown','ArrowUp'].includes(e.key)){ e.preventDefault(); if(!isOpen) open(); else setActive(active + (e.key === 'ArrowDown' ? 1 : -1)); }
      else if(e.key === 'Enter' || e.key === ' '){ if(isOpen){ e.preventDefault(); const li = items()[active]; if(li) pick(li); } }
      else if(e.key === 'Escape' && isOpen){ e.preventDefault(); close(); }
      else if(e.key === 'Tab' && isOpen) close();
    });
    document.addEventListener('click', e => { if(!wrap.contains(e.target)) close(); });
    sel.addEventListener('change', render);
    sel.kitRender = render;
    new MutationObserver(render).observe(sel, {childList:true});
    render();
  }
  window.KitSelect = enhanceSelect;

  /* ---------- FAQ: exclusive + smooth ---------- */
  function faq(root){
    const ds = $$('details', root); if(!ds.length || root.dataset.kitFaq) return; root.dataset.kitFaq = 1;
    ds.forEach(d => {
      const sum = $('summary', d); if(!sum) return;
      let body = $('.kit-ans', d);
      if(!body){ body = document.createElement('div'); body.className = 'kit-ans'; [...d.childNodes].filter(n => n !== sum).forEach(n => body.appendChild(n)); d.appendChild(body); }
      d.classList.toggle('kit-open', d.open);
      sum.addEventListener('click', e => {
        e.preventDefault();
        if(d._a && d._a.playState === 'running') return;
        if(d.open) slide(d, false);
        else { ds.forEach(o => { if(o !== d && o.open) slide(o, false); }); slide(d, true); }
      });
    });
  }
  function slide(d, open){
    const b = $('.kit-ans', d); d.classList.toggle('kit-open', open);
    if(reduce){ d.open = open; return; }
    if(open){ d.open = true; const h = b.scrollHeight; d._a = b.animate([{height:'0px',opacity:0},{height:h+'px',opacity:1}], {duration:360, easing:'cubic-bezier(.22,.61,.36,1)'}); }
    else { const h = b.scrollHeight; d._a = b.animate([{height:h+'px',opacity:1},{height:'0px',opacity:0}], {duration:280, easing:'cubic-bezier(.4,0,.2,1)'}); d._a.onfinish = () => { d.open = false; }; }
  }
  window.KitFaq = faq;

  /* ---------- US phone mask ---------- */
  const mask = v => { let d = v.replace(/\D/g,''); if(d.length > 10 && d[0] === '1') d = d.slice(1); d = d.slice(0,10); if(!d) return ''; if(d.length < 4) return `(${d}`; if(d.length < 7) return `(${d.slice(0,3)}) ${d.slice(3)}`; return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`; };
  function phone(inp){ if(inp.dataset.kitPh) return; inp.dataset.kitPh = 1; inp.maxLength = 14; inp.inputMode = 'numeric'; inp.addEventListener('input', () => { inp.value = mask(inp.value); }); }
  window.KitPhone = { mask, valid: v => v.replace(/\D/g,'').replace(/^1(?=\d{10}$)/,'').length === 10 };

  /* ---------- auto init ---------- */
  function init(){
    $$('select[data-kit]').forEach(enhanceSelect);
    $$('[data-kit-faq]').forEach(faq);
    $$('input[type=tel]').forEach(phone);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.KitInit = init;
})();
