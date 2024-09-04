/*
 © 2021 Trevera
 Loads layout modifications

 */

define('Trevera.Layout.Checkout.Extension'
  , [
    'Trevera.Layout.Header',
    'Trevera.NamedAnchors.Extension',
    'Trevera.AddressHelpers',
    'Trevera.MultiSite.Helpers',
    'HF.CreditLock.Extension',
    'underscore'
  ]
  , function (
    LayoutHeader
    , TreveraNamedAnchorsExtension
    , AddressHelpers
    , MultiSiteHelpers
    , CreditLockExtension
    , _
  ) {
    'use strict';

    return {
      mountToApp: function mountToApp(container) {
        var ENVIRONMENT = container.getComponent('Environment')
          , LAYOUT      = container.getComponent('Layout');

        LayoutHeader.mountToApp(container);
        TreveraNamedAnchorsExtension.mountToApp(container);
        AddressHelpers.mountToApp(container);
        MultiSiteHelpers.mountToApp(container);
        CreditLockExtension.mountToApp(container);

        if (LAYOUT) {
          LAYOUT.addToViewContextDefinition(
            'Footer.View'
            , 'footerLogo'
            , 'string'
            , function footerLogo(context) {
              return ENVIRONMENT.getConfig('trevera.footer.logoUrl');
            }
          );
        }
      }
    }
  });
