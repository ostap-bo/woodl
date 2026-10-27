/* Woodl analytics: Google Analytics 4 + Microsoft Clarity + event tracking.
   Skipped inside preview iframes (the hero phones), so they don't inflate visits. */
(function(){
  var GA_ID = 'G-HKGVR1EB73';
  var CLARITY_ID = 'z40mntm67k';
  if (window.self !== window.top) { window.track = function(){}; return; }
  if (/^(localhost|127\.|file:)/.test(location.hostname || location.protocol)) { window.track = function(n,p){ console.info('[track]', n, p || {}); }; return; }

  var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID; document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA_ID);

  if (CLARITY_ID) {
    (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", CLARITY_ID);
  }

  window.track = function(name, params){ try { gtag('event', name, params || {}); if (window.clarity) clarity('event', name); } catch(e){} };

  /* auto-track clicks on contact links, demo and case links */
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    var h = a.getAttribute('href') || '', where = a.closest('header,footer,.hero,.mbar,.cta,.demo-card,#work,.pop') ;
    var loc = where ? (where.id || where.tagName.toLowerCase() === 'header' && 'header' || where.tagName.toLowerCase() === 'footer' && 'footer' || where.className.split(' ')[0]) : 'body';
    if (/wa\.me|whatsapp/i.test(h)) track('contact_click', {method:'whatsapp', location:loc});
    else if (/t\.me\//i.test(h)) track('contact_click', {method:'telegram', location:loc});
    else if (/^mailto:/i.test(h)) track('contact_click', {method:'email', location:loc});
    else if (/^tel:/i.test(h)) track('contact_click', {method:'phone', location:loc});
    else if (/(^|\/)demo\/?(\?|#|$)/.test(h)) track('demo_open', {location:loc});
    else if (/work\/[a-z-]+/.test(h)) track('case_open', {case_name:(h.match(/work\/([a-z-]+)/)||[])[1], location:loc});
    else if (/linkedin|upwork|fiverr/i.test(h)) track('social_click', {network:(h.match(/linkedin|upwork|fiverr/i)||[''])[0].toLowerCase()});
  }, true);
})();
