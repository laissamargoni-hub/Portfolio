/* Feedback do portfólio · botão discreto + painel com o Google Forms
   ---------------------------------------------------------------
   Aparece em todas as páginas que incluem <script src="feedback.js" defer>
   (ou "../feedback.js" dentro de uma pasta). Não é obrigatório: só abre se a pessoa clicar.
   Eventos (via analytics.js): feedback_open, feedback_close, feedback_submit. */
(function () {
  var FORM_ID = '1g6cV5uvqorMuglnIE5jRnM5VylVMqn15JoiC3m74BK8';
  var FORM_URL = 'https://docs.google.com/forms/d/' + FORM_ID + '/viewform?embedded=true';

  var root = document.documentElement;
  var body = document.body;
  var PAGE = body.getAttribute('data-page') || 'home';
  var CASE = body.getAttribute('data-case') || undefined;
  function en() { return root.lang === 'en-US'; }
  function t(pt, enTxt) { return en() ? enTxt : pt; }
  function track(name, props) { if (window.lmTrack) window.lmTrack(name, props || {}); }

  var css = '' +
    '.fb-btn{position:fixed;right:18px;bottom:18px;z-index:60;display:flex;align-items:center;gap:8px;padding:10px 16px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:500 14px/1 var(--body,inherit);box-shadow:0 6px 20px rgba(23,45,77,.14);cursor:pointer;opacity:.92;transition:opacity .2s,transform .2s}' +
    '.fb-btn:hover{opacity:1;transform:translateY(-2px)}' +
    '.fb-btn .dot{width:8px;height:8px;border-radius:50%;background:var(--accent)}' +
    '.fb-wrap{position:fixed;inset:0;z-index:70;display:flex;justify-content:flex-end;align-items:flex-end;background:rgba(23,45,77,.28);padding:18px}' +
    '.fb-wrap[hidden]{display:none}' +
    '.fb-panel{width:min(440px,100%);height:min(640px,calc(100vh - 36px));background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:18px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 18px 50px rgba(23,45,77,.25)}' +
    '.fb-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:18px 20px 12px;border-bottom:1px solid var(--line)}' +
    '.fb-head h2{margin:0 0 4px;font:600 18px/1.25 var(--display,inherit)}' +
    '.fb-head p{margin:0;font:400 13px/1.45 var(--body,inherit);opacity:.75}' +
    '.fb-x{border:0;background:none;color:inherit;font-size:22px;line-height:1;cursor:pointer;padding:2px 6px}' +
    '.fb-panel iframe{flex:1;width:100%;border:0;background:#fff}' +
    '.fb-thanks{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;gap:8px;font:400 15px/1.5 var(--body,inherit)}' +
    '.fb-thanks b{font:600 18px/1.3 var(--display,inherit);color:var(--accent)}' +
    '@media (max-width:560px){.fb-btn{right:12px;bottom:12px;padding:9px 13px}.fb-wrap{padding:0;align-items:stretch}.fb-panel{width:100%;height:100%;border-radius:0}}' +
    '@media print{.fb-btn,.fb-wrap{display:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'fb-btn'; btn.setAttribute('aria-haspopup', 'dialog');
  btn.innerHTML = '<span class="dot" aria-hidden="true"></span><span class="lbl"></span>';
  body.appendChild(btn);

  var wrap = document.createElement('div');
  wrap.className = 'fb-wrap'; wrap.hidden = true;
  wrap.innerHTML = '<div class="fb-panel" role="dialog" aria-modal="true" aria-labelledby="fb-title">' +
    '<div class="fb-head"><div><h2 id="fb-title"></h2><p class="fb-sub"></p></div><button type="button" class="fb-x"></button></div>' +
    '<div class="fb-body"></div></div>';
  body.appendChild(wrap);
  var panelBody = wrap.querySelector('.fb-body');
  panelBody.style.cssText = 'flex:1;display:flex;flex-direction:column';

  function paint() {
    btn.querySelector('.lbl').textContent = t('Feedback', 'Feedback');
    btn.setAttribute('aria-label', t('Deixar feedback sobre o portfólio', 'Leave feedback about this portfolio'));
    wrap.querySelector('#fb-title').textContent = t('Sua opinião ajuda muito', 'Your feedback helps a lot');
    wrap.querySelector('.fb-sub').textContent = t('Leva menos de 1 minuto e nenhuma pergunta é obrigatória.', 'Takes less than a minute. The form is in Portuguese.');
    wrap.querySelector('.fb-x').setAttribute('aria-label', t('Fechar', 'Close'));
    wrap.querySelector('.fb-x').textContent = '×';
  }
  paint();
  new MutationObserver(paint).observe(root, { attributes: true, attributeFilter: ['lang'] });

  var loads = 0, submitted = false, openedAt = 0;
  function mountForm() {
    loads = 0;
    panelBody.innerHTML = '';
    var f = document.createElement('iframe');
    f.src = FORM_URL; f.title = t('Formulário de feedback', 'Feedback form'); f.loading = 'lazy';
    f.style.flex = '1';
    // O Forms carrega uma vez ao abrir e de novo depois do envio: o segundo carregamento é o envio.
    f.addEventListener('load', function () {
      loads++;
      if (loads === 2 && !submitted) {
        submitted = true;
        track('feedback_submit', { seconds_to_submit: Math.round((Date.now() - openedAt) / 1000) });
      }
    });
    panelBody.appendChild(f);
  }

  function open() {
    wrap.hidden = false; openedAt = Date.now();
    if (!panelBody.firstChild || submitted) { submitted = false; mountForm(); }
    track('feedback_open', { feedback_location: PAGE === 'case' ? 'case' : 'home', case_name: CASE });
    wrap.querySelector('.fb-x').focus();
  }
  function close() {
    if (wrap.hidden) return;
    wrap.hidden = true;
    track('feedback_close', { submitted: submitted, seconds_open: Math.round((Date.now() - openedAt) / 1000) });
    btn.focus();
  }
  btn.addEventListener('click', open);
  wrap.querySelector('.fb-x').addEventListener('click', close);
  wrap.addEventListener('click', function (e) { if (e.target === wrap) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();
