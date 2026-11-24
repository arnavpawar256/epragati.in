
// Photo pop-up viewer: any link with class "zoom" opens its image in a dialog
(function(){
  var dlg = document.createElement('dialog');
  dlg.innerHTML = '<button type="button">बंद करा ×</button><img alt=""><p style="margin:8px 0 0;text-align:center"></p>';
  document.body.appendChild(dlg);
  var img = dlg.querySelector('img'), cap = dlg.querySelector('p');
  dlg.querySelector('button').onclick = function(){ dlg.close(); };
  dlg.addEventListener('click', function(e){ if(e.target === dlg) dlg.close(); });
  document.addEventListener('click', function(e){
    var a = e.target.closest('a.zoom');
    if(!a) return;
    e.preventDefault();
    var im = a.querySelector('img');
    img.src = a.getAttribute('href');
    img.alt = im ? im.alt : '';
    cap.textContent = im ? im.alt : '';
    dlg.showModal();
  });
})();

// Optional English translation (needs internet)
function googleTranslateElementInit(){
  new google.translate.TranslateElement({pageLanguage:'mr',includedLanguages:'en,mr',autoDisplay:false},'google_translate_element');
}
(function(){
  var sel = document.getElementById('site-language');
  if(!sel) return;
  sel.addEventListener('change', function(){
    if(!window.__gt){
      window.__gt = true;
      var s = document.createElement('script');
      s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.head.appendChild(s);
    }
    var tries = 0, t = setInterval(function(){
      var c = document.querySelector('.goog-te-combo');
      if(c){ c.value = sel.value; c.dispatchEvent(new Event('change')); clearInterval(t); }
      if(++tries > 40) clearInterval(t);
    }, 250);
  });
})();
