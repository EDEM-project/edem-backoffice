const translations = {
  fr: {
    // Nav
    'nav-projet': 'Le projet',
    'nav-publications': 'Publications',
    'nav-equipe': 'Équipe',
    'nav-contact': 'Contact',
    'nav-actualites': 'Actualités',

    // Hero (data-i18n-html keys contain HTML)
    'hero-title': 'Expliquer les IA<br/>Agricoles',
    'hero-desc': 'Les modèles de deep learning cartographient nos champs depuis l\'espace mais personne ne comprend pourquoi ils décident ce qu\'ils décident. <strong>EDEM change ça.</strong>',
    'hero-cta': 'Découvrir le projet',
    'hero-partners': 'En partenariat avec',

    // News section
    'news-eyebrow': 'Actualités',
    'news-heading': 'Les dernières nouvelles<br/>du <em>projet</em>',
    'news-all-pubs': 'Toutes les publications',
    'news-read-more': 'Lire la suite',
    'news-empty': 'Aucune actualité pour le moment.',

    // Research section
    'research-eyebrow': 'Recherche',
    'research-heading': 'Une recherche pour<br/>l\'intérêt de <em>l\'humanité</em>',
    'research-desc': 'Chercheurs et agriculteurs se sont réunis pour trouver une solution : l\'intelligence artificielle peut épauler les professionnels agricoles dans leurs prises de décisions, en rendant les modèles satellites compréhensibles et actionnables.',
    'research-cta': 'Voir les publications',

    // Team section
    'team-heading': 'Une équipe de chercheurs<br/><em>déterminée</em>',
    'team-desc': 'Les membres du laboratoire ETIS combinent expertise en apprentissage automatique, traitement d\'images satellite et agronomie. Leur objectif commun : rendre l\'IA agricole transparente, fiable et utile sur le terrain.',
    'team-cta': 'Voir l\'équipe',

    // Footer
    'footer-brand-desc': 'Expliquer les IA Agricoles.<br/>Un projet ANR porté par le laboratoire ETIS,<br/>CY Cergy Paris Université &amp; ENSEA.',
    'footer-rester': 'Rester informé',
    'btn-envoyer': 'Envoyer',

    // Publications page
    'search-placeholder': 'Rechercher…',
    'filter-all': 'toutes',
    'filter-recherche': 'recherches',
    'filter-rapport': 'rapports',
    'filter-article': 'articles',
    'btn-consulter': 'Consulter →',

    // Publication detail page
    'label-resume': 'Résumé',
    'label-explication': 'Explication',
    'label-code': 'Extrait de code',
    'btn-copier': 'Copier',
    'btn-copie': 'Copié !',
    'btn-voir-pdf': 'Voir PDF',
    'sidebar-autres': 'Autres publications',
    'sidebar-tags': 'Tags',
    'soumis-le': 'Soumis le',
    'ecrit-par': 'Écrit par',
    'voir-toutes': 'Voir toutes les publications →',
    'no-autres': 'Aucune autre publication.',

    // Team page
    'equipe-label': 'Membres du projet',
    'equipe-titre': 'L\'équipe de recherche',
    'btn-profil': 'Voir le profil →',
    'section-presentation': 'Présentation',
    'section-recentes': 'Publications récentes',

    // Shared
    'loading': 'Chargement…',
    'no-publications': 'Aucune publication trouvée.',
    'no-membres': 'Aucun membre pour le moment.',
  },

  en: {
    // Nav
    'nav-projet': 'The project',
    'nav-publications': 'Publications',
    'nav-equipe': 'Team',
    'nav-contact': 'Contact',
    'nav-actualites': 'News',

    // Hero
    'hero-title': 'Explaining<br/>Agricultural AI',
    'hero-desc': 'Deep learning models map our fields from space, but nobody understands why they make the decisions they do. <strong>EDEM changes that.</strong>',
    'hero-cta': 'Discover the project',
    'hero-partners': 'In partnership with',

    // News section
    'news-eyebrow': 'News',
    'news-heading': 'The latest<br/><em>project</em> news',
    'news-all-pubs': 'All publications',
    'news-read-more': 'Read more',
    'news-empty': 'No news yet.',

    // Research section
    'research-eyebrow': 'Research',
    'research-heading': 'Research for<br/>the benefit of <em>humanity</em>',
    'research-desc': 'Researchers and farmers have come together to find a solution: artificial intelligence can support agricultural professionals in their decision-making by making satellite models understandable and actionable.',
    'research-cta': 'View publications',

    // Team section
    'team-heading': 'A team of dedicated<br/><em>researchers</em>',
    'team-desc': 'Members of the ETIS laboratory combine expertise in machine learning, satellite image processing and agronomy. Their shared goal: making agricultural AI transparent, reliable and useful in the field.',
    'team-cta': 'View the team',

    // Footer
    'footer-brand-desc': 'Explaining Agricultural AI.<br/>An ANR project led by ETIS laboratory,<br/>CY Cergy Paris Université &amp; ENSEA.',
    'footer-rester': 'Stay informed',
    'btn-envoyer': 'Send',

    // Publications page
    'search-placeholder': 'Search…',
    'filter-all': 'all',
    'filter-recherche': 'research',
    'filter-rapport': 'reports',
    'filter-article': 'articles',
    'btn-consulter': 'View →',

    // Publication detail page
    'label-resume': 'Abstract',
    'label-explication': 'Explanation',
    'label-code': 'Code snippet',
    'btn-copier': 'Copy',
    'btn-copie': 'Copied!',
    'btn-voir-pdf': 'View PDF',
    'sidebar-autres': 'Other publications',
    'sidebar-tags': 'Tags',
    'soumis-le': 'Submitted on',
    'ecrit-par': 'Written by',
    'voir-toutes': 'View all publications →',
    'no-autres': 'No other publications.',

    // Team page
    'equipe-label': 'Project members',
    'equipe-titre': 'The research team',
    'btn-profil': 'View profile →',
    'section-presentation': 'About',
    'section-recentes': 'Recent publications',

    // Shared
    'loading': 'Loading…',
    'no-publications': 'No publications found.',
    'no-membres': 'No members yet.',
  }
};

function getCurrentLang() {
  return localStorage.getItem('edem_lang') || 'fr';
}

function t(key) {
  const lang = getCurrentLang();
  return (translations[lang] && translations[lang][key]) || (translations.fr && translations.fr[key]) || key;
}

function setLang(lang) {
  localStorage.setItem('edem_lang', lang);

  // Plain text elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = (translations[lang] && translations[lang][key]) || (translations.fr && translations.fr[key]) || key;
  });

  // Elements whose content contains HTML (br, em, strong…)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    el.innerHTML = (translations[lang] && translations[lang][key]) || (translations.fr && translations.fr[key]) || key;
  });

  // Placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    el.placeholder = (translations[lang] && translations[lang][key]) || (translations.fr && translations.fr[key]) || key;
  });

  // FR / EN toggle button styles
  document.querySelectorAll('[data-lang]').forEach(btn => {
    const active = btn.dataset.lang === lang;
    btn.style.fontWeight = active ? '700' : '400';
    btn.style.color = active ? 'rgb(28,25,23)' : 'rgba(0,0,0,0.45)';
  });

  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

document.addEventListener('DOMContentLoaded', () => {
  setLang(getCurrentLang());
});
