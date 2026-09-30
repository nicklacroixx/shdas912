/* Тема Closery: дневная и ночная. Подключается в <head> без defer, чтобы страница не мигала тёмным.
   Пока посетитель не выбрал сам, по умолчанию тёмная — фирменный вид. Выбор хранится в localStorage.
   Кнопка встаёт в шапку сама: круг, наполовину залитый, в ряд со ссылками. Клик поворачивает его на пол-оборота и меняет тему. */
(function(){
  var KEY='closery-theme-v2',root=document.documentElement;
  function pref(){try{var v=localStorage.getItem(KEY);return v==='light'?'light':'dark';}catch(e){return 'dark';}}
  function paint(t){
    root.setAttribute('data-theme',t);root.style.colorScheme=t;
    var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='light'?'#F8F5EE':'#07100D');
  }

  var L='html[data-theme="light"]',css=
  /* дневная палитра: нейтральная бумага без зелёного оттенка, акценты темнее, чтобы держать контраст на белом */
  L+'{--bg:#F8F5EE;--bg-2:#F2EEE4;--paper:#FFFDF8;--paper-2:#F4F0E6;--rule:#E8E2D5;--rule-2:#D7CFBF;'+
    '--ink:#15130F;--ink-2:#3F3B34;--ink-3:#746D61;--ink-4:#ADA596;--loss:#C4323A;--ok:#0F8A5F;--ok-soft:#0B6B4A;--amber:#8F6A17;'+
    '--gold:#86621A;--gold-2:#C9A24A;--gold-3:#EFE2BF;'+
    '--loss-2:#DE8488;--loss-3:#EFC0C2;--mid:#CBC4B6;--ok-2:#4DB58C;--ok-3:#A9DCC7;'+
    '--shadow:rgba(60,45,15,.08);--logo-filter:brightness(0);--veil:rgba(40,32,18,.30)}'+
  ':root{--shadow:rgba(0,0,0,.8);--logo-filter:brightness(0) invert(1);--veil:rgba(4,9,7,.72)}'+
  /* днём без атмосферы ночной темы: ни свечений, ни изумрудного тумана, ни зерна */
  L+' body::after{display:none}'+
  L+' .logo i,'+L+' .cmp-logo i,'+L+' .progress,'+L+' .scanline{box-shadow:none!important}'+
  L+' .band{background:none}'+
  /* днём акцент золотой: подписи разделов, номера, подчёркивания, полоса прочитанного. Зелёный остаётся за деньгами, красный за потерями */
  L+' .kick{color:var(--gold)}'+L+' .kick::before{color:var(--gold-2)}'+
  L+' .progress{background:var(--gold-2)!important}'+
  L+' .lnk{border-bottom-color:var(--gold-2)!important}'+L+' a:hover{text-decoration-color:var(--gold-2)}'+
  L+' .sh i{color:var(--gold-2)}'+
  L+' ::selection{background:var(--gold-3)}'+
  /* островки со светлым текстом в любой теме: подпись поверх фото */
  L+' .ti-dark{--ink:#F4F8F6;--ink-2:#CBD6D0;--ink-3:#8FA099;color:var(--ink)}'+
  /* плавная смена: View Transitions, иначе короткий переход цветов */
  '::view-transition-old(root),::view-transition-new(root){animation-duration:.4s;animation-timing-function:cubic-bezier(.4,0,.2,1)}'+
  'html.ti-fade *,html.ti-fade *::before,html.ti-fade *::after{transition:background-color .3s,color .3s,border-color .3s!important}'+
  /* кнопка: как ссылка меню, без рамки */
  '.ti-btn{flex:none;width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;margin:0 -6px;padding:0;border:0;border-radius:8px;background:none;color:var(--ink-3);cursor:pointer;transition:color .2s}'+
  '.ti-btn:hover{color:var(--ink)}'+
  '.ti-btn svg{width:16px;height:16px;display:block}'+
  '.ti-btn svg{transition:transform .7s cubic-bezier(.65,0,.35,1)}'+
  L+' .ti-btn svg{transform:rotate(180deg)}'+
  '@media(prefers-reduced-motion:reduce){.ti-btn *{transition:none!important}}';

  var st=document.createElement('style');st.id='ti-css';st.textContent=css;
  (document.head||root).appendChild(st);
  paint(pref());

  var ICON='<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.75" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.25a6.75 6.75 0 0 1 0 13.5z" fill="currentColor"/></svg>';

  var btns=[];
  function sync(){
    var t=root.getAttribute('data-theme'),lbl=t==='light'?'Включить ночной режим':'Включить дневной режим';
    btns.forEach(function(b){b.setAttribute('aria-label',lbl);b.title=lbl;});
  }
  function set(t){
    try{localStorage.setItem(KEY,t);}catch(e){}
    var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce)paint(t);
    else if(document.startViewTransition&&document.visibilityState==='visible'){var vt=document.startViewTransition(function(){paint(t);});vt.ready.catch(function(){paint(t);});vt.finished.catch(function(){});vt.updateCallbackDone&&vt.updateCallbackDone.catch(function(){});}
    else{root.classList.add('ti-fade');paint(t);setTimeout(function(){root.classList.remove('ti-fade');},350);}
    sync();
  }
  addEventListener('storage',function(e){if(e.key===KEY){paint(pref());sync();}});

  function mount(){
    var nav=document.querySelector('header .bar-nav, header .nav');
    if(!nav||nav.querySelector('.ti-btn'))return;
    var b=document.createElement('button');b.className='ti-btn';b.type='button';b.innerHTML=ICON;
    b.addEventListener('click',function(){set(root.getAttribute('data-theme')==='light'?'dark':'light');});
    nav.insertBefore(b,nav.querySelector('.bar-cta, .cta, .bar-burger')||null);
    btns.push(b);sync();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
