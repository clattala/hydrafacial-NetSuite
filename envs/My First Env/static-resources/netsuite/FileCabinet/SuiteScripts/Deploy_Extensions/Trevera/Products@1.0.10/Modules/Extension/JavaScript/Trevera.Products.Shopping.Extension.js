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
                case 26: // Silver Circle
                  comparePrice = item.pricelevel1; // 03. Silver Circle
                  price        = item.pricelevel26;
                  return {
                    showComparePrice     : price < comparePrice,
                    comparePriceFormatted: item.pricelevel1_formatted,
                    showTooltip          : tooltip && tooltip.length > 0,
                    tooltip              : tooltip
                  }
                  break;
                case 27: // White Star
                  comparePrice = item.pricelevel1; //04. White Star
                  price        = item.pricelevel27;
                  return {
                    showComparePrice     : price < comparePrice,
                    comparePriceFormatted: item.pricelevel1_formatted,
                    showTooltip          : tooltip && tooltip.length > 0,
                    tooltip              : tooltip
                  }
                  break;
                case 25: // Black Diamond
                  comparePrice = item.pricelevel1; // 05. Black Diamond
                  price        = item.pricelevel25;
                  return {
                    showComparePrice     : price < comparePrice,
                    comparePriceFormatted: item.pricelevel1_formatted,
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
              switch (pricelevel) {
                case 26: // Silver Circle
                  comparePrice = context.model.item.pricelevel1;
                  price        = context.model.item.pricelevel26;
                  return {
                    showComparePrice     : price < comparePrice,
                    comparePriceFormatted: context.model.item.pricelevel1_formatted,
                    showTooltip          : tooltip && tooltip.length > 0,
                    tooltip              : tooltip
                  }
                  break;
                case 27: // White Star
                  comparePrice = context.model.item.pricelevel1;
                  price        = context.model.item.pricelevel27;
                  return {
                    showComparePrice     : price < comparePrice,
                    comparePriceFormatted: context.model.item.pricelevel1_formatted,
                    showTooltip          : tooltip && tooltip.length > 0,
                    tooltip              : tooltip
                  }
                  break;
                case 25: // Black Diamond
                  comparePrice = context.model.item.pricelevel1;
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

        TreveraProductDetails.mountToApp(container);
        TreveraPLPExtension.mountToApp(container);
      }
    };
  });
