define('HF.Loyalty.Helpers'
  , [
    'HF.Loyalty.Main.SS2Model',
    'underscore'
  ]
  , function (
    LoyaltyConfigModel,
    _
  ) {
    'use strict';

    return {
      loyaltyPointsTotal: 0,

      promotions: [],

      getEarnedPointsData: function getEarnedPointsData(loyaltyConfig, total) {
        if(!total) total = this.loyaltyPointsTotal;
        var tierConfig = loyaltyConfig.get('tierConfig'),
            optedIn    = loyaltyConfig.get('optedIn');
        if (total > 0 && optedIn) {
          var pointsEarned = tierConfig.tierRatio * total;
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


      getPointsFromCart: function getPointsFromCart(CART) {
        var promise = jQuery.Deferred();
        var self    = this;
        self.loyaltyPointsTotal = 0;
        CART.getLines().then(function (lines) {
          _.each(lines, function (line) {
            var isFreeGift = line && line.extras && line.extras.free_gift;
            if (line.item && line.item.extras && line.item.extras.custitem_hf_applicable_loyalty === true && line.amount > 0 && !isFreeGift) {
              self.loyaltyPointsTotal += line.amount;
            }
          })
          console.log('cart lines', lines, self.loyaltyPointsTotal);
          promise.resolve();
        });
        return promise;

      },

      getPromotionsFromCart: function getPromotionsFromCart(CART) {
        var self        = this;
        var promise     = jQuery.Deferred();
        this.promotions = [];
        CART.getPromotions().then(function (promotions) {
          console.log('promotions', promotions);
          _.each(promotions, function (promotion) {
            console.log(promotion)
            var code                 = promotion.code;
            var internalid           = promotion.internalid;
            var hide_autoapply_promo = !_.isUndefined(promotion.extras.isautoapplied)
              ? promotion.extras.applicabilityreason === 'DISCARDED_BEST_OFFER' || (promotion.extras.isautoapplied && promotion.extras.applicabilitystatus === 'NOT_APPLIED')
              : false;
            var errormsg             = '';
            if (promotion.errormsg) {
              errormsg = promotion.errormsg;
            } else if (promotion.extras.applicabilityreason === 'NO_FREE_GIFTS_ADDED') {
              errormsg = Utils.translate('Sorry, something went wrong. We couldn\'t add your gift to the order.');
            }
            self.promotions.push({
              showPromo       : !!code && !hide_autoapply_promo,
              code            : code,
              internalid      : internalid,
              isEditable      : promotion.extras.isautoapplied === false,
              showDiscountRate: !!promotion.extras.discountrate_formatted,
              discountRate    : promotion.extras.discountrate_formatted,
              showWarning     : promotion.isvalid === false || promotion.extras.applicabilitystatus === 'NOT_APPLIED',
              errorMessage    : errormsg,
              isLoyalty       : code && (code.indexOf('LRP_') > -1 || code.indexOf('HFLOY_') > -1),
              pointsApplied   : Math.abs(promotion.rate)
            })
          });

          promise.resolve();
        });

        return promise;
      }
    }
  })
