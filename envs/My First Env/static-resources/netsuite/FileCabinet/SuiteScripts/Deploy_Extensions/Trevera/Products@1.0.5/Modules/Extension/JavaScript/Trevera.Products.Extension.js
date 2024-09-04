/*
 © 2020 Trevera

 Product Customizations that should load in Checkout and MyAccount.
 This class is just a module loader

 */

define(
  'Trevera.Products.Extension'
  , [
    'Backbone'
    , 'underscore'
    , 'Utils'
  ]
  , function (
    Backbone
    , _
    , Utils
  ) {
    'use strict';

    return {
      mountToApp: function mountToApp(container) {
        var LAYOUT      = container.getComponent('Layout');
        var PROFILE     = container.getComponent('UserProfile');
        var CHECKOUT    = container.getComponent('Checkout');
        var CART        = container.getComponent('Cart');
        var ENVIRONMENT = container.getComponent('Environment');

        var profile;
        PROFILE.getUserProfile().then(function (data) {
          profile = data;
          console.log('profile data', data);
          LAYOUT.cancelableTrigger('profileComponent:DataLoaded');
        });

        if (LAYOUT) {
          LAYOUT.addToViewContextDefinition(
            'Transaction.Line.Views.Price.View'
            , 'trvExtras'
            , 'object'
            , function trvExtras(context) {
              var onlineprice = context.model.item.onlinecustomerprice;
              var pricelevel  = profile && Number(profile.pricelevel) || 1;
              var tooltip     = ENVIRONMENT.getConfig('trevera.strikethroughPricingTooltip', '');
              var comparePrice, price;
              console.log('Transaction.Line.Views.Price.View',
                context.model.item.displayname, onlineprice, pricelevel, context.model.item.pricelevel25, context.model.item.pricelevel32);
              switch (pricelevel) {
                case 29: // 06. SC - HYBRID
                  comparePrice = context.model.item.pricelevel26; // 03. Silver Circle
                  price        = context.model.item.pricelevel29;
                  return {
                    showComparePrice     : price < comparePrice,
                    comparePriceFormatted: context.item.model.pricelevel26_formatted,
                    showTooltip          : tooltip && tooltip.length > 0,
                    tooltip              : tooltip
                  }
                  break;
                case 31: // 07. WS - HYBRID
                  comparePrice = context.model.item.pricelevel27; //04. White Star
                  price        = context.model.item.pricelevel31;
                  return {
                    showComparePrice     : price < comparePrice,
                    comparePriceFormatted: context.model.item.pricelevel27_formatted,
                    showTooltip          : tooltip && tooltip.length > 0,
                    tooltip              : tooltip
                  }
                  break;
                case 32: // 08. BD - HYBRID
                  comparePrice = context.model.item.pricelevel28; // 05. Black Diamond
                  price        = context.model.item.pricelevel32;
                  return {
                    showComparePrice     : price < comparePrice,
                    comparePriceFormatted: context.model.item.pricelevel28_formatted,
                    showTooltip          : tooltip && tooltip.length > 0,
                    tooltip              : tooltip
                  }
                  break;
                default:
                  return {
                    showComparePrice     : context.showComparePrice,
                    comparePriceFormatted: context.comparePriceFormatted,
                    showTooltip          : false
                  }
                  break;
              }
            }
          );
        }


      }
    };
  });
