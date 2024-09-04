// @module Trevera.Promotions.Extension.View.js
define('Promotions.CartLine.View'
  , [
    'Backbone.View'
    , 'trevera_promotions_cart_line_.tpl'
    , 'Promotions.Helpers'
    , 'underscore'
  ]
  , function (
    BackboneView
    , trevera_promotions_cart_line_tpl
    , Helpers
    , _
  ) {
    'use strict';

    return Backbone.View.extend({

      template: trevera_promotions_cart_line_tpl,

      initialize: function initialize(options) {
        console.log('here', this)
        this.appliedPromotions = options.appliedPromotions;
        this.line              = options.line;
        this.template          = trevera_promotions_cart_line_tpl;
        this.application       = options.application;
        this.LAYOUT            = options.application.getComponent('Layout');
        this.CART              = options.application.getComponent('Cart');
        this.PROFILE           = options.application.getComponent('UserProfile');
        this.profile_model;

        var self = this;

        this.LAYOUT.cancelableOn('appliedPromotions:loaded', function (data) {
          console.log('appliedPromotions:loaded');
          self.appliedPromotions = data;
          self.render();
        })
        /*this.model.on('change', function (data) {
          self.render();
        })*/
      },

      getContext: function getContext() {
        console.log('promotions', this.appliedPromotions, this.line);
        var options        = this.line && this.line.options || [];
        var ctx = {
          showRemove: true,
          lineId: this.line.internalid
        }
        if (_.size(options) > 0) {
          var promotionField = _.findWhere(options, {cartOptionId: 'custcol_custom_promotion_used'});
          if (promotionField && promotionField.value) {
            var matchingPromotion = _.where(this.appliedPromotions, {promo_code: promotionField.value.internalid});
            if (matchingPromotion) {
              _.extend(ctx, {
                showRemove: !!matchingPromotion ? !matchingPromotion.is_auto_apply : true
              })
            }
          }
        }
        return ctx
      }

    });
  });
