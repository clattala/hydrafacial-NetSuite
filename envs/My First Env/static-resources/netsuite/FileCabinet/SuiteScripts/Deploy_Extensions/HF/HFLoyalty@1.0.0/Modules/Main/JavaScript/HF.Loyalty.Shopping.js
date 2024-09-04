define('HF.Loyalty.Shopping'
  , [
    'HF.Loyalty.Cart.View',
    'HF.Loyalty.Main.SS2Model',
    'underscore'
  ]
  , function (
    HFCartPointsView,
    LoyaltyConfigModel,
    _
  ) {
    'use strict';

    return {
      mountToApp: function mountToApp(container) {
        var LAYOUT  = container.getComponent('Layout');
        var PDP     = container.getComponent('PDP');
        var PLP     = container.getComponent('PLP');
        var CART    = container.getComponent('Cart');
        var PROFILE = container.getComponent('UserProfile');
        var self    = this;
        this.profile;
        this.loyaltyConfig = new LoyaltyConfigModel();


        PROFILE.getUserProfile().then(function (data) {
          self.profile = data;
          if (self.profile.isloggedin) {
            self.loyaltyConfig.fetch({data: {action: 'getUserPoints'}}).done(function (data) {
              self.loyaltyConfig.set(data);
            })
          }
        });

        if (PDP) {
          PDP.addToViewContextDefinition(
            PDP.PDP_FULL_VIEW
            , 'hfLoyalty'
            , 'object'
            , function hfLoyalty(context) {
              console.log('PDP hfLoyalty', context);
              var price        = context.model.item && context.model.item.onlinecustomerprice_detail && context.model.item.onlinecustomerprice_detail.onlinecustomerprice || 0
                , tierConfig   = self.loyaltyConfig.get('tierConfig')
                , optedIn      = self.loyaltyConfig.get('optedIn');
              var pointsEarned = tierConfig && tierConfig.tierRatio * price || 0;
              if (pointsEarned > 0 && optedIn) {
                return {
                  message         : 'You Will Earn ' + pointsEarned.toFixed(2) + ' points.',
                  showPointsEarned: pointsEarned > 0
                }
              }
              return {
                message         : '',
                showPointsEarned: false
              }
            }
          );

          PDP.addToViewContextDefinition(
            PDP.PDP_QUICK_VIEW
            , 'hfLoyalty'
            , 'object'
            , function hfLoyalty(context) {
              console.log('PDP hfLoyalty', context);
              var price        = context.model.item && context.model.item.onlinecustomerprice_detail && context.model.item.onlinecustomerprice_detail.onlinecustomerprice || 0
                , tierConfig   = self.loyaltyConfig.get('tierConfig')
                , optedIn      = self.loyaltyConfig.get('optedIn');
              var pointsEarned = tierConfig && tierConfig.tierRatio * price || 0;
              if (pointsEarned > 0 && optedIn) {
                return {
                  message         : 'You Will Earn ' + pointsEarned.toFixed(2) + ' points.',
                  showPointsEarned: pointsEarned > 0
                }
              }
              return {
                message         : '',
                showPointsEarned: false
              }
            }
          );
        }

        if (PLP) {
          PLP.addToViewContextDefinition(
            'Facets.ItemCell.View'
            , 'hfLoyalty'
            , 'object'
            , function hfLoyalty(context) {
              var items      = PLP.getItemsInfo()
                , item       = _.find(items, {internalid: context.itemId})
                , tierConfig = self.loyaltyConfig.get('tierConfig')
                , optedIn    = self.loyaltyConfig.get('optedIn');

              console.log('loyaltyConfig', self.loyaltyConfig)
              var price        = item.onlinecustomerprice;
              var pointsEarned = tierConfig && tierConfig.tierRatio * price || 0;
              if (pointsEarned > 0 && optedIn) {
                return {
                  message         : 'You Will Earn ' + pointsEarned.toFixed(2) + ' points.',
                  showPointsEarned: pointsEarned > 0
                }
              }

              return {
                message         : '',
                showPointsEarned: false
              }
            }
          );
        }

        if (CART) {
          CART.addChildViews('Cart.Detailed.View', {
            'CartPromocodeListView': {
              'LoyaltyPoints.View': {
                childViewIndex      : 6,
                childViewConstructor: function () {
                  return new HFCartPointsView({application: container});
                }
              }
            }
          });
        }


        var LiveOrderModel;
        try {
          LiveOrderModel = require('LiveOrder.Model');
        } catch (e) {

        }
        LAYOUT.addToViewContextDefinition(
          'Cart.Promocode.List.Item.View'
          , 'loyaltyExtras'
          , 'object'
          , function loyaltyExtras(context) {
            var model            = LiveOrderModel.getInstance();
            var options          = model.get('options');
            var pointsApplied    = options['custbody_hf_redeemed_points'] && options['custbody_hf_redeemed_points'] == 'T',
                numPointsApplied = options['custbody_hf_num_points_redeemed'] || 0
              , pointsCalculated = 0;
            var promotions       = model.get('promocodes');
            console.log('promotions', promotions, model)
            _.each(promotions, function (promotion) {
              console.log('promotions', promotion);
              if (promotion.internalid == context.internalid) {

              }
            })
            console.log('context', context, model);
            return {
              isLoyalty    : (context.code.indexOf('LRP_') > -1 || context.code.indexOf('HFLOY_') > -1),
              pointsApplied: numPointsApplied
            }
          }
        )


      }
    };
  });
