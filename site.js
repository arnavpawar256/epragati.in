/* प्रगती सार्वजनिक वाचनालय — site.js */
(function(){
'use strict';
var D = window.PRAGATI || {};
var $ = function(s,r){ return (r||document).querySelector(s); };
var $$ = function(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
function mr(n){ return String(n).replace(/\d/g,function(d){ return '०१२३४५६७८९'.charAt(d); }); }
function el(tag,cls,txt){ var e=document.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e; }
function norm(s){ return String(s||'').normalize('NFC').replace(/[\u200c\u200d]/g,'').toLowerCase(); }

/* ---------- testable helpers ---------- */
function parseCSV(text){
  text=String(text).replace(/^\uFEFF/,'');
  var rows=[],row=[],f='',q=false,i,c;
  for(i=0;i<text.length;i++){
    c=text.charAt(i);
    if(q){ if(c==='"'){ if(text.charAt(i+1)==='"'){f+='"';i++;} else q=false; } else f+=c; }
    else if(c==='"') q=true;
    else if(c===','){ row.push(f); f=''; }
    else if(c==='\n'||c==='\r'){ if(c==='\r'&&text.charAt(i+1)==='\n') i++; row.push(f); f=''; if(row.some(function(x){return x.trim()!=='';})) rows.push(row); row=[]; }
    else f+=c;
  }
  row.push(f); if(row.some(function(x){return x.trim()!=='';})) rows.push(row);
  return rows;
}
function dayIndex(date,len){
  var start=new Date(date.getFullYear(),0,0), diff=date-start;
  var day=Math.floor(diff/86400000);
  return ((day+date.getFullYear())%len+len)%len;
}
function yearsSince(y,m,d,now){
  var n=now.getFullYear()-y;
  if(now.getMonth()+1<m || (now.getMonth()+1===m && now.getDate()<d)) n--;
  return n;
}
window.PragatiUtil={parseCSV:parseCSV,dayIndex:dayIndex,yearsSince:yearsSince,mr:mr,norm:norm};

/* ---------- photo pop-up viewer ---------- */
(function(){
  if(!$('a.zoom')) return;
  var dlg=document.createElement('dialog');
  dlg.innerHTML='<button type="button">बंद करा ×</button><img alt=""><p style="margin:8px 0 0;text-align:center"></p>';
  document.body.appendChild(dlg);
  var img=$('img',dlg), cap=$('p',dlg);
  $('button',dlg).onclick=function(){ dlg.close(); };
  dlg.addEventListener('click',function(e){ if(e.target===dlg) dlg.close(); });
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a.zoom'); if(!a) return;
    e.preventDefault();
    var im=a.querySelector('img');
    img.src=a.getAttribute('href'); img.alt=im?im.alt:''; cap.textContent=im?im.alt:'';
    dlg.showModal();
  });
})();

/* ---------- mobile menu ---------- */
(function(){
  var nav=$('nav.main'), btn=$('.menu-btn'); if(!nav||!btn) return;
  btn.addEventListener('click',function(){
    var open=nav.classList.toggle('open'); btn.setAttribute('aria-expanded',open?'true':'false');
    btn.textContent=open?'✕ बंद करा':'☰ मेनू';
  });
})();

/* ---------- optional English translation (Google, needs internet) ---------- */
window.googleTranslateElementInit=function(){
  new google.translate.TranslateElement({pageLanguage:'mr',includedLanguages:'en,mr',autoDisplay:false},'google_translate_element');
};
(function(){
  var sel=$('#site-language'); if(!sel) return;
  sel.addEventListener('change',function(){
    if(!window.__gt){ window.__gt=true; var s=document.createElement('script');
      s.src='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'; document.head.appendChild(s); }
    var tries=0,t=setInterval(function(){
      var c=$('.goog-te-combo');
      if(c){ c.value=sel.value; c.dispatchEvent(new Event('change')); clearInterval(t); }
      if(++tries>40) clearInterval(t);
    },250);
  });
})();

/* ---------- fill from data.js ---------- */
$$('[data-updated]').forEach(function(e){ if(D.updated) e.textContent=D.updated; });
$$('[data-years]').forEach(function(e){ e.textContent=mr(yearsSince(2002,11,14,new Date())); });

function fillList(name,items,fmt){
  $$('[data-list="'+name+'"]').forEach(function(ul){
    if(!items||!items.length) { if(!$('.empty',ul)) ul.hidden=true; return; }
    ul.innerHTML='';
    items.forEach(function(it){ var li=el('li'); fmt(li,it); ul.appendChild(li); });
  });
}
function lv(li,it){ var b=el('b',null,it.label+' : '); li.appendChild(b); li.appendChild(document.createTextNode(it.value)); }
fillList('hours',D.hours,lv); fillList('fees',D.fees,lv); fillList('studyroom',D.studyroom,lv);
fillList('rules',D.rules,function(li,t){ li.textContent=t; });
(function(){ var s=$('[data-hours-short]'); if(s&&D.hours&&D.hours.length) s.textContent=D.hours[0].label+' : '+D.hours[0].value; })();

(function(){ var ul=$('#new-books'); if(!ul||!D.newBooks||!D.newBooks.length) return;
  ul.innerHTML=''; D.newBooks.slice(0,6).forEach(function(b){ var li=el('li'); li.appendChild(el('b',null,b.title));
    if(b.author) li.appendChild(el('small',null,' — '+b.author)); ul.appendChild(li); });
})();

(function(){ var box=$('#bank-box'); if(box&&D.bank){ $('#bank-text').textContent=D.bank; box.hidden=false; } })();

(function(){ var c=D.calendar; if(!c) return;
  if(c.title){ var h=$('#cal'); if(h) h.textContent=c.title; }
  var ul=$('#cal-events'); if(ul&&c.events&&c.events.length){ ul.innerHTML='';
    c.events.forEach(function(e){ var li=el('li'); li.appendChild(el('b',null,e.date)); li.appendChild(document.createTextNode(' — '+e.text)); ul.appendChild(li); }); }
})();

/* ---------- आजचा प्रश्न ---------- */
(function(){ var q=$('#quiz-q'); if(!q||!D.quiz||!D.quiz.length) return;
  var it=D.quiz[dayIndex(new Date(),D.quiz.length)];
  q.textContent=it.q; $('#quiz-a').textContent=it.a;
})();

/* ---------- digital page: filter tiles ---------- */
(function(){ var inp=$('#tile-filter'); if(!inp) return;
  var tiles=$$('.tile'), msg=$('#tile-filter-msg');
  inp.addEventListener('input',function(){
    var t=norm(inp.value).trim().split(/\s+/).filter(Boolean), shown=0;
    tiles.forEach(function(a){ var ok=t.every(function(w){ return norm(a.textContent+' '+(a.closest('section')?a.closest('section').querySelector('h2').textContent:'')).indexOf(w)>-1; });
      a.hidden=!ok; if(ok) shown++; });
    $$('main section').forEach(function(sec){ var ts=$$('.tile',sec); if(!ts.length) return;
      sec.hidden=ts.every(function(a){return a.hidden;}); });
    msg.textContent=t.length?(shown?mr(shown)+' दुवे सापडले':'काहीही सापडले नाही'):'';
    msg.className=t.length?'small':'sr';
  });
})();

/* ---------- info page: application form ---------- */
(function(){ var f=$('#contact-form'); if(!f) return;
  var topic=$('#f-topic'), msg=$('#f-msg'), lab=$('#f-msg-label'), err=$('#f-err'), wa=$('#wa-btn');
  var T={member:['सभासद नोंदणी','संदेश (ऐच्छिक)'],feedback:['अभिप्राय / सूचना','तुमचा अभिप्राय किंवा सूचना'],
    book:['नवीन पुस्तकाची मागणी','पुस्तकाचे नाव व लेखक'],studyroom:['अभ्यासिका नोंदणी','कोणत्या परीक्षेची तयारी / कोणती वेळ हवी'],
    career:['कार्यक्रम / करिअर चौकशी','तुमचा प्रश्न']};
  function sync(){ lab.textContent=T[topic.value][1]; }
  var m=/[?&]topic=(\w+)/.exec(location.search); if(m&&T[m[1]]) topic.value=m[1];
  topic.addEventListener('change',sync); sync();
  if(m&&location.hash!=='#form'){ /* keep scroll */ }
  function text(){
    var g=function(id){ return $(id).value.trim(); };
    return 'विषय : '+T[topic.value][0]+'\n'+'नाव : '+g('#f-name')+'\n'+'गट : '+g('#f-group')+'\n'+'गाव : '+g('#f-village')+'\n'+'संपर्क : '+g('#f-contact')+'\n\n'+T[topic.value][1]+' :\n'+g('#f-msg');
  }
  function valid(){ var ok=$('#f-name').value.trim()&&$('#f-contact').value.trim(); err.hidden=!!ok; return !!ok; }
  f.addEventListener('submit',function(e){ e.preventDefault(); if(!valid()) return;
    var to=D.email||'epragatilibrary@gmail.com';
    location.href='mailto:'+to+'?subject='+encodeURIComponent('वाचनालय संकेतस्थळ : '+T[topic.value][0])+'&body='+encodeURIComponent(text());
  });
  if(D.whatsapp){ wa.hidden=false;
    wa.addEventListener('click',function(e){ if(!valid()){ e.preventDefault(); return; }
      wa.href='https://wa.me/'+String(D.whatsapp).replace(/\D/g,'')+'?text='+encodeURIComponent(text()); }); }
  var of=$('#online-forms'), links=$('#online-forms-links'), F=D.forms||{};
  [['registration','सभासद नोंदणी फॉर्म'],['feedback','अभिप्राय फॉर्म']].forEach(function(p){
    if(!F[p[0]]) return; var a=el('a','btn',p[1]+' ↗'); a.href=F[p[0]]; a.target='_blank'; a.rel='noopener noreferrer';
    links.appendChild(a); links.appendChild(document.createTextNode(' ')); of.hidden=false; });
})();

/* ---------- books page ---------- */
(function(){ var list=$('#book-list'); if(!list) return;
  var qi=$('#book-q'), cat=$('#book-cat'), cnt=$('#book-count'), more=$('#book-more'), empty=$('#book-empty');
  var books=[], shown=0, PAGE=40, res=[];
  function render(reset){
    if(reset){ list.innerHTML=''; shown=0;
      var t=norm(qi.value).trim().split(/\s+/).filter(Boolean), c=cat.value;
      res=books.filter(function(b){ if(c&&b.cat!==c) return false; return t.every(function(w){ return b.k.indexOf(w)>-1; }); });
      cnt.textContent=mr(res.length)+' पुस्तके सापडली'+(res.length!==books.length?' (एकूण '+mr(books.length)+')':''); }
    res.slice(shown,shown+PAGE).forEach(function(b){ var li=el('li'); li.appendChild(el('b',null,b.title));
      var meta=[b.author,b.cat,b.lang].filter(Boolean).join(' • '); if(meta) li.appendChild(el('small',null,meta)); list.appendChild(li); });
    shown=Math.min(res.length,shown+PAGE); more.hidden=shown>=res.length;
  }
  function start(rows){
    var head=rows.shift(); if(!rows.length) throw new Error('empty');
    books=rows.map(function(r){ var o={title:(r[0]||'').trim(),author:(r[1]||'').trim(),cat:(r[2]||'').trim(),lang:(r[3]||'').trim()};
      o.k=norm(o.title+' '+o.author+' '+o.cat+' '+o.lang); return o; }).filter(function(b){return b.title;});
    if(!books.length) throw new Error('empty');
    var cats={}; books.forEach(function(b){ if(b.cat) cats[b.cat]=1; });
    Object.keys(cats).sort().forEach(function(c){ var o=el('option',null,c); o.value=c; cat.appendChild(o); });
    qi.addEventListener('input',function(){ render(true); }); cat.addEventListener('change',function(){ render(true); });
    $('button',more).addEventListener('click',function(){ render(false); });
    render(true);
  }
  fetch('books.csv',{cache:'no-cache'}).then(function(r){ if(!r.ok) throw new Error(r.status); return r.text(); })
    .then(function(t){ start(parseCSV(t)); })
    .catch(function(){ empty.hidden=false; qi.closest('.filterbox').hidden=true; cnt.hidden=true; });
})();

/* ---------- site search page ---------- */
(function(){ var box=$('#s-results'); if(!box) return;
  var PAGES=[['index.html','मुख्यपृष्ठ'],['children.html','बालविश्व'],['students.html','विद्यार्थी'],['digital.html','ई-ग्रंथालय'],
    ['info.html','वेळ व सभासदत्व'],['journey.html','आमची वाटचाल'],['about.html','आमच्याविषयी']];
  var inp=$('#sq'), status=$('#s-status'), idx=null;
  var q0=(new URLSearchParams(location.search).get('q')||''); inp.value=q0;
  function txt(n){ return n?n.textContent.replace(/\s+/g,' ').trim():''; }
  function build(){
    return Promise.all(PAGES.map(function(p){
      return fetch(p[0]).then(function(r){ return r.text(); }).then(function(h){
        var doc=new DOMParser().parseFromString(h,'text/html'), out=[], main=doc.querySelector('main'); if(!main) return out;
        $$('.tile',main).forEach(function(a){ var sec=a.closest('section'); out.push({t:txt(a.querySelector('b')).replace(/\s*↗/,''),d:txt(a.querySelector('small')),u:a.getAttribute('href'),ext:true,w:p[1]+(sec&&sec.querySelector('h2')?' › '+txt(sec.querySelector('h2')):'')}); });
        $$('section',main).forEach(function(sec){ var h2=sec.querySelector('h2'); if(!h2) return;
          var first=sec.querySelector('p'), id=sec.id||h2.id;
          out.push({t:txt(h2),d:first?txt(first):'',u:p[0]+(sec.id?'#'+sec.id:''),w:p[1]});
          $$('.card',sec).forEach(function(c){ var h3=c.querySelector('h3'); out.push({t:h3?txt(h3):txt(c).slice(0,60),d:txt(c.querySelector('p')||c),u:p[0]+(sec.id?'#'+sec.id:''),w:p[1]+' › '+txt(h2)}); }); });
        $$('tr',main).forEach(function(tr){ var s=tr.closest('section'); if(tr.querySelector('th')) return; out.push({t:txt(tr),d:'',u:p[0]+(s&&s.id?'#'+s.id:''),w:p[1]}); });
        return out;
      }).catch(function(){ return []; });
    })).then(function(a){ idx=[].concat.apply([],a).map(function(e){ e.k=norm(e.t+' '+e.d+' '+e.w); return e; }); });
  }
  function show(q){
    box.innerHTML=''; var t=norm(q).trim().split(/\s+/).filter(Boolean);
    if(!t.length){ status.textContent='वर शोधशब्द लिहा.'; return; }
    var seen={}, r=idx.filter(function(e){ if(!t.every(function(w){return e.k.indexOf(w)>-1;})) return false;
      var key=e.u+'|'+e.t; if(seen[key]) return false; seen[key]=1; return true; });
    r.sort(function(a,b){ var A=t.every(function(w){return norm(a.t).indexOf(w)>-1;})?0:1,B=t.every(function(w){return norm(b.t).indexOf(w)>-1;})?0:1; return A-B; });
    status.textContent=r.length?mr(r.length)+' निकाल सापडले':'काहीही सापडले नाही. दुसरा शब्द वापरून पाहा.';
    r.slice(0,60).forEach(function(e){ var li=el('li'), a=el('a'); a.href=e.u; if(e.ext){ a.target='_blank'; a.rel='noopener noreferrer'; }
      a.appendChild(el('b',null,e.t+(e.ext?' ↗':''))); if(e.d) a.appendChild(el('span','d',e.d.length>110?e.d.slice(0,110)+'…':e.d)); a.appendChild(el('small',null,e.w));
      li.appendChild(a); box.appendChild(li); });
  }
  status.textContent='शोधत आहे…';
  build().then(function(){ if(!idx.length){ status.textContent='शोध सुविधा वाचनालयाच्या संकेतस्थळावरूनच (इंटरनेटवर) चालते.'; return; } show(q0); inp.focus(); });
  $('form',inp.closest('main')).addEventListener('submit',function(e){ if(!idx) return; e.preventDefault(); history.replaceState(null,'','?q='+encodeURIComponent(inp.value)); show(inp.value); });
})();
})();
