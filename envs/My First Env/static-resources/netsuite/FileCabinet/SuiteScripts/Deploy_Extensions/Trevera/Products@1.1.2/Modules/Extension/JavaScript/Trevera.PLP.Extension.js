define(
  'Trevera.PLP.Extension'
  , [
    'Trevera.Facets.Extension'
    , 'underscore'
  ]
  , function (
    TreveraFacetsExtension
    , _
  ) {
    'use strict';

    return {

      mountToApp: function mountToApp(container) {

        var ENVIRONMENT = container.getComponent('Environment')
          , LAYOUT      = container.getComponent('Layout')
          , PLP         = container.getComponent('PLP');

        if (PLP) {
          TreveraFacetsExtension.mountToApp(container);
        }

        if (LAYOUT) {

        }
      }
    };
  });
