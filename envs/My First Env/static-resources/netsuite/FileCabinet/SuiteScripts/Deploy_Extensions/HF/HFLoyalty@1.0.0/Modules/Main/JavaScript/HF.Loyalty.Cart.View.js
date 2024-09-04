// @module HF.AnnexCloud
define('HF.Loyalty.Cart.View'
  , [
    'hf_loyalty_points.tpl',
    'HF.Loyalty.Main.SS2Model',
    'Backbone',
    'underscore'
  ]
  , function (
    hf_points_tpl,
    LoyaltyConfigModel,
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
        //var PROFILE      = options.application.getComponent('UserProfile');
        var LAYOUT       = options.application.getComponent('Layout');
        var CART         = options.application.getComponent('Cart');
        this.profile;
        this.total = 0;

        this.loyaltyConfig = new LoyaltyConfigModel();

        this.loyaltyConfig.fetch({data: {action: 'getUserPoints'}}).done(function (data) {
          self.loyaltyConfig.set(data);
          self.render();
        })

        /*PROFILE.getUserProfile().then(function (data) {
          self.profile = data;
          self.render();
        });*/

        CART.getSummary().then(function (summary) {
          self.total = summary.subtotal;
          self.render();
        });
      },

      getEarnedPointsData: function getEarnedPointsData() {
        var tierConfig = this.loyaltyConfig.get('tierConfig')
          , optedIn    = this.loyaltyConfig.get('optedIn');
        if (this.total > 0 && optedIn) {
          var pointsEarned = tierConfig.tierRatio * this.total;
          if (pointsEarned > 0) {
            return {
              message     : 'You Will Earn ' + pointsEarned.toFixed(2) + ' points.',
              pointsEarned: pointsEarned
            }
          }
          return {
            message     : 'Calculating Points',
            pointsEarned: 0
          }
        }
        return {}
      },

      //@method getContext @return HF.Loyalty.Main.View.Context
      getContext: function getContext() {
        var pointsEarned = this.getEarnedPointsData();
        return {
          pointsMessage: pointsEarned.message,
          earnedPoints : pointsEarned.pointsEarned > 0
        };
      }
    });
  })
;
