/* Форма записи на МРТ для всех страниц Closery.
   Кнопки записи открывают полноэкранный лист с формой вместо перехода в Telegram. Заявка уходит в кабинет
   (cabinet.closery.ru/api/mri/lead), оттуда сразу в Telegram Николаю. Telegram остаётся ссылкой
   внутри листа — для тех, кому так удобнее.
   Вид — язык сайта, не модалка-анкета: слева утверждение и что будет дальше, справа поля линией
   по сетке 50 %. Только токены темы, поэтому лист работает и в дневной, и в ночной теме. */
(function(){
  var API='https://cabinet.closery.ru/api/mri/lead', TG='https://t.me/klimenko_prod';
  var css=`
.lf-bg{position:fixed;inset:0;z-index:300;background:var(--bg);color:var(--ink);font-family:var(--ui,'Onest',system-ui,sans-serif);overflow-y:auto;overscroll-behavior:contain;opacity:0;visibility:hidden;transition:opacity .35s,visibility 0s .35s}
.lf-bg.open{opacity:1;visibility:visible;transition:opacity .35s}
.lf-top{position:sticky;top:0;z-index:2;border-bottom:1px solid var(--rule);background:color-mix(in srgb,var(--bg) 88%,transparent);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px)}
.lf-in{max-width:1440px;margin:0 auto;padding-left:var(--gut,clamp(20px,5vw,56px));padding-right:var(--gut,clamp(20px,5vw,56px))}
.lf-top .lf-in{height:68px;display:flex;align-items:center;justify-content:space-between;gap:20px}
.lf-logo{display:inline-flex;align-items:center;gap:11px;font-family:var(--brand,'Plus Jakarta Sans',sans-serif);font-weight:800;font-size:13px;text-transform:uppercase;letter-spacing:.2em;color:var(--ink)}
.lf-logo i{width:9px;height:9px;border-radius:2px;background:var(--ok)}
.lf-x{display:inline-flex;align-items:center;gap:10px;background:none;border:0;padding:8px 0;font:inherit;font-size:14px;color:var(--ink-3);cursor:pointer;transition:color .2s}
.lf-x:hover{color:var(--ink)}
.lf{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:auto 1fr;padding-top:clamp(40px,9vh,104px);padding-bottom:clamp(56px,10vh,120px);transform:translateY(14px);transition:transform .5s cubic-bezier(.16,1,.3,1)}
.lf-bg.open .lf{transform:none}
.lf-head{grid-column:1;grid-row:1;padding-right:clamp(24px,3vw,56px)}
.lf-next{grid-column:1;grid-row:2;align-self:start;padding-right:clamp(24px,3vw,56px);margin-top:clamp(36px,6vh,64px);max-width:560px}
.lf-r{grid-column:2;grid-row:1/3;min-width:0;max-width:600px}
.lf-k{font-size:14px;color:var(--ink-3);display:flex;align-items:center;gap:12px;margin:0 0 22px}
.lf-k::before{content:"";width:28px;height:1px;background:var(--ink-4)}
.lf h3{font-family:var(--disp,'Unbounded',sans-serif);font-weight:600;font-size:clamp(36px,4.6vw,68px);letter-spacing:-.05em;line-height:1;margin:0}
.lf-sub{font-size:clamp(16px,1.3vw,18px);line-height:1.6;color:var(--ink-2);margin:24px 0 0;max-width:44ch}
.lf-next p{font-size:14px;color:var(--ink-3);margin:0 0 10px}
.lf-next ol{list-style:none;margin:0;padding:0;counter-reset:lf;border-top:1px solid var(--rule)}
.lf-next li{counter-increment:lf;display:grid;grid-template-columns:44px minmax(0,1fr);padding:14px 0;border-bottom:1px solid var(--rule);font-size:15px;line-height:1.5;color:var(--ink-2)}
.lf-next li::before{content:counter(lf,decimal-leading-zero);color:var(--ink-4);font-feature-settings:"tnum" 1}
.lf-alt{margin:22px 0 0;font-size:14px;color:var(--ink-3)}
.lf-alt a{color:var(--ink);text-decoration:none;border-bottom:1px solid var(--rule-2);transition:border-color .2s}
.lf-alt a:hover{border-color:var(--ink)}
.lf form{display:flex;flex-direction:column;gap:30px;margin:0}
.lf-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:30px clamp(20px,2.6vw,40px)}
.lf-f{display:flex;flex-direction:column;gap:4px;margin:0;min-width:0}
.lf-f>span{font-size:13px;color:var(--ink-3)}
.lf-f>span em{font-style:normal;color:var(--ink-4)}
.lf-f input,.lf-f textarea{width:100%;background:transparent;border:0;border-bottom:1px solid var(--rule-2);border-radius:0;color:var(--ink);font:inherit;font-size:16px;line-height:1.4;padding:9px 0 11px;outline:none;transition:border-color .2s,box-shadow .2s;-webkit-appearance:none;appearance:none}
.lf-f input{height:45px}
.lf-f textarea{min-height:45px;resize:none;overflow:hidden}
.lf-f input::placeholder,.lf-f textarea::placeholder{color:var(--ink-4);opacity:1}
.lf-f input:hover,.lf-f textarea:hover{border-bottom-color:var(--ink-4)}
.lf-f input:focus,.lf-f textarea:focus{border-bottom-color:var(--ok);box-shadow:0 1px 0 var(--ok)}
.lf-f.err input{border-bottom-color:var(--loss);box-shadow:0 1px 0 var(--loss)}
.lf-seg{display:flex;flex-wrap:wrap;gap:8px;padding-top:8px}
.lf-seg button{background:transparent;border:1px solid var(--rule-2);border-radius:8px;color:var(--ink-2);font:inherit;font-size:15px;line-height:1.2;padding:10px 15px;cursor:pointer;transition:border-color .2s,color .2s,background .2s}
.lf-seg button:hover{border-color:var(--ink-4);color:var(--ink)}
.lf-seg button[aria-pressed="true"]{background:var(--ink);border-color:var(--ink);color:var(--bg)}
.lf-note{margin:10px 0 0;font-size:13px;line-height:1.5;color:var(--ink-3)}
.lf-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
.lf-c{display:flex;gap:12px;align-items:flex-start;font-size:14px;line-height:1.5;color:var(--ink-3);cursor:pointer}
.lf-c input{-webkit-appearance:none;appearance:none;flex:none;width:18px;height:18px;margin:1px 0 0;border:1px solid var(--rule-2);border-radius:5px;background:transparent;display:grid;place-content:center;cursor:pointer;transition:background .15s,border-color .15s}
.lf-c input::after{content:"";width:9px;height:5px;border-left:2px solid var(--bg);border-bottom:2px solid var(--bg);transform:translateY(-1px) rotate(-45deg);opacity:0}
.lf-c input:hover{border-color:var(--ink-3)}
.lf-c input:checked{background:var(--ok);border-color:var(--ok)}
.lf-c input:checked::after{opacity:1}
.lf-c a{color:var(--ink-2)}
.lf-c.err{color:var(--loss)}
.lf-c.err input{border-color:var(--loss)}
.lf-go-row{display:flex;align-items:center;gap:20px;flex-wrap:wrap}
.lf-go{display:inline-flex;align-items:center;gap:10px;background:var(--ink);color:var(--bg);border:1px solid var(--ink);border-radius:10px;font:inherit;font-weight:500;font-size:16px;line-height:1.2;padding:16px 26px;cursor:pointer;transition:background .2s,border-color .2s}
.lf-go:hover{background:var(--ok-soft);border-color:var(--ok-soft)}
.lf-go svg{transition:transform .3s cubic-bezier(.16,1,.3,1)}
.lf-go:hover svg{transform:translateX(3px)}
.lf-go[disabled]{opacity:.4;cursor:wait;background:var(--ink);border-color:var(--ink)}
.lf-msg{margin:0;font-size:14px;line-height:1.5;color:var(--loss)}
.lf-msg:empty{display:none}
.lf-msg a{color:inherit}
.lf-ok h4{font-family:var(--disp,'Unbounded',sans-serif);font-weight:600;font-size:clamp(26px,2.6vw,36px);letter-spacing:-.04em;line-height:1.1;margin:0 0 16px}
.lf-ok p{font-size:16px;line-height:1.6;color:var(--ink-2);margin:0 0 30px;max-width:42ch}
.lf-ok p a{color:var(--ink)}
@media(max-width:860px){
  .lf{grid-template-columns:minmax(0,1fr);grid-template-rows:none;padding-top:36px}
  .lf-head,.lf-next,.lf-r{grid-column:1;grid-row:auto;padding-right:0;max-width:none}
  .lf-r{margin-top:40px}
  .lf-next{margin-top:48px}
}
@media(max-width:520px){.lf-row{grid-template-columns:minmax(0,1fr)}}
`;
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  var utm=(function(){try{var q=location.search.slice(1);if(/utm_/.test(q))sessionStorage.setItem('cl_utm',q);return sessionStorage.getItem('cl_utm')||'';}catch(e){return '';}})();
  var ARROW='<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';

  var bg=document.createElement('div');bg.className='lf-bg';bg.setAttribute('role','dialog');bg.setAttribute('aria-modal','true');bg.setAttribute('aria-labelledby','lfT');
  bg.innerHTML='<div class="lf-top"><div class="lf-in"><span class="lf-logo"><i></i>Closery</span>'+
    '<button class="lf-x" type="button">Закрыть <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12"/></svg></button></div></div>'+
    '<div class="lf-in lf"></div>';
  document.body.appendChild(bg);
  var body=bg.querySelector('.lf'),last=null,rev='',role='',extra={};

  function seg(k,label,opts){
    return '<div class="lf-f"><span>'+label+'</span><div class="lf-seg" data-seg="'+k+'" role="group" aria-label="'+label+'">'+
      opts.map(function(t){return '<button type="button" aria-pressed="false">'+t+'</button>';}).join('')+'</div>'+
      (k==='role'?'<p class="lf-note" hidden>МРТ проводим с собственником. Оставьте заявку, а на МРТ позовите его.</p>':'')+'</div>';
  }
  function form(){
    rev='';role='';extra={};
    var fromReport=/[?&]from=report/.test(location.search);  /* кнопка «Обсудить план и старт» из отчёта МРТ */
    var head=fromReport
      ? '<p class="lf-k">После МРТ</p><h3 id="lfT">Обсудить план и старт</h3><p class="lf-sub">Николай свяжется в течение рабочего дня и пройдёт с вами план первого месяца.</p>'
      : '<p class="lf-k">Коммерческий МРТ · 79&nbsp;990&nbsp;₽</p><h3 id="lfT">Заявка на МРТ</h3><p class="lf-sub">120 минут с собственником. Итог — ведомость потерь в рублях по каждому этапу продаж и порядок, в котором их закрывать.</p>';
    var steps=fromReport
      ? ['Самая дорогая потеря из ведомости — первой в работу.','План месяца по неделям и метрика «было → цель».','Работу принимаете по метрике, а не по отчёту о часах.']
      : ['Ответ в течение рабочего дня: время МРТ и решение по отбору — две компании в неделю проходят МРТ за счёт Closery.','NDA подписываем до доступа к данным.','Потерь, которые можно посчитать в рублях, не нашли — возвращаем оплату полностью.'];
    body.innerHTML='<div class="lf-head">'+head+'</div>'+
      '<div class="lf-r"><form novalidate>'+
        '<div class="lf-row"><label class="lf-f" data-f="name"><span>Имя</span><input name="name" autocomplete="name" class="ym-disable-keys"></label>'+
        '<label class="lf-f" data-f="contact"><span>Телефон, Telegram или почта</span><input name="contact" autocomplete="tel" class="ym-disable-keys"></label></div>'+
        '<label class="lf-f"><span>Компания</span><input name="company" autocomplete="organization" class="ym-disable-keys"></label>'+
        seg('role','Кто вы в компании',['Собственник','Гендиректор-партнёр','Другая роль'])+
        '<div class="lf-row">'+seg('team','Команда продаж',['1–2 человека','3–10','больше 10'])+seg('crm','CRM',['Есть','Нет'])+'</div>'+
        seg('rev','Выручка в месяц',['до 10 млн','10–50 млн','50–200 млн','больше 200 млн'])+
        '<label class="lf-f"><span>Что беспокоит больше всего <em>· необязательно</em></span><textarea name="pain" rows="1" class="ym-disable-keys" placeholder="Например: заявок много, а продаж не прибавляется"></textarea></label>'+
        (window.closeryLeadNote&&!fromReport?'<p class="lf-note lf-demo">Цифры из демо-МРТ и итог ведомости приложим к заявке — на МРТ Николай придёт уже с ними.</p>':'')+
        '<input class="lf-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">'+
        '<label class="lf-c"><input type="checkbox" name="consent"><span>Согласен на обработку персональных данных для ответа на заявку по <a href="/policy/" target="_blank">политике конфиденциальности</a></span></label>'+
        '<div class="lf-go-row"><button class="lf-go" type="submit">Отправить заявку '+ARROW+'</button><p class="lf-msg" aria-live="polite"></p></div>'+
      '</form></div>'+
      '<div class="lf-next"><p>Что дальше</p><ol>'+steps.map(function(s){return '<li>'+s+'</li>';}).join('')+'</ol>'+
        '<p class="lf-alt">Удобнее в мессенджере — <a href="'+TG+'" target="_blank" rel="noopener">написать в Telegram</a></p></div>';
    var f=body.querySelector('form'),ta=f.querySelector('textarea');
    ta.addEventListener('input',function(){ta.style.height='auto';ta.style.height=ta.scrollHeight+2+'px';});
    body.querySelectorAll('.lf-seg button').forEach(function(b){b.addEventListener('click',function(){
      var sg=b.parentNode;
      sg.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed','false');});
      b.setAttribute('aria-pressed','true');
      var k=sg.getAttribute('data-seg');
      if(k==='role'){role=b.textContent;body.querySelector('.lf-note').hidden=role!=='Другая роль';}
      else if(k==='rev') rev=b.textContent;
      else extra[k]=b.textContent;});});
    f.addEventListener('submit',send);
  }

  function send(e){
    e.preventDefault();
    var f=e.target,msg=f.querySelector('.lf-msg'),go=f.querySelector('.lf-go'),ok=true;
    function v(n){return f.querySelector('[name="'+n+'"]');}
    function bad(k,c){var el=f.querySelector('[data-f="'+k+'"]');if(el)el.classList.toggle('err',c);if(c)ok=false;}
    bad('name',v('name').value.trim().length<2);
    bad('contact',v('contact').value.trim().length<5);
    f.querySelector('.lf-c').classList.toggle('err',!v('consent').checked);if(!v('consent').checked)ok=false;
    if(!ok){msg.textContent='Заполните имя, контакт и отметьте согласие.';return;}
    msg.textContent='';go.disabled=true;
    var data={name:v('name').value,contact:v('contact').value,company:v('company').value,revenue:rev,pain:(role?'Роль: '+role+'\n':'')+(extra.team?'Команда продаж: '+extra.team+'\n':'')+(extra.crm?'CRM: '+extra.crm+'\n':'')+(window.closeryLeadNote&&!/[?&]from=report/.test(location.search)?window.closeryLeadNote+'\n':'')+v('pain').value,  /* в кабинете поле до 600 знаков: цифры демо — раньше свободного текста */
      website:v('website').value,consent:true,page:location.pathname,utm:utm};
    fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
      .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
      .then(function(x){
        if(!x.ok)throw new Error(x.j&&x.j.detail||'');
        try{if(window.ym)ym(113130091,'reachGoal','lead_form');}catch(e){}
        body.querySelector('.lf-r').innerHTML='<div class="lf-ok"><h4>Заявка у Николая</h4><p>Ответ — в течение рабочего дня по контакту, который вы оставили. Если срочно — <a href="'+TG+'" target="_blank" rel="noopener">напишите в Telegram</a>.</p><button class="lf-go" type="button">Вернуться на сайт</button></div>';
        body.querySelector('.lf-ok .lf-go').addEventListener('click',close);
      })
      .catch(function(err){
        go.disabled=false;
        msg.innerHTML=(err.message||'Не получилось отправить.')+' Напишите в <a href="'+TG+'" target="_blank" rel="noopener">Telegram</a> или на <a href="mailto:klimenko@closery.ru">klimenko@closery.ru</a>.';
      });
  }

  function open(){last=document.activeElement;form();bg.scrollTop=0;bg.classList.add('open');document.documentElement.style.overflow='hidden';
    setTimeout(function(){var i=body.querySelector('input');if(i)i.focus({preventScroll:true});},250);
    try{if(window.ym)ym(113130091,'reachGoal','lead_open');}catch(e){}}
  function close(){bg.classList.remove('open');document.documentElement.style.overflow='';if(last)last.focus();}
  bg.querySelector('.lf-x').addEventListener('click',close);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&bg.classList.contains('open'))close();});

  /* кнопки записи открывают форму; ссылки со словом «Telegram» и вопрос «в какой вы колонке» ведут в мессенджер */
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href*="t.me/klimenko_prod"]');
    if(!a||a.closest('.lf-bg')||a.closest('footer')||/telegram/i.test(a.textContent))return;
    e.preventDefault();open();
  });
  window.closeryLead=open;

  /* Неделя отбора: [data-week] получает даты понедельник–пятница текущей недели по Москве,
     в выходные — следующей. Дата настоящая, не счётчик. */
  try{
    var M=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
    var d=new Date(Date.now()+3*3600e3), wd=d.getUTCDay();
    var shift=(wd===0)?1:(wd===6)?2:(1-wd);
    var mon=new Date(d.getTime()+shift*864e5), fri=new Date(mon.getTime()+4*864e5);
    var txt=mon.getUTCMonth()===fri.getUTCMonth()
      ? 'Неделя '+mon.getUTCDate()+'–'+fri.getUTCDate()+' '+M[fri.getUTCMonth()]
      : 'Неделя '+mon.getUTCDate()+' '+M[mon.getUTCMonth()]+' – '+fri.getUTCDate()+' '+M[fri.getUTCMonth()];
    document.querySelectorAll('[data-week]').forEach(function(e){e.textContent=txt;});
  }catch(e){}
  /* ссылка с ?lead=1 или #zapis сразу открывает форму: так ведут кнопка в отчёте МРТ и ссылки из писем */
  try{if(/[?&]lead=1/.test(location.search)||location.hash==='#zapis')setTimeout(open,400);}catch(e){}
})();
