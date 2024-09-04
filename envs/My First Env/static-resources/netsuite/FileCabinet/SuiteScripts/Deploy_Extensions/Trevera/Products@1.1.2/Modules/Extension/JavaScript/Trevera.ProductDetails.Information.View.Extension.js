// @module Trevera.ProductDetails.Information.View.Extension
// allow for concatenating

define('Trevera.ProductDetails.Information.View.Extension'
  , [
    'product_details_information.tpl'
    , 'Utils'
    , 'Backbone'
    , 'jQuery'
    , 'underscore'
  ]
  , function (
    product_details_information_tpl
    , Utils
    , Backbone
    , jQuery
    , _
  ) {
    'use strict';

    // @class Trevera.ProductDetails.Information.View.Extension @extends Backbone.View
    return Backbone.View.extend({

      template: product_details_information_tpl

      , events: {}

      , contextDataRequest: ['item']

      , initialize: function initialize(options) {
        Backbone.View.prototype.initialize.apply(this, arguments);
        this.application = options.application;
        this.ENVIRONMENT = this.options.application.getComponent('Environment');

      }

      , render: function () {
        this.details = this.details || this.computeDetailsArea();
        this._render();
      }

      , computeDetailsArea: function () {
        var self    = this
          , details = [];

        var item_model = this.contextData.item();

        // allows multiple keys to be passed in. Item field values are concatenated
        _.each(this.ENVIRONMENT.getConfig('productDetailsInformation', []), function (item_information) {
          var content = '';

          if (item_information.contentFromKey) {
            content = item_model[item_information.contentFromKey];
          }

          if (item_information.contentFromKey.indexOf(',') > -1) {
            var keys = _.without(item_information.contentFromKey.split(","), "", " ");
            for (var i = 0; i < keys.length; i++) {
              if (item_model[keys[i]] && item_model[keys[i]].length > 0) {
                ///core/media/media.nl
                var itemContent = item_model[keys[i]];
                if (itemContent.indexOf('/core/media/media.nl') == 0) {
                  content += '<div class="product-details-full-imformation-view-multiple">'
                    + '<img src="' + itemContent + '" alt="image of ' + item_information.name + ' " />' + '</div>';
                } else {
                  content += '<div class="product-details-full-imformation-view-multiple">' + item_model[keys[i]] + '</div>';
                }
              }
            }
          } else {
            var itemContent = item_model[item_information.contentFromKey];
            if (itemContent.indexOf('/core/media/media.nl') == 0) {
              content = '<img src="' + itemContent + '" alt="image of ' + item_information.name + ' " />'
            } else {
              content = itemContent;
            }
          }

          if (content && Utils.trim(content)) {
            //@class ProductDetails.Information.DataContainer
            details.push({
              //@property {String} name
              name: item_information.name
              //@property {String} content Any string and event valid HTML is allowed
              , content: content
              //@property {String} itemprop
              , itemprop: item_information.itemprop
            });
            //@class ProductDetails.Information.View
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
          , showHeader: this.details.length < 2
          //@property {Array<ProductDetails.Information.DataContainer>} details
          , details: this.details

          , isNotPageGenerator: !SC.isPageGenerator()
        };
      }

    });
  });
