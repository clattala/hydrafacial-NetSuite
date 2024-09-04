/*
 © 2021 Trevera.
 User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

// @module OneTrust
define('Trevera.OneTrust'
  , [
    'Trevera.OneTrust.View',
    'jQuery',
    'underscore'
  ]
  , function (
    OneTrustView,
    jQuery,
    _
  ) {
    'use strict';

    //@class OneTrustModule @extend ApplicationModule
    return {

      //@method mountToApp
      //@param {ApplicationSkeleton} application
      //@return {Void}
      mountToApp: function mountToApp(container) {
        console.log('mountToAPP OneTrust');
        var self = this;
        var ENVIRONMENT    = container.getComponent('Environment');
        var LAYOUT         = container.getComponent('Layout');
        var oneTrustConfig = ENVIRONMENT.getConfig('trevera.oneTrust') || {};
        if (oneTrustConfig.enabled) {
          LAYOUT.addChildView('Footer', function () {
            return new OneTrustView({application: container});
          });
        }

        // This is handled in the SSP now because it won't work via the code...
        /*LAYOUT.on('afterShowContent', function () {
          /!**
           * <script src="https://cdn.cookielaw.org/scripttemplates/otSDKStub.js" type="text/javascript" charset="UTF-8" data-domain-script="{{domainHash}}"></script>
           * <script type="text/javascript"> function OptanonWrapper() { } </script>
           **!/

          jQuery('head').prepend('<script src="https:\/\/cdn.cookielaw.org\/scripttemplates\/otSDKStub.js" type="text\/javascript" charset="UTF-8" data-domain-script="' + oneTrustConfig.domainHash + '"><\/script>');
          jQuery('head').append('<script type="text\/javascript"> function OptanonWrapper() { } <\/script>');

          /!*var script  = document.createElement("script");
          script.type = 'text/javascript';
          script.src  = 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js';
          document.head.appendChild(script);*!/
        });*/

      }
    };
  });
