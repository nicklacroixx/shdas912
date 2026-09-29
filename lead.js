/* Форма заявки на МРТ для всех страниц Closery.
   Кнопки записи открывают окно с формой вместо перехода в Telegram. Заявка уходит в кабинет
   (cabinet.closery.ru/api/mri/lead), оттуда сразу в Telegram Николаю. Telegram остаётся ссылкой
   внутри окна — для тех, кому так удобнее. */
(function(){
  var API='https://cabinet.closery.ru/api/mri/lead', TG='https://t.me/klimenko_prod';
  var css=`
.lf-bg{position:fixed;inset:0;z-index:300;background:rgba(4,9,7,.72);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;pointer-events:none;transition:opacity .3s}
.lf-bg.open{opacity:1;pointer-events:auto}
.lf{position:relative;width:100%;max-width:560px;max-height:calc(100vh - 40px);overflow:auto;background:#0F1D19;border:1px solid #2A3F38;border-radius:18px;padding:clamp(24px,4vw,40px);box-shadow:0 60px 120px -30px rgba(0,0,0,.8);transform:translateY(16px);transition:transform .4s cubic-bezier(.16,1,.3,1);color:#F4F8F6;font-family:'Onest',system-ui,sans-serif}
.lf-bg.open .lf{transform:none}
.lf-x{position:absolute;right:16px;top:16px;width:36px;height:36px;border-radius:50%;border:1px solid #2A3F38;background:none;color:#CBD6D0;font-size:18px;line-height:1;cursor:pointer}
.lf-x:hover{color:#fff;border-color:#8FA099}
.lf-k{font-size:14px;color:#7FE9C0;display:flex;align-items:center;gap:12px;margin-bottom:16px}
.lf-k::before{content:"";width:28px;height:1px;background:#34D399}
.lf h3{font-family:'Unbounded','Onest',sans-serif;font-weight:600;font-size:clamp(24px,3vw,32px);letter-spacing:-.04em;line-height:1.08;margin:0 0 12px;padding-right:30px}
.lf-sub{font-size:15px;line-height:1.55;color:#CBD6D0;margin:0 0 24px}
.lf-f{display:block;margin-bottom:14px}
.lf-f span{display:block;font-size:13px;color:#8FA099;margin-bottom:6px}
.lf-f input,.lf-f textarea{width:100%;background:#0B1714;border:1px solid #2A3F38;border-radius:10px;color:#F4F8F6;font:inherit;font-size:16px;padding:13px 14px;outline:none;transition:border-color .2s}
.lf-f textarea{min-height:84px;resize:vertical}
.lf-f input:focus,.lf-f textarea:focus{border-color:#34D399}
.lf-f.err input{border-color:#EE5A5E}
.lf-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:520px){.lf-row{grid-template-columns:1fr}}
.lf-seg{display:flex;flex-wrap:wrap;gap:6px}
.lf-seg button{background:#0B1714;border:1px solid #2A3F38;border-radius:9px;color:#CBD6D0;font:inherit;font-size:14px;padding:9px 12px;cursor:pointer}
.lf-seg button[aria-pressed="true"]{background:#F4F8F6;border-color:#F4F8F6;color:#07100D}
.lf-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
.lf-c{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.5;color:#8FA099;margin:18px 0 22px;cursor:pointer}
.lf-c input{margin-top:3px;accent-color:#34D399;width:16px;height:16px;flex:none}
.lf-c a{color:#CBD6D0}
.lf-c.err{color:#EE5A5E}
.lf-go{width:100%;display:flex;justify-content:center;align-items:center;gap:10px;background:#F4F8F6;color:#07100D;border:none;border-radius:10px;font:inherit;font-weight:500;font-size:16px;padding:16px;cursor:pointer;transition:background .2s}
.lf-go:hover{background:#7FE9C0}
.lf-go[disabled]{opacity:.5;cursor:wait}
.lf-alt{margin-top:16px;font-size:14px;color:#8FA099;text-align:center}
.lf-alt a{color:#F4F8F6}
.lf-msg{margin-top:12px;font-size:14px;color:#EE5A5E;min-height:0}
.lf-ok{text-align:left}
.lf-ok b{display:block;font-family:'Source Serif 4',Georgia,serif;font-weight:600;font-size:64px;line-height:1;color:#7FE9C0;margin-bottom:16px}
`;
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  var utm=(function(){try{var q=location.search.slice(1);if(/utm_/.test(q))sessionStorage.setItem('cl_utm',q);return sessionStorage.getItem('cl_utm')||'';}catch(e){return '';}})();

  var bg=document.createElement('div');bg.className='lf-bg';bg.setAttribute('role','dialog');bg.setAttribute('aria-modal','true');bg.setAttribute('aria-labelledby','lfT');
  bg.innerHTML='<div class="lf"><button class="lf-x" type="button" aria-label="Закрыть">×</button><div class="lf-body"></div></div>';
  document.body.appendChild(bg);
  var body=bg.querySelector('.lf-body'),last=null,rev='';

  function form(){
    rev='';
    body.innerHTML=''+
      '<p class="lf-k">Коммерческий МРТ · 50&nbsp;000&nbsp;₽</p>'+
      '<h3 id="lfT">Запись на МРТ</h3>'+
      '<p class="lf-sub">Николай ответит в течение рабочего дня и предложит время для 120 минут по вашим цифрам.</p>'+
      '<form novalidate>'+
      '<div class="lf-row"><label class="lf-f" data-f="name"><span>Имя</span><input name="name" autocomplete="name" class="ym-disable-keys"></label>'+
      '<label class="lf-f" data-f="contact"><span>Телефон, Telegram или почта</span><input name="contact" autocomplete="tel" class="ym-disable-keys"></label></div>'+
      '<label class="lf-f"><span>Компания</span><input name="company" autocomplete="organization" class="ym-disable-keys"></label>'+
      '<div class="lf-f"><span>Выручка в месяц</span><div class="lf-seg">'+
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
      body.querySelectorAll('.lf-seg button').forEach(function(x){x.setAttribute('aria-pressed','false');});
      b.setAttribute('aria-pressed','true');rev=b.textContent;});});
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
    var data={name:v('name').value,contact:v('contact').value,company:v('company').value,revenue:rev,pain:v('pain').value,
      website:v('website').value,consent:true,page:location.pathname,utm:utm};
    fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
      .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
      .then(function(x){
        if(!x.ok)throw new Error(x.j&&x.j.detail||'');
        try{if(window.ym)ym(113130091,'reachGoal','lead_form');}catch(e){}
        body.innerHTML='<div class="lf-ok"><b>✓</b><h3 id="lfT">Заявка у Николая</h3><p class="lf-sub">Ответим в течение рабочего дня по контакту, который вы оставили. Если срочно — <a href="'+TG+'" target="_blank" rel="noopener" style="color:#F4F8F6">напишите в Telegram</a>.</p><button class="lf-go" type="button">Закрыть</button></div>';
        body.querySelector('.lf-go').addEventListener('click',close);
      })
      .catch(function(err){
        go.disabled=false;go.textContent='Отправить заявку';
        msg.innerHTML=(err.message||'Не получилось отправить.')+' Напишите в <a href="'+TG+'" target="_blank" rel="noopener" style="color:#F4F8F6">Telegram</a> или на <a href="mailto:klimenko@closery.ru" style="color:#F4F8F6">klimenko@closery.ru</a>.';
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
})();
