// Runs in <head> before the page paints: picks the language (?lang=uz|ru, else saved choice)
// and marks <html> so Uzbek pages don't flash Russian text before scripts translate them.
(function () {
  // Hide the hero for a moment until the motion layer animates it in (CSS shows it anyway after 2.5 s).
  try { if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('motion-pending'); } catch (e) { /* ignore */ }
  try {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'ru' || q === 'uz') localStorage.setItem('zarda_lang', q);
    var l = q === 'ru' || q === 'uz' ? q : localStorage.getItem('zarda_lang');
    if (l === 'uz') {
      document.documentElement.lang = 'uz';
      document.documentElement.classList.add('i18n-wait');
    }
  } catch (e) { /* storage blocked: stay Russian */ }
})();
