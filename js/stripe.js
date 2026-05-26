(function() {

  window.syncPlanButtons = function() {
    var plan = (window._iaUserData && window._iaUserData.plan) || null;
    var isConnected = window._iaConnected;
    document.querySelectorAll('.btn-pl[data-plan]').forEach(function(btn) {
      var btnPlan = btn.dataset.plan;
      btn.classList.remove('plan-actuel');
      btn.disabled = false;
      if (isConnected && plan && btnPlan === plan) {
        btn.classList.add('plan-actuel');
        btn.textContent = 'Plan actuel';
        btn.disabled = true;
      } else {
        btn.textContent = 'Commencer';
      }
    });
  };

  document.querySelectorAll('.btn-pl[data-plan]').forEach(function(btn) {
    btn.addEventListener('click', async function() {
      if (this.classList.contains('plan-actuel')) return;
      var plan = this.dataset.plan;

      if (!window._iaConnected) {
        window._selectedPlan = plan;
        var overlay = document.getElementById('modal-auth');
        if (overlay) { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
        var goReg = document.getElementById('go-register');
        if (goReg) goReg.click();
        return;
      }

      // Connecte et redirige vers Stripe
      var self = this;
      self.disabled = true;
      self.textContent = 'Redirection...';

      try {
        var session = (await window._sb.auth.getSession()).data.session;
        var resp = await fetch(
          'https://pfbijoyguskdpdseunfh.supabase.co/functions/v1/create-checkout',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + session.access_token
            },
            // userId et email lus côté serveur depuis le JWT — ne jamais faire confiance au client
            body: JSON.stringify({ plan: plan })
          }
        );
        var data = await resp.json();
        if (data.url) {
          // Open Redirect : vérification stricte que l'URL appartient à Stripe
          try {
            var stripeUrl = new URL(data.url);
            if(stripeUrl.protocol === 'https:' && (stripeUrl.hostname === 'checkout.stripe.com' || stripeUrl.hostname === 'billing.stripe.com')) {
              window.location.href = stripeUrl.href;
            } else {
              throw new Error('URL Stripe invalide');
            }
          } catch(e) {
            throw new Error('Redirection non autorisée');
          }
        } else {
          throw new Error(data.error || 'Erreur');
        }
      } catch(err) {
        self.disabled = false;
        self.textContent = 'Commencer';
        if (window.showToast) showToast('Erreur', 'Impossible de créer la session de paiement.');
      }
    });
  });

  // Retour depuis Stripe
  var params = new URLSearchParams(window.location.search);
  if (params.get('payment') === 'success') {
    var plan = params.get('plan');
    window.history.replaceState({}, '', window.location.pathname);
    // Attend que Supabase auth soit prêt puis recharge le profil
    setTimeout(async function() {
      if (window._sb) {
        var session = (await window._sb.auth.getSession()).data.session;
        if (session) {
          // Attend que le webhook ait mis à jour le profil
          await new Promise(function(r){ setTimeout(r, 2000); });
          var { data: profile } = await window._sb
            .from('profiles')
            .select('plan')
            .eq('id', session.user.id)
            .single();
          if (profile && window._iaUserData) {
            // Utilise uniquement le plan depuis Supabase (source fiable), jamais l'URL
            window._iaUserData.plan = profile.plan || 'free';
          }
          if (window.syncPlanButtons) syncPlanButtons();
          // Nom du plan depuis Supabase uniquement, jamais depuis l'URL
          var safePlan = (profile && profile.plan) ? profile.plan.replace(/[^a-zA-Z0-9\-_]/g,'') : '';
          if (window.showToast) showToast('Paiement r\u00e9ussi ! \uD83C\uDF89', 'Votre plan ' + safePlan + ' est maintenant actif.');
        }
      }
    }, 500);
  }
  if (params.get('payment') === 'cancelled') {
    window.history.replaceState({}, '', window.location.pathname);
    if (window.showToast) showToast('Paiement annul\u00e9', "Votre abonnement n'a pas \u00e9t\u00e9 activ\u00e9.");
  }

  window.syncPlanButtons();
})();

