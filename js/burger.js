(function(){
  var burger = document.getElementById('nav-burger');
  var mobMenu = document.getElementById('mob-menu');
  if(!burger || !mobMenu) return;

  function toggleMenu(){
    var isOpen = mobMenu.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  burger.addEventListener('click', function(e){
    e.stopPropagation();
    toggleMenu();
  });

  // Fermer en cliquant en dehors
  document.addEventListener('click', function(e){
    if(mobMenu.classList.contains('open') && !mobMenu.contains(e.target) && e.target !== burger){
      mobMenu.classList.remove('open');
      burger.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Fermer en cliquant un lien
  mobMenu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      mobMenu.classList.remove('open');
      burger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Connecter les boutons du menu mobile aux actions existantes
  var mobLogin = document.getElementById('mob-btn-login');
  if(mobLogin){
    mobLogin.addEventListener('click', function(){
      mobMenu.classList.remove('open');
      burger.classList.remove('open');
      document.body.style.overflow = '';
      var btnLogin = document.getElementById('btn-open-login');
      if(btnLogin) btnLogin.click();
    });
  }

  // Synchroniser l'état connecté/déconnecté dans le menu mobile
  var mobOut = document.getElementById('mob-nav-logged-out');
  function syncMobMenu(){
    var loggedIn = document.getElementById('nav-logged-in');
    if(loggedIn && mobOut){
      var isIn = loggedIn.style.display !== 'none' && loggedIn.style.display !== '';
      mobOut.style.display = isIn ? 'none' : 'flex';
    }
  }
  // Observer les changements sur nav-logged-in
  var target = document.getElementById('nav-logged-in');
  if(target && window.MutationObserver){
    new MutationObserver(syncMobMenu).observe(target, {attributes:true, attributeFilter:['style']});
  }
  syncMobMenu();

  // Relier boutons nav mobile aux mêmes handlers que les boutons desktop
  ['mob-nav-formations','mob-nav-ressources','mob-nav-apropos'].forEach(function(id){
    var el = document.getElementById(id);
    if(!el) return;
    var suffix = id.replace('mob-nav-','');
    var desktop = document.getElementById('nav-'+suffix+'-btn');
    if(desktop){
      el.addEventListener('click', function(){
        mobMenu.classList.remove('open');
        burger.classList.remove('open');
        document.body.style.overflow = '';
        desktop.click();
      });
    }
  });
})();
