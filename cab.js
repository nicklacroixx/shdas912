/* Кабинет собственника: кнопки сайта ведут на регистрацию в lk.closery.ru.
   Ссылка в разметке уже полная: /register?next=<раздел кабинета>&utm_source=site&utm_content=<блок> — работает и без скрипта.
   Скрипт помнит, откуда человек пришёл на сайт (метки, внешний реферер, первая страница), и в момент клика дописывает
   это к ссылке: кабинет пишет источник при регистрации. Новая кампания или новый внешний заход перезаписывают
   источник, переходы по сайту и прямые заходы — нет. Клик — цель Метрики reg_open. */
(function(){
  var KEY='closery-src', TTL=30*864e5, LK='https://lk.closery.ru', src=null;
  /* локальная копия сайта ведёт в локальную копию кабинета */
  var DEV=/^(localhost|127\.0\.0\.1)$/.test(location.hostname)?'http://127.0.0.1:8793':'';
  try{src=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){}
  if(!src||!src.t||Date.now()-src.t>TTL)src=null;
  var q=new URLSearchParams(location.search), utm={};
  ['utm_source','utm_medium','utm_campaign','utm_content'].forEach(function(k){var v=q.get(k);if(v)utm[k]=v.slice(0,80);});
  var ref=document.referrer&&document.referrer.indexOf(location.origin)!==0?document.referrer.slice(0,200):'';
  if(utm.utm_source||ref||!src){
    src={t:Date.now(),utm:utm,ref:ref,lp:(location.pathname+(q.get('lead')?'?lead=1':'')).slice(0,200)};
    try{localStorage.setItem(KEY,JSON.stringify(src));}catch(e){}
  }

  function target(a){
    var u=new URL(a.href), block=u.searchParams.get('utm_content')||'';
    if(src.utm.utm_source){               /* пришёл по метке: источник — она, блок кнопки дописываем к её content */
      ['utm_source','utm_medium','utm_campaign'].forEach(function(k){if(src.utm[k])u.searchParams.set(k,src.utm[k]);else u.searchParams.delete(k);});
      u.searchParams.set('utm_content',src.utm.utm_content?src.utm.utm_content+'/'+block:block);
    }
    if(src.ref)u.searchParams.set('ref',src.ref);
    if(src.lp)u.searchParams.set('lp',src.lp);
    var s=u.toString();
    return DEV?s.replace(LK,DEV):s;
  }

  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href^="'+LK+'/register"]');
    if(!a)return;
    var url=target(a);
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.button===1||a.target==='_blank'){a.href=url;return;}
    e.preventDefault();
    var gone=false;function go(){if(!gone){gone=true;location.href=url;}}
    try{if(window.ym)ym(113130091,'reachGoal','reg_open',{},go);}catch(_){}
    setTimeout(go,window.ym?400:0);
  });
  /* «Уже есть доступ — войти» тоже ведёт в локальный кабинет при проверке */
  if(DEV)document.querySelectorAll('a[href^="'+LK+'"]:not([href^="'+LK+'/register"])').forEach(function(a){a.href=a.href.replace(LK,DEV);});
})();
