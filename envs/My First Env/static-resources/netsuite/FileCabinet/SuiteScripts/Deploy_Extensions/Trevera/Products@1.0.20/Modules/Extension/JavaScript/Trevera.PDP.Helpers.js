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

    var _channelFieldID = 'custentity_ecomm_channel';
    var _jumpstartMax   = 2;


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
        var self   = this;

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
            }
            else {
              if (selectedChilds.length === 1) {
                // console.log('selector', selector);
                jQuery('.product-details-quantity-value').prop('max', selectedChilds[0].isbackorderable ? 1000 : selectedChilds[0].quantityavailable);
              }
              else {
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

      limitQuantityFeaturePerChannelOn: function (config, limitQuantitiesOn, profile, container) {
        console.log('limitQuantityFeaturePerChannelOn')
        var customFields    = profile && profile.customfields;
        var channelField    = _.find(customFields, {id: _channelFieldID});
        var channelsToLimit = ['5'] //config.channelsToEnforce ? config.channelsToEnforce.split(',').map(function (channel) {return channel.trim()}) : []
        var PDP             = container.getComponent('PDP');
        var LAYOUT          = container.getComponent('Layout');
        var CART            = container.getComponent('Cart');
        var self            = this;
        var cartLines;
        CART.getLines().then(function (lines) { cartLines = lines });
        if (PDP && channelsToLimit.indexOf(channelField.value) > -1) {
          LAYOUT.addToViewContextDefinition(
            'ProductDetails.Quantity.View'
            , 'hfExtras'
            , 'object'
            , function hfExtras(context) {
              var maxQuantity = false;
              console.log('ProductDetails.Quantity.View', context);
              var matrxiChilds = PDP.getSelectedMatrixChilds(); // get all matrix children
              if (matrxiChilds.length === 1) { // if length == 1 then matrix is fully configured
                var child = _.find(context.model.item.matrixchilditems_detail, function (childs) {
                  return childs.internalid === matrxiChilds[0].internalid;
                });
                if (!!child) {
                  maxQuantity = Number(child.custitem_hf_rep_limit) > 0
                    ? Number(child.custitem_hf_rep_limit) : limitQuantitiesOn
                      ? 1000 : child.quantityavailable;
                }
              }
              // if matrix not fully configured or non matrix item, use whats on the model
              if (context.model && context.model.item) {
                maxQuantity = Number(context.model.item.custitem_hf_rep_limit) > 0
                  ? Number(context.model.item.custitem_hf_rep_limit) : context.model.item.isbackorderable
                    ? 1000 : context.model.item.quantityavailable;
              }
              var qtyInCart     = 0;
              var matchingLines = _.filter(cartLines, function (line) { return line.item.internalid === context.model.item.internalid });
              qtyInCart         = matchingLines.reduce(function (num, line) { return num + line.quantity }, 0);
              console.log('self.getQuantityInCart(CART, context)', qtyInCart);
              if (qtyInCart > maxQuantity) {
                self.checkLineQuantity(CART, LAYOUT, context.model.item.internalid)
              }
              return {
                limitQuantity   : maxQuantity > 0,
                max             : maxQuantity,
                maxAllowed      : qtyInCart > maxQuantity ? 0 : maxQuantity - qtyInCart,
                isQtyAddDisabled: maxQuantity > 0 ? context.model.quantity >= maxQuantity : false,
                showAddToCart   : qtyInCart < maxQuantity && qtyInCart != maxQuantity
              };
            }
          );

          LAYOUT.addToViewContextDefinition('Cart.AddToCart.Button.View'
            , 'isCurrentItemPurchasable'
            , 'boolean'
            , function isCurrentItemPurchasable(context) {
              console.log('isCurrentItemPurchasable')
              var details = PDP.getItemInfo();
              if (details && details.item) {
                var max = details.item.custitem_hf_rep_limit || 0;
                if (max > 0) {
                  var currentQty = self.getQuantityInCart(cartLines, details.item.internalid)
                  return currentQty < max;
                }
              }
              return context.isCurrentItemPurchasable
            }
          );


          LAYOUT.addToViewContextDefinition('Cart.Item.Summary.View'
            , 'hfExtras'
            , 'object'
            , function hfExtras(context) {
              console.log('Cart.Item.Summary.View.trvExtras', context)
              var maxQty = 0, currentQty = 0;
              if (context.line && context.line.item) {
                var maxQty = context.line.item.custitem_hf_rep_limit || 0;
                if (maxQty > 0) {
                  currentQty = self.getQuantityInCart(cartLines, context.line.item.internalid)
                }
              }
              return {
                maximumQuantity    : maxQty,
                showControls       : currentQty < maxQty,
                showMaximumQuantity: maxQty > 0
              }
            }
          );

          CART.on('afterAddLine', function (line) {
            console.log('afterAddLine', line);
            self.checkLineQuantity(CART, LAYOUT, line.line.item.internalid);
          })
          CART.on('afterUpdateLine', function (line) {
            console.log('afterUpdateLine', line);
            self.checkLineQuantity(CART, LAYOUT, line.line.item.internalid);
          })

        }
      },

      handleJumpstartItems: function (CART, LAYOUT) {
        var self = this;
        CART.on('afterShowContent', function (data) {
          console.log('afterShowContent', data);
          self.checkLineQuantityMatrixFromParent(CART, LAYOUT, 5720);
          self.checkLineQuantityMatrixFromParent(CART, LAYOUT, 5689);
        })
        CART.on('afterAddLine', function (line) {
          console.log('afterAddLine', line);
          self.checkLineQuantityMatrix(CART, LAYOUT, line.line.item.internalid);
        })
        CART.on('afterUpdateLine', function (line) {
          console.log('afterUpdateLine', line);
          self.checkLineQuantityMatrix(CART, LAYOUT, line.line.item.internalid);
        })
        /*CART.on('beforeAddLine', function (line) {
          console.log('beforeAddLine', line);
          return self.canAddJumpstartItemToCart(CART, LAYOUT, line.line.item.internalid);
        })*/
      },

      getQuantityInCart: function getQuantityInCart(cartLines, itemId) {
        var matchingLines = _.filter(cartLines, function (line) {
          return line.item.internalid === itemId;
        });
        return matchingLines.reduce(function (num, line) {
          return num + line.quantity
        }, 0);
      },

      checkLineQuantity: function checkLineQuantity(CART, LAYOUT, itemId) {
        CART.getLines().then(function (lines) {
          var matchingLines = _.filter(lines, function (line) {
            return line.item.internalid === itemId;
          });
          const cartQty     = matchingLines.reduce(function (num, line) {
            return num + line.quantity
          }, 0);
          if (matchingLines.length > 0) {
            var maxQty = matchingLines[0].item.extras.custitem_hf_rep_limit || null;
            if (!!maxQty && cartQty > maxQty) {
              if (matchingLines.length > 1) {
                var linesToRemove = matchingLines.shift(); // remove the first line from the found array
                if (linesToRemove.length > 0) {
                  var linesRemoved = 0;
                  for (var line = 0; line < linesToRemove.length; line++) {
                    CART.removeLine({line_id: linesToRemove[line].internalid}).then(function () {linesRemoved++;});
                  }
                  console.log('lines removed: ', linesRemoved);
                }
              }
              CART.updateLine({
                line: {internalid: matchingLines[0].internalid, quantity: maxQty}
              }).then(function () {
                LAYOUT.showMessage({message: 'You have added more to your cart than what is available. We\'ve adjusted the quantity for you.', type: 'error', selector: 'Product.Price', timeout: 5000});
                console.log('Line update finished');
                return false;
              }).fail(function (data) {
                console.log(data)
              });
            }
          }
          else {
            return true
          }
          console.log('matchingLines', matchingLines, cartQty);
        });
      },

      canAddJumpstartItemToCart: function canAddJumpstartItemToCart(CART, LAYOUT, itemId) {
        var cartLinesCheckPromise = jQuery.Deferred();
        CART.getLines().then(function (lines) {
          var matchingLinesOnMatrix = _.filter(lines, function (line) {
            return line.item.extras.matrix_parent && [5720, 5689].indexOf(line.item.extras.matrix_parent.internalid) > -1;
          });
          if (matchingLinesOnMatrix.length > 0) {
            const cartQty = matchingLinesOnMatrix.reduce(function (num, line) {
              return num + line.quantity
            }, 0);
            if (cartQty > _jumpstartMax) {
              return cartLinesCheckPromise.reject({errorCode: 'ERR_MAX_ITEMS', errorMessage: Utils.translate('You already have the max in your cart')});
            } else {
              return cartLinesCheckPromise.resolve();
            }
          }
          else {
            return cartLinesCheckPromise.resolve();
          }
        });
        return cartLinesCheckPromise;
      },

      checkLineQuantityMatrix: function checkLineQuantityMatrix(CART, LAYOUT, itemId) {
        CART.getLines().then(function (lines) {
          var matchingLines = _.filter(lines, function (line) {
            return line.item.internalid === itemId;
          });
          console.log('matching lines', matchingLines);
          var parentID = 0;
          if (matchingLines.length > 0) {
            parentID = matchingLines[0].item.extras.matrix_parent.internalid;
          }
          if (parentID > 0) {
            var matchingLinesOnMatrix = _.filter(lines, function (line) {
              return line.item.extras.matrix_parent && line.item.extras.matrix_parent.internalid === parentID;
            });
            if (matchingLinesOnMatrix.length > 0) {
              const cartQty = matchingLinesOnMatrix.reduce(function (num, line) {
                return num + line.quantity
              }, 0);
              if (cartQty > _jumpstartMax) {
                _.each(matchingLinesOnMatrix, function (line) {
                  jQuery('#' + line.internalid + ' .cart-lines-summary').append('<div class="global-views-message global-views-message-error">There is maximum number of ' + _jumpstartMax + ' items allowed for this item. Please adjust your quantities.</div>');
                });
              }
            }
            else {
              return true
            }
          }
          console.log('matchingLines', matchingLines);
        });
      },

      checkLineQuantityMatrixFromParent: function checkLineQuantityMatrixFromParent(CART, LAYOUT, parentID) {
        CART.getLines().then(function (lines) {
          var matchingLinesOnMatrix = _.filter(lines, function (line) {
            return line.item.extras.matrix_parent && line.item.extras.matrix_parent.internalid === parentID;
          });
          if (matchingLinesOnMatrix.length > 0) {
            const cartQty = matchingLinesOnMatrix.reduce(function (num, line) {
              return num + line.quantity
            }, 0);
            if (cartQty > _jumpstartMax) {
              _.each(matchingLinesOnMatrix, function (line) {
                jQuery('#' + line.internalid + ' .cart-lines-summary').append('<div class="global-views-message global-views-message-error">There is maximum number of ' + _jumpstartMax + ' items allowed for this item. Please adjust your quantities.</div>');
              });
            }
          }
          else {
            return true
          }
        })
      },

      autoSelectSingleOptionsOn: function (container) {
        var PDP    = container.getComponent('PDP');
        var LAYOUT = container.getComponent('Layout');
        var self   = this;

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

        if (limitQuantity) this.limitQuantityFeatureOn(container);
        if (autoSelectSingleOptions) this.autoSelectSingleOptionsOn(container);

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
