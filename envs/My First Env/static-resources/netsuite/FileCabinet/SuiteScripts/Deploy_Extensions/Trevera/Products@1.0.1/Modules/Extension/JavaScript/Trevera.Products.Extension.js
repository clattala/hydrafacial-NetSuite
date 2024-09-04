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
        var CHECKOUT    = container.getComponent('Checkout');
        var CART        = container.getComponent('Cart');
        var ENVIRONMENT = container.getComponent('Environment');

        if (LAYOUT) {}


      }
    };
  });
