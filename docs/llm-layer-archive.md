# Архив: LLM-слой для диагностики (снят с прода 28.07.2026)

## Зачем снят
Продажи ещё не пошли, ценность слоя не проверена. Ядро диагностики
детерминированное и самодостаточно: все цифры, диагноз, приоритеты и
дорожная карта считаются кодом. LLM писал только связный текст поверх
готового расчёта — то есть был надстройкой, а не механикой.

## Когда возвращать
Когда пойдут продажи и станет видно, чего не хватает в живом разборе.
Проверять надо на реальном вопросе: «читает ли клиент этот текст и
меняет ли он решение», а не «выглядит ли умно».

## Как вернуть
1. Вставить модуль `LLM` (ниже) перед `const Final`.
2. Вернуть CSS-блок (в конце документа) перед `/* Демо-режим`.
3. В `Final.show()` вернуть панель и обработчики — они в разделе «Разметка
   и обработчики».
4. В `Report.printPDF()` вернуть страницу «РАЗБОР» — раздел «Страница PDF».

## Экономика
Один разбор: ~6 тыс входных + ~4 тыс выходных токенов на Opus 5 —
порядка 5–15 ₽. При чеке 50 000 ₽ это шум.

## Риски, которые были учтены
- Ключ лежит в localStorage браузера, страница публичная. Открывать
  только на своей машине.
- Модель не считает и не придумывает числа — в системном промпте это
  запрещено явно, ей передаётся готовый расчёт.
- В промпте зашит запретный список формулировок из
  `files/05-closery-позиционирование.md`.

---

## Модуль

```js
const LLM = {
  KEY_STORE: 'closery_api_key',
  MODEL_STORE: 'closery_api_model',
  ENDPOINT: 'https://api.anthropic.com/v1/messages',

  key(){ try{ return localStorage.getItem(this.KEY_STORE) || ''; }catch(e){ return ''; } },
  setKey(v){ try{ v ? localStorage.setItem(this.KEY_STORE, v.trim()) : localStorage.removeItem(this.KEY_STORE); }catch(e){} },
  model(){ try{ return localStorage.getItem(this.MODEL_STORE) || 'claude-opus-5'; }catch(e){ return 'claude-opus-5'; } },
  setModel(v){ try{ localStorage.setItem(this.MODEL_STORE, v); }catch(e){} },
  available(){ return !!this.key(); },

  // Готовый расчёт — модель работает поверх него, а не вместо него
  payload(){
    const a = State.answers;
    const p = Profile.build();
    const f = Funnel.build();
    const fd = Funnel.diagnose();
    const cap = Capacity.build();
    const perc = Perception.build();
    const idx = Scoring.index(true) ?? 0;
    const cats = Scoring.categories();
    return {
      компания: a.company, ниша: a.niche, продукт: a.product,
      сегмент: a.audience, чек: a.avg_check, маржа: a.margin,
      выручка_в_месяц: a.revenue, прибыль_в_месяц: a.profit,
      индекс_зрелости: idx,
      оценки_систем: Object.fromEntries(Object.entries(CAT_LABELS).map(([k,l]) => [l, cats[k].touched ? cats[k].score : null])),
      нормы_профиля: {конверсия: p.convTarget, повторные: p.repeatTarget,
                      скорость_ответа: Profile.respLabel(), лидов_на_продавца: p.loadNorm,
                      как_выведены: Profile.explain()},
      воронка: f && !f.partial ? {лиды: f.leads, диалоги: f.dialogs,
                      дозвон: Math.round(f.reachRate*100)+'%', закрытие: Math.round(f.closeRate*100)+'%',
                      норма_закрытия: Math.round(f.closeNorm*100)+'%', диагноз: fd && fd.title} : null,
      пропускная_способность: cap ? {лидов_на_продающего: Math.round(cap.load), норма: cap.loadNorm,
                      состояние: Capacity.state(), предел_сделок: cap.cap} : null,
      главное_ограничение: (Constraint.detect() || {}).name,
      потери_в_год: FinModel.totalLoss(),
      статьи_потерь: FinModel.losses().map(l => ({причина: l.label, рублей_в_год: l.val})),
      возврат_за_90_дней: FinModel.recoverable(),
      возможности: FinModel.opportunities().map(o => ({из: o.from, рублей: o.value, недель: o.weeks,
                      ответственный: o.owner, первый_шаг: o.step})),
      расхождение_мнения_и_данных: perc ? {тип: perc.kind, считает: perc.believed, данные: perc.data} : null,
      разрыв_до_цели: GoalGap.text(),
      качество_данных: DataQuality.text(),
      что_сломается_при_росте: a.growth_ready,
      причина_отказов: a.lost_reason,
      кого_считает_виноватым: a.attribution
    };
  },

  SYSTEM: `Ты — старший консультант по построению коммерческих отделов. Тебе передан ГОТОВЫЙ расчёт диагностики компании: все цифры уже посчитаны детерминированной моделью.

