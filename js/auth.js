(function() {
  var SITE_URL = 'https://ia-academy-lilac.vercel.app';

  var sb = window._sb = supabase.createClient(
    'https://pfbijoyguskdpdseunfh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmYmlqb3lndXNrZHBkc2V1bmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMTczMjcsImV4cCI6MjA5Mzc5MzMyN30.UNk-OJuZBdXIgDMvtp7ZLvpxQfs9Qrzu1aAcQwHhdyQ',
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  );

  function getField(id){var e=document.getElementById(id);return e?e.value.trim():'';}

  // Helper : fetch avec timeout
  function sbFetchTimeout(promise, ms) {
    ms = ms || 10000;
    var timeout = new Promise(function(_, reject){
      setTimeout(function(){ reject(new Error('Délai dépassé. Vérifiez votre connexion.')); }, ms);
    });
    return Promise.race([promise, timeout]);
  }

  function setError(id, msg) {
    var e = document.getElementById(id);
    if (e) { e.textContent = msg; e.style.display = msg ? 'block' : 'none'; }
  }

  // setBtnLoading : préserve le innerHTML (contient des SVG)
  function setBtnLoading(btn, loading, label) {
    if (!btn) return;
    btn.disabled = loading;
    if (loading) {
      btn._savedHTML = btn.innerHTML;
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin .8s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Chargement...';
    } else {
      if (btn._savedHTML) { btn.innerHTML = btn._savedHTML; btn._savedHTML = null; }
      else { btn.textContent = label; }
    }
  }
  function closeAuthModal(){var o=document.getElementById('modal-auth');if(o){o.classList.remove('open');document.body.style.overflow='';}}

  function updateUI(prenom, email, avatarUrl) {
    var n=document.getElementById('dd-user-name');
    var em=document.getElementById('dd-user-email');
    var av=document.getElementById('dd-user-avatar');
    var ph=document.getElementById('phc-name');
    var wl=document.getElementById('pd-welcome-name');
    if(n) n.textContent=prenom;
    if(em) em.textContent=email||'';
    if(ph) ph.textContent=prenom;
    if(wl) wl.textContent='Bienvenue, '+prenom+' \uD83D\uDC4B';
    if(av){
      if(avatarUrl){
        try {
          var parsed = new URL(avatarUrl);
          var trustedHosts = ['lh3.googleusercontent.com','avatars.githubusercontent.com','pfbijoyguskdpdseunfh.supabase.co'];
          if(parsed.protocol === 'https:' && trustedHosts.some(function(h){ return parsed.hostname === h; })){
            var img = document.createElement('img');
            img.src = parsed.href;
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%';
            img.alt = '';
            av.innerHTML = '';
            av.appendChild(img);
          } else { throw new Error('untrusted'); }
        } catch(e) {
          av.textContent = prenom.charAt(0).toUpperCase();
          av.style.cssText += 'font-size:16px;font-weight:700;color:#fff';
        }
      } else {
        av.textContent = prenom.charAt(0).toUpperCase();
        av.style.cssText += 'font-size:16px;font-weight:700;color:#fff';
      }
    }
  }

  // Flag : inscription en attente de confirmation email
  var _waitingConfirmation = false;

  async function onSignedIn(session){
    var user=session.user;
    var prenom=(user.user_metadata&&user.user_metadata.prenom)||user.email.split('@')[0];
    if(window._iaUserData) window._iaUserData.prenom=prenom;
    updateUI(prenom, user.email, user.user_metadata&&user.user_metadata.avatar_url);
    if(window.setAuthState) setAuthState(true);
    closeAuthModal();
    setTimeout(async function(){
      var r=await sb.from('profiles').select('*').eq('id',user.id).single();
      if(r.data){
        var p=r.data.prenom||prenom, n2=r.data.nom||'';
        if(window._iaUserData){window._iaUserData.prenom=p;window._iaUserData.plan=r.data.plan||'free';}
        updateUI((p+' '+n2).trim(),user.email,r.data.avatar_url);
      }
      var r1=await sb.from('enrollments').select('*',{count:'exact',head:true}).eq('user_id',user.id);
      var r2=await sb.from('certificates').select('*',{count:'exact',head:true}).eq('user_id',user.id);
      if(window._iaUserData){window._iaUserData.formations=r1.count||0;window._iaUserData.certifs=r2.count||0;}
      if(window.syncPlanButtons) syncPlanButtons();
      if(window._syncProfilStats) _syncProfilStats();
    },800);
  }

  // ── EMAIL CONFIRMATION SCREEN ──
  function showConfirmationSent(email) {
    var fLog = document.getElementById('form-login');
    var fReg = document.getElementById('form-register');
    var fOtp = document.getElementById('form-otp');

    // Chercher ou créer un écran de confirmation
    var fConf = document.getElementById('form-email-confirm');
    if (!fConf) {
      fConf = document.createElement('div');
      fConf.id = 'form-email-confirm';
      fConf.innerHTML =
        '<div class="modal-title">Vérifiez votre boîte mail</div>' +
        '<div class="modal-underline"></div>' +
        '<div style="text-align:center;padding:12px 0 20px">' +
          '<div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--purple));display:flex;align-items:center;justify-content:center;margin:0 auto 16px">' +
            '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>' +
          '</div>' +
          '<div id="conf-email-dest" style="font-weight:700;font-size:.95rem;color:var(--text);margin-bottom:8px"></div>' +
          '<p style="font-size:.85rem;color:var(--text-2);line-height:1.6;margin-bottom:20px">Un lien de confirmation a été envoyé. Cliquez sur ce lien pour activer votre compte et vous connecter automatiquement.</p>' +
          '<div style="background:rgba(91,33,245,0.06);border:1px solid var(--border);border-radius:12px;padding:14px;font-size:.82rem;color:var(--text-3);text-align:left;margin-bottom:20px">' +
            '<strong style="color:var(--text-2)">Vous ne trouvez pas l\'email ?</strong><br>Vérifiez vos spams · Le lien est valable 24h · Assurez-vous d\'avoir utilisé la bonne adresse.' +
          '</div>' +
          '<button id="conf-resend-btn" style="background:none;border:1.5px solid var(--border2);border-radius:50px;padding:8px 20px;font-family:inherit;font-size:.84rem;font-weight:600;color:var(--blue);cursor:pointer;transition:background .15s;margin-bottom:10px;width:100%" type="button">Renvoyer l\'email</button>' +
          '<button id="conf-back-btn" style="background:none;border:none;font-family:inherit;font-size:.82rem;color:var(--text-3);cursor:pointer;text-decoration:underline" type="button">← Retour</button>' +
        '</div>';

      // Insérer dans le même conteneur que les autres formulaires
      if (fReg && fReg.parentNode) fReg.parentNode.appendChild(fConf);

      document.getElementById('conf-resend-btn').addEventListener('click', async function() {
        this.disabled = true;
        this.textContent = 'Envoi...';
        var confEmail = this.closest('#form-email-confirm').dataset.email;
        await sb.auth.resend({ type: 'signup', email: confEmail });
        this.textContent = 'Email renvoyé !';
        setTimeout(function(btn){ btn.disabled = false; btn.textContent = 'Renvoyer l\'email'; }.bind(null, this), 4000);
      });

      document.getElementById('conf-back-btn').addEventListener('click', function() {
        fConf.style.display = 'none';
        if (fReg) fReg.style.display = 'block';
      });
    }

    fConf.dataset.email = email;
    var dest = document.getElementById('conf-email-dest');
    if (dest) dest.textContent = email;

    if (fLog) fLog.style.display = 'none';
    if (fReg) fReg.style.display = 'none';
    if (fOtp) fOtp.style.display = 'none';
    fConf.style.display = 'block';

    // Bloquer onAuthStateChange pendant l'attente de confirmation
    _waitingConfirmation = true;

    // S'assurer que la modale reste ouverte
    var modalAuth = document.getElementById('modal-auth');
    if (modalAuth) { modalAuth.classList.add('open'); document.body.style.overflow = 'hidden'; }
  }

  // ── OTP LOGIC ──
  var currentOtpEmail = '';
  var currentOtpType  = 'signup'; // 'signup' ou 'email'

  var otpCountdownInterval = null;

  function startOtpCountdown(seconds) {
    var timerText  = document.getElementById('otp-timer-text');
    var countdown  = document.getElementById('otp-countdown');
    var btnResend  = document.getElementById('btn-resend-otp');
    if(!timerText || !countdown || !btnResend) return;

    clearInterval(otpCountdownInterval);
    timerText.style.display = 'inline';
    btnResend.style.display = 'none';
    var remaining = seconds || 120;

    function tick() {
      var m = Math.floor(remaining / 60);
      var s = remaining % 60;
      countdown.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      if(remaining <= 0) {
        clearInterval(otpCountdownInterval);
        timerText.style.display = 'none';
        btnResend.style.display = 'inline';
      }
      remaining--;
    }
    tick();
    otpCountdownInterval = setInterval(tick, 1000);
  }

  function showOtpForm(email, type) {
    currentOtpEmail = email;
    currentOtpType  = type || 'signup';

    var sub = document.getElementById('otp-sub');
    if(sub) sub.textContent = 'Entrez le code à 8 chiffres envoyé à ' + email;

    // Cacher tous les formulaires dans modal-left
    ['form-login','form-register','form-otp'].forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.style.display = 'none';
    });

    // Afficher form-otp
    var fOtp = document.getElementById('form-otp');
    if(fOtp) {
      fOtp.style.removeProperty('display');
      fOtp.style.display = 'block';
      var ml = fOtp.closest('.modal-left');
      if(ml) { ml.style.overflow = 'auto'; ml.scrollTop = 0; }
    }

    // Reset champs
    document.querySelectorAll('.otp-digit').forEach(function(i){ i.value=''; i.classList.remove('filled'); });
    setError('otp-error','');
    startOtpCountdown(3600);
    setTimeout(function(){
      var first = document.querySelector('#form-otp .otp-digit');
      if(first) first.focus();
    }, 100);
  }

  // Navigation entre champs OTP
  document.querySelectorAll('.otp-digit').forEach(function(input, idx, all) {
    input.addEventListener('input', function() {
      this.value = this.value.replace(/[^0-9]/g,'').slice(-1);
      if(this.value) {
        this.classList.add('filled');
        if(idx < all.length - 1) all[idx+1].focus();
        else document.getElementById('btn-verify-otp') && document.getElementById('btn-verify-otp').focus();
      } else {
        this.classList.remove('filled');
      }
    });
    input.addEventListener('keydown', function(e) {
      if(e.key==='Backspace'&&!this.value&&idx>0) {
        all[idx-1].focus();
        all[idx-1].value='';
        all[idx-1].classList.remove('filled');
      }
      if(e.key==='ArrowLeft'&&idx>0) all[idx-1].focus();
      if(e.key==='ArrowRight'&&idx<all.length-1) all[idx+1].focus();
    });
    // Paste support
    input.addEventListener('paste', function(e) {
      e.preventDefault();
      var paste = (e.clipboardData||window.clipboardData).getData('text').replace(/\D/g,'');
      all.forEach(function(inp, i) {
        if(paste[i]) { inp.value=paste[i]; inp.classList.add('filled'); }
      });
      var lastFilled = Math.min(paste.length, all.length) - 1;
      if(lastFilled >= 0) all[lastFilled].focus();
    });
  });

  // Vérification OTP
  var btnVerify = document.getElementById('btn-verify-otp');
  if(btnVerify) {
    btnVerify.addEventListener('click', async function() {
      var digits = Array.from(document.querySelectorAll('.otp-digit')).map(function(i){return i.value;});
      var token  = digits.join('');
      if(token.length < 8) { setError('otp-error','Entrez le code complet à 8 chiffres.'); return; }
      setError('otp-error','');
      setBtnLoading(this, true, 'Vérification...');
      try {
        var result = await sb.auth.verifyOtp({
          email: currentOtpEmail,
          token: token,
          type: currentOtpType === 'signup' ? 'signup' : 'email'
        });
        var data  = result.data;
        var error = result.error;
        if(error) { setError('otp-error', 'Code incorrect ou expiré. Réessayez.'); return; }
        if(data && data.session) {
          var user   = data.session.user;
          var prenom = (user.user_metadata && user.user_metadata.prenom) || user.email.split('@')[0];
          // Mail de bienvenue
          try {
            fetch('/api/send-welcome', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user.email, prenom: prenom })
            });
          } catch(e) {}
          // Connexion
          await onSignedIn(data.session);
          var modal = document.getElementById('modal-auth');
          if(modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
          clearAuthForms();
          if(window.showToast) showToast('Compte activé !', 'Bienvenue ' + prenom + ' sur IA Academy !');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setError('otp-error', 'Vérification échouée. Réessayez.');
        }
      } catch(err) {
        setError('otp-error', 'Erreur réseau. Réessayez.');
      } finally {
        setBtnLoading(this, false, 'Vérifier le code');
      }
    });
  }

  // Renvoyer le code
  var btnResend = document.getElementById('btn-resend-otp');
  if(btnResend) {
    btnResend.addEventListener('click', async function() {
      if(!currentOtpEmail) return;
      this.textContent = 'Envoi...';
      this.disabled = true;
      await sb.auth.resend({ type: 'signup', email: currentOtpEmail });
      this.disabled = false;
      // Relance le countdown
      startOtpCountdown(120);
      if(window.showToast) showToast('Code renvoyé !', 'Vérifiez votre boîte email.');
    });
  }

  // Retour depuis OTP
  var btnBackOtp = document.getElementById('btn-back-from-otp');
  if(btnBackOtp) {
    btnBackOtp.addEventListener('click', function() {
      var fOtp = document.getElementById('form-otp');
      var fReg = document.getElementById('form-register');
      if(fOtp) fOtp.style.display = 'none';
      if(fReg) fReg.style.display = 'block';
      // Reset champs OTP
      document.querySelectorAll('.otp-digit').forEach(function(i){ i.value=''; i.classList.remove('filled'); });
    });
  }

  // INSCRIPTION
  var fReg=document.getElementById('form-register');
  if(fReg){
    var bReg=document.getElementById('btn-register');
    async function doSignUp(e){
      if(e) e.preventDefault();
      var prenom = getField('reg-prenom');
      var nom    = getField('reg-nom');
      var email  = getField('reg-email');
      var pwd    = getField('reg-pwd');
      var pwd2   = getField('reg-pwd2');
      setError('reg-error','');

      if(!prenom||!email||!pwd){setError('reg-error','Prénom, email et mot de passe sont requis.');return;}

      var emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
      if(!emailRegex.test(email)){setError('reg-error','Adresse email invalide.');return;}

      prenom = prenom.replace(/<[^>]*>/g,'').trim().slice(0,50);
      nom    = nom.replace(/<[^>]*>/g,'').trim().slice(0,50);
      if(!prenom){setError('reg-error','Prénom invalide.');return;}

      var pwdErrors = [];
      if(pwd.length < 8) pwdErrors.push('8 caractères minimum');
      if(!/[A-Z]/.test(pwd)) pwdErrors.push('une majuscule');
      if(!/[a-z]/.test(pwd)) pwdErrors.push('une minuscule');
      if(!/[0-9]/.test(pwd)) pwdErrors.push('un chiffre');
      if(!/[^A-Za-z0-9]/.test(pwd)) pwdErrors.push('un caractère spécial');
      if(pwdErrors.length>0){setError('reg-error','Mot de passe trop faible : '+pwdErrors.join(', ')+'.');return;}
      if(pwd!==pwd2){setError('reg-error','Les mots de passe ne correspondent pas.');return;}

      var cguCheck = fReg.querySelector('input[type="checkbox"]');
      if(cguCheck && !cguCheck.checked){setError('reg-error','Veuillez accepter les conditions générales.');return;}

      setBtnLoading(bReg,true,'Créer mon compte');
      try {
        var result = await sbFetchTimeout(
          sb.auth.signUp({
            email: email,
            password: pwd,
            options: {
              data: { prenom: prenom, nom: nom },
              emailRedirectTo: SITE_URL
            }
          })
        );
        var data  = result.data;
        var error = result.error;

        if(error){
          setError('reg-error', error.message || 'Une erreur est survenue. Réessayez.');
          return;
        }

        if(data && data.session){
          _waitingConfirmation = false;
          setError('reg-error','');
          await onSignedIn(data.session);
          if(window.showToast) showToast('Compte créé !', 'Bienvenue ' + prenom + ' !');
        } else if(data && data.user){
          if(data.user.identities && data.user.identities.length === 0){
            setError('reg-error', 'Cette adresse email est déjà utilisée. Connectez-vous ou réinitialisez votre mot de passe.');
          } else {
            setError('reg-error','');
            showOtpForm(email, 'signup');
          }
        } else {
          setError('reg-error', 'Inscription impossible. Cet email est peut-être déjà utilisé — essayez de vous connecter ou utilisez une autre adresse.');
        }
      } catch(err) {
        setError('reg-error', '[EXCEPTION] ' + (err.message || String(err)));
      } finally {
        setBtnLoading(bReg, false, 'Créer mon compte');
      }
    }
    if(bReg) bReg.addEventListener('click', doSignUp);
    fReg.addEventListener('submit', doSignUp);
  }

  // PROTECTION ANTI-BRUTE FORCE
  var _loginAttempts = 0;
  var _loginLockUntil = 0;
  var MAX_ATTEMPTS = 5;
  var LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  function isLoginLocked() {
    return _loginAttempts >= MAX_ATTEMPTS && Date.now() < _loginLockUntil;
  }
  function getLockRemainingSeconds() {
    return Math.ceil((_loginLockUntil - Date.now()) / 1000);
  }
  function recordFailedAttempt() {
    _loginAttempts++;
    if (_loginAttempts >= MAX_ATTEMPTS) _loginLockUntil = Date.now() + LOCK_DURATION_MS;
  }
  function resetAttempts() {
    _loginAttempts = 0;
    _loginLockUntil = 0;
  }

  // CONNEXION
  var fLog=document.getElementById('form-login');
  if(fLog){
    var bLog=document.getElementById('btn-login-submit');
    async function doSignIn(e){
      if(e) e.preventDefault();
      if(isLoginLocked()){
        setError('login-error','Trop de tentatives. Réessayez dans '+getLockRemainingSeconds()+' secondes.');
        return;
      }
      var email=getField('login-email'), pwd=getField('login-pwd');
      setError('login-error','');
      if(!email||!pwd){setError('login-error','Email et mot de passe requis.');return;}

      // Validation format email
      var emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
      if(!emailRegex.test(email)){setError('login-error','Adresse email invalide. Vérifiez le format (ex: nom@exemple.com).');return;}

      setBtnLoading(bLog,true,'Se connecter');
      try {
        var result = await sbFetchTimeout(sb.auth.signInWithPassword({email:email, password:pwd}));
        var data  = result.data;
        var error = result.error;
        if(error){
          recordFailedAttempt();
          if(isLoginLocked()){
            setError('login-error','Trop de tentatives échouées. Compte bloqué 5 minutes.');
          } else {
            // Distinguer email inexistant vs mauvais mot de passe
            var msg = error.message || '';
            if(msg.toLowerCase().includes('invalid login') || msg.toLowerCase().includes('invalid credentials')){
              // Supabase retourne le même message pour sécurité — on affiche un message adapté
              setError('login-error','Email ou mot de passe incorrect. Vérifiez vos identifiants ou créez un compte.');
            } else if(msg.toLowerCase().includes('email not confirmed')){
              setError('login-error','Votre email n\'est pas encore confirmé. Vérifiez votre boîte mail.');
            } else {
              setError('login-error', msg || 'Une erreur est survenue. Réessayez.');
            }
          }
          return;
        }
        resetAttempts();
        await onSignedIn(data.session);
        var modal = document.getElementById('modal-auth');
        if(modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
        clearAuthForms();
        if(window.showToast) showToast('Connexion réussie !','Bon retour '+(window._iaUserData&&window._iaUserData.prenom||'')+' !');
      } catch(err) {
        setError('login-error', err.message || 'Erreur réseau. Vérifiez votre connexion.');
      } finally {
        setBtnLoading(bLog, false, 'Se connecter');
      }
    }
    if(bLog) bLog.addEventListener('click',doSignIn);
    fLog.addEventListener('submit',doSignIn);

    // Validation format email en temps réel
    var loginEmailField = document.getElementById('login-email');
    if(loginEmailField){
      loginEmailField.addEventListener('blur', function(){
        var val = this.value.trim();
        if(!val) return;
        var emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
        if(!emailRegex.test(val)){
          setError('login-error','Adresse email invalide. Vérifiez le format (ex: nom@exemple.com).');
        } else {
          setError('login-error','');
        }
      });
      loginEmailField.addEventListener('input', function(){
        setError('login-error','');
      });
    }
  }

  // GOOGLE
  document.querySelectorAll('.m-social-btn').forEach(function(btn){
    if(btn.textContent.trim().toLowerCase().includes('google')){
      btn.addEventListener('click',async function(){
        var redirectTo = window.location.origin + window.location.pathname;
        await sb.auth.signInWithOAuth({
          provider:'google',
          options:{ redirectTo: redirectTo }
        });
      });
    }
  });

  // CHECKLIST MOT DE PASSE — style moderne
  (function(){
    var pwdInput = document.getElementById('reg-pwd');
    var block    = document.getElementById('pwd-security-block');
    if(!pwdInput || !block) return;

    var rules = {
      len:     function(p){ return p.length >= 8; },
      upper:   function(p){ return /[A-Z]/.test(p); },
      lower:   function(p){ return /[a-z]/.test(p); },
      digit:   function(p){ return /[0-9]/.test(p); },
      special: function(p){ return /[^A-Za-z0-9]/.test(p); }
    };

    pwdInput.addEventListener('input', function(){
      var val = this.value;
      block.style.display = val ? 'block' : 'none';
      Object.keys(rules).forEach(function(key){
        var el = document.getElementById('rule-'+key);
        if(el) el.classList.toggle('ok', rules[key](val));
      });
      // Re-vérifier la confirmation si déjà remplie
      var pwd2 = document.getElementById('reg-pwd2');
      if(pwd2 && pwd2.value) pwd2.dispatchEvent(new Event('input'));
    });
  })();

  // CONFIRMATION MOT DE PASSE — feedback rouge/vert en temps réel
  (function(){
    var pwd1   = document.getElementById('reg-pwd');
    var pwd2   = document.getElementById('reg-pwd2');
    var field2 = document.getElementById('pwd2-field');
    var msg    = document.getElementById('pwd2-msg');
    if(!pwd1 || !pwd2 || !field2 || !msg) return;

    pwd2.addEventListener('input', function(){
      var v1 = pwd1.value;
      var v2 = this.value;
      if(!v2){ 
        field2.style.borderColor = '';
        msg.style.display = 'none';
        return;
      }
      if(v1 === v2){
        field2.style.borderColor = 'var(--green)';
        msg.style.display  = 'block';
        msg.style.color    = 'var(--green)';
        msg.textContent    = '✓ Les mots de passe correspondent';
      } else {
        field2.style.borderColor = 'var(--red)';
        msg.style.display  = 'block';
        msg.style.color    = 'var(--red)';
        msg.textContent    = '✗ Les mots de passe ne correspondent pas';
      }
    });

    // Remettre à zéro si le champ de confirmation est vidé
    pwd2.addEventListener('blur', function(){
      if(!this.value){
        field2.style.borderColor = '';
        msg.style.display = 'none';
      }
    });
  })();

  // VÉRIFICATION CGU obligatoire à l'inscription
  (function(){
    var fReg2 = document.getElementById('form-register');
    if(!fReg2) return;
    var cguCheck = fReg2.querySelector('input[type="checkbox"]');
    var bReg2 = document.getElementById('btn-register') || fReg2.querySelector('.btn-modal');
    if(!cguCheck || !bReg2) return;
    function syncCgu(){
      bReg2.style.opacity = cguCheck.checked ? '1' : '0.5';
      bReg2.style.pointerEvents = cguCheck.checked ? 'auto' : 'none';
      bReg2.title = cguCheck.checked ? '' : 'Veuillez accepter les conditions générales';
    }
    cguCheck.addEventListener('change', syncCgu);
    syncCgu();
  })();

  // DÉCONNEXION
  var bOut=document.getElementById('btn-logout');
  if(bOut) bOut.addEventListener('click',async function(e){
    e.preventDefault();
    await sb.auth.signOut();
    // Effacement sécurisé des données sensibles en mémoire
    if(window._iaUserData){
      window._iaUserData.formations=0;
      window._iaUserData.certifs=0;
      window._iaUserData.progression=0;
      window._iaUserData.prenom='';
      window._iaUserData.nom='';
      window._iaUserData.email='';
      window._iaUserData.plan=null;
    }
    // Réinitialisation du compteur de tentatives
    resetAttempts && resetAttempts();
    if(window.setAuthState) setAuthState(false);
    if(window._syncProfilStats) _syncProfilStats();
    if(window.showToast) showToast('Déconnecté','À bientôt !');
  });

  // IDs des elements avec leurs noms hardcodes
  function fixHardcodedNames(){
    var dd=document.getElementById('dd-user-name');
    var ph=document.getElementById('phc-name');
    if(dd&&dd.textContent.trim()==='Alex Bernard') dd.textContent='';
    if(ph&&ph.textContent.trim()==='Alex Bernard') ph.textContent='';
  }

  // SESSION PERSISTANTE + retour du lien de confirmation email

  // ── AUTO-LOGOUT PAR INACTIVITÉ ───────────────────────────────────────────
  (function() {
    var INACTIVITY_LIMIT = 20 * 60 * 1000;  // 20 minutes
    var WARNING_BEFORE   =  2 * 60 * 1000;  // avertissement 2 min avant
    var _timer = null;
    var _warnTimer = null;
    var _warnToast = null;

    function clearTimers() {
      if (_timer)     { clearTimeout(_timer);     _timer = null; }
      if (_warnTimer) { clearTimeout(_warnTimer); _warnTimer = null; }
    }

    function removeWarnToast() {
      if (_warnToast && _warnToast.parentNode) {
        _warnToast.parentNode.removeChild(_warnToast);
        _warnToast = null;
      }
    }

    function showWarning() {
      removeWarnToast();
      _warnToast = document.createElement('div');
      _warnToast.id = 'inactivity-warn';
      _warnToast.innerHTML =
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
          '<div>' +
            '<div style="font-weight:700;font-size:.88rem;color:#92400e">Session bientôt expirée</div>' +
            '<div style="font-size:.78rem;color:#b45309;margin-top:2px">Déconnexion dans 2 minutes par inactivité.</div>' +
          '</div>' +
          '<button id="inact-stay" style="margin-left:8px;padding:6px 14px;background:#f59e0b;color:#fff;border:none;border-radius:8px;font-size:.78rem;font-weight:600;cursor:pointer">Rester connecté</button>' +
        '</div>';
      _warnToast.style.cssText = [
        'position:fixed','bottom:24px','left:50%','transform:translateX(-50%)',
        'background:#fffbeb','border:1.5px solid #f59e0b','border-radius:14px',
        'padding:14px 20px','z-index:9999','box-shadow:0 8px 32px rgba(0,0,0,.15)',
        'max-width:420px','width:calc(100% - 48px)','animation:pfIn .3s ease both'
      ].join(';');
      document.body.appendChild(_warnToast);

      var stayBtn = document.getElementById('inact-stay');
      if (stayBtn) {
        stayBtn.addEventListener('click', function() {
          removeWarnToast();
          resetInactivityTimer();
        });
      }
    }

    function doAutoLogout() {
      if (!window._iaConnected) return;
      removeWarnToast();
      clearTimers();
      // Déconnexion Supabase
      if (window._sb) window._sb.auth.signOut();
      // Reset UI
      if (window._iaUserData) {
        window._iaUserData.formations = 0;
        window._iaUserData.certifs = 0;
        window._iaUserData.progression = 0;
        window._iaUserData.prenom = '';
        window._iaUserData.plan = null;
      }
      if (window.setAuthState) setAuthState(false);
      if (window._syncProfilStats) _syncProfilStats();
      // Fermer tous les panels ouverts
      ['pfd','pcd','pcr'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) { el.classList.remove('open'); el.style.display = 'none'; }
      });
      document.body.style.overflow = '';
      // Toast de déconnexion
      if (window.showToast) showToast('Session expirée', 'Vous avez été déconnecté pour inactivité.');
    }

    function resetInactivityTimer() {
      if (!window._iaConnected) return;
      clearTimers();
      removeWarnToast();
      _warnTimer = setTimeout(showWarning,   INACTIVITY_LIMIT - WARNING_BEFORE);
      _timer     = setTimeout(doAutoLogout,  INACTIVITY_LIMIT);
    }

    // Écouter toute activité utilisateur
    var EVENTS = ['mousemove','mousedown','keydown','touchstart','scroll','click'];
    var _throttle = null;
    function onActivity() {
      if (!window._iaConnected) return;
      if (_throttle) return;
      _throttle = setTimeout(function() {
        _throttle = null;
        resetInactivityTimer();
      }, 1000); // throttle 1s pour ne pas spammer
    }

    EVENTS.forEach(function(ev) {
      document.addEventListener(ev, onActivity, { passive: true });
    });

    // Démarrer/arrêter selon l'état de connexion
    var _origSetAuthState = null;
    var _checkInterval = setInterval(function() {
      if (window.setAuthState && window.setAuthState !== _origSetAuthState) {
        _origSetAuthState = window.setAuthState;
        window.setAuthState = function(connected) {
          _origSetAuthState(connected);
          if (connected) {
            resetInactivityTimer();
          } else {
            clearTimers();
            removeWarnToast();
          }
        };
        clearInterval(_checkInterval);
      }
    }, 200);

    // Si déjà connecté au moment du chargement
    setTimeout(function() {
      if (window._iaConnected) resetInactivityTimer();
    }, 2000);

  })();
  // ─────────────────────────────────────────────────────────────────────────

  sb.auth.onAuthStateChange(async function(event, session){
    if((event==='SIGNED_IN' || event==='USER_UPDATED' || event==='TOKEN_REFRESHED') && session){
      // Retour depuis le lien de confirmation email
      if(window.location.hash && window.location.hash.indexOf('access_token') !== -1){
        _waitingConfirmation = false;
        window.history.replaceState(null, '', window.location.pathname);
        await onSignedIn(session);
        if(window.showToast) showToast('Email confirmé !', 'Bienvenue, votre compte est activé.');
        return;
      }
      // Ne pas connecter si on attend une confirmation email
      if(_waitingConfirmation) return;
      await onSignedIn(session);
    }
    if(event==='SIGNED_OUT'){
      _waitingConfirmation = false;
      if(window.setAuthState) setAuthState(false);
      clearAuthForms();
    }
  });

  sb.auth.getSession().then(async function(ref){
    var session = ref.data && ref.data.session;
    if(session) await onSignedIn(session);
    else fixHardcodedNames();
  });

})();
