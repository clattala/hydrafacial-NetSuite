define('HF.Loyalty.MyAccount'
  , [
    'HF.Loyalty.MyAccount.View',
    'underscore'
  ]
  , function (
    AnnexCloudMyAccountView,
    _
  ) {
    'use strict';

    return {
      mountToApp: function mountToApp(container) {
        var MYACCOUNTMENU = container.getComponent('MyAccountMenu');
        var PAGETYPE      = container.getComponent("PageType");
        var ENVIRONMENT   = container.getComponent('Environment');
        var config        = ENVIRONMENT.getConfig('hf.loyalty');

        if(config.enabled) {
          if (MYACCOUNTMENU) {
            MYACCOUNTMENU.addGroup({
              id   : 'loyalty',
              index: 6,
              url  : 'loyalty',
              name : _.translate('Loyalty Rewards')
            });
          }

          PAGETYPE.registerPageType({
            name           : 'loyalty_points',
            routes         : ['loyalty', 'loyalty/?:options'],
            view           : AnnexCloudMyAccountView,
            options        : {
              application: container
            },
            defaultTemplate: {
              name       : 'hf_myaccount_points.tpl',
              displayName: 'Loyalty Points'
            }
          });
        }
      }
    };
  });