ТВОЯ ЗАДАЧА: написать связный разбор на языке ниши клиента, опираясь только на переданные цифры.

ЖЁСТКИЕ ПРАВИЛА:
1. НЕ считай и НЕ придумывай числа. Используй только те, что переданы. Если числа нет — не упоминай его.
2. Не обещай конкретных финансовых результатов. Возврат из расчёта — это оценка модели, называй его оценкой, а не гарантией.
3. Запрещённые формулировки: «микробизнес», «×2 к выручке» и любые обещания результата в цифрах, «отдел продаж под ключ», «бизнес полетит в космос», «лидерство на рынке», гарантия конкретной выручки.
4. Не продавай и не хвали Closery. Клиент уже заплатил за разбор — он ждёт анализа, а не рекламы.
5. Обращайся на «вы», без панибратства. Тон — спокойный, прямой, без драматизации и без утешений.
6. Каждое утверждение — либо цифра из расчёта, либо проверяемый факт о его бизнесе.
7. Пиши по-русски. Никакого markdown, только чистый текст с абзацами.

ФОРМАТ ОТВЕТА — ровно три блока, каждый начинается со своего заголовка на отдельной строке:

ЧТО ПРОИСХОДИТ
Два-три абзаца: как связаны между собой найденные проблемы в терминах именно этой ниши. Не перечисляй находки списком — покажи причинно-следственную цепь.

ЧТО ЭТО ЗНАЧИТ ДЛЯ ВАС
Один-два абзаца: чем это обернётся для собственника лично — его время, риски, устойчивость бизнеса. Если данные и мнение собственника расходятся, скажи об этом прямо и объясни, почему это дорого.

С ЧЕГО НАЧАТЬ В ПОНЕДЕЛЬНИК
Три-четыре конкретных действия на ближайшие две недели. Каждое — одним предложением, начиная с глагола. Только то, что следует из расчёта.`,

  async generate(onChunk){
    const key = this.key();
    if (!key) throw new Error('Ключ не задан');
    const res = await fetch(this.ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        // Обязателен для вызова из браузера
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: this.model(),
        max_tokens: 4000,
        stream: true,
        thinking: {type: 'adaptive'},
        system: this.SYSTEM,
        messages: [{role: 'user', content:
          'Расчёт диагностики:\n\n' + JSON.stringify(this.payload(), null, 1) +
          '\n\nНапиши разбор по заданному формату.'}]
      })
    });
    if (!res.ok){
      const t = await res.text().catch(()=> '');
      throw new Error(`API ${res.status}: ${t.slice(0,200)}`);
    }
    // Разбор SSE-потока
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '', text = '';
    while (true){
      const {done, value} = await reader.read();
      if (done) break;
      buf += dec.decode(value, {stream:true});
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines){
        if (!line.startsWith('data:')) continue;
        const raw = line.slice(5).trim();
        if (!raw || raw === '[DONE]') continue;
        let ev; try{ ev = JSON.parse(raw); }catch(e){ continue; }
        if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta'){
          text += ev.delta.text;
          if (onChunk) onChunk(text);
        }
      }
    }
    return text;
  },

  // Три блока ответа → HTML
  render(text){
    const heads = ['ЧТО ПРОИСХОДИТ', 'ЧТО ЭТО ЗНАЧИТ ДЛЯ ВАС', 'С ЧЕГО НАЧАТЬ В ПОНЕДЕЛЬНИК'];
    const esc = s => FlowUI.esc(s);
    let html = '', rest = text;
    const idxs = heads.map(h => ({h, i: rest.indexOf(h)})).filter(x => x.i >= 0);
    if (!idxs.length) return `<div class="llm-body">${esc(text).replace(/\n{2,}/g,'</p><p>').replace(/\n/g,'<br>')}</div>`;
    idxs.forEach((x, n) => {
      const from = x.i + x.h.length;
      const to = n+1 < idxs.length ? idxs[n+1].i : rest.length;
      const body = rest.slice(from, to).trim();
      html += `<div class="llm-h">${esc(x.h)}</div><div class="llm-body"><p>${
        esc(body).split(/\n{2,}/).join('</p><p>').replace(/\n/g,'<br>')}</p></div>`;
    });
    return html;
  }
};```

