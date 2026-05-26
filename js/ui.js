(function() {
  var pages = {
    'pf':  document.getElementById('pf'),
    'pfd': document.getElementById('pfd'),
    'pr':  document.getElementById('pr'),
    'pa':  document.getElementById('pa'),
    'pd':  document.getElementById('pd')
  };

  function hideAll() {
    Object.values(pages).forEach(function(p) {
      if (!p) return;
      p.classList.remove('open');
      p.style.display = 'none';
    });
    document.body.style.overflow = '';
    document.body.style.height = '';
  }

  function showPage(id, navId) {
    hideAll();
    var p = pages[id];
    if (!p) return;
    p.style.display = id === 'pd' ? 'flex' : 'block';
    void p.offsetHeight;
    p.classList.add('open');
    p.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    setNav(navId);
    if (id === 'pd') {
      setTimeout(async function() {
        // Recharge les vraies stats depuis Supabase si connecté
        if (window._sb && window._iaConnected) {
          var session = (await window._sb.auth.getSession()).data.session;
          if (session) {
            // Formations inscrites
            var r1 = await window._sb.from('enrollments')
              .select('*, courses(title, slug)', { count: 'exact' })
              .eq('user_id', session.user.id);

            // Certifs obtenus
            var r2 = await window._sb.from('certificates')
              .select('*, courses(title)', { count: 'exact' })
              .eq('user_id', session.user.id);

            // Progression depuis la vue
            var r3 = await window._sb.from('course_progress')
              .select('*')
              .eq('user_id', session.user.id);

            var avg = 0;
            if (r3.data && r3.data.length > 0) {
              avg = Math.round(r3.data.reduce(function(s,r){ return s+(r.progress_pct||0); }, 0) / r3.data.length);
            }

            if (window._iaUserData) {
              window._iaUserData.formations  = r1.data ? r1.data.length : 0;
              window._iaUserData.certifs     = r2.data ? r2.data.length : 0;
              window._iaUserData.progression = avg;
            }

            // Met à jour la section progression avec les vraies formations
            var progContent = document.getElementById('pd-progression-content');
            if (progContent && r1.data && r1.data.length > 0) {
              progContent.innerHTML = '<div class="pd-prog-detail">' +
                r1.data.map(function(enr) {
                  var prog = r3.data ? r3.data.find(function(p){ return p.course_id === enr.course_id; }) : null;
                  var pct  = prog ? (prog.progress_pct || 0) : 0;
                  var title = (enr.courses && enr.courses.title) || 'Formation';
                  var status = pct === 100 ? 'termine' : 'en-cours';
                  return '<div class="pd-prog-course-card">' +
                    '<div class="pd-prog-course-top">' +
                      '<div class="pd-prog-course-ico" style="background:var(--bg2)">📚</div>' +
                      '<div><div class="pd-prog-course-name">' + title + '</div>' +
                      '<div class="pd-prog-course-sub">' + pct + '% complété</div></div>' +
                    '</div>' +
                    '<div class="pd-prog-bar-row">' +
                      '<div class="pd-prog-bar-track"><div class="pd-prog-bar-fill" style="width:'+pct+'%"></div></div>' +
                      '<div class="pd-prog-bar-pct">'+pct+'%</div>' +
                    '</div>' +
                    '<span class="pd-prog-badge '+status+'">'+(status==='termine'?'✓ Terminé':'▶ En cours')+'</span>' +
                  '</div>';
                }).join('') +
              '</div>';
            }

            // Met à jour la section certifs avec les vraies données
            var certContent = document.getElementById('pd-certifs-content');
            if (certContent && r2.data && r2.data.length > 0) {
              certContent.innerHTML = '<div class="pd-certifs-grid">' +
                r2.data.map(function(cert) {
                  var title = (cert.courses && cert.courses.title) || 'Formation';
                  var date  = cert.issued_at ? new Date(cert.issued_at).toLocaleDateString('fr-FR', {day:'numeric',month:'long',year:'numeric'}) : '';
                  return '<div class="pd-certif-card">' +
                    '<div class="pd-certif-ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></div>' +
                    '<div class="pd-certif-name">'+title+'</div>' +
                    '<div class="pd-certif-date">Obtenu le '+date+'</div>' +
                    '<button class="pd-certif-dl"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Télécharger</button>' +
                  '</div>';
                }).join('') +
              '</div>';
            }
          }
        }

        // Anime les éléments visuels
        var prog = (window._iaUserData && window._iaUserData.progression) || 0;
        var ring = document.getElementById('pd-ring');
        var circumference = 2 * Math.PI * 34;
        if (ring) {
          ring.style.strokeDasharray = circumference;
          ring.style.strokeDashoffset = (circumference - circumference * (prog / 100)).toFixed(1);
        }
        var bar = document.getElementById('pd-bar');
        if (bar) bar.style.width = prog + '%';
        var ringVal = document.getElementById('pd-ring-val');
        if (ringVal) ringVal.textContent = prog + '%';
        var objPct = document.getElementById('pd-obj-pct');
        if (objPct) objPct.textContent = prog + '%';
        if (window._syncProfilStats) window._syncProfilStats();
      }, 120);
    }
  }

  function setNav(activeId) {
    document.querySelectorAll('.nav-ul a').forEach(function(a) {
      a.classList.remove('active');
    });
    var el = document.getElementById(activeId);
    if (el) el.classList.add('active');
  }

  function goHome() {
    hideAll();
    setNav('nav-accueil');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // -- NAV LINKS
  var acc = document.getElementById('nav-accueil');
  if (acc) acc.addEventListener('click', function(e) { e.preventDefault(); goHome(); });

  var logo = document.getElementById('nav-logo');
  if (logo) logo.addEventListener('click', function(e) { e.preventDefault(); goHome(); });

  var btnF = document.getElementById('nav-formations-btn');
  if (btnF) btnF.addEventListener('click', function(e) { e.preventDefault(); showPage('pf', 'nav-formations-btn'); animateBars(); });

  var btnR = document.getElementById('nav-ressources-btn');
  if (btnR) btnR.addEventListener('click', function(e) { e.preventDefault(); showPage('pr', 'nav-ressources-btn'); });

  var btnA = document.getElementById('nav-apropos-btn');
  if (btnA) btnA.addEventListener('click', function(e) { e.preventDefault(); showPage('pa', 'nav-apropos-btn'); });

  // -- BACK / CLOSE BUTTONS inside pages
  var ids = [
    'pf-back', 'pf-cta-btn',
    'pr-cta-close', 'pr-back',
    'pa-join-btn', 'pd-back'
  ];
  ids.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', function(e) { e.preventDefault(); goHome(); });
  });

  // -- CROSS-PAGE LINKS
  var prToF = document.getElementById('pr-to-formations');
  if (prToF) prToF.addEventListener('click', function(e) { e.preventDefault(); showPage('pf', 'nav-formations-btn'); animateBars(); });

  var paToF = document.getElementById('pa-to-formations');
  if (paToF) paToF.addEventListener('click', function(e) { e.preventDefault(); showPage('pf', 'nav-formations-btn'); animateBars(); });

  // -- ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var mo = document.getElementById('modal-auth');
      if (mo && mo.classList.contains('open')) return; // let modal handle it
      goHome();
    }
  });

  // -- FORMATIONS progress bars
  function animateBars() {
    setTimeout(function() {
      document.querySelectorAll('#pf .cr-progress-fill').forEach(function(b) {
        b.style.width = b.dataset.width || '0%';
      });
    }, 200);
  }


  // -- RESSOURCES tag toggle
  document.querySelectorAll('#pr .pr-tag').forEach(function(tag) {
    tag.addEventListener('click', function() {
      document.querySelectorAll('#pr .pr-tag').forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  // -- RESSOURCES save toggle
  document.querySelectorAll('#pr .pr-row-save').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      this.classList.toggle('saved');
    });
  });

  var overlay   = document.getElementById('modal-auth');
  var formLogin = document.getElementById('form-login');
  var formReg   = document.getElementById('form-register');
  var mrLogin   = document.getElementById('mr-login');
  var mrReg     = document.getElementById('mr-register');

  function openModal(mode) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    showAuthForm(mode || 'login');
  }
  function clearAuthForms() {
    ['login-email','login-pwd','reg-prenom','reg-nom','reg-email','reg-pwd','reg-pwd2'].forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.value = '';
    });
    setError('login-error','');
    setError('reg-error','');
    setError('otp-error','');
    document.querySelectorAll('.otp-digit').forEach(function(i){ i.value=''; i.classList.remove('filled'); });
    var cgu = document.querySelector('#form-register input[type="checkbox"]');
    if(cgu) cgu.checked = false;
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    clearAuthForms();
  }
  function showAuthForm(mode) {
    // Toujours cacher form-otp d'abord
    var fOtp = document.getElementById('form-otp');
    if(fOtp) fOtp.style.display = 'none';

    if (mode === 'register') {
      formLogin.style.display = 'none';
      formReg.style.display   = 'block';
      mrLogin.style.display   = 'none';
      mrReg.style.display     = 'block';
    } else {
      formLogin.style.display = 'block';
      formReg.style.display   = 'none';
      mrLogin.style.display   = 'block';
      mrReg.style.display     = 'none';
    }
  }

  var btnOpenLogin = document.getElementById('btn-open-login');
  if (btnOpenLogin) btnOpenLogin.addEventListener('click', function() { openModal('login'); });

  var btnModalClose = document.getElementById('modal-close-btn');
  if (btnModalClose) btnModalClose.addEventListener('click', closeModal);

  if (overlay) overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });

  var goReg   = document.getElementById('go-register');
  var goLogin2 = document.getElementById('go-login');
  if (goReg)    goReg.addEventListener('click',    function() { showAuthForm('register'); });
  if (goLogin2) goLogin2.addEventListener('click', function() { showAuthForm('login'); });

  // Password toggles
  function togglePwd(inputId, btnId) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', function() {
      var inp = document.getElementById(inputId);
      if (!inp) return;
      inp.type = (inp.type === 'password') ? 'text' : 'password';
    });
  }
  togglePwd('login-pwd',  'toggle-login-pwd');
  togglePwd('reg-pwd',    'toggle-reg-pwd');
  togglePwd('reg-pwd2',   'toggle-reg-pwd2');

  var btnProfil   = document.getElementById('btn-profil');
  var profilDD    = document.getElementById('profil-dropdown');
  var hoverCard   = document.getElementById('profil-hover-card');

  if (btnProfil && profilDD) {
    btnProfil.addEventListener('click', function(e) {
      e.stopPropagation();
      profilDD.classList.toggle('open');
      // hide hover card when dropdown is open
      if (hoverCard) hoverCard.classList.toggle('hidden', profilDD.classList.contains('open'));
    });
    document.addEventListener('click', function(e) {
      if (!profilDD.contains(e.target) && e.target !== btnProfil) {
        profilDD.classList.remove('open');
      }
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') profilDD.classList.remove('open');
    });
    // Dropdown links → navigate to pages
    var ddF = document.getElementById('dd-formations');
    if (ddF) ddF.addEventListener('click', function(e) {
      e.preventDefault();
      profilDD.classList.remove('open');
      showPage('pf', 'nav-formations-btn');
      animateBars();
    });
    var ddR = document.getElementById('dd-ressources');
    if (ddR) ddR.addEventListener('click', function(e) {
      e.preventDefault();
      profilDD.classList.remove('open');
      showPage('pr', 'nav-ressources-btn');
    });
    // helper: open dashboard, activate sidebar item, scroll to section
    function openDashboard(sidebarId, sectionId) {
      profilDD.classList.remove('open');
      if (hoverCard) hoverCard.classList.remove('hidden');
      showPage('pd', 'nav-accueil');
      setTimeout(function() {
        // activate sidebar item
        document.querySelectorAll('.pd-nav-item').forEach(function(el) {
          el.classList.remove('active');
        });
        var sideEl = sidebarId ? document.getElementById(sidebarId) : null;
        if (sideEl) sideEl.classList.add('active');
        // scroll to section
        if (sectionId) {
          var target = document.getElementById(sectionId);
          var main   = document.querySelector('.pd-main');
          if (target && main) {
            main.scrollTo({ top: target.offsetTop - 16, behavior: 'smooth' });
          }
        } else {
          var main = document.querySelector('.pd-main');
          if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 180);
    }

    var ddD = document.getElementById('dd-dashboard');
    if (ddD) ddD.addEventListener('click', function(e) {
      e.preventDefault();
      openDashboard('pds-dashboard', null);
    });

    var ddProg = document.getElementById('dd-progression');
    if (ddProg) ddProg.addEventListener('click', function(e) {
      e.preventDefault();
      openDashboard('pds-progression', 'pd-section-progression');
    });

    var ddCert = document.getElementById('dd-certifs');
    if (ddCert) ddCert.addEventListener('click', function(e) {
      e.preventDefault();
      openDashboard('pds-certifs', 'pd-section-certifs');
    });

    var userData = window._iaUserData = {
      formations:  0,
      certifs:     0,
      progression: 0,
      plan:        null  // 'starter' | 'pro' | 'expert' | null
    };

    function syncProfilStats() {
      window._syncProfilStats = syncProfilStats;
      // Mini stats dans le header dropdown
      var elF   = document.getElementById('dd-stat-formations');
      var elC   = document.getElementById('dd-stat-certifs');
      var elP   = document.getElementById('dd-stat-prog');
      var elBar = document.getElementById('dd-prog-fill');
      // Badges sur les items
      var bdgF  = document.querySelector('#dd-formations .profil-dd-badge');
      var bdgC  = document.querySelector('#dd-certifs .profil-dd-badge');

      if (elF)  elF.textContent  = userData.formations;
      if (elC)  elC.textContent  = userData.certifs;
      if (elP)  elP.textContent  = userData.progression + '%';
      if (bdgF) bdgF.textContent = userData.formations;
      if (bdgC) bdgC.textContent = userData.certifs;

      // Barre de progression animée dropdown
      setTimeout(function() {
        if (elBar) elBar.style.width = userData.progression + '%';
      }, 80);

      // Sync stats cards du dashboard
      var cards = document.querySelectorAll('.pd-stat-val');
      if (cards[0]) cards[0].textContent = userData.formations;
      if (cards[1]) cards[1].textContent = userData.certifs;

      var donutRing = document.getElementById('pf-donut-ring');
      var donutPct  = document.getElementById('pf-donut-pct');
      var progH4    = document.getElementById('pf-prog-h4');
      var progP     = document.getElementById('pf-prog-p');
      var progBtn   = document.getElementById('pf-prog-btn');
      var resumeCard = document.getElementById('pf-resume-card');

      if (donutRing) {
        var offset = 175.9 - (175.9 * userData.progression / 100);
        setTimeout(function() {
          donutRing.style.strokeDashoffset = offset.toFixed(1);
        }, 200);
      }
      if (donutPct) donutPct.textContent = userData.progression + '%';

      var progContent = document.getElementById('pd-progression-content');
      if (progContent) {
        if (userData.formations === 0) {
          progContent.innerHTML =
            '<div class="pd-empty">' +
            '<div class="pd-empty-ico-wrap"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg></div>' +
            '<div class="pd-empty-t">Aucune formation en cours</div>' +
            '<div class="pd-empty-s">D\u00e9marrez votre premi\u00e8re formation pour voir votre progression ici.</div>' +
            '<button class="pd-empty-cta" onclick="window.showPage && showPage(\'pf\')">Explorer les formations</button>' +
            '</div>';
        } else {
          var courses = [
            { name:'IA G\u00e9n\u00e9rative & LLMs', sub:'Module 2 · Le\u00e7on 5 / 12', pct:42, ico:'🤖', status:'en-cours' },
            { name:'Automatisation avec n8n', sub:'Module 3 · Le\u00e7on 2 / 8',  pct:65, ico:'⚡', status:'en-cours' },
            { name:'Les fondamentaux de l\'IA', sub:'Termin\u00e9', pct:100, ico:'🧠', status:'termine' }
          ];
          progContent.innerHTML = '<div class="pd-prog-detail">' +
            courses.map(function(c) {
              return '<div class="pd-prog-course-card">' +
                '<div class="pd-prog-course-top">' +
                  '<div class="pd-prog-course-ico" style="background:var(--bg2)">' + c.ico + '</div>' +
                  '<div><div class="pd-prog-course-name">' + c.name + '</div>' +
                  '<div class="pd-prog-course-sub">' + c.sub + '</div></div>' +
                '</div>' +
                '<div class="pd-prog-bar-row">' +
                  '<div class="pd-prog-bar-track"><div class="pd-prog-bar-fill" style="width:' + c.pct + '%"></div></div>' +
                  '<div class="pd-prog-bar-pct">' + c.pct + '%</div>' +
                '</div>' +
                '<span class="pd-prog-badge ' + c.status + '">' + (c.status === 'termine' ? '✓ Termin\u00e9' : '▶ En cours') + '</span>' +
              '</div>';
            }).join('') +
          '</div>';
        }
      }

      var certContent = document.getElementById('pd-certifs-content');
      if (certContent) {
        if (userData.certifs === 0) {
          certContent.innerHTML =
            '<div class="pd-empty">' +
            '<div class="pd-empty-ico-wrap"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></div>' +
            '<div class="pd-empty-t">Aucun certificat obtenu</div>' +
            '<div class="pd-empty-s">Terminez votre premi\u00e8re formation pour d\u00e9crocher votre certificat et valoriser vos comp\u00e9tences.</div>' +
            '<button class="pd-empty-cta" onclick="window.showPage && showPage(\'pf\')">Voir les formations</button>' +
            '</div>';
        } else {
          var certs = [
            { name:'Automatisation No-Code', date:'Obtenu le 12 avril 2025' },
            { name:'Les fondamentaux de l\'IA', date:'Obtenu le 3 mars 2025' }
          ];
          certContent.innerHTML = '<div class="pd-certifs-grid">' +
            certs.map(function(c) {
              return '<div class="pd-certif-card">' +
                '<div class="pd-certif-ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></div>' +
                '<div class="pd-certif-name">' + c.name + '</div>' +
                '<div class="pd-certif-date">' + c.date + '</div>' +
                '<button class="pd-certif-dl"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>T\u00e9l\u00e9charger</button>' +
              '</div>';
            }).join('') +
            // Carte verrouillée
            '<div class="pd-certif-card" style="opacity:.45;cursor:default">' +
              '<div class="pd-certif-ico" style="background:var(--bg3);box-shadow:none"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>' +
              '<div class="pd-certif-name" style="color:var(--text-3)">IA G\u00e9n\u00e9rative & LLMs</div>' +
              '<div class="pd-certif-date">En cours · 42% compl\u00e9t\u00e9</div>' +
              '<button class="pd-certif-dl" style="opacity:.5;pointer-events:none">Non disponible</button>' +
            '</div>' +
          '</div>';
        }
      }
      var ringVal    = document.getElementById('pd-ring-val');
      var objPct     = document.getElementById('pd-obj-pct');
      var greeting   = document.getElementById('pd-prog-greeting');
      var progMsg    = document.getElementById('pd-prog-msg');

      if (ringVal) ringVal.textContent = userData.progression + '%';
      if (objPct)  objPct.textContent  = userData.progression + '%';

      // État zéro vs actif
      if (userData.formations === 0) {
        if (progH4)    progH4.textContent  = 'Commencez votre parcours !';
        if (progP)     progP.textContent   = 'Inscrivez-vous \u00e0 votre premi\u00e8re formation et commencez \u00e0 progresser.';
        if (progBtn)   progBtn.textContent = 'D\u00e9couvrir les formations';
        if (resumeCard) resumeCard.style.display = 'none';
        if (greeting)  greeting.textContent = 'Bienvenue sur IA Academy !';
        if (progMsg)   progMsg.textContent  = 'Inscrivez-vous \u00e0 votre premi\u00e8re formation.';
      } else {
        if (progH4)    progH4.textContent  = 'Tr\u00e8s bien !';
        if (progP)     progP.textContent   = 'Continuez sur cette lanc\u00e9e et atteignez vos objectifs.';
        if (progBtn)   progBtn.textContent = 'Continuer ma formation';
        if (resumeCard) resumeCard.style.display = '';
        if (greeting)  greeting.textContent = 'Tr\u00e8s bien !';
        if (progMsg)   progMsg.textContent  = 'Vous avez compl\u00e9t\u00e9 ' + userData.formations + ' formation' + (userData.formations > 1 ? 's' : '') + '.';
      }
    }

    // Sync à l'ouverture du dropdown
    btnProfil.addEventListener('click', function() {
      syncProfilStats();
    });

    // Sync immédiat au chargement
    syncProfilStats();
  }

})();


