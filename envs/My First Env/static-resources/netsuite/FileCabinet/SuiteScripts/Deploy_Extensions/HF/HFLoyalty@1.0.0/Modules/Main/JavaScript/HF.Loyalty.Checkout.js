define('HF.Loyalty.Checkout'
  , [
    'HF.Loyalty.Cart.View',
    'HF.OrderWizard.Module.PointsRedemption',
    'underscore'
  ]
  , function (
    HFCartPointsView,
    HFOrderWizardModulePointsRedemption,
    _
  ) {
    'use strict';

    return {
      mountToApp: function mountToApp(container) {
        var CHECKOUT = container.getComponent('Checkout');

        if (CHECKOUT) {
          CHECKOUT.addChildViews('Wizard.View', {
            'PromocodeList': {
              'HFLoyaltyPoints.View': {
                childViewIndex      : 6,
                childViewConstructor: function () {
                  return new HFCartPointsView({application: container});
                }
              }
            }
          });

          CHECKOUT.addModuleToStep({
            step_url: 'review', module: {
              id: 'hf_loyalty_redemption', index: 5, classname: 'HF.OrderWizard.Module.PointsRedemption'
            }
          });

          CHECKOUT.addModuleToStep({
            step_url: 'opc', module: {
              id: 'hf_loyalty_redemption', index: 8, classname: 'HF.OrderWizard.Module.PointsRedemption'
            }
          });

          CHECKOUT.addModuleToStep({
            step_url: 'billing', module: {
              id: 'hf_loyalty_redemption', index: 8, classname: 'HF.OrderWizard.Module.PointsRedemption'
            }
          });

          var LiveOrderModel;
          try {
            LiveOrderModel = require('LiveOrder.Model');
          } catch (e) {

          }
          CHECKOUT.addToViewContextDefinition(
            'Cart.Promocode.List.Item.View'
            , 'loyaltyExtras'
            , 'object'
            , function loyaltyExtras(context) {
              var model         = LiveOrderModel.getInstance();
              var options       = model.get('options');
              var pointsApplied = options['custbody_hf_redeemed_points'] && options['custbody_hf_redeemed_points'] == 'T',
                  numPointsApplied =  options['custbody_hf_num_points_redeemed'] || 0
                , pointsCalculated = 0;
              var promotions = model.get('promocodes');
              console.log('promotions', promotions, model)
              _.each(promotions, function (promotion) {
                console.log('promotions', promotion);
                if(promotion.internalid == context.internalid) {

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
      }
    };
  });
