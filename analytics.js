/* Analytics do portfólio · Clarity + Google Analytics 4 + Mixpanel
   ---------------------------------------------------------------
   Preencha os IDs abaixo. Ferramenta com ID vazio simplesmente não carrega,
   então dá para ligar uma de cada vez.
   - Clarity:   clarity.microsoft.com > Settings > Overview > Project ID (ex.: "abc123xyz0")
   - GA4:       analytics.google.com > Admin > Data streams > Measurement ID (ex.: "G-XXXXXXXXXX")
   - Mixpanel:  mixpanel.com > Project settings > Project token (ex.: "a1b2c3...")
   Debug: abra o site com ?debug=1 para ver os eventos no console.
   Acesso interno: abra com ?eu=1 para seus acessos não contarem (?eu=0 desfaz).
   Páginas: cada página declara no <body> data-page="home" ou data-page="case" data-case="<slug>".
   Página nova precisa incluir <script src="analytics.js" defer> (ou "../analytics.js" dentro de uma pasta). */
(function () {
  var CONFIG = {
    clarityId: 'zjvf9dlstc',
    ga4Id: 'G-4KMNZ5W65C',
    mixpanelToken: 'fb198d816ea3e0a994763e8812209539',
    mixpanelHost: 'https://api-js.mixpanel.com' // projeto na UE? use 'https://api-eu.mixpanel.com'
  };

  var body = document.body || document.documentElement;
  var PAGE = body.getAttribute('data-page') || 'home';      // 'home' | 'case'
  var CASE = body.getAttribute('data-case') || undefined;   // ex.: 'prescricao-do-futuro'
  var DEBUG = /[?&]debug=1/.test(location.search);
  var root = document.documentElement;

  // Só mede o site publicado (GitHub Pages). Arquivo local, localhost e prévias ficam de fora.
  var isLive = /\.github\.io$/.test(location.hostname);
  if (!isLive && !DEBUG) return;

  // Acessos da própria Laíssa não entram nas métricas.
  // Abra o site uma vez com ?eu=1 em cada aparelho/navegador para marcar como interno; ?eu=0 desfaz.
  try {
    var eu = new URLSearchParams(location.search).get('eu');
    if (eu === '1') localStorage.setItem('lm-internal', '1');
    if (eu === '0') localStorage.removeItem('lm-internal');
    if (localStorage.getItem('lm-internal') === '1' && !DEBUG) { console.info('[analytics] acesso interno: métricas desligadas neste navegador'); return; }
  } catch (e) {}

  function lang() { return root.lang === 'en-US' ? 'en' : 'pt'; }
  function theme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function source() {
    var p = new URLSearchParams(location.search);
    if (p.get('utm_source')) return p.get('utm_source');
    if (!document.referrer) return 'direct';
    try { return new URL(document.referrer).hostname.replace(/^www\./, ''); } catch (e) { return 'unknown'; }
  }

  /* ---------- carregamento das ferramentas ---------- */

  if (CONFIG.clarityId) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CONFIG.clarityId);
  }

  if (CONFIG.ga4Id) {
    var gs = document.createElement('script');
    gs.async = true;
    gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.ga4Id;
    document.head.appendChild(gs);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', CONFIG.ga4Id, { page_type: PAGE, case_name: CASE, site_language: lang(), site_theme: theme(), debug_mode: DEBUG || undefined });
  }

  if (CONFIG.mixpanelToken) {
    (function (f, b) { if (!b.__SV) { var e, g, i, h; window.mixpanel = b; b._i = []; b.init = function (e, f, c) { function g(a, d) { var b = d.split('.'); 2 == b.length && (a = a[b[0]], d = b[1]); a[d] = function () { a.push([d].concat(Array.prototype.slice.call(arguments, 0))); }; } var a = b; 'undefined' !== typeof c ? a = b[c] = [] : c = 'mixpanel'; a.people = a.people || []; a.toString = function (a) { var d = 'mixpanel'; 'mixpanel' !== c && (d += '.' + c); a || (d += ' (stub)'); return d; }; a.people.toString = function () { return a.toString(1) + '.people (stub)'; }; i = 'disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove'.split(' '); for (h = 0; h < i.length; h++) g(a, i[h]); b._i.push([e, f, c]); }; b.__SV = 1.2; e = f.createElement('script'); e.type = 'text/javascript'; e.async = !0; e.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js'; g = f.getElementsByTagName('script')[0]; g.parentNode.insertBefore(e, g); } })(document, window.mixpanel || []);
    mixpanel.init(CONFIG.mixpanelToken, {
      api_host: CONFIG.mixpanelHost,
      persistence: 'localStorage',
      ip: true,               // usa o IP só para país, estado e cidade (o Mixpanel não guarda o IP)
      track_pageview: true,
      debug: DEBUG
    });
    mixpanel.register({ page_type: PAGE, site_language: lang(), site_theme: theme(), traffic_source: source() });
    if (CASE) mixpanel.register({ case_name: CASE }); else mixpanel.unregister('case_name');
    mixpanel.time_event(PAGE === 'case' ? 'case_exit' : 'home_exit');
  }

  if (window.clarity) {
    clarity('set', 'page_type', PAGE);
    if (CASE) clarity('set', 'case_name', CASE);
    clarity('set', 'site_language', lang());
    clarity('set', 'site_theme', theme());
    clarity('set', 'traffic_source', source());
  }

  /* ---------- envio unificado ---------- */

  function track(name, props) {
    props = props || {};
    props.site_language = lang();
    props.page_type = PAGE;
    if (CASE && !props.case_name) props.case_name = CASE;
    if (DEBUG) console.log('[analytics]', name, props);
    if (window.gtag && CONFIG.ga4Id) gtag('event', name, props);
    if (window.mixpanel && CONFIG.mixpanelToken) mixpanel.track(name, props);
    if (window.clarity) clarity('event', name);
  }

  window.lmTrack = track; // usado pelo feedback.js

  function setProp(key, value) {
    if (window.mixpanel && CONFIG.mixpanelToken) { var o = {}; o[key] = value; mixpanel.register(o); }
    if (window.clarity) clarity('set', key, value);
    if (window.gtag && CONFIG.ga4Id) { var g = {}; g[key] = value; gtag('set', 'user_properties', g); }
  }

  function on(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener('click', fn); }

  /* ---------- eventos comuns às páginas ---------- */

  // Idioma e tema
  on('lang-pt', function () { setProp('site_language', 'pt'); track('language_change', { language: 'pt' }); });
  on('lang-en', function () { setProp('site_language', 'en'); track('language_change', { language: 'en' }); });
  on('theme-light', function () { setProp('site_theme', 'light'); track('theme_change', { theme: 'light' }); });
  on('theme-dark', function () { setProp('site_theme', 'dark'); track('theme_change', { theme: 'dark' }); });

  // Profundidade de scroll (25/50/75/100)
  var marks = [25, 50, 75, 100], hit = {}, maxScroll = 0;
  window.addEventListener('scroll', function () {
    var h = document.documentElement.scrollHeight - innerHeight;
    if (h <= 0) return;
    var pct = Math.round((scrollY / h) * 100);
    maxScroll = Math.max(maxScroll, pct);
    marks.forEach(function (m) { if (pct >= m && !hit[m]) { hit[m] = true; track('scroll_depth', { percent: m }); } });
  }, { passive: true });

  // Links: cards e botões de case, CTAs, contato, saídas
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    var cta = a.getAttribute('data-cta');
    var caseLink = a.getAttribute('data-case-link');
    if (caseLink) track('case_card_click', { case_name: caseLink, cta_location: cta || 'link' });
    else if (cta) track('cta_click', { cta: cta });
    if (/^mailto:/.test(href)) track('contact_click', { channel: 'email' });
    else if (/\.pdf$/i.test(href)) track('resume_download', { language: /-en\.pdf$/i.test(href) ? 'en' : 'pt' });
    else if (a.hostname && /(^|\.)linkedin\.com$/.test(a.hostname)) track('contact_click', { channel: 'linkedin' });
    else if (a.hostname && /(^|\.)instagram\.com$/.test(a.hostname)) track('contact_click', { channel: 'instagram' });
    if (a.hostname && a.hostname !== location.hostname) track('outbound_click', { url: a.href, domain: a.hostname });
  });

  // Botões que não são links (ex.: "Fora do trabalho" no Sobre)
  [].forEach.call(document.querySelectorAll('button[data-cta]'), function (b) {
    b.addEventListener('click', function () { track('cta_click', { cta: b.getAttribute('data-cta') }); });
  });
  // Cards "Em breve" (interesse em cases futuros)
  [].forEach.call(document.querySelectorAll('[data-soon]'), function (c) {
    c.addEventListener('click', function () { track('soon_card_click', { case_name: c.getAttribute('data-soon') }); });
  });

  // Cards de evento (abrem a janela de detalhes)
  [].forEach.call(document.querySelectorAll('[data-event]'), function (b) {
    b.addEventListener('click', function () { track('event_open', { event: b.getAttribute('data-event') }); });
  });

  // Seções vistas (funil de leitura) — na Home são seções, no case são capítulos
  var order = PAGE === 'case'
    ? [].map.call(document.querySelectorAll('section.chapter[id]'), function (e) { return e.id; }).concat('fim')
    : ['trabalho', 'formacao', 'sobre', 'como-trabalho', 'depoimentos', 'contato'];
  var seen = {};
  var deepest = 0;
  var start = Date.now();
  if ('IntersectionObserver' in window) {
    var onSeen = function (entries) {
      entries.forEach(function (en) {
        var id = en.target.id;
        if (!en.isIntersecting || seen[id]) return;
        seen[id] = true;
        var idx = order.indexOf(id) + 1;
        deepest = Math.max(deepest, idx);
        var secs = Math.round((Date.now() - start) / 1000);
        if (PAGE === 'case') {
          track('chapter_view', { chapter: id, chapter_number: idx, seconds_since_load: secs });
          if (id === 'fim') track('case_completed', { seconds_to_complete: secs });
        } else {
          track('home_section_view', { section: id, section_number: idx, seconds_since_load: secs });
        }
      });
    };
    var io = new IntersectionObserver(onSeen, { rootMargin: '0px 0px -50% 0px', threshold: 0 }); // conta quando a seção cruza o meio da tela
    // A última seção fica no fim da página e pode nunca cruzar o meio da tela: conta quando 40% dela aparece
    var ioLast = new IntersectionObserver(onSeen, { threshold: 0.4 });
    var last = order[order.length - 1];
    order.forEach(function (id) { var el = document.getElementById(id); if (el) (id === last ? ioLast : io).observe(el); });
  }

  // Saída: tempo na página e quão longe a pessoa foi
  var sentExit = false;
  function exit() {
    if (sentExit) return;
    sentExit = true;
    if (window.mixpanel && CONFIG.mixpanelToken && mixpanel.set_config) mixpanel.set_config({ api_transport: 'sendBeacon' });
    var secs = Math.round((Date.now() - start) / 1000);
    if (PAGE === 'case') {
      track('case_exit', { deepest_chapter: deepest ? order[deepest - 1] : 'hero', deepest_chapter_number: deepest, max_scroll_percent: maxScroll, seconds_on_page: secs });
    } else {
      track('home_exit', { deepest_section: deepest ? order[deepest - 1] : 'hero', deepest_section_number: deepest, max_scroll_percent: maxScroll, seconds_on_page: secs });
    }
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') exit(); });
  window.addEventListener('pagehide', exit);

  // Vídeos com controles, inclusive os que entram depois (janela de eventos). O loop sem som da capa não conta.
  // Eventos de mídia não sobem na árvore, então escutamos na fase de captura.
  function vid(e) { var v = e.target; return v && v.tagName === 'VIDEO' && v.hasAttribute('controls') ? v : null; }
  function vname(v) { return v.getAttribute('data-video') || 'receitapro-15s'; }
  document.addEventListener('play', function (e) { var v = vid(e); if (v) track('video_play', { video: vname(v) }); }, true);
  document.addEventListener('timeupdate', function (e) {
    var v = vid(e); if (!v || v._half || !v.duration) return;
    if (v.currentTime / v.duration >= 0.5) { v._half = true; track('video_progress', { video: vname(v), percent: 50 }); }
  }, true);
  document.addEventListener('ended', function (e) { var v = vid(e); if (v) track('video_complete', { video: vname(v) }); }, true);

  if (PAGE !== 'case') return;

  /* ---------- eventos só do case ---------- */

  // Abas do protótipo (Texto / Voz / Imagem)
  [].forEach.call(document.querySelectorAll('.tab[data-shot]'), function (t) {
    t.addEventListener('click', function () {
      track('prototype_tab_view', { prototype_mode: t.getAttribute('data-shot').replace('s-', '') });
    });
  });

})();