(function() {
  var toast     = document.getElementById('ia-toast');
  var toastT    = document.getElementById('toast-title');
  var toastS    = document.getElementById('toast-sub');
  var toastX    = document.getElementById('toast-close');
  var toastTimer;

  window.showToast = function(title, sub, duration) {
    clearTimeout(toastTimer);
    toastT.textContent = title;
    toastS.textContent = sub || '';
    toast.classList.remove('hide');
    toast.classList.add('show');
    toastTimer = setTimeout(function() { hideToast(); }, duration || 4000);
  };

  function hideToast() {
    toast.classList.add('hide');
    setTimeout(function() {
      toast.classList.remove('show', 'hide');
    }, 380);
  }

  if (toastX) toastX.addEventListener('click', function() {
    clearTimeout(toastTimer);
    hideToast();
  });
})();

(function() {
  // Ancien handler simulé remplacé par Supabase Auth
})();

/* ── AUTH STATE : connecté / déconnecté ── */
(function() {
  var loggedOut = document.getElementById('nav-logged-out');
  var loggedIn  = document.getElementById('nav-logged-in');

  function setAuthState(connected) {
    window._iaConnected = connected;
    if (loggedOut) loggedOut.style.display = connected ? 'none'  : 'flex';
    if (loggedIn)  loggedIn.style.display  = connected ? 'flex'  : 'none';
    if (connected && window._selectedPlan && window._iaUserData) {
      window._iaUserData.plan = window._selectedPlan;
    }
    setTimeout(function() {
      if (window.syncPlanButtons) window.syncPlanButtons();
    }, 60);
  }

  // État initial : déconnecté
  setAuthState(false);

  // NE PAS mettre de listener btn-modal ici — géré par Supabase Auth

  // Expose globalement
  window.setAuthState = setAuthState;
})();

