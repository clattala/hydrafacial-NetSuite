// @module HF.Loyalty
define('HF.Loyalty.Cart.View'
  , [
    'hf_loyalty_points.tpl',
    'HF.Loyalty.Main.SS2Model',
    'HF.Loyalty.Helpers',
    'Backbone',
    'underscore'
  ]
  , function (
    hf_points_tpl,
    LoyaltyConfigModel,
    LoyaltyHelpers,
    Backbone,
    _
  ) {
    'use strict';

    // @class HF.Loyalty.Main.View @extends Backbone.View
    return Backbone.View.extend({

      template: hf_points_tpl,

      initialize: function (options) {
        var self         = this;
        self.pointsRatio = 0.01;
        var PROFILE      = options.application.getComponent('UserProfile');
        this.CART        = options.application.getComponent('Cart');
        this.profile     = {};
        this.total       = 0;

        this.loyaltyConfig = new LoyaltyConfigModel();

        this.loyaltyConfig.fetch({ data: { action: 'getUserPoints' } }).done(function (data) {
          self.loyaltyConfig.set(data);
          LoyaltyHelpers.getPointsFromCart(self.CART).done(function () {
            self.render();
          })
        })

        PROFILE.getUserProfile().then(function (data) {
          self.profile = data;
          self.render();
        });
      },

      //@method getContext @return HF.Loyalty.Main.View.Context
      getContext: function getContext() {
        var pointsEarned = LoyaltyHelpers.getEarnedPointsData(this.loyaltyConfig);
        //console.log('cart get context', pointsEarned)
        return {
          pointsMessage: pointsEarned.message,
          earnedPoints : pointsEarned.pointsEarned > 0,
          isLoggedIn   : this.profile.isloggedin
        };
      }
    });
  })
;