(function() {
  function normalize(str) {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
  }
  function showEmpty(container, show, msg) {
    var id = container.id + '-search-empty';
    var el = document.getElementById(id);
    if (show) {
      if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.style.cssText = 'padding:40px 24px;text-align:center;color:var(--text-3)';
        el.innerHTML = '<div style="font-size:1.8rem;margin-bottom:10px">🔍</div>' +
          '<div style="font-weight:700;font-size:.88rem;color:var(--text-2);margin-bottom:5px">Aucun résultat</div>' +
          '<div style="font-size:.8rem">' + msg + '</div>';
        container.appendChild(el);
      }
      el.style.display = 'block';
    } else if (el) {
      el.style.display = 'none';
    }
  }

  var pfSearchQuery = '';

  function applyPfFilters() {
    var rows = document.querySelectorAll('#pf .course-row');
    var q = normalize(pfSearchQuery);
    var count = 0;
    rows.forEach(function(row) {
      var text = normalize(row.innerText || row.textContent);
      var ok = !q || text.indexOf(q) !== -1;
      row.style.display = ok ? '' : 'none';
      if (ok) count++;
    });
    var counter = document.getElementById('pf-result-count');
    if (counter) counter.textContent = count + ' formation' + (count > 1 ? 's' : '');
    var list = document.querySelector('#pf #pf-courses-list');
    if (list) showEmpty(list, count === 0, 'Aucune formation ne correspond à votre recherche.');
  }

  var pfInput = document.getElementById('pf-search-input');
  if (pfInput) {
    pfInput.addEventListener('input', function() {
      pfSearchQuery = this.value;
      applyPfFilters();
    });
    pfInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') { this.value = ''; pfSearchQuery = ''; applyPfFilters(); }
    });
  }

  var prInput = document.getElementById('pr-search-input');
  if (prInput) {
    prInput.addEventListener('input', function() {
      var q = normalize(this.value);
      var rows = document.querySelectorAll('#pr .pr-row');
      var count = 0;
      rows.forEach(function(row) {
        var show = !q || normalize(row.innerText||row.textContent).indexOf(q) !== -1;
        row.style.display = show ? '' : 'none';
        if (show) count++;
      });
      var prList = document.querySelector('#pr .pr-popular') || document.querySelector('#pr');
      if (prList) showEmpty(prList, q.length > 0 && count === 0, 'Essayez d\'autres mots-clés.');
    });
    prInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') { this.value = ''; document.querySelectorAll('#pr .pr-row').forEach(function(r){r.style.display=''}); }
    });
    var prBtn = document.querySelector('.pr-search-btn');
    if (prBtn) prBtn.addEventListener('click', function() { prInput.dispatchEvent(new Event('input')); prInput.focus(); });
  }

  document.querySelectorAll('#pr .pr-tag').forEach(function(tag) {
    tag.addEventListener('click', function() {
      document.querySelectorAll('#pr .pr-tag').forEach(function(t){t.classList.remove('active')});
      this.classList.add('active');
      var val = normalize(this.textContent.trim());
      if (val === 'voir plus +') return;
      document.querySelectorAll('#pr .pr-row').forEach(function(row) {
        row.style.display = normalize(row.innerText||row.textContent).indexOf(val) !== -1 ? '' : 'none';
      });
      if (prInput) prInput.value = '';
    });
  });

  var pdInput = document.getElementById('pd-search-input');
  if (pdInput) {
    pdInput.addEventListener('input', function() {
      var q = normalize(this.value);
      document.querySelectorAll('#pd .pd-course-row').forEach(function(row) {
        row.style.display = !q || normalize(row.innerText||row.textContent).indexOf(q) !== -1 ? '' : 'none';
      });
    });
    pdInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') { this.value = ''; document.querySelectorAll('#pd .pd-course-row').forEach(function(r){r.style.display=''}); }
    });
  }

})();
