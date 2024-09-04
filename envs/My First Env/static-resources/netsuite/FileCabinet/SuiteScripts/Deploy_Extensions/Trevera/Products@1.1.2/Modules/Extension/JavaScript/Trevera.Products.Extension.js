/*
 © 2020 Trevera

 Product Customizations that should load in Checkout and MyAccount.
 This class is just a module loader

 */
define('Trevera.Products.Extension'
  , [
    'Trevera.ExcludeFromSearch'
    , 'Backbone'
    , 'underscore'
    , 'Utils'
  ]
  , function (
    ExcludeFromSearch
    , Backbone
    , _
    , Utils
  ) {
    'use strict';

    return {
      mountToApp: function mountToApp(container) {
        var LAYOUT      = container.getComponent('Layout');
        var PROFILE     = container.getComponent('UserProfile');
        var ENVIRONMENT = container.getComponent('Environment');


        var profile;
        PROFILE.getUserProfile().then(function (data) {
          profile = data;
          LAYOUT.cancelableTrigger('profileComponent:DataLoaded');
        });

        ExcludeFromSearch.mountToApp(container);

        if (LAYOUT) {
          /** Show compare price based on the price level assigned to the customer */
          LAYOUT.addToViewContextDefinition(
            'Transaction.Line.Views.Price.View'
            , 'trvExtras'
            , 'object'
            , function trvExtras(context) {
              var onlineprice = context.model.item.onlinecustomerprice;
              var pricelevel  = profile && Number(profile.pricelevel) || 1;
              var tooltip     = ENVIRONMENT.getConfig('trevera.strikethroughPricingTooltip', '');
              var comparePrice, price;
              switch (pricelevel) {
                case 26: // Silver Circle
                  comparePrice = context.model.item.pricelevel1; // 03. Silver Circle
                  price        = context.model.item.pricelevel26;
                  return {
                    showComparePrice     : price < comparePrice,
                    comparePriceFormatted: context.model.item.pricelevel1_formatted,
                    showTooltip          : tooltip && tooltip.length > 0,
                    tooltip              : tooltip
                  }
                  break;
                case 27: // White Star
                  comparePrice = context.model.item.pricelevel1; //04. White Star
                  price        = context.model.item.pricelevel27;
                  return {
                    showComparePrice     : price < comparePrice,
                    comparePriceFormatted: context.model.item.pricelevel1_formatted,
                    showTooltip          : tooltip && tooltip.length > 0,
                    tooltip              : tooltip
                  }
                  break;
                case 25: // Black Diamond
                  comparePrice = context.model.item.pricelevel1; // 05. Black Diamond
                  price        = context.model.item.pricelevel25;
                  return {
                    showComparePrice     : price < comparePrice,
                    comparePriceFormatted: context.model.item.pricelevel1_formatted,
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
