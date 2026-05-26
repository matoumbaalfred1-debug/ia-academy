(function() {

  var THEME_GRADIENTS = {
    'ia':           'linear-gradient(135deg,#3B35FF,#8B5CF6)',
    'automatisation':'linear-gradient(135deg,#FF9500,#FF2D78)',
    'data':         'linear-gradient(135deg,#8B5CF6,#FF2D78)',
    'developpement':'linear-gradient(135deg,#3B35FF,#00C96B)',
    'default':      'linear-gradient(135deg,#5B21F5,#00C8FF)'
  };

  var LEVEL_MAP = {
    'debutant':      'Débutant',
    'intermediaire': 'Intermédiaire',
    'avance':        'Avancé'
  };

  function getGradient(course) {
    if (course.theme) return THEME_GRADIENTS[course.theme] || THEME_GRADIENTS['default'];
    var t = (course.title || '').toLowerCase();
    if (t.includes('n8n') || t.includes('automat')) return THEME_GRADIENTS['automatisation'];
    if (t.includes('data') || t.includes('python')) return THEME_GRADIENTS['data'];
    if (t.includes('développ') || t.includes('developpement')) return THEME_GRADIENTS['developpement'];
    return THEME_GRADIENTS['ia'];
  }

  function getTheme(course) {
    if (course.theme) return course.theme;
    var t = (course.title || '').toLowerCase();
    if (t.includes('n8n') || t.includes('automat')) return 'automatisation';
    if (t.includes('data') || t.includes('python')) return 'data';
    if (t.includes('développ') || t.includes('developpement')) return 'developpement';
    return 'ia';
  }

  function getLevel(course) {
    return course.level || 'debutant';
  }

  function buildCourseRow(course) {
    var gradient = getGradient(course);
    var theme    = getTheme(course);
    var level    = getLevel(course);
    var levelLabel = LEVEL_MAP[level] || level;
    var title    = course.title || 'Formation';
    var desc     = course.description || '';
    var duration = course.duration || '';
    var price    = course.price != null ? course.price + '€' : 'Gratuit';
    var emoji    = course.emoji || '🎓';

    return '<div class="course-row" data-level="' + level + '" data-theme="' + theme + '" data-course-id="' + (course.slug || course.id) + '">' +
      '<div class="cr-thumb" style="background:' + gradient + '">' +
        (course.image_url
          ? '<img src="' + course.image_url + '" alt="' + title + '" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">'
          : '<span style="font-size:44px;display:inline-flex;align-items:center;justify-content:center;filter:drop-shadow(0 4px 12px rgba(0,0,0,.2))">' + emoji + '</span>') +
      '</div>' +
      '<div class="cr-body">' +
        '<div class="cr-tag"><span class="cr-tag-pill">Parcours complet</span>' +
          (course.is_new ? '<span class="cr-badge cr-badge-new">✦ Nouveau</span>' : '') +
          (course.is_popular ? '<span class="cr-badge cr-badge-hot">🔥 Populaire</span>' : '') +
        '</div>' +
        '<div class="cr-title">' + title + '</div>' +
        '<div class="cr-desc">' + desc + '</div>' +
        '<div class="cr-meta">' +
          '<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' + levelLabel + '</span>' +
          (duration ? '<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' + duration + '</span>' : '') +
        '</div>' +
      '</div>' +
      '<div class="cr-right">' +
        '<div class="cr-price" style="font-weight:700;font-size:1.1rem;color:var(--blue);margin-bottom:8px">' + price + '</div>' +
        '<button class="btn-voir">Voir le programme</button>' +
      '</div>' +
    '</div>';
  }

  async function loadCatalogue() {
    var container = document.getElementById('pf-courses-list');
    if (!container) return;

    // Attendre que Supabase soit dispo
    var tries = 0;
    while (!window._sb && tries < 20) {
      await new Promise(function(r){ setTimeout(r, 200); });
      tries++;
    }
    if (!window._sb) {
      container.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-3);font-size:.85rem">Impossible de charger les formations.</div>';
      return;
    }

    try {
      var res = await window._sb
        .from('courses')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      var courses = (res.data && res.data.length) ? res.data : null;

      if (!courses) {
        container.innerHTML = '<div style="text-align:center;padding:48px 20px;color:var(--text-3)">' +
          '<div style="font-size:2rem;margin-bottom:12px">📚</div>' +
          '<div style="font-weight:600;color:var(--text-2)">Aucune formation disponible</div>' +
          '<div style="font-size:.82rem;margin-top:6px">Revenez bientôt !</div>' +
          '</div>';
        return;
      }

      // Mise à jour compteur
      var countEl = document.getElementById('pf-result-count');
      if (countEl) countEl.textContent = ' ' + courses.length + ' formation' + (courses.length > 1 ? 's' : '');

      container.innerHTML = courses.map(buildCourseRow).join('');

      // Re-attacher les listeners click sur les nouvelles rows
      container.querySelectorAll('.course-row').forEach(function(row) {
        row.style.cursor = 'pointer';
        row.addEventListener('click', function() {
          var cid = row.dataset.courseId || 'ia-gen';
          if (window.openFormationDetail) window.openFormationDetail(cid);
        });
      });

      // Re-attacher applyPfFilters sur les nouvelles rows si une recherche est active
      if (window.applyPfFilters) window.applyPfFilters();

    } catch(e) {
      console.error('loadCatalogue:', e);
      container.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-3);font-size:.85rem">Erreur de chargement : ' + e.message + '</div>';
    }
  }

  // Lancer dès que le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCatalogue);
  } else {
    loadCatalogue();
  }

  // Exposer pour recharger depuis ailleurs (ex: après publication admin)
  window.loadCatalogue = loadCatalogue;

})();
