/* 18.10 «Анализ вашей ниши» на главной: игра из кабинета, lk.closery.ru/assets/game.js и game.css.
   Человек вводит компанию, видит рынок по ФНС, имя и телефон открывают кабинет с отчётом (POST lk.closery.ru/quick).
   Источник тот же, что у кнопок регистрации, cab.js: метки кампании, внешний реферер, первая страница.
   Локальная копия сайта берёт игру из локального кабинета: порт по ?lk=8811, запоминается на вкладку. Цели Метрики:
   niche_found — рынок показан, reg_open — отправил имя и телефон. */
(function(){
  var box=document.getElementById('niche-game');
  if(!box)return;
  var LK='https://lk.closery.ru', q=new URLSearchParams(location.search);
  if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname)){
    var port=q.get('lk');
    try{if(port)sessionStorage.setItem('cl-lk',port);else port=sessionStorage.getItem('cl-lk');}catch(e){}
    LK='http://127.0.0.1:'+(port||'8793');
  }
  function goal(n,cb){try{if(window.ym){ym(113130091,'reachGoal',n,{},cb);return;}}catch(e){}if(cb)cb();}
  function source(){
    var s=null,out={};
    try{s=JSON.parse(localStorage.getItem('closery-src')||'null');}catch(e){}
    s=s||{};
    var u=s.utm||{};
    ['utm_source','utm_medium','utm_campaign'].forEach(function(k){if(u[k])out[k]=u[k];});
    out.utm_content=(u.utm_content?u.utm_content+'/':'')+'niche';
    if(!out.utm_source)out.utm_source='site';
    if(s.ref)out.referrer=s.ref;
    out.landing=s.lp||location.pathname;
    return out;
  }
  var css=document.createElement('link');css.rel='stylesheet';css.href=LK+'/assets/game.css?v=4';document.head.appendChild(css);
  var js=document.createElement('script');js.src=LK+'/assets/game.js?v=4';
  js.onload=function(){
    window.ClGame.mount(box,{base:LK,src:source(),
      onResult:function(){goal('niche_found');},
      onSubmit:function(){goal('reg_open');}});
  };
  js.onerror=function(){box.innerHTML='<a class="btn" href="'+LK+'/register?utm_source=site&amp;utm_content=niche">Найти свой рынок</a>';};
  document.body.appendChild(js);
})();