(function() {

  /* ── DONNÉES DE COURS ── */
  var COURSES = window.COURSES = {}; // Chargé depuis Supabase

  /* ── CONTENU DES LEÇONS ── */
  var LESSON_CONTENT = {
    text: function(lesson) {
      return LESSON_CONTENT.text_header(lesson) +
      '<div class="pcr-content">' +
        '<h2>Résumé de la leçon</h2>' +
        '<p>Cette leçon explore en profondeur <strong>' + lesson.name + '</strong>. Vous découvrirez les concepts fondamentaux, les cas d\'usage réels et les meilleures pratiques adoptées par les équipes d\'ingénierie IA en 2025.</p>' +
        '<div class="pcr-callout"><strong>Point clé :</strong> Les modèles de langage de grande taille (LLMs) sont des systèmes entraînés sur des milliards de tokens de texte. Leur capacité à générer du contenu cohérent repose sur l\'architecture Transformer et le mécanisme d\'attention.</div>' +
        '<h2>Ce que vous allez apprendre</h2>' +
        '<p>Au terme de cette leçon, vous serez capable de comprendre les rouages internes d\'un LLM, d\'évaluer ses forces et ses limites, et d\'identifier les cas d\'usage où il excelle par rapport à des approches classiques de ML.</p>' +
        '<div class="pcr-img-block"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> Illustration du concept</div>' +
        '<h2>Notes &amp; ressources</h2>' +
        '<p>Retrouvez ci-dessous les ressources complémentaires pour approfondir cette leçon : articles de recherche, notebooks Colab et exemples de code prêts à l\'emploi.</p>' +
        '<div class="pcr-tags-row">' +
          '<span class="pcr-tag-pill">Transformer</span>' +
          '<span class="pcr-tag-pill">Attention</span>' +
          '<span class="pcr-tag-pill">GPT</span>' +
          '<span class="pcr-tag-pill">Embeddings</span>' +
          '<span class="pcr-tag-pill">Fine-tuning</span>' +
        '</div>' +
      '</div>';
    },
    text: function(lesson) {
      return '<div class="pcr-text-hero">' +
        '<div class="pcr-text-hero-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>' +
        '<div class="pcr-text-hero-body">' +
          '<div class="pcr-text-hero-tag"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>Lecture</div>' +
          '<div class="pcr-text-hero-title">' + lesson.name + '</div>' +
          '<div class="pcr-text-hero-meta">' +
            '<span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' + lesson.dur + '</span>' +
            '<span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>Lecture approfondie</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="pcr-content">' +
        '<h2>Introduction</h2>' +
        '<p>Ce module de lecture approfondie couvre <strong>' + lesson.name + '</strong> avec une approche à la fois théorique et pratique. Chaque concept est illustré par des exemples tirés de projets réels déployés en production.</p>' +
        '<div class="pcr-callout"><strong>Pourquoi c\'est important :</strong> Maîtriser ces fondamentaux vous permettra de prendre des décisions éclairées lors de la conception de vos systèmes IA, d\'éviter les pièges classiques et de communiquer efficacement avec les équipes techniques.</div>' +
        '<h2>Concepts clés</h2>' +
        '<p>L\'architecture moderne des LLMs repose sur plusieurs blocs fondamentaux. Le mécanisme d\'<strong>attention multi-têtes</strong> permet au modèle de pondérer l\'importance de chaque token en fonction du contexte global de la séquence.</p>' +
        '<p>Les <strong>embeddings</strong> transforment des tokens discrets en vecteurs continus dans un espace de haute dimension, capturant des relations sémantiques subtiles entre les concepts. Cette représentation dense est ce qui permet au modèle de "comprendre" le sens.</p>' +
        '<div class="pcr-img-block"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> Schéma : Architecture Transformer</div>' +
        '<h2>Application pratique</h2>' +
        '<p>Dans la pratique, ces connaissances vous aident à choisir le bon modèle pour votre cas d\'usage, à optimiser vos prompts, et à comprendre pourquoi certaines requêtes produisent des résultats inattendus.</p>' +
        '<div class="pcr-tags-row">' +
          '<span class="pcr-tag-pill">LLM</span>' +
          '<span class="pcr-tag-pill">NLP</span>' +
          '<span class="pcr-tag-pill">Architecture</span>' +
          '<span class="pcr-tag-pill">Tokens</span>' +
        '</div>' +
      '</div>';
    },
    quiz: function(lesson) {
      return '<div class="pcr-text-hero">' +
        '<div class="pcr-text-hero-ico" style="background:linear-gradient(135deg,var(--green),#00a855)"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>' +
        '<div class="pcr-text-hero-body">' +
          '<div class="pcr-text-hero-tag" style="color:var(--green);background:rgba(0,201,107,.1)"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Quiz</div>' +
          '<div class="pcr-text-hero-title">' + lesson.name + '</div>' +
          '<div class="pcr-text-hero-meta"><span>3 questions · ' + lesson.dur + '</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="pcr-content">' +
        '<p>Testez vos connaissances sur ce que vous venez d\'apprendre. Choisissez la meilleure réponse pour chaque question.</p>' +
        renderQuiz([
          { q:'Quelle architecture est à la base des LLMs modernes ?', opts:['CNN (Convolutional Neural Network)','Transformer','RNN (Recurrent Neural Network)','Autoencoder'], correct:1 },
          { q:'Que représente un "token" dans le contexte des LLMs ?', opts:['Un pixel d\'image','Une unité de texte (mot, sous-mot ou caractère)','Un paramètre du modèle','Un couche de réseau de neurones'], correct:1 },
          { q:'Le "fine-tuning" d\'un LLM consiste à :', opts:['Entraîner le modèle depuis zéro sur de nouvelles données','Ajuster les poids d\'un modèle pré-entraîné sur une tâche spécifique','Réduire la taille du modèle pour l\'optimisation','Augmenter le nombre de paramètres du modèle'], correct:1 }
        ]) +
      '</div>';
    }
  };

  function renderQuiz(questions) {
    return questions.map(function(q, qi) {
      var opts = q.opts.map(function(opt, oi) {
        return '<div class="pcr-quiz-opt" data-qi="' + qi + '" data-oi="' + oi + '" data-correct="' + q.correct + '">' +
          '<div class="pcr-quiz-radio"></div>' + opt +
        '</div>';
      }).join('');
      return '<div class="pcr-quiz" id="quiz-' + qi + '">' +
        '<div class="pcr-quiz-q">Question ' + (qi+1) + ' : ' + q.q + '</div>' +
        opts +
        '<button class="pcr-quiz-btn" data-qi="' + qi + '">Valider</button>' +
        '<div class="pcr-quiz-feedback" id="qfb-' + qi + '"></div>' +
      '</div>';
    }).join('');
  }

  /* ── STATE ── */
  var currentCourseId = 'ia-gen';
  var currentLessonId = 'l5'; // leçon active par défaut (en cours)
  var allLessons = [];

  function buildLessonList(course) {
    allLessons = [];
    course.modules.forEach(function(m) {
      m.lessons.forEach(function(l) {
        allLessons.push({ moduleId: m.id, lesson: l });
      });
    });
  }

  function getLessonIndex(lessonId) {
    for (var i = 0; i < allLessons.length; i++) {
      if (allLessons[i].lesson.id === lessonId) return i;
    }
    return 0;
  }

  function countDone() {
    return allLessons.filter(function(l) { return l.lesson.done; }).length;
  }

  /* ── SIDEBAR RENDER ── */
  function renderSidebar(course) {
    var modulesEl = document.getElementById('pcr-modules');
    if (!modulesEl) return;
    modulesEl.innerHTML = course.modules.map(function(m, mi) {
      var allDone = m.lessons.every(function(l){ return l.done; });
      var hasActive = m.lessons.some(function(l){ return l.id === currentLessonId; });
      var numCls = allDone ? 'done' : (hasActive ? 'active' : '');
      var isOpen = hasActive || mi === 0;
      var lessons = m.lessons.map(function(l) {
        var isActive = l.id === currentLessonId;
        var icoCls = l.locked ? 'locked' : (l.done ? 'done' : (isActive ? 'active' : ''));
        var icoSvg = l.locked
          ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
          : (l.done
            ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
            : (l.type === 'quiz'
                ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
                : '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'));
        var typeLbl = { text:'Texte', quiz:'Quiz' }[l.type] || l.type;
        return '<div class="pcr-lesson' + (isActive ? ' active' : '') + '" data-lid="' + l.id + '" ' + (l.locked ? 'style="opacity:.45;pointer-events:none"' : '') + '>' +
          '<div class="pcr-lesson-ico ' + icoCls + '">' + icoSvg + '</div>' +
          '<div class="pcr-lesson-info">' +
            '<div class="pcr-lesson-name' + (l.locked ? ' locked-t' : '') + '">' + l.name + '</div>' +
            '<div class="pcr-lesson-dur">' + l.dur + '</div>' +
          '</div>' +
          '<span class="pcr-lesson-type ' + l.type + '">' + typeLbl + '</span>' +
        '</div>';
      }).join('');
      return '<div class="pcr-module" data-mid="' + m.id + '">' +
        '<div class="pcr-module-head' + (isOpen ? ' open' : '') + '">' +
          '<div class="pcr-module-num ' + numCls + '">' + (mi+1) + '</div>' +
          '<div class="pcr-module-info">' +
            '<div class="pcr-module-name">' + m.name + '</div>' +
            '<div class="pcr-module-meta">' + m.lessons.length + ' leçons · ' + m.lessons.filter(function(l){return l.done;}).length + ' terminées</div>' +
          '</div>' +
          '<svg class="pcr-module-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>' +
        '</div>' +
        '<div class="pcr-lessons' + (isOpen ? ' open' : '') + '">' + lessons + '</div>' +
      '</div>';
    }).join('');

    // Module accordion
    modulesEl.querySelectorAll('.pcr-module-head').forEach(function(head) {
      head.addEventListener('click', function() {
        var lessonsEl = this.nextElementSibling;
        var open = this.classList.toggle('open');
        lessonsEl.classList.toggle('open', open);
      });
    });

    // Lesson click
    modulesEl.querySelectorAll('.pcr-lesson[data-lid]').forEach(function(el) {
      el.addEventListener('click', function() {
        var lid = this.dataset.lid;
        goToLesson(lid);
      });
    });
  }

  LESSON_CONTENT.text_header = function(lesson) {
    return '<div class="pcr-text-hero">' +
      '<div class="pcr-text-hero-ico" style="background:linear-gradient(135deg,var(--blue),var(--purple))"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>' +
      '<div class="pcr-text-hero-body">' +
        '<div class="pcr-text-hero-tag">Lecture</div>' +
        '<div class="pcr-text-hero-title">' + lesson.name + '</div>' +
        '<div class="pcr-text-hero-meta"><span>' + lesson.dur + '</span></div>' +
      '</div>' +
    '</div>';
  };

  function renderQuizFromAI(lesson, questions) {
    var header = '<div class="pcr-text-hero">' +
      '<div class="pcr-text-hero-ico" style="background:linear-gradient(135deg,var(--green),#00a855)"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>' +
      '<div class="pcr-text-hero-body">' +
        '<div class="pcr-text-hero-tag">Quiz</div>' +
        '<div class="pcr-text-hero-title">' + lesson.name + '</div>' +
        '<div class="pcr-text-hero-meta"><span>' + questions.length + ' questions · ' + lesson.dur + '</span></div>' +
      '</div>' +
    '</div>' +
    '<div class="pcr-content"><p>Testez vos connaissances sur cette leçon.</p>';

    var quizHtml = questions.map(function(q, qi) {
      // Normaliser clés Supabase (question/options/reponse_correcte) ET clés internes (q/opts/correct)
      var qText   = q.question   || q.q   || ('Question ' + (qi+1));
      var qOpts   = q.options    || q.opts || [];
      var qCorrect= (q.reponse_correcte !== undefined) ? q.reponse_correcte : (q.correct !== undefined ? q.correct : 0);

      var opts = qOpts.map(function(opt, oi) {
        return '<div class="pcr-quiz-opt" data-qi="'+qi+'" data-oi="'+oi+'" data-correct="'+qCorrect+'">' +
          '<div class="pcr-quiz-radio"></div>' + opt +
        '</div>';
      }).join('');
      return '<div class="pcr-quiz" id="quiz-'+qi+'">' +
        '<div class="pcr-quiz-q">Question '+(qi+1)+' : '+qText+'</div>' +
        opts +
        '<button class="pcr-quiz-btn" data-qi="'+qi+'">Valider</button>' +
        '<div class="pcr-quiz-feedback" id="qfb-'+qi+'"></div>' +
      '</div>';
    }).join('');

    return header + quizHtml + '</div>';
  }

  function updateNav(lessonId) {
    var idx = getLessonIndex(lessonId);
    var prev = document.getElementById('pcr-prev');
    var next = document.getElementById('pcr-next');
    var counter = document.getElementById('pcr-counter');
    var completeBtn = document.getElementById('pcr-complete');
    var lesson = allLessons[idx] ? allLessons[idx].lesson : null;

    if (prev)    prev.disabled = (idx === 0);
    if (next)    next.disabled = (idx === allLessons.length - 1);
    if (counter) counter.textContent = 'Leçon ' + (idx+1) + ' / ' + allLessons.length;
    if (completeBtn && lesson) {
      if (lesson.done) {
        completeBtn.classList.add('done');
        completeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Terminé';
      } else {
        completeBtn.classList.remove('done');
        completeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Marquer comme terminé';
      }
    }

    // Progress bar
    var done = countDone();
    var pct = Math.round((done / allLessons.length) * 100);
    var fill = document.getElementById('pcr-prog-fill');
    var pctEl = document.getElementById('pcr-prog-pct');
    if (fill) fill.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
  }


  /* ── LESSON RENDER ── */
  async function renderLesson(lessonId) {
    var found = null;
    var foundModule = null;
    var course = COURSES[currentCourseId];

    // ── DEBUG VISUEL ──────────────────────────────────────────────
    var _dbg = document.getElementById('pcr-lesson-content');
    var _log = function(msg, color) {
      if (!_dbg) return;
      var line = document.createElement('div');
      line.style.cssText = 'font-family:monospace;font-size:12px;padding:3px 8px;color:'+(color||'#333');
      line.textContent = '▶ ' + msg;
      _dbg.appendChild(line);
    };
    _dbg.innerHTML = '<div style="padding:16px;background:#fffbeb;border:1px solid #f59e0b;border-radius:8px;margin:16px"><b style="font-size:13px">🔍 Debug Reader</b></div>';
    _log('currentCourseId = ' + currentCourseId);
    _log('lessonId cherché = ' + lessonId);
    _log('COURSES keys = ' + Object.keys(COURSES).join(', '));
    _log('course trouvé = ' + (course ? course.title : 'NULL ❌'), course ? '#166534' : '#dc2626');
    if (course) {
      _log('nb modules = ' + course.modules.length);
      course.modules.forEach(function(m) {
        m.lessons.forEach(function(l) { _log('  leçon id=' + l.id + ' name=' + l.name, '#555'); });
      });
    }
    // ─────────────────────────────────────────────────────────────

    if (!course) {
      _log('ERREUR: course est null/undefined', '#dc2626');
      return;
    }

    for (var i = 0; i < course.modules.length; i++) {
      for (var j = 0; j < course.modules[i].lessons.length; j++) {
        if (course.modules[i].lessons[j].id === lessonId) {
          found = course.modules[i].lessons[j];
          foundModule = course.modules[i];
          break;
        }
      }
      if (found) break;
    }

    _log('found = ' + (found ? found.name : 'NULL ❌'), found ? '#166534' : '#dc2626');
    if (!found) {
      _log('ERREUR: lessonId "'+lessonId+'" introuvable dans les leçons ci-dessus', '#dc2626');
      return;
    }

    // Supabase check
    _log('window._sb = ' + (window._sb ? 'OK ✓' : 'NULL ❌'), window._sb ? '#166534' : '#dc2626');

    var contentEl = document.getElementById('pcr-lesson-content');
    if (!contentEl) return;

    // Scroll to top
    var main = document.getElementById('pcr-main');
    if (main) main.scrollTop = 0;

    // Affiche un loader pendant la génération
    contentEl.innerHTML =
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 24px;gap:16px">' +
      '<div style="width:40px;height:40px;border:3px solid var(--bg3);border-top-color:var(--blue);border-radius:50%;animation:spin 0.8s linear infinite"></div>' +
      '<div style="font-size:.85rem;color:var(--text-3);font-weight:500">Génération du contenu avec l\'IA...</div>' +
      '</div>';

    // Ajoute l'animation spin si pas déjà présente
    if (!document.getElementById('spin-style')) {
      var style = document.createElement('style');
      style.id = 'spin-style';
      style.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(style);
    }

    // Contenu déjà chargé dans l'objet leçon depuis openCourseReader
    var aiContent = null;

    if (found._sbContent && found._sbContent.trim()) {
      aiContent = { content: found._sbContent, isQuiz: false };
    } else if (found._sbQuiz) {
      aiContent = { quiz: found._sbQuiz, isQuiz: true };
    } else if (window._sb && found.sbId) {
      // Fallback : charger depuis Supabase si pas encore dans l'objet
      try {
        var lessonRes = await window._sb.from('lessons')
          .select('content, quiz')
          .eq('id', found.sbId)
          .maybeSingle();
        if (lessonRes.data) {
          if (lessonRes.data.content) {
            found._sbContent = lessonRes.data.content;
            aiContent = { content: lessonRes.data.content, isQuiz: false };
          } else if (lessonRes.data.quiz) {
            found._sbQuiz = lessonRes.data.quiz;
            aiContent = { quiz: lessonRes.data.quiz, isQuiz: true };
          }
        }
      } catch(e) { console.warn('[renderLesson] fetch error:', e); }
    }

    // Afficher le contenu
    // ── RENDU : texte d'abord, quiz en bas si présent ──────────────────
    var header = LESSON_CONTENT.text_header ? LESSON_CONTENT.text_header(found) : '';
    var bodyHtml = '';
    var quizHtml = '';

    // 1. Contenu texte
    if (found._sbContent && found._sbContent.trim()) {
      var body = found._sbContent;
      if (!body.includes('<')) {
        // Markdown → HTML
        body = body
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/\*([^*]+)\*/g, '<em>$1</em>')
          .replace(/^#{3}\s+(.+)$/gm, '<h4>$1</h4>')
          .replace(/^#{1,2}\s+(.+)$/gm, '<h3>$1</h3>')
          .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>');
        // Wrap listes
        body = body.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, '<ul>$1</ul>');
        body = '<p>' + body.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
      }
      bodyHtml = '<div class="pcr-content">' + body + '</div>';
    } else if (!found._sbQuiz) {
      // Fallback statique si rien du tout en base
      var renderer = LESSON_CONTENT[found.content] || LESSON_CONTENT.text;
      contentEl.innerHTML = renderer(found);
      return; // early return pour éviter le reste
    }

    // 2. Quiz (après le texte)
    if (found._sbQuiz && Array.isArray(found._sbQuiz) && found._sbQuiz.length) {
      var quizSection =
        '<div class="pcr-quiz-section">' +
          '<div class="pcr-quiz-section-title">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
            ' Testez vos connaissances' +
          '</div>';
      quizSection += found._sbQuiz.map(function(q, qi) {
        var qText    = q.question   || q.q   || ('Question ' + (qi+1));
        var qOpts    = q.options    || q.opts || [];
        var qCorrect = (q.reponse_correcte !== undefined) ? q.reponse_correcte : (q.correct !== undefined ? q.correct : 0);
        var opts = qOpts.map(function(opt, oi) {
          return '<div class="pcr-quiz-opt" data-qi="'+qi+'" data-oi="'+oi+'" data-correct="'+qCorrect+'">' +
            '<div class="pcr-quiz-radio"></div>' + opt +
          '</div>';
        }).join('');
        return '<div class="pcr-quiz" id="quiz-'+qi+'">' +
          '<div class="pcr-quiz-q">Question '+(qi+1)+' : '+qText+'</div>' +
          opts +
          '<button class="pcr-quiz-btn" data-qi="'+qi+'">Valider</button>' +
          '<div class="pcr-quiz-feedback" id="qfb-'+qi+'"></div>' +
        '</div>';
      }).join('');
      quizSection += '</div>';
      quizHtml = quizSection;
    }

    contentEl.innerHTML = header + bodyHtml + quizHtml;

    // Quiz interactions
    if (found.type === 'quiz' || found.content === 'quiz') {
      contentEl.querySelectorAll('.pcr-quiz-opt').forEach(function(opt) {
        opt.addEventListener('click', function() {
          var qi = this.dataset.qi;
          contentEl.querySelectorAll('.pcr-quiz-opt[data-qi="'+qi+'"]').forEach(function(o) {
            o.classList.remove('selected');
          });
          this.classList.add('selected');
        });
      });
      contentEl.querySelectorAll('.pcr-quiz-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var qi = this.dataset.qi;
          var selected = contentEl.querySelector('.pcr-quiz-opt[data-qi="'+qi+'"].selected');
          var fb = document.getElementById('qfb-' + qi);
          if (!selected) return;
          var isCorrect = parseInt(selected.dataset.oi) === parseInt(selected.dataset.correct);
          contentEl.querySelectorAll('.pcr-quiz-opt[data-qi="'+qi+'"]').forEach(function(o) {
            o.classList.remove('selected');
            if (parseInt(o.dataset.oi) === parseInt(o.dataset.correct)) o.classList.add('correct');
          });
          if (!isCorrect) selected.classList.add('wrong');
          if (fb) {
            fb.style.display = 'block';
            fb.className = 'pcr-quiz-feedback ' + (isCorrect ? 'correct' : 'wrong');
            fb.textContent = isCorrect ? '✓ Bonne réponse !' : '✗ Pas tout à fait. La bonne réponse est en vert.';
          }
          btn.disabled = true;
        });
      });
    }

    updateNav(lessonId);
  }

  async function goToLesson(lessonId) {
    currentLessonId = lessonId;
    renderSidebar(COURSES[currentCourseId]);
    await renderLesson(lessonId);
  }

  /* ── OPEN / CLOSE ── */
  // Mapping slugs Supabase → clés locales COURSES
  // Mapping slug Supabase → clé locale (et clé locale → elle-même)
  var _SLUG_MAP = {
    // slugs Supabase exacts
    'ia-generative-llms':                       'ia-gen',
    'automatisation-n8n':                        'automatisation',
    'fondations-de-l-ia-1779434920365':          'fondations',
    'mathematiques-pour-l-ia-1779436227828':     'maths',
    'introduction-au-machine-learning-177943':   'intro-ml',
    'data-science-python':                       'data',
    // clés locales (identité)
    'ia-gen':'ia-gen', 'automatisation':'automatisation',
    'fondations':'fondations', 'maths':'maths',
    'intro-ml':'intro-ml', 'data':'data'
  };

  // Mapping clé locale → slug Supabase exact
  var _LOCAL_TO_SLUG = {
    'ia-gen':        'ia-generative-llms',
    'automatisation':'automatisation-n8n',
    'fondations':    'fondations-de-l-ia-1779434920365',
    'maths':         'mathematiques-pour-l-ia-1779436227828',
    'intro-ml':      'introduction-au-machine-learning-177943',
    'data':          'data-science-python'
  };

  window.openCourseReader = function(courseId) {
    courseId = courseId || 'ia-gen';
    // Résoudre le slug Supabase vers la clé locale
    var localKey = _SLUG_MAP[courseId] || courseId;
    // Slug Supabase correspondant
    var sbSlug = _LOCAL_TO_SLUG[localKey] || localKey;
    currentCourseId = localKey;
    var course = COURSES[localKey];

    // Charger depuis Supabase si pas encore chargé
    var _sbLoaded = COURSES[localKey] && COURSES[localKey]._sbLoaded;
    if (!_sbLoaded && window._sb) {
      // Placeholder immédiat pendant le chargement
      if (!COURSES[localKey]) {
        COURSES[localKey] = {
          title: 'Chargement...',
          modules: [{ id:'loading', name:'Chargement...', done:false,
            lessons:[{ id:'loading-l1', name:'Chargement du contenu...', type:'text', dur:'...', done:false, content:'text' }]
          }]
        };
      }
      (async function(lk, slug) {
        try {
          var sb = window._sb;

          // 1. Chercher le cours par slug exact
          var courseRes = await sb.from('courses')
            .select('id, title, description')
            .eq('slug', slug)
            .maybeSingle();

          if (!courseRes.data) {
            console.warn('[reader] cours introuvable slug=', slug);
            return;
          }
          var courseRow = courseRes.data;

          // 2. Charger les leçons directement depuis course_id (ta vraie structure)
          var lessonsRes = await sb.from('lessons')
            .select('id, title, type, duration_min, position, is_free, content, quiz, module_id')
            .eq('course_id', courseRow.id)
            .order('position', { ascending: true });

          var rawLessons = lessonsRes.data || [];

          // 3. Grouper par module_id
          var moduleMap = {};
          var moduleOrder = [];
          rawLessons.forEach(function(l) {
            var mid = l.module_id || 'default';
            if (!moduleMap[mid]) {
              moduleMap[mid] = [];
              moduleOrder.push(mid);
            }
            moduleMap[mid].push(l);
          });

          // 4. Charger les titres des modules
          var moduleTitles = {};
          if (moduleOrder[0] !== 'default') {
            var modsRes = await sb.from('modules')
              .select('id, title, position')
              .in('id', moduleOrder)
              .order('position', { ascending: true });
            (modsRes.data || []).forEach(function(m) {
              moduleTitles[m.id] = m.title;
            });
          }

          // 5. Construire la structure COURSES
          var modules = moduleOrder.map(function(mid, mi) {
            var lessons = moduleMap[mid].map(function(l, li) {
              var hasContent = !!(l.content && l.content.trim());
              // Toute leçon = texte + quiz optionnel en bas
              var parsedQuiz = null;
              if (l.quiz) {
                try {
                  parsedQuiz = typeof l.quiz === 'string' ? JSON.parse(l.quiz) : l.quiz;
                  if (!Array.isArray(parsedQuiz) || !parsedQuiz.length) parsedQuiz = null;
                } catch(e) { parsedQuiz = null; }
              }
              return {
                id:         l.id,
                sbId:       l.id,
                name:       l.title || ('Leçon ' + (li+1)),
                type:       'text',
                dur:        l.duration_min ? l.duration_min + ' min' : '10 min',
                done:       false,
                locked:     false,
                content:    'text',
                _sbContent: l.content || null,
                _sbQuiz:    parsedQuiz
              };
            });
            return {
              id:   mid,
              name: moduleTitles[mid] || ('Module ' + (mi+1)),
              done: false,
              lessons: lessons
            };
          });

          if (!modules.length) {
            console.warn('[reader] aucune leçon pour course_id=', courseRow.id);
            return;
          }

          COURSES[lk] = { title: courseRow.title, modules: modules, _sbLoaded: true };
          // Relancer le reader avec les vraies données
          if (window.openCourseReader) window.openCourseReader(lk);

        } catch(e) { console.warn('[openCourseReader] Supabase error:', e); }
      })(localKey, sbSlug);
    }

    // 1. Afficher #pcr IMMÉDIATEMENT avant tout le reste
    var el = document.getElementById('pcr');
    if (el) {
      el.style.display = 'flex';
      void el.offsetHeight;
      el.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    var titleEl = document.getElementById('pcr-course-title');
    if (titleEl) titleEl.textContent = course.title;

    // 2. Construire la liste des leçons
    buildLessonList(course);
    var target = allLessons.find(function(l){ return !l.lesson.done && !l.lesson.locked; });
    if (!target) target = allLessons[0];
    currentLessonId = target ? target.lesson.id : (allLessons[0] ? allLessons[0].lesson.id : null);

    if (!currentLessonId) { console.error('[openCourseReader] Aucune leçon trouvée'); return; }

    // 3. Rendu sidebar + contenu
    renderSidebar(course);
    renderLesson(currentLessonId);
  };

  window.closeCourseReader = function() {
    var el = document.getElementById('pcr');
    if (el) {
      el.classList.remove('open');
      el.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  /* ── EVENTS ── */
  var backBtn = document.getElementById('pcr-back');
  if (backBtn) backBtn.addEventListener('click', window.closeCourseReader);

  var prevBtn = document.getElementById('pcr-prev');
  if (prevBtn) prevBtn.addEventListener('click', function() {
    var idx = getLessonIndex(currentLessonId);
    if (idx > 0) goToLesson(allLessons[idx-1].lesson.id);
  });

  var nextBtn = document.getElementById('pcr-next');
  if (nextBtn) nextBtn.addEventListener('click', function() {
    var idx = getLessonIndex(currentLessonId);
    if (idx < allLessons.length-1) goToLesson(allLessons[idx+1].lesson.id);
  });

  var completeBtn = document.getElementById('pcr-complete');
  if (completeBtn) completeBtn.addEventListener('click', async function() {
    var idx = getLessonIndex(currentLessonId);
    if (allLessons[idx]) {
      allLessons[idx].lesson.done = true;
      updateNav(currentLessonId);
      renderSidebar(COURSES[currentCourseId]);
      if (window.showToast) showToast('Leçon terminée !', 'Bravo, continuez sur cette lancée.');

      // ── Sauvegarde progression dans Supabase ──
      if (window._sb) {
        var session = (await window._sb.auth.getSession()).data.session;
        if (session) {
          var lesson   = allLessons[idx].lesson;
          var slugMap  = { 'ia-gen':'ia-generative-llms', 'automatisation':'automatisation-n8n', 'fondamentaux':'fondamentaux-ia', 'data':'data-science-python' };
          var slug     = slugMap[currentCourseId] || currentCourseId;

          // Récupère les IDs depuis Supabase
          var { data: course } = await window._sb.from('courses').select('id').eq('slug', slug).single();
          if (course) {
            // Cherche la leçon par titre
            var { data: lessonRow } = await window._sb
              .from('lessons')
              .select('id, module_id')
              .eq('title', lesson.name)
              .single();

            if (lessonRow) {
              // Upsert progress
              await window._sb.from('progress').upsert({
                user_id:      session.user.id,
                lesson_id:    lessonRow.id,
                course_id:    course.id,
                completed:    true,
                completed_at: new Date().toISOString()
              }, { onConflict: 'user_id,lesson_id' });

              // Vérifie si toutes les leçons sont terminées → certificat
              var totalDone = countDone();
              if (totalDone === allLessons.length) {
                await window._sb.from('certificates').upsert({
                  user_id:   session.user.id,
                  course_id: course.id,
                  issued_at: new Date().toISOString()
                }, { onConflict: 'user_id,course_id' });
                if (window.showToast) showToast('Félicitations ! 🏆', 'Vous avez obtenu votre certificat !');
              }

              // Met à jour les stats globales
              if (window._iaUserData) {
                var pct = Math.round((totalDone / allLessons.length) * 100);
                window._iaUserData.progression = pct;
              }
              if (window._syncProfilStats) _syncProfilStats();
            }
          }
        }
      }

      // Auto-advance après 800ms
      setTimeout(function() {
        if (idx < allLessons.length-1) goToLesson(allLessons[idx+1].lesson.id);
      }, 800);
    }
  });

  // Sidebar collapse / expand
  var sidebarToggle = document.getElementById('pcr-sidebar-toggle');
  var sidebarExpand = document.getElementById('pcr-sidebar-expand');
  var sidebar = document.getElementById('pcr-sidebar');

  function collapseSidebar() {
    if (sidebar) sidebar.classList.add('collapsed');
    if (sidebarExpand) sidebarExpand.style.display = 'flex';
  }
  function expandSidebar() {
    if (sidebar) sidebar.classList.remove('collapsed');
    if (sidebarExpand) sidebarExpand.style.display = 'none';
  }
  if (sidebarToggle) sidebarToggle.addEventListener('click', collapseSidebar);
  if (sidebarExpand) sidebarExpand.addEventListener('click', expandSidebar);

  // ── MOBILE : bouton "Programme" dans la topbar ──
  (function() {
    var topbar = document.querySelector('.pcr-topbar');
    if (!topbar) return;
    // Crée le bouton seulement si pas déjà présent
    if (document.getElementById('pcr-mob-prog-btn')) return;
    var mobBtn = document.createElement('button');
    mobBtn.id = 'pcr-mob-prog-btn';
    mobBtn.className = 'pcr-mob-prog-btn';
    mobBtn.style.display = 'none'; // caché sur desktop, montré par CSS mobile
    mobBtn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' +
      ' Programme';
    topbar.appendChild(mobBtn);

    var sidebarEl = document.getElementById('pcr-sidebar');
    var progOpen = false;
    mobBtn.addEventListener('click', function() {
      if (!sidebarEl) return;
      progOpen = !progOpen;
      sidebarEl.classList.toggle('mob-open', progOpen);
      mobBtn.style.color = progOpen ? 'var(--blue)' : '';
      mobBtn.innerHTML = progOpen
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Fermer'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> Programme';
    });

    // Ferme la sidebar mobile quand on clique une leçon
    if (sidebarEl) {
      sidebarEl.addEventListener('click', function(e) {
        if (e.target.closest('.pcr-lesson')) {
          if (window.innerWidth <= 600) {
            progOpen = false;
            sidebarEl.classList.remove('mob-open');
            mobBtn.style.color = '';
            mobBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> Programme';
          }
        }
      });
    }

    // Affiche/cache selon la taille de l'écran
    function syncMobBtn() {
      mobBtn.style.display = window.innerWidth <= 600 ? 'flex' : 'none';
      if (window.innerWidth > 600) {
        progOpen = false;
        if (sidebarEl) sidebarEl.classList.remove('mob-open');
      }
    }
    syncMobBtn();
    window.addEventListener('resize', syncMobBtn);
  })();

  // Keyboard ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var pcr = document.getElementById('pcr');
      if (pcr && pcr.classList.contains('open')) window.closeCourseReader();
    }
  });

})();

