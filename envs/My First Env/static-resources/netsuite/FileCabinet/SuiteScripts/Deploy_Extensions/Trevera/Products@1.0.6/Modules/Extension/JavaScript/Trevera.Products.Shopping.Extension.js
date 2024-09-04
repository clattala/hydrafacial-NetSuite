/*
 © 2020 Trevera

 Product Customizations that should load in Shopping.
 This class is just a module loader

 */

define(
  'Trevera.Products.Shopping.Extension'
  , [
    'Trevera.ProductDetails'
    , 'Trevera.PLP.Extension'
    , 'Backbone'
    , 'underscore'
    , 'Utils'
  ]
  , function (
    TreveraProductDetails
    , TreveraPLPExtension
    , Backbone
    , _
    , Utils
  ) {
    'use strict';

    return {
      mountToApp: function mountToApp(container) {
        var LAYOUT  = container.getComponent('Layout');
        var PROFILE = container.getComponent('UserProfile');
        var ENVIRONMENT = container.getComponent('Environment');

        var profile;
        PROFILE.getUserProfile().then(function (data) {
          profile = data;
          console.log('profile data', data);
          LAYOUT.cancelableTrigger('profileComponent:DataLoaded');
        });

        if (LAYOUT) {
          LAYOUT.addToViewContextDefinition(
            'ProductViews.Price.View'
            , 'trvExtras'
            , 'object'
            , function trvExtras(context) {
              var item = context.model;
              if (context.model.item) item = context.model.item;
              var pricelevel = profile && Number(profile.pricelevel) || 1;
              var tooltip    = ENVIRONMENT.getConfig('trevera.strikethroughPricingTooltip', '');
              var comparePrice, price;
              console.log('ProductViews.Price.View', item.displayname, pricelevel, item.pricelevel26, item.pricelevel29);
              switch (pricelevel) {
                case 29: // 06. SC - HYBRID
                  comparePrice = item.pricelevel26; // 03. Silver Circle
                  price        = item.pricelevel29;
                  return {
                    showComparePrice     : price < comparePrice,
                    comparePriceFormatted: item.pricelevel26_formatted,
                    showTooltip          : tooltip && tooltip.length > 0,
                    tooltip              : tooltip
                  }
                  break;
                case 30: // 07. WS - HYBRID
                  comparePrice = item.pricelevel27; //04. White Star
                  price        = item.pricelevel30;
                  return {
                    showComparePrice     : price < comparePrice,
                    comparePriceFormatted: item.pricelevel27_formatted,
                    showTooltip          : tooltip && tooltip.length > 0,
                    tooltip              : tooltip
                  }
                  break;
                case 31: // 08. BD - HYBRID
                  comparePrice = item.pricelevel28; // 05. Black Diamond
                  price        = item.pricelevel31;
                  return {
                    showComparePrice     : price < comparePrice,
                    comparePriceFormatted: item.pricelevel28_formatted,
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
          LAYOUT.addToViewContextDefinition(
            'Transaction.Line.Views.Price.View'
            , 'trvExtras'
            , 'object'
            , function trvExtras(context) {
              var pricelevel = profile && Number(profile.pricelevel) || 1;
              var tooltip    = ENVIRONMENT.getConfig('trevera.strikethroughPricingTooltip', '');
              var comparePrice, price;
              console.log('Transaction.Line.Views.Price.View', context.model.item.displayname, pricelevel, context.model.item.pricelevel25, context.model.item.pricelevel32);
              switch (pricelevel) {
                case 30: // schybrid
                  comparePrice = context.model.item.pricelevel26;
                  price        = context.model.item.pricelevel30;
                  return {
                    showComparePrice     : price < comparePrice,
                    comparePriceFormatted: context.item.model.pricelevel26_formatted,
                    showTooltip          : tooltip && tooltip.length > 0,
                    tooltip              : tooltip
                  }
                  break;
                case 31: // wshybrid
                  comparePrice = context.model.item.pricelevel27;
                  price        = context.model.item.pricelevel31;
                  return {
                    showComparePrice     : price < comparePrice,
                    comparePriceFormatted: context.model.item.pricelevel27_formatted,
                    showTooltip          : tooltip && tooltip.length > 0,
                    tooltip              : tooltip
                  }
                  break;
                case 32: // bdhybrid
                  comparePrice = context.model.item.pricelevel25;
                  price        = context.model.item.pricelevel32;
                  return {
                    showComparePrice     : price < comparePrice,
                    comparePriceFormatted: context.model.item.pricelevel25_formatted,
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

        TreveraProductDetails.mountToApp(container);
        TreveraPLPExtension.mountToApp(container);
      }
    };
  });
