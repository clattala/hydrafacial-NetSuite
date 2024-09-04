// @module Trevera.Promotions.Extension.View.js
define('Promotions.Extension.View'
  , [
    'Backbone.View'
    , 'trevera_promotions_extension.tpl'
    , 'Promotions.Extension.SS2Model'
    , 'Promotions.Helpers'
  ]
  , function (
    BackboneView
    , trevera_promotions_tpl
    , PromotionsModel
    , Helpers
  ) {
    'use strict';

    return Backbone.View.extend({

      template: trevera_promotions_tpl,

      initialize: function initialize(options) {
        this.model       = PromotionsModel.getInstance();
        this.template    = trevera_promotions_tpl;
        this.application = options.application;
        this.LAYOUT      = options.application.getComponent('Layout');
        this.CART        = options.application.getComponent('Cart');
        this.PROFILE     = options.application.getComponent('UserProfile');
        this.profile_model;

        this.promocode = Helpers.getCleaningKitPromotion();

        this.LAYOUT.on('promotionsDataLoaded', function (data) {
          console.log('promotionsDataLoaded');
        })

        var self = this;

      },

      handleAddToCart: function (promoCode) {
        var self = this;
        self.application.getComponent('Cart').getLatestAddition().then(function (line) {
          if (line) {
            jQuery('[data-view="promocode-message-placeholder"]').empty();
            var isPromotionLine = Helpers.isPromotionLine(line);
            if (!!isPromotionLine) {
              var promotionField = _.findWhere(line.options, {cartOptionId: 'custcol_custom_promotion_used'});
              if (promotionField && promotionField.value && promotionField.value.internalid == promoCode) {
                Backbone.history.navigate('cart', {trigger: true, replace: true})
                self.LAYOUT.showMessage({
                  message  : 'Success! Your cleaning kit is in your <a href="/cart">cart</a>.',
                  type     : 'success',
                  selector : 'promocode-message-placeholder',
                  closeable: false
                }, 100);
              }
              else {
                self.LAYOUT.showMessage({
                  message  : 'Looks like you\'ve already claimed your cleaning kit for this month.',
                  type     : 'warning',
                  selector : 'promocode-message-placeholder',
                  closeable: false
                }, 100);
              }
            }
            else {
              self.LAYOUT.showMessage({
                message  : 'Looks like you\'ve already claimed your cleaning kit for this month.',
                type     : 'warning',
                selector : 'promocode-message-placeholder',
                closeable: false
              }, 100);
            }
          }
          else {
            self.LAYOUT.showMessage({
              message  : 'Looks like you\'ve already claimed your cleaning kit for this month.',
              type     : 'warning',
              selector : 'promocode-message-placeholder',
              closeable: false
            }, 100);
          }
        })
      },

      getPromotionsData: function () {
        var self = this;
        PromotionsModel.getPromise({user: this.profile_model.internalid}).done(function promotionsDataLoaded() {
          self.model = PromotionsModel.getInstance();
          jQuery('[data-view="promocode-message-placeholder"]').empty();
          if (self.model.get('promotions')) {
            var promotion = _.find(self.model.get('promotions'), {'promocode': self.promocode});
            if(promotion && promotion.redemption.canClaim) {
              var lines = [];
              lines.push({
                item    : {
                  internalid: 120 // cleaning kit
                },
                quantity: promotion.eligibility.numberWarranties - promotion.redemption.numberClaimed,
                options : [{
                  value       : {
                    internalid: promotion.promocode
                  },
                  cartOptionId: 'custcol_custom_promotion_used',
                  label       : 'Promotion Used'
                }]
              });

              self.CART.addLines({lines: lines}).fail(function (resp) {
                console.log(resp);
                self.LAYOUT.showMessage({
                  message  : 'Success! Your cleaning kit is in your <a href="/cart">cart</a>.',
                  type     : 'success',
                  selector : 'promocode-message-placeholder',
                  closeable: false
                }, 100);
              }).then(function (resp) {
                console.log('success', resp);
                if(resp.length > 0) {
                  self.LAYOUT.showMessage({
                    message  : 'Success! Your cleaning kit is in your <a href="/cart">cart</a>.',
                    type     : 'success',
                    selector : 'promocode-message-placeholder',
                    closeable: false
                  }, 100);
                }
                else {
                  self.LAYOUT.showMessage({
                    message  : 'Looks like you\'ve already claimed your cleaning kit for this month.',
                    type     : 'warning',
                    selector : 'promocode-message-placeholder',
                    closeable: false
                  }, 100);
                }
              });
            }
            else {
              self.LAYOUT.showMessage({
                message  : 'Looks like you\'ve already claimed your cleaning kit for this month.',
                type     : 'warning',
                selector : 'promocode-message-placeholder',
                closeable: false
              }, 100);
            }
          }
        });
      },

      beforeShowContent: function () {
        var self    = this;
        var promise = jQuery.Deferred();

        this.PROFILE.getUserProfile().then(function (profile) {
          self.profile_model = profile;
          promise.resolve();
          if (self.profile_model.isloggedin) {
            self.getPromotionsData();
          }
        });

        return promise;
      },

      getContext: function getContext() {
        console.log('promotions', this.profile_model)
        return {
          isLoggedIn: this.profile_model && this.profile_model.isloggedin
        }
      }

    });
  });
