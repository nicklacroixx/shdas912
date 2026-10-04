/* Форма записи на МРТ для всех страниц Closery.
   Кнопки записи открывают окно с формой вместо перехода в Telegram. Заявка уходит в кабинет
   (cabinet.closery.ru/api/mri/lead), оттуда сразу в Telegram Николаю. Telegram остаётся ссылкой
   внутри окна — для тех, кому так удобнее. */
(function(){
  var API='https://cabinet.closery.ru/api/mri/lead', TG='https://t.me/klimenko_prod';
  var css=`
.lf-bg{position:fixed;inset:0;z-index:300;background:var(--veil);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;pointer-events:none;transition:opacity .3s}
.lf-bg.open{opacity:1;pointer-events:auto}
.lf{position:relative;width:100%;max-width:560px;max-height:calc(100vh - 40px);overflow:auto;background:var(--paper);border:1px solid var(--rule-2);border-radius:18px;padding:clamp(24px,4vw,40px);box-shadow:0 60px 120px -30px var(--shadow);transform:translateY(16px);transition:transform .4s cubic-bezier(.16,1,.3,1);color:var(--ink);font-family:'Onest',system-ui,sans-serif}
.lf-bg.open .lf{transform:none}
.lf-x{position:absolute;right:16px;top:16px;width:36px;height:36px;border-radius:50%;border:1px solid var(--rule-2);background:none;color:var(--ink-2);font-size:18px;line-height:1;cursor:pointer}
.lf-x:hover{color:var(--ink);border-color:var(--ink-3)}
.lf-k{font-size:14px;color:var(--ok-soft);display:flex;align-items:center;gap:12px;margin-bottom:16px}
.lf-k::before{content:"";width:28px;height:1px;background:var(--ok)}
.lf h3{font-family:'Unbounded','Onest',sans-serif;font-weight:600;font-size:clamp(24px,3vw,32px);letter-spacing:-.04em;line-height:1.08;margin:0 0 12px;padding-right:30px}
.lf-sub{font-size:15px;line-height:1.55;color:var(--ink-2);margin:0 0 24px}
.lf-f{display:block;margin-bottom:14px}
.lf-f span{display:block;font-size:13px;color:var(--ink-3);margin-bottom:6px}
.lf-f input,.lf-f textarea{width:100%;background:var(--bg-2);border:1px solid var(--rule-2);border-radius:10px;color:var(--ink);font:inherit;font-size:16px;padding:13px 14px;outline:none;transition:border-color .2s}
.lf-f textarea{min-height:84px;resize:vertical}
.lf-f input:focus,.lf-f textarea:focus{border-color:var(--ok)}
.lf-f.err input{border-color:var(--loss)}
.lf-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:520px){.lf-row{grid-template-columns:1fr}}
.lf-seg{display:flex;flex-wrap:wrap;gap:6px}
.lf-seg button{background:var(--bg-2);border:1px solid var(--rule-2);border-radius:9px;color:var(--ink-2);font:inherit;font-size:14px;padding:9px 12px;cursor:pointer}
.lf-seg button[aria-pressed="true"]{background:var(--ink);border-color:var(--ink);color:var(--bg)}
.lf-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
.lf-c{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.5;color:var(--ink-3);margin:18px 0 22px;cursor:pointer}
.lf-c input{margin-top:3px;accent-color:var(--ok);width:16px;height:16px;flex:none}
.lf-c a{color:var(--ink-2)}
.lf-c.err{color:var(--loss)}
.lf-go{width:100%;display:flex;justify-content:center;align-items:center;gap:10px;background:var(--ink);color:var(--bg);border:none;border-radius:10px;font:inherit;font-weight:500;font-size:16px;padding:16px;cursor:pointer;transition:background .2s}
.lf-go:hover{background:var(--ok-soft)}
.lf-go[disabled]{opacity:.5;cursor:wait}
.lf-alt{margin-top:16px;font-size:14px;color:var(--ink-3);text-align:center}
.lf-alt a{color:var(--ink)}
.lf-note{margin:8px 0 0;font-size:13px;line-height:1.5;color:var(--ink-3)}
.lf-msg{margin-top:12px;font-size:14px;color:var(--loss);min-height:0}
.lf-ok{text-align:left}
.lf-ok b{display:block;font-family:'Source Serif 4',Georgia,serif;font-weight:600;font-size:64px;line-height:1;color:var(--ok-soft);margin-bottom:16px}
`;
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  var utm=(function(){try{var q=location.search.slice(1);if(/utm_/.test(q))sessionStorage.setItem('cl_utm',q);return sessionStorage.getItem('cl_utm')||'';}catch(e){return '';}})();

  var bg=document.createElement('div');bg.className='lf-bg';bg.setAttribute('role','dialog');bg.setAttribute('aria-modal','true');bg.setAttribute('aria-labelledby','lfT');
  bg.innerHTML='<div class="lf"><button class="lf-x" type="button" aria-label="Закрыть">×</button><div class="lf-body"></div></div>';
  document.body.appendChild(bg);
  var body=bg.querySelector('.lf-body'),last=null,rev='',role='',extra={};

  function form(){
    rev='';role='';extra={};
    var fromReport=/[?&]from=report/.test(location.search);  /* кнопка «Обсудить план и старт» из отчёта МРТ */
    body.innerHTML=''+
      (fromReport
        ? '<p class="lf-k">После МРТ</p><h3 id="lfT">Обсудить план и старт</h3><p class="lf-sub">Николай свяжется в течение рабочего дня: самая дорогая течь, план на месяц, метрика приёмки и дата старта.</p>'
        : '<p class="lf-k">Коммерческий МРТ · 79&nbsp;990&nbsp;₽</p><h3 id="lfT">Заявка на МРТ</h3><p class="lf-sub">Две компании в неделю проходят МРТ за счёт Closery — по итогам отбора. Решение и время — в течение рабочего дня. NDA подписываем до доступа к данным.</p>')+
      '<form novalidate>'+
      '<div class="lf-row"><label class="lf-f" data-f="name"><span>Имя</span><input name="name" autocomplete="name" class="ym-disable-keys"></label>'+
      '<label class="lf-f" data-f="contact"><span>Телефон, Telegram или почта</span><input name="contact" autocomplete="tel" class="ym-disable-keys"></label></div>'+
      '<label class="lf-f"><span>Компания</span><input name="company" autocomplete="organization" class="ym-disable-keys"></label>'+
      '<div class="lf-f"><span>Кто вы в компании</span><div class="lf-seg" data-seg="role">'+
        ['Собственник','Гендиректор-партнёр','Другая роль'].map(function(t){return '<button type="button" aria-pressed="false">'+t+'</button>';}).join('')+
      '</div><p class="lf-note" hidden>МРТ проводим с собственником. Оставьте заявку, а на МРТ позовите его.</p></div>'+
      '<div class="lf-f"><span>Отдел продаж</span><div class="lf-seg" data-seg="team">'+
        ['1–2 человека','3–10','больше 10'].map(function(t){return '<button type="button" aria-pressed="false">'+t+'</button>';}).join('')+
      '</div></div>'+
      '<div class="lf-f"><span>CRM</span><div class="lf-seg" data-seg="crm">'+
        ['Есть','Нет'].map(function(t){return '<button type="button" aria-pressed="false">'+t+'</button>';}).join('')+
      '</div></div>'+
      '<div class="lf-f"><span>Выручка в месяц</span><div class="lf-seg" data-seg="rev">'+
        ['до 10 млн','10–50 млн','50–200 млн','больше 200 млн'].map(function(t){return '<button type="button" aria-pressed="false">'+t+'</button>';}).join('')+
      '</div></div>'+
      '<label class="lf-f"><span>Что сейчас беспокоит больше всего? Необязательно</span><textarea name="pain" class="ym-disable-keys" placeholder="Например: заявок много, а продаж не прибавляется"></textarea></label>'+
      '<input class="lf-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">'+
      '<label class="lf-c"><input type="checkbox" name="consent"><span>Согласен на обработку персональных данных для ответа на заявку по <a href="/policy/" target="_blank">политике конфиденциальности</a></span></label>'+
      '<button class="lf-go" type="submit">Отправить заявку</button>'+
      '<p class="lf-msg" aria-live="polite"></p>'+
      '</form>'+
      '<p class="lf-alt">Удобнее в мессенджере? <a href="'+TG+'" target="_blank" rel="noopener">Написать в Telegram</a></p>';
    var f=body.querySelector('form');
    body.querySelectorAll('.lf-seg button').forEach(function(b){b.addEventListener('click',function(){
      var seg=b.parentNode;
      seg.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed','false');});
      b.setAttribute('aria-pressed','true');
      var k=seg.getAttribute('data-seg');
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
    msg.textContent='';go.disabled=true;go.textContent='Отправляем…';
    var data={name:v('name').value,contact:v('contact').value,company:v('company').value,revenue:rev,pain:(role?'Роль: '+role+'\n':'')+(extra.team?'Отдел продаж: '+extra.team+'\n':'')+(extra.crm?'CRM: '+extra.crm+'\n':'')+v('pain').value,
      website:v('website').value,consent:true,page:location.pathname,utm:utm};
    fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
      .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
      .then(function(x){
        if(!x.ok)throw new Error(x.j&&x.j.detail||'');
        try{if(window.ym)ym(113130091,'reachGoal','lead_form');}catch(e){}
        body.innerHTML='<div class="lf-ok"><b>✓</b><h3 id="lfT">Заявка у Николая</h3><p class="lf-sub">Ответим в течение рабочего дня по контакту, который вы оставили. Если срочно — <a href="'+TG+'" target="_blank" rel="noopener" style="color:var(--ink)">напишите в Telegram</a>.</p><button class="lf-go" type="button">Закрыть</button></div>';
        body.querySelector('.lf-go').addEventListener('click',close);
      })
      .catch(function(err){
        go.disabled=false;go.textContent='Отправить заявку';
        msg.innerHTML=(err.message||'Не получилось отправить.')+' Напишите в <a href="'+TG+'" target="_blank" rel="noopener" style="color:var(--ink)">Telegram</a> или на <a href="mailto:klimenko@closery.ru" style="color:var(--ink)">klimenko@closery.ru</a>.';
      });
  }

  function open(){last=document.activeElement;form();bg.classList.add('open');document.documentElement.style.overflow='hidden';
    setTimeout(function(){var i=body.querySelector('input');if(i)i.focus();},200);
    try{if(window.ym)ym(113130091,'reachGoal','lead_open');}catch(e){}}
  function close(){bg.classList.remove('open');document.documentElement.style.overflow='';if(last)last.focus();}
  bg.addEventListener('click',function(e){if(e.target===bg)close();});
  bg.querySelector('.lf-x').addEventListener('click',close);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&bg.classList.contains('open'))close();});

  /* кнопки записи открывают форму; ссылки со словом «Telegram» и вопрос «в какой вы колонке» ведут в мессенджер */
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href*="t.me/klimenko_prod"]');
    if(!a||a.closest('.lf')||a.closest('footer')||/telegram/i.test(a.textContent))return;
    e.preventDefault();open();
  });
  window.closeryLead=open;

  /* Рабочая неделя для предложения «две встречи в неделю без оплаты»: [data-week] получает даты
     понедельник–пятница текущей недели по Москве, в выходные — следующей. Дата настоящая, не счётчик. */
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
