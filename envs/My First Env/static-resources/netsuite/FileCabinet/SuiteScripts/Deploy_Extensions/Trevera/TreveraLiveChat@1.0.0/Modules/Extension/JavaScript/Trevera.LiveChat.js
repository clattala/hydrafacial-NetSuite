/*
 © 2021 Trevera.
 User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

// @module livechat
define('Trevera.LiveChat'
  , [
    'jQuery'
    , 'underscore'
  ]
  , function (
    jQuery
    , _) {
    'use strict';

    //@class LiveChatModule @extend ApplicationModule
    return {

      urlRoot: 'https://cdn.livechatinc.com/tracking.js'

      //@method mountToApp
      //@param {ApplicationSkeleton} application
      //@return {Void}
      , mountToApp: function mountToApp(container) {
        console.log('mountToAPP LiveChat');
        var ENVIRONMENT    = container.getComponent('Environment');
        var liveChatConfig = ENVIRONMENT.getConfig('trevera.liveChat') || {};
        if (liveChatConfig.enabled) {

          window.LIVECHAT     = {};
          window.__lc         = window.__lc || {};
          window.__lc.license = Number(liveChatConfig.license) || 12350310;
          /*window.__lc.group               = 3;
           window.__lc.chat_between_groups = false;
           window.__lc.mute_csp_errors     = false;
           window.__lc.hostname            = "secure.livechatinc.com";
           window.__lc.params              = "";
           window.__lc.skill               = 0;*/

          (function (n, t, c) {
            function i(n) {return e._h ? e._h.apply(null, n) : e._q.push(n)}

            var e = {
              _q: [], _h: null, _v: "2.0", on: function () {i(["on", c.call(arguments)])}, once: function () {i(["once", c.call(arguments)])},
              off                                                                              : function () {i(["off", c.call(arguments)])}, get: function () {
                if (!e._h) throw new Error("[LiveChatWidget] You can't use getters before load.");
                return i(["get", c.call(arguments)])
              }, call                                                                          : function () {i(["call", c.call(arguments)])}, init                      : function () {
                var n = t.createElement("script");
                n.async = !0, n.type = "text/javascript", n.src = "https://cdn.livechatinc.com/tracking.js", t.head.appendChild(n)
              }
            };
            !n.__lc.asyncInit && e.init(), n.LiveChatWidget = n.LiveChatWidget || e
          }(window, document, [].slice))
        }

        //application.getLayout().once('afterAppendView', jQuery.proxy(LiveChatModule, 'loadScript'));
      }

      // load livechat library
      , loadScript: function () {
        var self = this;
        return SC.ENVIRONMENT.jsEnvironment === 'browser' && jQuery.getScript(self.urlRoot).done(function () {
        });
      }
    };
  });
