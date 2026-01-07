function loadPartial(path, containerId, fallbackHtml){
    return fetch(path)
      .then(r => { if(!r.ok) throw new Error('load failed ' + path + ' (' + r.status + ')'); return r.text(); })
      .then(html => {
          const el = document.getElementById(containerId);
          if(el) el.innerHTML = html;
          return html;
      })
      .catch(err => {
          console.error('Partial load error:', path, err);
          const el = document.getElementById(containerId);
          if(el) el.innerHTML = fallbackHtml || '';
          return null;
      });
}

function loadHeader(){
    const fallback = '<header class="fallback-header" style="padding:1rem;background:#fff;border-bottom:1px solid rgba(0,0,0,0.05)"><div class="container"><a href="/" style="font-weight:700;color:#0b5ea8">OTECH Environnement</a></div></header>';
    const headerPath = '/header.html';
    return loadPartial(headerPath, 'header', fallback);
}

function loadFooter(){
    const fallback = '<footer><div class="footer container"><div class="row"><div class="col-12 text-center">contact@otechenvironnement.fr — 03 21 26 09 13</div></div></div></footer>';
    return loadPartial('/footer.html', 'footer', fallback);
}

const SITE_PHRASES = [
    "L’eau, on l’aime,  on la préserve.",
    "Chaque goutte compte, économise l’eau.",
    "L’eau, trop précieuse pour être polluée.",
    "Préserver l’eau aujourd’hui, c’est préserver la vie de demain.",
    "Ferme le robinet, ouvre ton esprit.",
    "L’eau n’est pas inépuisable, notre implication si.",
    "L’eau : soigne-la comme si ta vie en dépendait.",
    "Assainir l’eau, c’est garantir demain.",
    "La planète tu la préfères bleue ou bien cuite ?",
    "On a pas trouvé d'eau sur Mars, alors préservons-la sur Terre !",
    "Arrête de niquer ta MER !",
    "On boit quoi demain ?",
    "On nettoie l’eau aujourd’hui, on chill demain !"
];

function setHeroSlogan(phrase){
    if(!phrase) return;
    const lead = document.querySelector('.text-overlay .lead');
    if(!lead) return;
    let el = document.querySelector('.lead-slogan');
    if(el){
        el.textContent = phrase;
    } else {
        el = document.createElement('p');
        el.className = 'lead-slogan';
        el.textContent = phrase;
        lead.insertAdjacentElement('afterend', el);
    }
}

function pickRandomDifferent(current){
    if(SITE_PHRASES.length === 0) return '';
    if(SITE_PHRASES.length === 1) return SITE_PHRASES[0];
    let candidate;
    let attempts = 0;
    do {
        candidate = SITE_PHRASES[Math.floor(Math.random()*SITE_PHRASES.length)];
        attempts++;
    } while(candidate === current && attempts < 10);
    return candidate;
}

function setSloganForElement(footerContainer, phrase){
    if(!footerContainer) return;
    const leftCol = footerContainer.querySelector('.row > div') || footerContainer.querySelector('.col-md-6');
    if(!leftCol) return;
    let desc = leftCol.querySelector('p.footer-slogan') || leftCol.querySelector('p.mb-0');
    const chosen = phrase || SITE_PHRASES[Math.floor(Math.random()*SITE_PHRASES.length)];
    if(desc){
        desc.textContent = chosen;
        desc.classList.add('footer-slogan');
    } else {
        desc = document.createElement('p');
        desc.className = 'footer-slogan mb-0';
        desc.textContent = chosen;
        const h5 = leftCol.querySelector('h5');
        if(h5) h5.insertAdjacentElement('afterend', desc);
        else leftCol.appendChild(desc);
    }
}

function updateFooterSlogan(phrase){
    document.querySelectorAll('footer .footer').forEach(f => setSloganForElement(f, phrase));
}

let __footerSloganObserverInitialized = false;
function initFooterObserver(getCurrentPhrase){
    if(__footerSloganObserverInitialized) return;
    const mo = new MutationObserver(muts => {
        for(const m of muts){
            for(const n of m.addedNodes){
                if(!(n instanceof HTMLElement)) continue;
                if(n.matches && (n.matches('footer') || n.matches('footer .footer') || n.matches('.footer'))){
                    const f = n.matches('footer') ? n.querySelector('.footer') : (n.matches('footer .footer') ? n : n);
                    try{ setSloganForElement(f || n, getCurrentPhrase()); } catch(e){ /* ignore */ }
                } else {
                    const nested = n.querySelector && (n.querySelector('footer .footer') || n.querySelector('.footer'));
                    if(nested) setSloganForElement(nested, getCurrentPhrase());
                }
            }
        }
    });
    mo.observe(document.body, {childList:true, subtree:true});
    __footerSloganObserverInitialized = true;
}

function loadScript(url){
    return new Promise((resolve, reject) => {
        if(document.querySelector(`script[src="${url}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = url;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('failed to load ' + url));
        document.head.appendChild(s);
    });
}

function loadBootstrapBundle(){
    if(window.bootstrap) return Promise.resolve();
    return loadScript('https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js');
}

function initHeaderBehavior(){
    // close menus when clicking outside
    document.addEventListener('click', function(e){
      if (!e.target.closest('.navbar')) {
        document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
        document.querySelectorAll('.dropdown-toggle[aria-expanded="true"]').forEach(t => t.setAttribute('aria-expanded','false'));
      }
    });

    // submenu toggle for mobile
    document.querySelectorAll('.dropdown-submenu > .dropdown-toggle').forEach(function(toggle){
      toggle.addEventListener('click', function(e){
        const submenu = toggle.nextElementSibling;
        if (submenu) {
          e.preventDefault();
          submenu.classList.toggle('show');
        }
      });
    });
}

// on load choose one phrase and rotate it every 5 seconds for both hero and footer
window.addEventListener('DOMContentLoaded', () => {
    // load bootstrap & header then init behaviors
    Promise.all([loadBootstrapBundle(), loadHeader()])
      .then(() => initHeaderBehavior())
      .catch(err => console.warn('Bootstrap/header load warning', err));

    loadFooter();

    let shared = SITE_PHRASES[Math.floor(Math.random()*SITE_PHRASES.length)];
    setHeroSlogan(shared);
    updateFooterSlogan(shared);
    initFooterObserver(() => shared);

    setInterval(() => {
        const next = pickRandomDifferent(shared);
        shared = next;
        setHeroSlogan(shared);
        updateFooterSlogan(shared);
    }, 5000);
});
