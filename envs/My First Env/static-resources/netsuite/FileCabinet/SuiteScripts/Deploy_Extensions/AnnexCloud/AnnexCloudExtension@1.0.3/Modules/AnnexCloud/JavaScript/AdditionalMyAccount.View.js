define('AdditionalMyAccount.View', [
  'Backbone',
  'QuestionsAndAnswersModule.Model',
  'Profile.Model',
  'additional_myaccount_view.tpl',
  'CryptoJs',
  'jQuery',
  'Utils'
], function (
  Backbone,
  QuestionsAndAnswersModuleModel,
  ProfileModel,
  additionalMyAccountViewTpl,
  CryptoJS,
  jQuery,
  Utils
) {
  return Backbone.View.extend({
    template          : additionalMyAccountViewTpl,
    initialize        : function (options) {
      var self          = this;
      this.profileModel = ProfileModel.getInstance();
      this.model        = new QuestionsAndAnswersModuleModel();
      this.model.fetch({
        data: {
          "id": 'myaccount'
        }
      }).done($.proxy(function (data) {
      }, this));
      this.model.on('change', this.render, this);
      //}


    },
    getBreadcrumbPages: function () {
      return [{text: Utils.translate('Loyalty Rewards'), href: '/loyalty'}]
    },
    getContext        : function () {

      var profile = this.profileModel;

      function base64url(source) {
        // Encode in classical base64
        encodedSource = source;

        // Remove padding equal characters
        encodedSource = encodedSource.replace(/=+/, '');
        //r(*X]oĸ+Q^|(9z
        // Replace characters according to base64url specifications
        encodedSource = encodedSource.replace(/\+/g, '-');
        encodedSource = encodedSource.replace(/\//g, '_');
        return encodedSource;
      }

      // JWT Start Here
      // var key = this.model.attributes.accesstoken;
      var payloadUserGet = profile.get('email');

      var timestamp  = new Date();
      var UTCseconds = (timestamp.getTime() + timestamp.getTimezoneOffset() * 60 * 1000) / 1000;
      UTCseconds     = UTCseconds + 360000;

      var siteId = this.model.attributes.siteId;
      var sub    = "MyronDev";
      var secret = this.model.attributes.accesstoken;
      if (secret) {
        var a_header = {
          "typ": "JWT",
          "alg": "HS256"
        };

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
        var s_jwt      = base64url(o_header) + "." + base64url(o_payload) + "." + base64url(base64Sign);
        this.jwt_token = s_jwt;

        return {
          siteId     : this.model.attributes.siteId,
          email      : profile.get('email'),
          firstname  : profile.get('firstname'),
          lastname   : profile.get('lastname'),
          accesstoken: this.jwt_token,
        };

      }
    }
  });
});
