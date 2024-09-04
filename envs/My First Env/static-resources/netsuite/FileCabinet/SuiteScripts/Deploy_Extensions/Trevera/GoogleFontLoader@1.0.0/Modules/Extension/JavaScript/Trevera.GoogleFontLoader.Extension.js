define(
	'Trevera.GoogleFontLoader.Extension'
	, [
		'jQuery'
	]
	, function (
		jQuery
	) {
		'use strict';

		return {
			mountToApp: function mountToApp(container) {
				var ENVIRONMENT = container.getComponent('Environment');
				var fontConfig  = ENVIRONMENT.getConfig('scs.googleFontLoader');

				if (fontConfig && fontConfig.enabled) {
					var fonts     = _.pluck(fontConfig.fontString, 'fontName');
					var typekitID = fontConfig.typekitID;
					var config    = {};

					if (fonts && fonts.length > 0) {
						config = {"google": {"families": fonts}, "timeout": 2000};
					}

					if (typekitID && typekitID.length > 0) {
						_.extend(config, {
							typekit: {id: typekitID}
						})
					}

					window.WebFontConfig = config;

					if (SC.ENVIRONMENT.jsEnvironment === 'browser') {

						/*var $head             = jQuery('head');
						 var webfontLoader     = '<script type="text/javascript" src="'
						 + ('https:' === document.location.protocol ? 'https' : 'http') + '://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'
						 + '" async="true"></script>'
						 , webfontStyleSheet = '<link rel="stylesheet"' + 'href="https://fonts.googleapis.com/css?' + fontConfig.fontString + '">';*/

						(function (d) {
							var wf   = d.createElement('script'),
									s    = d.scripts[0];
							wf.src   =
								('https:' == document.location.protocol ? 'https' : 'http') +
								'://ajax.googleapis.com/ajax/libs/webfont/1.5.18/webfont.js';
							wf.type  = 'text/javascript';
							wf.async = 'true';
							s.parentNode.insertBefore(wf, s);
						})(document);

						/*container.getComponent('Layout').cancelableOn('afterShowContent', function () {

						 });
						 container.getComponent('Layout').on('afterShowContent', function () {
						 $head.prepend(webfontLoader);
						 });

						 container.getLayout().on('afterViewRender', function () {
						 $head.prepend(webfontLoader);
						 });*/
					}

				}

			}
		};
	});