(function() {
  function wireCards() {
    // Boutons "Continuer ma formation" et "Commencer"
    var pfProgBtn = document.getElementById('pf-prog-btn');
    if (pfProgBtn) pfProgBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.openCourseReader('ia-gen');
    });

    // Toutes les course-rows dans pf
    document.querySelectorAll('#pf .course-row').forEach(function(row) {
      row.style.cursor = 'pointer';
      row.addEventListener('click', function() {
        var cid = row.dataset.courseId || 'ia-gen';
        if (window.openFormationDetail) window.openFormationDetail(cid);
        else window.openCourseReader(cid);
      });
    });

    // "Continuer" dans le dashboard
    document.querySelectorAll('.pd-course-resume, .pd-course-row .btn-continue-pf').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var row = btn.closest('[data-course-id]');
        var cid = (row && row.dataset.courseId) || 'ia-gen';
        window.openCourseReader(cid);
      });
    });
  }
  // Delayed wire to ensure DOM is ready
  setTimeout(wireCards, 300);
})();

(function() {
  var notifications = [
    {
      id: 1, unread: true, type: 'blue', time: 'Il y a 5 min',
      msg: '<strong>Nouvelle leçon disponible</strong> — Module 4 de "IA Générative & LLMs" vient d\'être publié.',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'
    },
    {
      id: 2, unread: true, type: 'green', time: 'Il y a 2 h',
      msg: 'Vous avez obtenu le certificat <strong>"Automatisation No-Code"</strong>. Félicitations !',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>'
    },
    {
      id: 3, unread: true, type: 'orange', time: 'Il y a 3 h',
      msg: 'Live demain à 18h00 — <strong>"Build an AI Agent"</strong> avec Thomas D. Réservez votre place.',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
    },
    {
      id: 4, unread: false, type: 'purple', time: 'Hier',
      msg: '<strong>Marie L.</strong> a répondu à votre question dans le forum "Prompts avancés".',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
    },
    {
      id: 5, unread: false, type: 'pink', time: 'Il y a 2 j',
      msg: 'Votre progression cette semaine : <strong>+18 leçons</strong>. Vous êtes dans le top 10% !',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'
    }
  ];

  var btnBell    = document.getElementById('btn-bell');
  var dropdown   = document.getElementById('notif-dropdown');
  var list       = document.getElementById('notif-list');
  var badge      = document.getElementById('notif-badge');
  var markAllBtn = document.getElementById('notif-mark-all');

  function countUnread() {
    return notifications.filter(function(n) { return n.unread; }).length;
  }

  function updateBadge() {
    var u = countUnread();
    if (badge) {
      badge.textContent = u;
      badge.style.display = u > 0 ? '' : 'none';
    }
    if (btnBell) {
      u > 0 ? btnBell.classList.add('has-notif') : btnBell.classList.remove('has-notif');
    }
  }

  function renderList() {
    if (!list) return;
    list.innerHTML = '';
    if (notifications.length === 0) {
      list.innerHTML =
        '<div class="notif-empty">' +
        '<div class="notif-empty-ico">🔔</div>' +
        '<div class="notif-empty-t">Tout est à jour</div>' +
        '<div class="notif-empty-s">Aucune nouvelle notification pour l\'instant.</div>' +
        '</div>';
      return;
    }
    notifications.forEach(function(n) {
      var item = document.createElement('div');
      item.className = 'notif-item' + (n.unread ? ' unread' : '');
      item.dataset.id = n.id;
      item.innerHTML =
        '<div class="notif-ico ' + n.type + '">' + n.icon + '</div>' +
        '<div class="notif-body">' +
          '<div class="notif-msg">' + n.msg + '</div>' +
          '<div class="notif-time">' + n.time + '</div>' +
        '</div>';
      item.addEventListener('click', function() {
        n.unread = false;
        item.classList.remove('unread');
        updateBadge();
      });
      list.appendChild(item);
    });
    updateBadge();
  }

  function openDropdown() {
    dropdown.classList.add('open');
    btnBell.classList.add('active');
  }
  function closeDropdown() {
    dropdown.classList.remove('open');
    btnBell.classList.remove('active');
  }

  if (btnBell) {
    btnBell.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = dropdown.classList.contains('open');
      // ferme le profil dropdown si ouvert
      var profilDD = document.getElementById('profil-dropdown');
      if (profilDD) profilDD.classList.remove('open');
      isOpen ? closeDropdown() : openDropdown();
    });
  }

  document.addEventListener('click', function(e) {
    if (!dropdown) return;
    if (!dropdown.contains(e.target) && e.target !== btnBell) closeDropdown();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeDropdown();
  });

  if (markAllBtn) {
    markAllBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      notifications.forEach(function(n) { n.unread = false; });
      renderList();
      updateBadge();
    });
  }

  // Init
  renderList();
})();

