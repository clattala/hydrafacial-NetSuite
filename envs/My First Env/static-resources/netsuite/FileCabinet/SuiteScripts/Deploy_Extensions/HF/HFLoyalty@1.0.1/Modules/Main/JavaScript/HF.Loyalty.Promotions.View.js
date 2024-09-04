// @module HF.Loyalty
define('HF.Loyalty.Promotions.View'
  , [
    'hf_loyalty_promotions.tpl',
    'HF.Loyalty.Main.SS2Model',
    'HF.Loyalty.Helpers',
    'Backbone',
    'underscore'
  ]
  , function (
    hf_loyalty_promotions_tpl,
    LoyaltyConfigModel,
    Helpers,
    Backbone,
    _
  ) {
    'use strict';

    // @class HF.Loyalty.Main.View @extends Backbone.View
    return Backbone.View.extend({

      template: hf_loyalty_promotions_tpl,

      events: {
        'click [data-action="remove-promocode"]': 'removePromotion'
      },

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
          self.render();
        })

        PROFILE.getUserProfile().then(function (data) {
          self.profile = data;
          self.render();
        });

        Helpers.getPromotionsFromCart(this.CART).done(function () {
          self.render();
        })
      },

      removePromotion: function removePromotion(evt) {
        evt.preventDefault();
        var self = this;
        var $elem = jQuery(evt.currentTarget);
        var id = $elem.data('id');
        this.CART.removePromotion({ promocode_internalid: id.toString() }).fail(function () {
          console.log("Could not remove promotion.");
        }).done(function () {
          Helpers.getPromotionsFromCart(self.CART).done(function () {
            self.render();
          })
        });
      },

      //@method getContext @return HF.Loyalty.Main.View.Context
      getContext: function getContext() {
        var pointsEarned = Helpers.getEarnedPointsData(this.loyaltyConfig, this.total);
        //console.log('cart get context', pointsEarned)
        return {
          promotions: Helpers.promotions
        };
      }
    });
  })
;
