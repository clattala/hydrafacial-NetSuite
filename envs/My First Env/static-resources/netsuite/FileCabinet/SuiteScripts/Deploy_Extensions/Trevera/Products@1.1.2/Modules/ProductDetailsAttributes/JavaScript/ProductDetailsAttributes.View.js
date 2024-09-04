// @module Trevera.ProductDetailsAttributes.Extension
define('ProductDetailsAttributes.View'
  , [
    'trv_productdetailsattributes_extension.tpl'
    , 'Utils'
    , 'Backbone'
    , 'jQuery'
    , 'underscore'
  ]
  , function (
    productdetailsattributes_extension_tpl
    , Utils
    , Backbone
    , jQuery
    , _
  ) {
    'use strict';

    // @class Trevera.ProductDetailsAttributes.Extension.View @extends Backbone.View
    return Backbone.View.extend({

      template: productdetailsattributes_extension_tpl

      , events: {}

      , contextDataRequest: ['item']

      , initialize: function initialize(options) {
        Backbone.View.prototype.initialize.apply(this, arguments);
        this.application = options.application;
        this.ENVIRONMENT = this.options.application.getComponent('Environment');

        this.contentKey = options.contentKey;
        this.showLabels = options.showLabels;
      }

      , render: function () {
        this.details = this.details || this.computeDetailsArea();
        this._render();
      }

      , computeDetailsArea: function () {
        var self    = this
          , details = [];

        var item_model = this.contextData.item();

        _.each(this.ENVIRONMENT.getConfig('trevera.productDetailsAttributes.attributes', []), function (item_information) {
          var content = '';

          if (item_information.contentFromKey) {
            content = item_model[item_information.contentFromKey];
          }

          var isContentArea          = !!item_information.contentArea && item_information.contentArea.length > 0;
          var itemMatchesContentArea = self.contentKey === item_information.contentArea;

          if (content && Utils.trim(content)) {
            if (itemMatchesContentArea) {
              details.push({
                //@property {String} name
                name      : item_information.name
                //@property {String} content Any string and event valid HTML is allowed
                , content : content
                //@property {String} itemprop
                , itemprop: item_information.itemprop
              });
            }
          }


        });

        return details;
      }

      , getContext: function () {
        this.computeDetailsArea();

        return {
          //@property {Boolean} showInformation
          showInformation: this.details.length > 0
          //@property {Boolean} showHeader
          , showHeader   : this.details.length < 2
          //@property {Array<ProductDetails.Information.DataContainer>} details
          , details      : this.details
          , showLabels   : this.showLabels
        };
      }

    });
  });
