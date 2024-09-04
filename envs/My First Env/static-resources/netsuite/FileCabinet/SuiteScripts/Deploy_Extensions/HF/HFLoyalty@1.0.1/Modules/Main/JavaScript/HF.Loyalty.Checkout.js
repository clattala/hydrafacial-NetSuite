define('HF.Loyalty.Checkout'
  , [
    'HF.Loyalty.Cart.View',
    'HF.Loyalty.Promotions.View',
    'HF.OrderWizard.Module.PointsRedemption',
    'underscore'
  ]
  , function (
    HFCartPointsView,
    HFCartPromotionsView,
    HFOrderWizardModulePointsRedemption,
    _
  ) {
    'use strict';

    return {
      mountToApp: function mountToApp(container) {
        var CHECKOUT      = container.getComponent('Checkout');
        var LAYOUT        = container.getComponent('Layout');
        var MYACCOUNTMENU = container.getComponent('MyAccountMenu');
        var ENVIRONMENT   = container.getComponent('Environment');
        var config        = ENVIRONMENT.getConfig('hf.loyalty');

        if (config.enabled) {
          if (CHECKOUT) {
            // we want to override the native view here
            LAYOUT.addChildView('CartPromocodeListView', function PromocodeList() {
              return new HFCartPromotionsView({ application: container });
            });

            CHECKOUT.addChildViews('Wizard.View', {
              'PromocodeList': {
                'HFLoyaltyPoints.View': {
                  childViewIndex      : 6,
                  childViewConstructor: function () {
                    return new HFCartPointsView({ application: container });
                  }
                }
              }
            });

            /*CHECKOUT.addModuleToStep({
              step_url: 'review', module: {
                id: 'hf_loyalty_redemption', index: 5, classname: 'HF.OrderWizard.Module.PointsRedemption'
              }
            });*/

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
                var model            = LiveOrderModel.getInstance();
                var options          = model.get('options');
                var numPointsApplied = options['custbody_hf_num_points_redeemed'] || 0
                console.log('context', context, model);
                return {
                  isLoyalty    : (context.code.indexOf('LRP_') > -1 || context.code.indexOf('HFLOY_') > -1),
                  pointsApplied: numPointsApplied
                }
              }
            )
          }

          if (MYACCOUNTMENU) {
            MYACCOUNTMENU.addGroup({
              id   : 'loyalty',
              index: 6,
              url  : 'loyalty',
              name : _.translate('Loyalty Rewards')
            });
          }
        }
      }
    };
  });
