/*
 © 2022 Trevera
 Hides address buttons

 */

define('Trevera.AddressHelpers'
  , []
  , function () {
    'use strict';

    return {
      mountToApp: function mountToApp(container) {
        var LAYOUT      = container.getComponent('Layout')
        if (LAYOUT) {
          try {
            LAYOUT.addToViewContextDefinition(
              'Address.Details.View'
              , 'showActionButtons'
              , 'boolean'
              , function showActionButtons(context) {
                return false
              }
            );
          } catch (e) {
            console.log('error loading address details view.')
          }
        }
      }
    }
  });
