/* Общий скрипт Closery для кейсов, демо-МРТ и политики: меню, появление блоков, полоса прочитанного */
(function(){
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
  var btn=document.getElementById('barBurger'),menu=document.getElementById('barMobile');
  if(btn&&menu){
    btn.addEventListener('click',function(){var o=menu.classList.toggle('open');btn.classList.toggle('open',o);btn.setAttribute('aria-expanded',String(o));});
    $$('a',menu).forEach(function(a){a.addEventListener('click',function(){menu.classList.remove('open');btn.classList.remove('open');});});
  }
  var pending=$$('.rv'),bar=document.getElementById('progress'),tk=false;
  function reveal(el){el.classList.add('in');}
  function sweep(){var lim=innerHeight*.92;pending=pending.filter(function(el){if(el.getBoundingClientRect().top<lim){reveal(el);return false;}return true;});}
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){reveal(e.target);io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px'});
    pending.forEach(function(el){io.observe(el);});
  }
  function onScroll(){sweep();if(bar){var h=document.documentElement.scrollHeight-innerHeight;bar.style.setProperty('--p',h>0?Math.min(1,scrollY/h):0);}}
  addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(function(){onScroll();tk=false;});}},{passive:true});
  addEventListener('resize',onScroll);onScroll();
})();
