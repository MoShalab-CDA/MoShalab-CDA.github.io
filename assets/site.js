(function(){
  var FORMSPREE='https://formspree.io/f/REPLACE_ME';
  var views=[].slice.call(document.querySelectorAll('.view'));
  var segs=views.map(function(v){return v.dataset.view}).filter(function(v){return v!=='home'});
  var homeAnchors=['products','spaces','acoustics','top'];
  var seg=document.getElementById('seg-field');
  var desc=document.querySelector('meta[name="description"]'); var baseDesc=desc.content;
  function show(name){ if(views.length<2) return;
    views.forEach(function(v){v.hidden=v.dataset.view!==name});
    var v=views.filter(function(x){return x.dataset.view===name})[0];
    document.title=v.dataset.title; desc.content=v.dataset.desc||baseDesc;
    seg.value=name==='home'?'דף הבית':v.dataset.title.split(' | ')[0];
    [].forEach.call(document.querySelectorAll('.nav a'),function(a){a.removeAttribute('aria-current')});
    if(name!=='home'){var sp=document.querySelector('.nav a[href="#spaces"]');if(sp)sp.setAttribute('aria-current','page')}
  }
  var current='home';
  function route(){
    var h=(location.hash||'').replace('#','');
    if(segs.indexOf(h)>-1){ if(current!==h){show(h);current=h} window.scrollTo(0,0); closeNav(); return; }
    if(homeAnchors.indexOf(h)>-1 && current!=='home'){ show('home'); current='home'; }
    if(h==='top'||h===''){ window.scrollTo(0,0); }
    else { var t=document.getElementById(h); if(t) t.scrollIntoView(); }
    closeNav();
  }
  var multi=views.length>1;
  if(multi) window.addEventListener('hashchange',route);
  // nav
  var btn=document.querySelector('.menu-btn'), nav=document.getElementById('nav');
  function closeNav(){nav.classList.remove('open');btn.setAttribute('aria-expanded','false')}
  btn.addEventListener('click',function(){var o=!nav.classList.contains('open');nav.classList.toggle('open',o);btn.setAttribute('aria-expanded',String(o))});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeNav()});
  var head=document.querySelector('.site-head');
  window.addEventListener('scroll',function(){head.classList.toggle('scrolled',window.scrollY>8)},{passive:true});
  // theme
  var tbtn=document.querySelector('.theme-btn'), root=document.documentElement;
  function setTheme(t){root.dataset.theme=t;var d=t==='dark';tbtn.setAttribute('aria-pressed',String(d));tbtn.setAttribute('aria-label',d?'מצב בהיר':'מצב כהה');try{localStorage.setItem('kyma-theme',t)}catch(e){}}
  setTheme(root.dataset.theme==='dark'?'dark':'light');
  tbtn.addEventListener('click',function(){setTheme(root.dataset.theme==='dark'?'light':'dark')});
  // form
  var form=document.querySelector('form[name="lead"]'), err=document.getElementById('form-error'), thanks=document.getElementById('thanks');
  function fail(msg,el){err.textContent=msg;err.hidden=false;if(el){el.setAttribute('aria-invalid','true');el.focus()}}
  form.addEventListener('input',function(e){e.target.removeAttribute('aria-invalid');err.hidden=true});
  var steps=[].slice.call(form.querySelectorAll('.step')), bars=form.querySelectorAll('.progress span'), label=document.getElementById('step-label');
  var LABELS=['שלב 1 מתוך 2 · על הפרויקט','שלב 2 מתוך 2 · פרטי התקשרות'];
  function go(n){ steps.forEach(function(s,i){s.hidden=i!==n}); [].forEach.call(bars,function(b,i){b.classList.toggle('on',i<=n)}); label.textContent=LABELS[n]; err.hidden=true; }
  function checkStep1(){
    var t=document.getElementById('f-type'); if(!t.value){fail('בחרו את סוג העסק או הפרויקט.',t);return false}
    if(!form.querySelector('input[name="areas"]:checked')){fail('בחרו לפחות מקום אחד לפתרון האקוסטי.',form.querySelector('.chip input'));return false}
    return true;
  }
  form.querySelector('[data-next]').addEventListener('click',function(){ if(checkStep1()){ go(1); document.getElementById('f-first').focus(); } });
  form.querySelector('[data-back]').addEventListener('click',function(){ go(0); document.getElementById('f-type').focus(); });
  form.addEventListener('submit',function(e){
    e.preventDefault(); err.hidden=true;
    if(!checkStep1()){ go(0); return; }
    var req=[['f-first','מלאו שם פרטי.'],['f-last','מלאו שם משפחה.'],['f-phone','מלאו מספר טלפון תקין.'],['f-city','מלאו עיר או יישוב.']];
    for(var i=0;i<req.length;i++){var el=document.getElementById(req[i][0]);if(!el.value.trim()||!el.checkValidity()){return fail(req[i][1],el)}}
    var mail=document.getElementById('f-mail'); if(mail.value&&!mail.checkValidity()) return fail('כתובת האימייל לא תקינה.',mail);
    var data=new FormData(form), areas=data.getAll('areas'), body=new URLSearchParams(); data.forEach(function(v,k){body.append(k,v)});
    var btnS=form.querySelector('button[type="submit"]'); btnS.disabled=true; btnS.textContent='שולחים…';
    function done(){ if(form.dataset.thanks){ location.href=form.dataset.thanks; return; } [].slice.call(form.children).forEach(function(c){if(c!==thanks)c.hidden=true}); thanks.hidden=false; thanks.focus(); }
    function viaWhatsApp(){
      var t='שלום KYMA, אשמח לקבל הצעה.\nסוג: '+data.get('type')+'\nשם: '+data.get('first_name')+' '+data.get('last_name')+'\nטלפון: '+data.get('phone')+'\nעיר: '+data.get('city')+(data.get('email')?'\nאימייל: '+data.get('email'):'')+'\nאיפה: '+areas.join(', ')+(data.get('employees')?'\nעובדים: '+data.get('employees'):'')+(data.get('notes')?'\nהערות: '+data.get('notes'):'')+'\nעמוד: '+data.get('segment-page');
      window.open('https://wa.me/972542002029?text='+encodeURIComponent(t),'_blank','noopener');
      [].slice.call(form.children).forEach(function(c){if(c!==thanks)c.hidden=true}); thanks.hidden=false; thanks.focus();
    }
    if(form.dataset.provider==='formspree'){
      if(typeof FORMSPREE==='undefined'||FORMSPREE.indexOf('REPLACE_ME')>-1){ viaWhatsApp(); return; }
      fetch(FORMSPREE,{method:'POST',headers:{'Accept':'application/json'},body:data})
        .then(function(r){ if(r.ok) done(); else viaWhatsApp(); }).catch(viaWhatsApp);
    } else {
      fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString()})
        .then(function(r){ if(r.ok) done(); else viaWhatsApp(); }).catch(viaWhatsApp);
    }
  });
  if(multi) route();
})();
