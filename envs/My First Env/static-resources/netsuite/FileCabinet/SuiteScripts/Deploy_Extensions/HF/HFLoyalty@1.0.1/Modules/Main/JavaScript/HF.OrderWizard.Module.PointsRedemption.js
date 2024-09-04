define('HF.OrderWizard.Module.PointsRedemption'
  , [
    'Wizard.Module',
    'HF.Loyalty.Main.SS2Model',
    'hf_loyalty_points_redemption.tpl',
    'jQuery',
    'Utils',
    'underscore'
  ]
  , function (
    WizardModule,
    LoyaltyConfigModel,
    hf_loyalty_points_redemption,
    jQuery,
    Utils,
    _
  ) {
    'use strict';

    return WizardModule.extend({

      template: hf_loyalty_points_redemption,

      className: 'OrderWizard.Module.PointsRedemption',

      //@property {Object} attributes
      attributes: {
        'id'     : 'order-wizard-loyalty-points'
        , 'class': 'order-wizard-loyalty-points'
      },

      errors: [
        'ERR_OVER_MAX'
      ],

      overMaxMessage: {
        errorCode   : 'ERR_OVER_MAX',
        errorMessage: Utils.translate('You cannot redeem more points than your maximum available points.')
      },

      events: {
        'blur [data-action="validate-points"]': 'roundPoints',
        'click [data-action="redeem-points"]' : 'redeemPoints'
      },

      childViews: {},

      initialize: function () {
        var self = this;
        WizardModule.prototype.initialize.apply(this, arguments);
        this.application = this.wizard.application;
        this.wizard.model.on('change', this.render, this);
        this.application = this.wizard.application;
        this.CART        = this.application.getComponent('Cart');
        this.LAYOUT      = this.application.getComponent('Layout');
        this.isRemoving  = false;

        this.loyaltyConfig = new LoyaltyConfigModel();

        this.loyaltyConfig.fetch({data: {action: 'getUserPoints'}}).done(function (data) {
          self.loyaltyConfig.set(data);
          console.log('loyalty config fetched getUserPoints', data);
          self.getHasLoyaltyPromoApplied();
          self.render();
        });

        this.isSaving               = false;
        this.hasLoyaltyPromoApplied = false;
        this.pointsRedeemed         = 0;
        this.pointsRemaining        = 0;
        self.addCartListeners();

      },

      addCartListeners: function addCartListeners() {
        var self = this;

        this.CART.on('afterAddPromotion', function () {
          self.CART.getPromotions().then(function (promotions) {
            self.promotions = promotions;
          });
        });

        this.CART.on('afterRemovePromotion', function (data) {
          console.log('afterRemovePromotion', data)
          var removedPromotion   = _.findWhere(self.promotions, {internalid: data.internalid});
          var removedPromotionId = removedPromotion && removedPromotion.extras && removedPromotion.extras.promocodeid;

          if ((removedPromotion.code.indexOf('LRP_') > -1 || removedPromotion.code.indexOf('HFLOY_') > -1) && !self.isRemoving) {
            self.isRemoving = true;
            var options     = self.wizard.model.get('options');
            if (!!options) {
              options['custbody_hf_num_points_redeemed'] = '0';
              options['custbody_hf_redeemed_points']     = 'F';
              self.wizard.model.set('options', options);
              self.wizard.model.save().done(function (resp) {
                console.log('saved', resp)
                self.isSaving = false;
                self.loyaltyConfig.fetch({data: {action: 'removePromotion', promotionId: removedPromotionId}}).then(function (response) {
                  console.log(response)
                  if (response.status == "OK") {
                    console.log('Promotion removed');
                    self.getHasLoyaltyPromoApplied()
                  }
                  else {
                    console.log('Error removing promotion');
                    self.CART.getPromotions().then(function (promotions) {
                      self.getHasLoyaltyPromoApplied()
                      self.render();
                    });
                  }
                })
                self.isRemoving = false;
                self.render();
              })
            }

            //Delete promotion from backend

          }
        })
      },

      isActive: function () {
        return true;
      },

      submit: function () {
        return this.isValid();
      },

      /** round points value on entry */
      roundPoints: function roundPoints(e) {
        e.preventDefault();
        e.stopPropagation();
        var $target = jQuery(e.currentTarget);
        var amt     = Number($target.val());

        var pointsBalance = this.loyaltyConfig.get('pointsBalance');
        if (amt > Math.floor(pointsBalance)) $target.val(Math.floor(pointsBalance));
      },

      redeemPoints: function redeemPoints(e) {
        e.preventDefault();
        e.stopPropagation();

        var self          = this;
        var $target       = this.$('[data-action="validate-points"]');
        var pointsBalance = this.loyaltyConfig.get('pointsBalance');
        var points        = Number($target.val()); // normalize and round value.
        if (points < 1) {
          self.LAYOUT.showMessage({message: 'Points are required.', type: 'error', selector: 'Loyalty.ErrorMessage'})
        }
        else if (points > pointsBalance) {
          self.LAYOUT.showMessage({message: 'You cannot redeem more points than your maximum available points.', type: 'error', selector: 'Loyalty.ErrorMessage'});
        }
        else {
          var orderSummary   = this.wizard.model.get('summary');
          var orderSubtotal  = orderSummary.subtotal;
          var orderDiscounts = orderSummary.discounttotal;

          if (points > (orderSubtotal - orderDiscounts)) {
            self.LAYOUT.showMessage({message: 'You cannot redeem more points than the order total. Please adjust your points to redeem.', type: 'error', selector: 'Loyalty.ErrorMessage'})
          }
          else {
            this.isSaving = true;
            this.loyaltyConfig.fetch({data: {action: 'getPromotionCode', discount: points}}).done(function (data) {
              self.loyaltyConfig.set(data);
              console.log('loyalty config fetched', data);
              var response = data.response;
              if (response.promotionCode) {
                self.CART.addPromotion({promocode: response.promotionCode}).then(function (result) {
                  var options       = self.wizard.model.get('options');
                  var currentPoints = Number(options['custbody_hf_num_points_redeemed']);
                  if (_.isNaN(currentPoints)) currentPoints = 0;
                  if (!!options) {
                    options['custbody_hf_num_points_redeemed'] = (currentPoints + points).toFixed(2);
                    options['custbody_hf_redeemed_points']     = 'T';
                    self.wizard.model.set('options', options);
                    self.wizard.model.save().done(function (resp) {
                      console.log('saved', resp)
                      self.isSaving = false;
                      self.getHasLoyaltyPromoApplied();
                      self.render();
                    })
                  }
                }).fail(function (data) {
                  self.LAYOUT.showMessage({message: 'Something when wrong when redeeming your points. Please refresh the page and try again.', type: 'error', selector: 'Loyalty.ErrorMessage'})
                })
              }
              else {
                self.LAYOUT.showMessage({message: 'Something when wrong when redeeming your points. Please refresh the page and try again.', type: 'error', selector: 'Loyalty.ErrorMessage'})
              }
            })
          }
        }
      },

      setOptionsOnOrder: function setOptionsOnOrder(points) {

      },

      showModule: function () {
        return this.loyaltyConfig.get('optedIn');
      },

      getHasLoyaltyPromoApplied: function getHasLoyaltyPromoApplied() {
        var self = this;
        this.CART.getPromotions().then(function (promotions) {
          console.log('promotions fetched', promotions)
          self.promotions            = promotions;
          self.hasLoyaltyPromoApplied = false;
          self.pointsRedeemed        = 0;
          self.pointsRemaining       = self.loyaltyConfig.get('pointsBalance');
          _.each(self.promotions, function (promotion) {
            if (promotion.code.indexOf('LRP_') > -1 || promotion.code.indexOf('HFLOY_') > -1) {
              self.hasLoyaltyPromoApplied = true;
              self.pointsRedeemed         = Math.abs(promotion.rate);
              self.pointsRemaining        = Number(self.loyaltyConfig.get('pointsBalance')) + Number(promotion.rate); // rate is negative
            }
          });

          self.render();
        });

      },

      getPointsBalance: function getPointsBalance() {
        var points = Math.floor(this.loyaltyConfig.get('pointsBalance'));
        return {
          pointsBalance  : this.loyaltyConfig.get('pointsBalance'),
          pointsFormatted: Utils.formatCurrency(points)
        };
      },

      getContext: function () {
        return {
          showModule            : this.showModule(),
          loyaltyPoints         : this.getPointsBalance(),
          isSaving              : this.isSaving,
          hasLoyaltyPromoApplied: this.hasLoyaltyPromoApplied,
          pointsRedeemed        : this.pointsRedeemed,
          pointsRemaining       : !!this.pointsRemaining && this.pointsRemaining.toFixed(2) || 0.00
        }
      }
    });
  });