## CSS

```css
/* Разбор, написанный поверх готового расчёта */
.llm-h{font-size:10px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--teal);margin:18px 0 8px}
.llm-h:first-child{margin-top:0}
.llm-body p{font-size:13.5px;color:var(--ink-2);line-height:1.7;margin:0 0 10px}
.llm-body p:last-child{margin-bottom:0}
.llm-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px}
.llm-bar input{flex:1 1 220px;min-width:0;background:var(--surface);border:1px solid var(--line);
  color:var(--ink);font-family:inherit;font-size:12px;padding:8px 10px}
.llm-bar input:focus{outline:none;border-color:var(--teal)}
.llm-bar select{background:var(--surface);border:1px solid var(--line);color:var(--ink-2);font-family:inherit;font-size:11px;padding:8px 10px}
.llm-hint{font-size:11.5px;color:var(--ink-3);line-height:1.5;margin-top:8px}
.llm-err{font-size:12px;color:var(--bad);margin-top:8px;line-height:1.5}```

## Разметка и обработчики (в Final.show)

```js
// Разметка — вставлялась перед панелью «Качество данных»
`<div class="panel" style="margin-bottom:22px"><div class="panel-h">Развёрнутый разбор</div>
  <div class="llm-bar">
    <input type="password" id="llmKey" placeholder="sk-ant-… ключ Anthropic" value="${FlowUI.esc(LLM.key())}" autocomplete="off">
    <select id="llmModel"><option value="claude-opus-5">Opus 5</option><option value="claude-sonnet-5">Sonnet 5</option></select>
    <button class="btn-ghost" id="btnLLM" style="flex:none">Собрать разбор</button>
  </div>
  <div id="llmOut"></div>
  <div class="llm-hint">Цифры выше уже посчитаны и не изменятся — модель пишет связный текст поверх готового расчёта на языке вашей ниши. Ключ хранится только в этом браузере и уходит напрямую в api.anthropic.com. Один разбор стоит порядка 5–15 ₽.</div>
</div>`

// Обработчики — после привязки btnPDF / btnBook
const kIn = document.getElementById('llmKey');
const mSel = document.getElementById('llmModel');
const out = document.getElementById('llmOut');
const btn = document.getElementById('btnLLM');
if (kIn && btn){
  mSel.value = LLM.model();
  kIn.addEventListener('change', ()=>LLM.setKey(kIn.value));
  mSel.addEventListener('change', ()=>LLM.setModel(mSel.value));
  btn.onclick = async ()=>{
    LLM.setKey(kIn.value); LLM.setModel(mSel.value);
    if (!LLM.available()){ out.innerHTML = '<div class="llm-err">Нужен ключ Anthropic — получить можно на console.anthropic.com → API Keys.</div>'; return; }
    btn.disabled = true; btn.textContent = 'Собираю…';
    out.innerHTML = '<div class="empty-note">// модель читает расчёт…</div>';
    try{
      const text = await LLM.generate(partial => { out.innerHTML = LLM.render(partial); });
      out.innerHTML = LLM.render(text);
      Final._llmText = text;
    }catch(e){
      out.innerHTML = `<div class="llm-err">Не получилось: ${FlowUI.esc(e.message)}</div>`;
    }finally{
      btn.disabled = false; btn.textContent = 'Пересобрать разбор';
    }
  };
}
```

## Страница PDF (в Report.printPDF, перед дорожной картой)

```js
if (Final._llmText){
  const blocks = ['ЧТО ПРОИСХОДИТ','ЧТО ЭТО ЗНАЧИТ ДЛЯ ВАС','С ЧЕГО НАЧАТЬ В ПОНЕДЕЛЬНИК'];
  const t = Final._llmText;
  const found = blocks.map(h=>({h, i:t.indexOf(h)})).filter(x=>x.i>=0);
  const body = found.length
    ? found.map((x,n)=>{
        const from = x.i + x.h.length, to = n+1<found.length ? found[n+1].i : t.length;
        return `<div class="pr-h2" style="margin-top:${n?16:0}px">${x.h.charAt(0)+x.h.slice(1).toLowerCase()} <i>·</i></div>` +
               t.slice(from,to).trim().split(/\n{2,}/).map(par=>`<div class="pr-lede">${FlowUI.esc(par)}</div>`).join('');
      }).join('')
    : `<div class="pr-lede">${FlowUI.esc(t)}</div>`;
  page('РАЗБОР', `<div class="pr-tag">Развёрнутый разбор</div>
    <div class="pr-title">Как это связано между собой</div>${body}`);
}
```
