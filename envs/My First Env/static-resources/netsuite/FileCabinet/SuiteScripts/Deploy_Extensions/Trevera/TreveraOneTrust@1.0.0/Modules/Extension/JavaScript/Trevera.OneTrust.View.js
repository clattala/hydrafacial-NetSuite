// @module Trevera.OneTrust.View
define('Trevera.OneTrust.View'
  , [
    'trevera_one_trust.tpl',
    'Backbone',
    'underscore',
    'Utils'
  ]
  , function (
    trevera_one_trust,
    Backbone,
    _,
    Utils
  ) {
    'use strict';

    // @class Trevera.OneTrust.View @extends Backbone.View
    return Backbone.View.extend({

      template: trevera_one_trust,

      childViews: {},

      events: {},

      initialize: function (options) {
        this.application = options.application;
        var self         = this;
        var LAYOUT       = this.application.getComponent('Layout');
        var ENVIRONMENT  = this.application.getComponent('Environment');
        this.config      = ENVIRONMENT.getConfig('trevera.oneTrust') || {}

        LAYOUT.on('afterShowContent', function () {
          console.log('afterShowContent', 'ot')
          self.reloadOTBanner();
        })
      },

      reloadOTBanner: function reloadOTBanner() {
        var otConsentSdk = document.getElementById("onetrust-consent-sdk");
        if (otConsentSdk) {
          otConsentSdk.remove();
        }

        if (window.OneTrust != null) {
          OneTrust.Init();

          setTimeout(function() {
            OneTrust.LoadBanner();

            var toggleDisplay = document.getElementsByClassName(
              "ot-sdk-show-settings"
            );

            for (var i = 0; i < toggleDisplay.length; i++) {
              toggleDisplay[i].onclick = function(event) {
                event.stopImmediatePropagation();
                window.OneTrust.ToggleInfoDisplay();
              };
            }
          }, 1000);
        }
      },

      getOTCookie: function getOTCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) {
          return true;
        }
      },

      //@method getContext @return Trevera.OneTrust.VView.Context
      getContext: function getContext() {
        return {
          domainHash       : this.config.domainHash,
          doNotSellEnabled : this.config.doNotSellEnabled,
          cookieListEnabled: this.config.cookieListEnabled
        };
      }
    });
  });
