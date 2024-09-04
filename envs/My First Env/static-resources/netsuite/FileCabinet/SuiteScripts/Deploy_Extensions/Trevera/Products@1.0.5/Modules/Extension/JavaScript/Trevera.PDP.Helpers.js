define('Trevera.PDP.Helpers'
  , [
    'Backbone',
    'Utils',
    'jQuery',
    'underscore'
  ], function (
    Backbone,
    Utils,
    jQuery,
    _
  ) {
    'use strict';

    return {
      checkForQuantity: function checkForQuantity(PDP, LAYOUT) {
        var selectedChilds = PDP.getSelectedMatrixChilds();
        if (selectedChilds.length === 1) {
          console.log('check for max', selectedChilds[0]);
          if (!selectedChilds[0].isbackorderable) {
            var currentQuantity = parseInt(jQuery('.product-details-quantity-value').val());
            console.log(currentQuantity, selectedChilds[0].quantityavailable);

            if (currentQuantity > selectedChilds[0].quantityavailable) {
              PDP.setQuantity(selectedChilds[0].quantityavailable);
              LAYOUT.showMessage({
                message : 'You have added more to your cart than what is available. We\'ve adjusted the quantity for you.',
                type    : 'error',
                selector: 'Product.Price',
                timeout : 5000
              });
            }

          }
        }
      },

      setSingleOptions: function setSingleOptions(PDP) {
        var selectedChilds = PDP.getSelectedMatrixChilds();

        var item          = PDP.getItemInfo();
        var matrixOptions = _.filter(item.options, {isMatrixDimension: true}); // find matrix dimensions
        var optionMap     = {};

        _.each(matrixOptions, function (option) { // map matrix options to values on available matrix children
          optionMap[option.itemOptionId] = _.uniq(_.pluck(selectedChilds, option.itemOptionId));
        });

        _.each(matrixOptions, function (option) {
          // console.log(option, option.value, optionMap[option.itemOptionId]);
          // console.log('option.value', option.value);
          if ((!option.value || _.isUndefined(option.value)) && optionMap[option.itemOptionId].length === 1 && optionMap[option.itemOptionId][0].length > 0) {
            // if the value isn't set for the option and there is only one available option
            var matchingOptionValue = _.where(option.values, {label: optionMap[option.itemOptionId][0]}); // find the internalid
            if (_.size(matchingOptionValue) === 1 && parseInt(matchingOptionValue[0].internalid) > 0) {
              PDP.setOption(option.cartOptionId, matchingOptionValue[0].internalid); // set the option
            }
          }
          if (optionMap[option.itemOptionId].length === 1 && optionMap[option.itemOptionId][0].length > 0) {
            // TODO: Hide the option selector here using jQuery
            // console.log('option.cartOptionId', option.cartOptionId);
            var selector  = '#' + option.cartOptionId + '-container';
            var $selector = jQuery(selector);
            // console.log('selector', selector);
            // console.log('$selector', $selector);
            // console.log('$selector.length', $selector.length);
            $selector.hide();
          }
        });
      },

      limitQuantityFeatureOn: function (container) {
        var PDP    = container.getComponent('PDP');
        var LAYOUT = container.getComponent('Layout');
        var self = this;

        if (PDP) {
          LAYOUT.addToViewContextDefinition(
            'ProductDetails.Quantity.View'
            , 'quantityAvailable'
            , 'string'
            , function quantityAvailable(context) {
              var matrxiChilds = PDP.getSelectedMatrixChilds(); // get all matrix children
              if (matrxiChilds.length === 1) { // if length == 1 then matrix is fully configured
                var child = _.find(context.model.item.matrixchilditems_detail, function (childs) {
                  return childs.internalid === matrxiChilds[0].internalid;
                });

                if (!!child) {
                  return child.isbackorderable ? 1000 : child.quantityavailable;
                }
              }
              // if matrix not fully configured or non matrix item, use whats on the model
              if (context.model && context.model.item) {
                return context.model.item.isbackorderable ? 1000 : context.model.item.quantityavailable;
              }
              return 1000;
            }
          );

          PDP.on('afterOptionSelection', function (data) {
            var matrixChilds   = PDP.getAllMatrixChilds();
            var selectedChilds = PDP.getSelectedMatrixChilds();

            if (matrixChilds.length === selectedChilds.length && matrixChilds.length > 1) {  // no option selected and there is more than one possible matrix child
              jQuery('.product-details-quantity-value').prop('max', 1);
            } else {
              if (selectedChilds.length === 1) {
                // console.log('selector', selector);
                jQuery('.product-details-quantity-value').prop('max', selectedChilds[0].isbackorderable ? 1000 : selectedChilds[0].quantityavailable);
              } else {
                jQuery('.product-details-quantity-value').prop('max', 1);
              }
            }

          });

          PDP.on('afterShowContent', function (data) {
            self.checkForQuantity(PDP, LAYOUT);
          });

          PDP.on('afterQuantityChange', function (data) {
            self.checkForQuantity(PDP, LAYOUT)
          });
        }
      },

      autoSelectSingleOptionsOn: function (container) {
        var PDP    = container.getComponent('PDP');
        var LAYOUT = container.getComponent('Layout');
        var self = this;

        PDP.on('afterOptionSelection', function (data) {
            self.setSingleOptions(PDP);
        });

        PDP.on('afterShowContent', function (data) {
          self.setSingleOptions(PDP);
        });
      },

      mountToApp: function mountToApp(container, limitQuantity, autoSelectSingleOptions) {
        var PDP         = container.getComponent('PDP');
        var PLP         = container.getComponent('PLP');
        var LAYOUT      = container.getComponent('Layout');
        var ENVIRONMENT = container.getComponent('Environment');
        var self        = this;

        if(limitQuantity) this.limitQuantityFeatureOn(container);
        if(autoSelectSingleOptions) this.autoSelectSingleOptionsOn(container);

        if (PDP) {
          PDP.on('afterOptionSelection', function (data) {
            // handle that the view doesn't rerender by swapping classes
            setTimeout(function () {
              jQuery('.product-views-option-color-picker-box-img').siblings('span[data-availability-label]').removeClass('is-available-false').addClass('is-available-true'); //reset all
              jQuery('.product-views-option-color-picker-box-img.muted').siblings('span[data-availability-label]').removeClass('is-available-true').addClass('is-available-false');
              jQuery('.product-views-option-color-picker-box-img.active').siblings('span[data-availability-label]').removeClass('is-available-false').addClass('is-available-true');
            }, 100);

          });

          PDP.on('beforeShowContent', function (data) {
            if (data === 'ProductDetails.QuickView.View') {
              return;
            }
            //var item = PDP.getItemInfo();
          });

          PDP.on('afterShowContent', function (data) {
            if (data === 'ProductDetails.QuickView.View') {
              return;
            }

          });
        }
      }
    };
  });
