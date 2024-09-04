define('HF.Warranty.Main'
  , [
    'HF.Warranty.View',
    'underscore'
  ]
  , function (
    HFWarrantyView,
    _
  ) {
    'use strict';

    return {
      mountToApp: function mountToApp(container) {
        var MYACCOUNTMENU = container.getComponent('MyAccountMenu');
        var PAGETYPE      = container.getComponent("PageType");

        if (MYACCOUNTMENU) {
          MYACCOUNTMENU.addGroup({
            id   : 'warranty',
            index: 6,
            url  : 'warranty',
            name : _.translate('Warranties')
          });
        }

        PAGETYPE.registerPageType({
          name           : 'warranty',
          routes         : ['warranty', 'warranty/?:options'],
          view           : HFWarrantyView,
          options        : {
            application: container
          },
          defaultTemplate: {
            name       : 'hf_warranty_dashboard.tpl',
            displayName: 'Warranty Dashboard'
          }
        });

      }
    };
  });
