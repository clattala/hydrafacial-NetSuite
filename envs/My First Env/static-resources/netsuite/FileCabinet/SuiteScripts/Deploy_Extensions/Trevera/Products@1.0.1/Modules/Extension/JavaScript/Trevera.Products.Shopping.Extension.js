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
        TreveraProductDetails.mountToApp(container);
        TreveraPLPExtension.mountToApp(container);
      }
    };
  });
