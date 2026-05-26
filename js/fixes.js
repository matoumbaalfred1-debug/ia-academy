(function() {
  function initPcdButtons() {
    var btnStart = document.getElementById('pcd-btn-start');
    var btnTry   = document.getElementById('pcd-btn-try');

    if (btnStart && !btnStart._pcdInit) {
      btnStart._pcdInit = true;
      btnStart.addEventListener('click', async function(e) {
        e.preventDefault();
        var courseId = window._currentCourseId || 'ia-gen';
        if (!window._iaConnected) {
          var overlay = document.getElementById('modal-auth');
          if (overlay) { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
          var goReg = document.getElementById('go-register');
          if (goReg) goReg.click();
          return;
        }
        // Ferme le panel pcd
        var pcd = document.getElementById('pcd');
        if (pcd) { pcd.classList.remove('open'); pcd.style.display = 'none'; document.body.style.overflow = ''; }
        // Lance enrollment + reader
        if (typeof enrollAndStart === 'function') {
          await enrollAndStart(courseId);
        } else if (window.openCourseReader) {
          window.openCourseReader(courseId);
        }
      });
    }

    if (btnTry && !btnTry._pcdInit) {
      btnTry._pcdInit = true;
      btnTry.addEventListener('click', function(e) {
        e.preventDefault();
        var courseId = window._currentCourseId || 'ia-gen';
        // Ferme le panel pcd
        var pcd = document.getElementById('pcd');
        if (pcd) { pcd.classList.remove('open'); pcd.style.display = 'none'; document.body.style.overflow = ''; }
        // Ouvre directement le reader en mode essai
        if (window.openCourseReader) window.openCourseReader(courseId);
      });
    }
  }

  // Init au chargement + retry pour s'assurer que les boutons existent
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPcdButtons);
  } else {
    initPcdButtons();
    setTimeout(initPcdButtons, 500);
  }
})();
