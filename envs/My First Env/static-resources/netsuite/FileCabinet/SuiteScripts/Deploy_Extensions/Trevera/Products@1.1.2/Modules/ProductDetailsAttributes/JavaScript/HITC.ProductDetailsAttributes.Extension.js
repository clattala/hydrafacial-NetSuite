/*
* In order for views to render, <div data-view="Product.Attributes"></div> must be added to templates
*
*/
define(
  'Trevera.ProductDetailsAttributes.Extension'
  , [
    'ProductDetailsAttributes.View'
  ]
  , function (
    ExtensionView
  ) {
    'use strict';

    return {
      mountToApp: function mountToApp(container) {
        var PDP          = container.getComponent('PDP');
        var ENVIRONMENT  = container.getComponent('Environment')
          , moduleConfig = ENVIRONMENT.getConfig('trevera.productDetailsAttributes') || {};

        if (PDP && moduleConfig.enabled) {
          if (moduleConfig.showOnPDP) {
            PDP.addChildViews(
              PDP.PDP_FULL_VIEW
              , {
                'Product.Attributes': {
                  'Product.Attributes':
                    {
                      childViewIndex        : 5
                      , childViewConstructor: function () {

                        return new ExtensionView({
                          application: container,
                          PDP        : PDP,
                          contentKey : '',
                          showLabels : true
                        })
                      }
                    }
                }
              }
            );

            PDP.addChildViews(
              PDP.PDP_FULL_VIEW
              , {
                'Product.Attributes.Features': {
                  'Product.Attributes.Features':
                    {
                      childViewIndex        : 5
                      , childViewConstructor: function () {

                        return new ExtensionView({
                          application: container,
                          PDP        : PDP,
                          contentKey : 'features',
                          showLabels : false
                        })
                      }
                    }
                }
              }
            );
          }

          if (moduleConfig.showOnQuickView) {
            PDP.addChildViews(
              PDP.PDP_QUICK_VIEW
              , {
                'Product.Attributes': {
                  'Product.Attributes':
                    {
                      childViewIndex        : 5
                      , childViewConstructor: function () {
                        return new ExtensionView({
                          application: container,
                          PDP        : PDP
                        })
                      }
                    }
                }
              }
            );
          }
        }
      }
    };
  });
