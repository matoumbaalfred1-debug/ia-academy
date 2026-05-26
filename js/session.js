(function() {
  var TIMEOUT_MS      = 30 * 60 * 1000; // 30 min d'inactivité
  var WARNING_MS      = 2  * 60 * 1000; // avertissement 2 min avant
  var _timer          = null;
  var _warnTimer      = null;
  var _warningVisible = false;

  // ── Créer le modal d'avertissement ─────────────────────────────────
  function createWarningModal() {
    if (document.getElementById('session-warning')) return;
    var el = document.createElement('div');
    el.id = 'session-warning';
    el.innerHTML =
      '<div id="sw-backdrop"></div>' +
      '<div id="sw-box">' +
        '<div id="sw-icon">' +
          '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<circle cx="12" cy="12" r="10"/>' +
            '<line x1="12" y1="8" x2="12" y2="12"/>' +
            '<line x1="12" y1="16" x2="12.01" y2="16"/>' +
          '</svg>' +
        '</div>' +
        '<div id="sw-title">Session sur le point d\'expirer</div>' +
        '<div id="sw-msg">Vous serez déconnecté dans <strong id="sw-countdown">2:00</strong> pour inactivité.</div>' +
        '<div id="sw-actions">' +
          '<button id="sw-btn-stay">Rester connecté</button>' +
          '<button id="sw-btn-logout">Se déconnecter</button>' +
        '</div>' +
      '</div>';

    var style = document.createElement('style');
    style.textContent =
      '#session-warning{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center}' +
      '#session-warning.visible{display:flex}' +
      '#sw-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(3px)}' +
      '#sw-box{position:relative;background:#fff;border-radius:20px;padding:36px 32px;max-width:380px;width:90%;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,.18);animation:swIn .25s cubic-bezier(.22,1,.36,1)}' +
      '@keyframes swIn{from{opacity:0;transform:scale(.92) translateY(12px)}to{opacity:1;transform:none}}' +
      '#sw-icon{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#ef4444);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:#fff}' +
      '#sw-title{font-size:1.1rem;font-weight:700;color:#0d0d1a;margin-bottom:8px}' +
      '#sw-msg{font-size:.88rem;color:#6b7280;margin-bottom:24px;line-height:1.5}' +
      '#sw-msg strong{color:#ef4444;font-variant-numeric:tabular-nums}' +
      '#sw-actions{display:flex;gap:10px;justify-content:center}' +
      '#sw-btn-stay{flex:1;padding:11px;border-radius:10px;border:none;background:linear-gradient(135deg,#1B4FD8,#5b21f5);color:#fff;font-weight:600;font-size:.88rem;cursor:pointer}' +
      '#sw-btn-stay:hover{opacity:.9}' +
      '#sw-btn-logout{flex:1;padding:11px;border-radius:10px;border:1.5px solid #e5e7eb;background:#fff;color:#6b7280;font-weight:600;font-size:.88rem;cursor:pointer}' +
      '#sw-btn-logout:hover{border-color:#ef4444;color:#ef4444}';

    document.head.appendChild(style);
    document.body.appendChild(el);

    document.getElementById('sw-btn-stay').addEventListener('click', function() {
      resetTimer();
      hideWarning();
    });

    document.getElementById('sw-btn-logout').addEventListener('click', function() {
      hideWarning();
      doLogout();
    });
  }

  // ── Countdown affiché dans le modal ────────────────────────────────
  var _countdownInterval = null;
  function startCountdown() {
    var remaining = WARNING_MS;
    var el = document.getElementById('sw-countdown');
    _countdownInterval && clearInterval(_countdownInterval);
    _countdownInterval = setInterval(function() {
      remaining -= 1000;
      if (remaining <= 0) { clearInterval(_countdownInterval); return; }
      var m = Math.floor(remaining / 60000);
      var s = Math.floor((remaining % 60000) / 1000);
      if (el) el.textContent = m + ':' + (s < 10 ? '0' : '') + s;
    }, 1000);
  }

  function showWarning() {
    if (_warningVisible) return;
    _warningVisible = true;
    var el = document.getElementById('session-warning');
    if (el) { el.classList.add('visible'); startCountdown(); }
  }

  function hideWarning() {
    _warningVisible = false;
    var el = document.getElementById('session-warning');
    if (el) el.classList.remove('visible');
    _countdownInterval && clearInterval(_countdownInterval);
  }

  // ── Déconnexion effective ───────────────────────────────────────────
  function doLogout() {
    clearTimers();
    if (window._sb) window._sb.auth.signOut();
    if (window._iaUserData) {
      window._iaUserData.formations = 0;
      window._iaUserData.certifs    = 0;
      window._iaUserData.prenom     = '';
      window._iaUserData.plan       = null;
    }
    if (window.setAuthState)     setAuthState(false);
    if (window._syncProfilStats) _syncProfilStats();
    // Fermer le reader si ouvert
    if (window.closeCourseReader) window.closeCourseReader();
    if (window.showToast) showToast('Session expirée', 'Vous avez été déconnecté pour inactivité.');
  }

  // ── Timers ──────────────────────────────────────────────────────────
  function clearTimers() {
    _timer     && clearTimeout(_timer);
    _warnTimer && clearTimeout(_warnTimer);
  }

  function resetTimer() {
    if (!window._iaConnected) return;
    clearTimers();
    hideWarning();
    // Avertissement à TIMEOUT - WARNING
    _warnTimer = setTimeout(function() {
      if (!window._iaConnected) return;
      showWarning();
      // Déconnexion réelle après WARNING_MS supplémentaires
      _timer = setTimeout(function() {
        if (!window._iaConnected) return;
        doLogout();
      }, WARNING_MS);
    }, TIMEOUT_MS - WARNING_MS);
  }

  // ── Détecter l'activité utilisateur ────────────────────────────────
  var _throttle = null;
  function onActivity() {
    if (!window._iaConnected) return;
    if (_warningVisible) return; // ne pas reset si l'avertissement est visible
    if (_throttle) return;
    _throttle = setTimeout(function() { _throttle = null; }, 5000);
    resetTimer();
  }

  ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'].forEach(function(evt) {
    document.addEventListener(evt, onActivity, { passive: true });
  });

  // ── Démarrer/arrêter selon l'état auth ─────────────────────────────
  // Patch setAuthState pour hooker le système
  var _origSetAuth = null;
  function patchSetAuth() {
    if (window.setAuthState && window.setAuthState !== _patchedSetAuth) {
      _origSetAuth = window.setAuthState;
      window.setAuthState = _patchedSetAuth;
    }
  }

  function _patchedSetAuth(connected) {
    _origSetAuth && _origSetAuth(connected);
    if (connected) {
      createWarningModal();
      resetTimer();
    } else {
      clearTimers();
      hideWarning();
    }
  }

  // Tenter le patch immédiatement et après chargement
  patchSetAuth();
  document.addEventListener('DOMContentLoaded', patchSetAuth);
  setTimeout(patchSetAuth, 1000);
  setTimeout(patchSetAuth, 3000);

})();
