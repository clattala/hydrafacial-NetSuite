/* eslint-disable */
define('SC.PoshThemeExtension.LoadWebFont', [
  'SC.PoshThemeExtension.Common.Configuration'
], function SCPoshThemeExtensionLoadWebFont(Configuration) {
  'use strict';

  return {
    loadModule: function loadModule() {
      if (
        Configuration.get('posh.webFonts.isWebFontEnabled') &&
        Configuration.get('posh.webFonts.isWebFontAsync')
      ) {
        window.WebFontConfig = Configuration.get('posh.webFonts.webFontConfig');

        if (SC.ENVIRONMENT.jsEnvironment === 'browser') {
          (function (d) {
            var wf = d.createElement('script'),
              s = d.scripts[0];
            wf.src =
              ('https:' == document.location.protocol ? 'https' : 'http') +
              '://ajax.googleapis.com/ajax/libs/webfont/1.5.18/webfont.js';
            wf.type = 'text/javascript';
            wf.async = 'true';
            s.parentNode.insertBefore(wf, s);
          })(document);
        }
      }
    }
  };
});

/* eslint-enable */
