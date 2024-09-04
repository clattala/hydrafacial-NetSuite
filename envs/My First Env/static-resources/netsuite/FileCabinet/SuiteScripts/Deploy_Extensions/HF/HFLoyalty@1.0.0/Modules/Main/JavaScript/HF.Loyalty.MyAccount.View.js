// @module HF.AnnexCloud
define('HF.Loyalty.MyAccount.View'
  , [
    'hf_hfannexcloud_main.tpl',
    'HF.Loyalty.Main.SS2Model',
    'CryptoJs',
    'Backbone'
  ]
  , function (
    hf_hfannexcloud_main_tpl,
    MainSS2Model,
    CryptoJS,
    Backbone
  ) {
    'use strict';

    // @class HF.Loyalty.Main.View @extends Backbone.View
    return Backbone.View.extend({

      template: hf_hfannexcloud_main_tpl,

      initialize: function (options) {
        var self    = this;
        var PROFILE = options.application.getComponent('UserProfile');
        var LAYOUT  = options.application.getComponent('Layout');
        this.profile;

        PROFILE.getUserProfile().then(function (data) {
          self.profile = data;
          LAYOUT.cancelableTrigger('profileComponent:DataLoaded');
        });

        this.model = new MainSS2Model({});
        this.model.fetch({data: {}}).done(function (data) {
          self.model.set(data);
          self.render();
        });
      },

      events: {},

      bindings: {},

      childViews: {},

      getJWT: function getJWT() {
        var payloadUserGet = this.profile.email;

        var timestamp  = new Date();
        var UTCseconds = (timestamp.getTime() + timestamp.getTimezoneOffset() * 60 * 1000) / 1000;
        UTCseconds     = UTCseconds + 360000;

        var siteId = this.model.get('siteId');
        var sub    = "MyronDev";
        var secret = this.model.get('accesstoken');
        if (secret) {
          var a_header            = {"typ": "JWT", "alg": "HS256"};
          var getCustomerStbase64 = btoa(JSON.stringify(payloadUserGet));
          var hash                = CryptoJS.HmacSHA256(getCustomerStbase64, secret);
          var hashInBase64        = CryptoJS.enc.Base64.stringify(hash);
          console.log(hashInBase64);
          var a_payload  = {
            "sub"    : sub,
            "exp"    : UTCseconds,
            "site_id": siteId,
            "hmac"   : hashInBase64
          };
          var o_header   = btoa(JSON.stringify(a_header));
          var o_payload  = btoa(JSON.stringify(a_payload));
          var s_sing     = CryptoJS.HmacSHA256(o_header + "." + o_payload, secret);
          var base64Sign = CryptoJS.enc.Base64.stringify(s_sing);
          var s_jwt      = this.base64url(o_header) + "." + this.base64url(o_payload) + "." + this.base64url(base64Sign);
          this.jwt_token = s_jwt;
        }
      },

      base64url: function base64url(source) {
        // Encode in classical base64
        var encodedSource = source;
        // Remove padding equal characters
        encodedSource     = encodedSource.replace(/=+/, '');
        //r(*X]oĸ+Q^|(9z
        // Replace characters according to base64url specifications
        encodedSource = encodedSource.replace(/\+/g, '-');
        encodedSource = encodedSource.replace(/\//g, '_');
        return encodedSource;
      },

      //@method getContext @return HF.Loyalty.Main.View.Context

      getContext: function getContext() {
        return {
          siteId     : this.model.get('siteId'),
          email      : this.profile.email,
          firstname  : this.profile.firstname,
          lastname   : this.profile.lastname,
          accesstoken: this.jwt_token,
        };
      }
    });
  })
;
