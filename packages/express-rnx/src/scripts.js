/**
 * Script tag generation for rnxJS
 */

/**
 * Render rnxJS script includes
 *
 * @param {boolean} cdn Use CDN links
 * @param {string} theme Theme name ('bootstrap', 'm3', 'plugins', or null)
 * @returns {string} HTML script tags
 */
function renderScripts(cdn = true, theme = 'bootstrap') {
  if (cdn) {
    let scripts = `<!-- rnxJS from CDN -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/dist/rnx.global.js"><\/script>`;

    if (theme === 'm3') {
      scripts += '\n<link href="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/css/bootstrap-m3-theme.css" rel="stylesheet">';
    } else if (theme === 'plugins') {
      scripts += '\n<link href="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/css/plugins.css" rel="stylesheet">';
    }

    return scripts;
  } else {
    // Local file serving
    let scripts = `<!-- rnxJS from local files -->
<link href="/css/bootstrap.min.css" rel="stylesheet">
<link href="/css/bootstrap-icons.min.css" rel="stylesheet">
<script src="/js/rnx.global.js"><\/script>`;

    if (theme === 'm3') {
      scripts += '\n<link href="/css/bootstrap-m3-theme.css" rel="stylesheet">';
    } else if (theme === 'plugins') {
      scripts += '\n<link href="/css/plugins.css" rel="stylesheet">';
    }

    return scripts;
  }
}

module.exports = { renderScripts };