(async function() {
  'use strict';

  var PROGRAMME = [
    { name:'Introduction aux LLMs', lessons:[
      { name:'Qu\'est-ce qu\'un LLM ?', type:'text', dur:'8 min', free:true },
      { name:'Histoire des transformers', type:'text', dur:'12 min', free:true },
      { name:'Quiz : Les bases', type:'quiz', dur:'5 min', free:false }
    ]},
    { name:'Prompt Engineering', lessons:[
      { name:'Anatomie d\'un bon prompt', type:'text', dur:'11 min', free:false },
      { name:'Techniques avancées (CoT, few-shot)', type:'text', dur:'15 min', free:false },
      { name:'Few-shot & chain-of-thought', type:'text', dur:'9 min', free:false },
      { name:'Quiz : Prompting', type:'quiz', dur:'6 min', free:false }
    ]},
    { name:'RAG & Agents', lessons:[
      { name:'Comprendre le RAG', type:'text', dur:'13 min', free:false },
      { name:'Construire un pipeline RAG', type:'text', dur:'18 min', free:false },
      { name:'Introduction aux agents IA', type:'text', dur:'14 min', free:false }
    ]},
    { name:'Déploiement & Production', lessons:[
      { name:'APIs et intégrations', type:'text', dur:'10 min', free:false },
      { name:'Projet final : Build your AI', type:'text', dur:'22 min', free:false }
    ]}
  ];

  var typeIco = {
    text:  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    quiz:  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  };

  function renderProgrammeFromData(modules) {
    var el = document.getElementById('pfd-programme');
    if (!el) return;
    if (!modules || !modules.length) {
      el.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-3);font-size:.85rem">Aucun module disponible pour cette formation.</div>';
      return;
    }
    el.innerHTML = modules.map(function(m, mi) {
      var isFirst = mi === 0;
      var lessons = (m.lessons || []).map(function(l) {
        return '<div class="pfd-lesson-item">' +
          '<span class="pfd-lesson-type-ico">' + (typeIco['text'] || '') + '</span>' +
          '<span class="pfd-lesson-name">' + (l.title || l.name || 'Leçon') + '</span>' +
          '<span class="pfd-lesson-dur">' + (l.position ? 'Leçon ' + l.position : '') + '</span>' +
          '<span class="pfd-lesson-lock"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>' +
        '</div>';
      }).join('');
      var totalDur = (m.lessons || []).length + ' leçon' + ((m.lessons||[]).length > 1 ? 's' : '');
      return '<div class="pfd-module">' +
        '<div class="pfd-module-head' + (isFirst ? ' open' : '') + '">' +
          '<div class="pfd-module-num">' + (mi+1) + '</div>' +
          '<div class="pfd-module-name">' + (m.title || m.name || 'Module') + '</div>' +
          '<div class="pfd-module-meta">' + totalDur + '</div>' +
          '<svg class="pfd-module-chev" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>' +
        '</div>' +
        '<div class="pfd-lessons-list' + (isFirst ? ' open' : '') + '">' + lessons + '</div>' +
      '</div>';
    }).join('');

    el.querySelectorAll('.pfd-module-head').forEach(function(head) {
      head.addEventListener('click', function() {
        var list = this.nextElementSibling;
        this.classList.toggle('open');
        list.classList.toggle('open');
      });
    });
  }

  function renderProgramme() {
    renderProgrammeFromData(PROGRAMME.map(function(m) {
      return { title: m.name, lessons: m.lessons.map(function(l, i) { return { title: l.name, position: i+1 }; }) };
    }));
  }

  async function loadAndRenderProgramme(courseId) {
    var el = document.getElementById('pfd-programme');
    if (!el) return;
    el.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-3)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite;display:inline-block"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg><div style="margin-top:8px;font-size:.82rem">Chargement...</div></div>';

    try {
      var sb = window._sb;
      if (!sb) { renderProgramme(); return; }

      // Chercher le cours par slug d'abord, puis par id UUID
      var courseRes = await sb.from('courses').select('id, title, description, objectives').eq('slug', courseId).maybeSingle();
      if (!courseRes.data) {
        courseRes = await sb.from('courses').select('id, title, description, objectives').eq('id', courseId).maybeSingle();
      }
      if (!courseRes.data) {
        var titleEl2 = document.getElementById('pfd-title');
        if (titleEl2) titleEl2.textContent = 'Formation introuvable';
        el.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-3);font-size:.85rem">Formation introuvable dans la base de données.</div>';
        return;
      }

      var course = courseRes.data;

      // Mettre à jour le titre et description dans le panneau
      var titleEl = document.getElementById('pfd-title');
      var descEl  = document.getElementById('pfd-desc');
      var miniTitle = document.getElementById('pfd-card-title-mini');
      if (titleEl) titleEl.textContent = course.title;
      if (descEl && course.description) descEl.textContent = course.description;
      if (miniTitle) miniTitle.textContent = course.title;

      // Mettre à jour les objectifs
      var objEl = document.getElementById('pfd-objectifs');
      if (objEl) {
        var objIco = '<svg class="pfd-obj-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.2"><path d="M20 6L9 17l-5-5"/></svg>';

        function renderObjectives(list) {
          objEl.innerHTML = list.map(function(obj) {
            return '<div class="pfd-obj-item">' + objIco + obj + '</div>';
          }).join('');
        }

        if (course.objectives && course.objectives.length) {
          // Déjà en base → afficher directement
          renderObjectives(course.objectives);
        } else {
          // Pas d'objectifs → générer via l'IA puis sauvegarder
          objEl.innerHTML = '<div style="color:var(--text-3);font-size:.82rem;padding:8px 0;display:flex;align-items:center;gap:8px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite;flex-shrink:0"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>Génération des objectifs...</div>';
          try {
            var prompt = 'Tu es un expert en formation e-learning. Pour le cours "' + course.title + '"' +
              (course.description ? ' (' + course.description + ')' : '') +
              ', génère exactement 6 objectifs pédagogiques concrets en français.' +
              ' Réponds UNIQUEMENT avec un JSON valide sans markdown : ["Objectif 1", "Objectif 2", "Objectif 3", "Objectif 4", "Objectif 5", "Objectif 6"]';

            var apiRes = await fetch('/api/generate-course', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: prompt, maxTokens: 400 })
            });
            var apiData = await apiRes.json();
            var raw = (apiData.text || '').replace(/```json|```/g, '').trim();
            var generated = JSON.parse(raw);

            renderObjectives(generated);

            // Sauvegarder en base pour ne pas régénérer la prochaine fois
            await sb.from('courses').update({ objectives: generated }).eq('id', course.id);

          } catch(objErr) {
            console.warn('Objectifs IA:', objErr);
            objEl.innerHTML = '<div style="color:var(--text-3);font-size:.82rem;padding:8px 0">Objectifs non disponibles.</div>';
          }
        }
      }

      // Charger les modules avec leurs leçons
      var modRes = await sb.from('modules')
        .select('id, title, position, lessons(id, title, position)')
        .eq('course_id', course.id)
        .order('position', { ascending: true });

      if (modRes.error || !modRes.data || !modRes.data.length) {
        el.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-3);font-size:.85rem">Programme en cours de construction.</div>';
        return;
      }

      // Trier les leçons par position
      var modules = modRes.data.map(function(m) {
        m.lessons = (m.lessons || []).sort(function(a,b){ return a.position - b.position; });
        return m;
      });

      renderProgrammeFromData(modules);

    } catch(e) {
      console.warn('loadAndRenderProgramme:', e);
      renderProgramme();
    }
  }

  // Course SVG icons per category (injected into big icon + card icon)
  var courseIcons = {
    'ia-gen':        '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 7h.01M10 7h4M7 10h10"/></svg>',
    'automatisation':'<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    'fondamentaux':  '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
    'data':          '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    'default':       '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 5.34L3.93 6.75M12 2v2M12 20v2M20.49 9H22M2 9h1.51"/></svg>'
  };

  var courseIconsSmall = {
    'ia-gen':        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 7h.01M10 7h4M7 10h10"/></svg>',
    'automatisation':'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    'fondamentaux':  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="1.8"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
    'data':          '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    'default':       '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 5.34L3.93 6.75M12 2v2M12 20v2M20.49 9H22M2 9h1.51"/></svg>'
  };

  window.openFormationDetail = async function(courseId) {
    window._currentCourseId = courseId || 'ia-gen';
    var pfd = document.getElementById('pfd');
    if (!pfd) return;

    // Vider titre/desc/objectifs immédiatement pour éviter d'afficher les anciennes données
    var titleEl   = document.getElementById('pfd-title');
    var descEl    = document.getElementById('pfd-desc');
    var miniTitle = document.getElementById('pfd-card-title-mini');
    var objEl     = document.getElementById('pfd-objectifs');
    if (titleEl)   titleEl.textContent   = '';
    if (descEl)    descEl.textContent    = '';
    if (miniTitle) miniTitle.textContent = '';
    if (objEl)     objEl.innerHTML       = '<div style="color:var(--text-3);font-size:.82rem;padding:8px 0">Chargement...</div>';

    // Icônes par défaut
    var bigIcon = document.getElementById('pfd-hero-icon');
    if (bigIcon) bigIcon.innerHTML = courseIcons['default'];
    var cardIcon = document.getElementById('pfd-card-icon');
    if (cardIcon) cardIcon.innerHTML = courseIconsSmall['default'];

    pfd.style.display = 'block';
    void pfd.offsetHeight;
    pfd.classList.add('open');
    pfd.scrollTop = 0;
    document.body.style.overflow = 'hidden';

    await loadAndRenderProgramme(courseId);
  };

  // Mapping courseId → slug Supabase
  var COURSE_SLUGS = {
    'ia-gen':        'ia-generative-llms',
    'automatisation':'automatisation-n8n',
    'fondations':    'fondations-de-l-ia-1779434920365',
    'maths':         'mathematiques-pour-l-ia-1779436227828',
    'intro-ml':      'introduction-au-machine-learning-177943',
    'data':          'data-science-python'
  };

  async function enrollAndStart(courseId) {
    // 1. Ferme les panels immédiatement
    var pfd = document.getElementById('pfd');
    if (pfd) { pfd.classList.remove('open'); pfd.style.display = 'none'; }
    var pcd = document.getElementById('pcd');
    if (pcd) { pcd.classList.remove('open'); pcd.style.display = 'none'; }
    document.body.style.overflow = 'hidden';

    // 2. Ouvre le course reader IMMÉDIATEMENT
    if (window.openCourseReader) window.openCourseReader(courseId);

    // 3. Enrollment Supabase en arrière-plan (non-bloquant)
    try {
      if (!window._sb) return;
      var sbSession = (await window._sb.auth.getSession()).data.session;
      if (!sbSession) return;
      // Résoudre le slug : clé locale → slug Supabase exact
      var slug = COURSE_SLUGS[courseId] || courseId;
      // Chercher par slug d'abord, puis par id si pas trouvé
      var courseRowRes = await window._sb.from('courses').select('id').eq('slug', slug).maybeSingle();
      if (!courseRowRes.data) courseRowRes = await window._sb.from('courses').select('id').eq('slug', courseId).maybeSingle();
      var courseRow = courseRowRes ? courseRowRes.data : null;
      if (!courseRow) return;
      var { error: enrollErr } = await window._sb.from('enrollments').upsert(
        { user_id: sbSession.user.id, course_id: courseRow.id },
        { onConflict: 'user_id,course_id' }
      );
      if (!enrollErr) {
        // Recharger le vrai count depuis Supabase
        var r1 = await window._sb.from('enrollments').select('*', {count:'exact', head:true}).eq('user_id', sbSession.user.id);
        if (window._iaUserData) window._iaUserData.formations = r1.count || (window._iaUserData.formations || 0) + 1;
        if (window._syncProfilStats) _syncProfilStats();
        if (window.showToast) showToast('Inscription confirmée !', 'Bonne formation !');
      }
    } catch(err) {
      console.warn('[enrollAndStart] Supabase non-bloquant:', err);
    }
  }
  var btnStart = document.getElementById('pfd-btn-start');
  if (btnStart) {
    btnStart.addEventListener('click', async function(e) {
      e.preventDefault();
      var isConnected = window._iaConnected;
      if (!isConnected) {
        var overlay = document.getElementById('modal-auth');
        if (overlay) { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
        var goReg = document.getElementById('go-register');
        if (goReg) goReg.click();
        setTimeout(function() {
          var sub = document.querySelector('.modal-subtitle');
          if (sub) sub.textContent = 'Créez votre compte pour accéder à cette formation.';
        }, 10);
      } else {
        var courseId = window._currentCourseId || 'ia-gen';
        await enrollAndStart(courseId);
      }
    });
  }

  var btnWish = document.getElementById('pfd-btn-wishlist');
  if (btnWish) {
    btnWish.addEventListener('click', function() {
      var saved = this.dataset.saved === '1';
      if (saved) {
        this.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>Ajouter à ma liste';
        this.dataset.saved = '0';
        if (window.showToast) showToast('Retiré de votre liste', '');
      } else {
        this.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="var(--red)" stroke="var(--red)" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>Ajouté à ma liste ♥';
        this.dataset.saved = '1';
        if (window.showToast) showToast('Ajouté à votre liste !', 'Retrouvez cette formation dans votre dashboard.');
      }
    });
  }

  // Bouton "Continuer ma formation"
  setTimeout(function() {
    var pfProgBtn = document.getElementById('pf-prog-btn');
    if (pfProgBtn) {
      pfProgBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (window._iaConnected) {
          window.openCourseReader('ia-gen');
        } else {
          window.openFormationDetail('ia-gen');
        }
      });
    }
  }, 400);

})();
