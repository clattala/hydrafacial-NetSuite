define('LiveOrder.Model.TrvPromotions', [
  'SC.Models.Init',
  'Application',
  'underscore'
], function LiveOrderModelTrvPromotions(
  ModelsInit,
  Application,
  _
) {

  'use strict';

  var PROFILE_HAS_WARRANTY_FIELD = 'custentity_hf_account_has_warranty';
  var CLEANING_KIT_ITEM_ID       = 120; //
  var PROMO_CODE_FIELD           = 'custcol_custom_promotion_used'; // flag for items that shouldnt have a charge
  var PROMO_CODE_FIELD_MODEL     = 'CUSTCOL_CUSTOM_PROMOTION_USED'; // flag for items that shouldnt have a charge

  var getItemType   = function getItemType(longItemType) {
    switch (longItemType) {
      case 'Inventory Item':
        return 'InvtPart';
      default:
      // Do nothing
    }
    return 'NonInvtPart'
  };
  var getOrderItems = function getOrderLines(self) {
    var orderFields = ModelsInit.order.getFieldValues();
    var lines;

    try {
      lines = ModelsInit.order.getItems();
    } catch (e) {
      lines = [];
    }
    return lines;
  };

  function getPromotionLineToAdd(item, quantity, promotion) {
    var line = {
      item    : {
        internalid: item,
        type      : 'InvtPart'
      },
      quantity: quantity.toString(),
      options : [{
        value       : {internalid: promotion},
        cartOptionId: PROMO_CODE_FIELD,
        label       : 'Promotion Used',
        type        : 'text'
      }]
    };
    nlapiLogExecution('DEBUG', 'lineToAdd: item', JSON.stringify(promotion));
    nlapiLogExecution('DEBUG', 'lineToAdd', JSON.stringify(line));
    return line;
  };

  try {
    var LiveOrder = require('LiveOrder.Model');
  } catch (e) {
    log('LiveOrder.Model', e.message || 'Model not found');
  }

  try {
    var StoreItem = require('StoreItem.Model');
  } catch (e) {
    log('StoreItem.Model', e.message || 'Model not found');
  }

  function getPromotionData() {
    var ctx                = ModelsInit.context;
    var promoData          = ctx.getSessionObject('trvPromos') || "";
    var promoDataRefreshed = ctx.getSessionObject('trvPromosTs') || "";
    var now                = new Date();
    var session            = 60 * 60 * 1000; // one hour
    var refreshData        = true;

    nlapiLogExecution('DEBUG', 'promoData', JSON.stringify(promoData));
    if (promoDataRefreshed.length > 0) {
      refreshData = now.getDate() - Number(promoDataRefreshed) > session;
    }
    nlapiLogExecution('DEBUG', 'refreshData', refreshData);
    if (promoData.length < 1 || refreshData) {
      var url      = nlapiResolveURL('SUITELET', 'customscript_trv_sca_get_promotions', 'customdeploy_trv_sca_get_promotions', true);
      url += '&user=' + ModelsInit.session.getCustomer().getFieldValues().internalid
      var response = nlapiRequestURL(url, null, {'Content-Type': 'application/json'});
      var body     = response.getBody();

      nlapiLogExecution('DEBUG', 'body', JSON.stringify(body));
      ctx.setSessionObject('trvPromos', body);

    }
    try {
      return JSON.parse(ctx.getSessionObject('trvPromos'));
    } catch (e) {
      nlapiLogExecution('ERROR', 'coudnt parse body', JSON.stringify(e));
      return {};
    }
  }

  function getValidPromotionLinesByPromotion(lines, promotion) {
    var linesInCart = [];
    _(lines).each(function (line) {
      var promotionField = _(line.options).findWhere({id: PROMO_CODE_FIELD_MODEL});
      nlapiLogExecution('DEBUG', 'getValidPromotionLinesByPromotion: line', JSON.stringify(line.options));
      nlapiLogExecution('DEBUG', 'getValidPromotionLinesByPromotion: promotionField', JSON.stringify(promotionField));
      if (promotionField && promotionField.value) {
        var items = _(promotion.itemsToAdd.items).pluck('itemId')
        if(promotion.type === 1 && promotionField.value.internalid === promotion.promocode) {
          linesInCart.push(line);
        } else if (promotionField.value.internalid === promotion.promocode && items.indexOf(line.internalid.toString()) > -1) {
          linesInCart.push(line);
        }
      }
    });
    return linesInCart;
  }

  function isPromotionItem(line) {
    var promotionField = _(line.options).findWhere({id: PROMO_CODE_FIELD_MODEL});
    nlapiLogExecution('DEBUG', 'isPromotionItem', JSON.stringify(promotionField));
    return !!promotionField && promotionField.value;
  }

  function isPromotionLine(line) {
    var promotionField = _(line.options).findWhere({cartOptionId: PROMO_CODE_FIELD});
    nlapiLogExecution('DEBUG', 'isPromotionLine', JSON.stringify(promotionField));
    return !!promotionField && promotionField.value;
  }

  function checkIfOrderQualifies(lines, promotion) {
    if (promotion.type === 1) {
      return Number(promotion.redemptions.numberCanClaim) > 0;
    }
    else if (promotion.qualifyingItems.type === 'multiple') { // then must hit from each group
      var qualificationMap   = {};
      var qualificationIndex = 0;
      for (var i in promotion.qualifyingItems.items) {
        var itemIndex   = 0;
        var mapObj      = promotion.qualifyingItems.items[i];
        var isOr        = mapObj.isOr;
        var qtyRequired = mapObj.quantityToPurchase;

        for (var i = 0; i < mapObj.itemIds.length; i++) {
          var key               = 'case' + '_' + qualificationIndex;
          qualificationMap[key] = false;
          if (isOr) {
            var lineInCart = [];
            _(lines).each(function (line) {
              if (Number(line.internalid) === Number(mapObj.itemIds[i])) {
                lineInCart.push(line);
              }
            });

            nlapiLogExecution('DEBUG', 'lineInCart', JSON.stringify(lineInCart));
            if (lineInCart.length > 0) {
              var qtyInCart = 0
              _(lineInCart).each(function (line) {
                nlapiLogExecution('DEBUG', 'line.isDiscount', line.discount);
                if (line.discount > 0) qtyInCart += 0;
                if (isPromotionItem(line)) qtyInCart += 0;
                qtyInCart += line.quantity;
              })

              nlapiLogExecution('DEBUG', 'qtyInCart ' + qtyInCart, 'qtyRequired ' + qtyRequired);
              if (qtyInCart >= qtyRequired) {
                qualificationMap[key] = true;
                break;
              }
            }
          }
          else {
            var caseMet = {};
            _.each(mapObj.items, function (item) {
              caseMet[item] = false;
            });
            _.each(lines, function (line) {
              var itemID = line.internalid.toString();
              var qty    = line.quantity;
              if (mapObj.indexOf(itemID) > -1) {
                caseMet[itemID] = qty >= qtyRequired;
              }
            });
            var summary = _(caseMet).countBy(function (met) {
              return met;
            });
            nlapiLogExecution('DEBUG', 'summary', JSON.stringify(summary));
          }
          itemIndex++;
        }
        qualificationIndex++;
      }

      nlapiLogExecution('DEBUG', 'qualificationMap', JSON.stringify(qualificationMap));
    }
    else if (promotion.qualifyingItems.type === 'single') {
      var givePromotion = false;
      for (var i in promotion.qualifyingItems.items) {
        var mapObj      = promotion.qualifyingItems.items[i];
        var qtyRequired = mapObj.quantityToPurchase;
        var lineInCart  = [];
        _(lines).each(function (line) {
          if (Number(line.internalid) === Number(mapObj.itemIds[i])) {
            lineInCart.push(line);
          }
        });

        nlapiLogExecution('DEBUG', 'lineInCart', JSON.stringify(lineInCart));
        if (lineInCart.length > 0) {
          var qtyInCart = 0
          _(lineInCart).each(function (line) {
            nlapiLogExecution('DEBUG', 'line.isDiscount', line.discount);
            if (line.discount > 0) qtyInCart += 0;
            if (isPromotionItem(line)) qtyInCart += 0;
            qtyInCart += line.quantity;
          })

          nlapiLogExecution('DEBUG', 'qtyInCart ' + qtyInCart, 'qtyRequired ' + qtyRequired);
          if (qtyInCart >= qtyRequired) {
            givePromotion = true;
            break;
          }
        }
      }

      nlapiLogExecution('DEBUG', 'single: give promotion', givePromotion)
      return givePromotion;
    }
    return false;
  }

  function checkIfOrderQualifiesLines(lines, promotion) {
    if (promotion.type === 1) {
      return promotion.redemptions.canClaim;
    }
    else if (promotion.qualifyingItems.type === 'multiple') { // then must hit from each group
      var qualificationMap   = {};
      var qualificationIndex = 0;
      for (var i in promotion.qualifyingItems.items) {
        var itemIndex   = 0;
        var mapObj      = promotion.qualifyingItems.items[i];
        var isOr        = mapObj.isOr;
        var qtyRequired = mapObj.quantityToPurchase;

        for (var i = 0; i < mapObj.itemIds.length; i++) {
          var key               = 'case' + '_' + qualificationIndex;
          qualificationMap[key] = false;
          if (isOr) {
            var lineInCart = [];
            _(lines).each(function (line) {

              nlapiLogExecution('DEBUG', 'Number(line.item.internalid) ' + Number(line.item.internalid), Number(mapObj.itemIds[i]));
              if (Number(line.item.internalid) === Number(mapObj.itemIds[i])) {
                lineInCart.push(line);
              }
            });

            nlapiLogExecution('DEBUG', 'lineInCart', JSON.stringify(lineInCart));
            if (lineInCart.length > 0) {
              var qtyInCart = 0
              _(lineInCart).each(function (line) {
                nlapiLogExecution('DEBUG', 'line.isDiscount', line.discount);
                if (line.discount > 0) qtyInCart += 0;
                if (isPromotionLine(line)) qtyInCart += 0;
                qtyInCart += line.quantity;
              })

              nlapiLogExecution('DEBUG', 'qtyInCart ' + qtyInCart, 'qtyRequired ' + qtyRequired);
              if (qtyInCart >= qtyRequired) {
                qualificationMap[key] = true;
                break;
              }
            }
          }
          else {
            var caseMet = {};
            _.each(mapObj.items, function (item) {
              caseMet[item] = false;
            });
            _.each(lines, function (line) {
              var itemID = line.item.internalid.toString();
              var qty    = line.quantity;
              if (mapObj.indexOf(itemID) > -1) {
                caseMet[itemID] = qty >= qtyRequired;
              }
            });
            var summary = _(caseMet).countBy(function (met) {
              return met;
            });
            nlapiLogExecution('DEBUG', 'summary', JSON.stringify(summary));
          }
          itemIndex++;
        }
        qualificationIndex++;
      }

      nlapiLogExecution('DEBUG', 'qualificationMap', JSON.stringify(qualificationMap));
    }
    else if (promotion.qualifyingItems.type === 'single') {
      if (promotion.redemptions.numberClaimed > 0) {
        nlapiLogExecution('DEBUG', 'checkIfOrderQualifiesLines promotion.redemptions.numberClaimed', promotion.redemptions.numberClaimed);
        return false;
      }
      var givePromotion = false;
      for (var i in promotion.qualifyingItems.items) {
        var mapObj      = promotion.qualifyingItems.items[i];
        var qtyRequired = mapObj.quantityToPurchase;
        var lineInCart  = [];
        _(lines).each(function (line) {
          nlapiLogExecution('DEBUG', 'checkIfOrderQualifiesLines', JSON.stringify(isPromotionLine(line)));
          nlapiLogExecution('DEBUG', 'checkIfOrderQualifiesLines', line.item.internalid);
          if (Number(line.item.internalid) === Number(mapObj.itemIds[i]) && !isPromotionLine(line)) {
            lineInCart.push(line);
          }
        });

        nlapiLogExecution('DEBUG', 'lineInCart', JSON.stringify(lineInCart));
        if (lineInCart.length > 0) {
          var qtyInCart = 0
          _(lineInCart).each(function (line) {
            nlapiLogExecution('DEBUG', 'line.isDiscount', line.discount);
            if (line.discount > 0) qtyInCart += 0;
            if (isPromotionLine(line)) qtyInCart += 0;
            qtyInCart += line.quantity;
          })

          nlapiLogExecution('DEBUG', 'qtyInCart ' + qtyInCart, 'qtyRequired ' + qtyRequired);
          if (qtyInCart >= qtyRequired) {
            givePromotion = true;
            break;
          }
        }
      }

      nlapiLogExecution('DEBUG', 'checkIfOrderQualifiesLines single: give promotion', givePromotion)
      return givePromotion;
    }
    return false;
  }

  function getPromotionLines(lines) {
    var linesInCart = {
      codes         : [],
      promotionLines: [],
      promotionCount: 0
    };
    _(lines).each(function (line) {
      //nlapiLogExecution('DEBUG', 'getPromotionLines', JSON.stringify(line.options))
      var promotionField = _.findWhere(line.options, {cartOptionId: PROMO_CODE_FIELD});
      if (promotionField && promotionField.value) {
        linesInCart.codes.push(promotionField.value.internalid);
        linesInCart.promotionLines.push(line);
      }
    });
    linesInCart.promotionCount = _(linesInCart.codes).countBy(function (code) {return code})
    return linesInCart;
  }

  function getPromotionLinesToAddFromPromotion(promotion) {
    var linesToAdd = []
    if(promotion.type === 1) {
      linesToAdd.push(getPromotionLineToAdd(CLEANING_KIT_ITEM_ID, Number(promotion.redemptions.numberCanClaim), promotion.promocode));
    }
    else {
      for (var i = 0; i < promotion.itemsToAdd.items.length; i++) {
        nlapiLogExecution('DEBUG', 'single: give promotion.promocode', promotion.promocode)
        linesToAdd.push(getPromotionLineToAdd(promotion.itemsToAdd.items[i].itemId, Number(promotion.itemsToAdd.items[i].quantityToAdd), promotion.promocode));
      }
    }
    return linesToAdd;
  }

  function getInvalidPromotionLinesByPromotion(lines, promotion) {
    var linesToUpdate  = {linesToRemove: [], linesToUpdate: []};
    var itemsEligible  = _.pluck(promotion.itemsToAdd.items, 'itemId');
    var orderQualifies = checkIfOrderQualifiesLines(lines, promotion);
    nlapiLogExecution('DEBUG', 'getInvalidPromotionLinesByPromotion itemsEligible ' + promotion.promocode + ' orderQualifies ' + orderQualifies, JSON.stringify(itemsEligible))
    _(lines).each(function (line) {
      var isPromotionLine = _.findWhere(line.options, {cartOptionId: PROMO_CODE_FIELD});
      nlapiLogExecution('DEBUG', 'getInvalidPromotionLinesByPromotion check isPromotionLine', JSON.stringify(isPromotionLine));
      if (!!isPromotionLine && isPromotionLine.value.internalid === promotion.promocode) {
        nlapiLogExecution('DEBUG', 'getInvalidPromotionLinesByPromotion check if remove line that doesn\'t qualify ', JSON.stringify(line));
        if (!orderQualifies) { linesToUpdate.linesToRemove.push(line); }
        else {
          nlapiLogExecution('DEBUG', 'getInvalidPromotionLinesByPromotion promotion ', JSON.stringify(promotion));
          if (promotion.type !== 1) {
            var qualifyingItemInPromotionMap = _(promotion.itemsToAdd.items).where({itemId: line.item.internalid.toString()}); // check if item in cart
            nlapiLogExecution('DEBUG', 'getInvalidPromotionLinesByPromotion entry ', JSON.stringify(qualifyingItemInPromotionMap))
            if (qualifyingItemInPromotionMap && qualifyingItemInPromotionMap.length > 0) {
              var quantityAllowedOfPromotion = Number(qualifyingItemInPromotionMap[0].quantityToAdd);
              var quantityWrong              = line.quantity > quantityAllowedOfPromotion || line.quantity < quantityAllowedOfPromotion;
              nlapiLogExecution('DEBUG', 'getInvalidPromotionLinesByPromotion quantity', quantityWrong)
              if (quantityWrong) {
                linesToUpdate.linesToUpdate.push({
                  line            : line,
                  eligibleQuantity: Number(qualifyingItemInPromotionMap[0].quantityToAdd)
                });
              }
            }
          }
          else {
            var quantityAllowedOfPromotion = Number(promotion.redemptions.numberCanClaim)
            nlapiLogExecution('DEBUG', 'getInvalidPromotionLinesByPromotion cleaning kit ' + line.quantity, quantityAllowedOfPromotion);
            var quantityWrong              = line.quantity > quantityAllowedOfPromotion;
            if (quantityWrong) {
              linesToUpdate.linesToUpdate.push({
                line            : line,
                eligibleQuantity: Number(quantityAllowedOfPromotion)
              });
            }
          }
        }
      }

    });
    return linesToUpdate;
  }

  function checkForRogueLines(lines, promotionsInCart) {
    var self             = this;
    var customPromocodes = _.pluck(promotionsInCart, 'promocode');
    var rougePromotions  = _(promotionsInCart.codes).difference(customPromocodes);
    nlapiLogExecution('DEBUG', 'checkForRogueLines promotionsInCart', JSON.stringify(promotionsInCart));
    nlapiLogExecution('DEBUG', 'checkForRogueLines ' + customPromocodes.toString(), JSON.stringify(rougePromotions));
    if (rougePromotions.length > 0) {
      _(rougePromotions).each(function (promocode) {
        removePromotionsNotEligible(lines, getPromotionLinesByPromotion(promocode))
      })
    }
  }

  function getPromotionLinesByPromotion(lines, promotion) { // string[]
    var linesInCart = [];
    _(lines).each(function (line) {
      var promotionField = _(line.options).findWhere({cartOptionId: PROMO_CODE_FIELD});
      if (promotionField && promotionField.value) {
        if (promotionField.value === promotion) {
          linesInCart.push(line);
        }
      }
    });

    return linesInCart;
  }

  function updateQuantityOnPromotionLines(invalidLines) {
    invalidLines.forEach(function (line) {
      nlapiLogExecution('DEBUG', 'updateQuantityOnPromotionLines', JSON.stringify(line));
      var lineObj = line.line;
      nlapiLogExecution('DEBUG', 'updateQuantityOnPromotionLines lineObj', JSON.stringify(lineObj.internalid));
      try {
        ModelsInit.order.updateItemQuantity( {orderitemid: lineObj.internalid, quantity: line.eligibleQuantity})
        //LiveOrder.updateLine(lineObj.internalid, {quantity: line.eligibleQuantity});
      } catch (e) {
        nlapiLogExecution('error', 'updateQuantityOnPromotionLines', JSON.stringify(e));
      }
    })
  }

  function removePromotionsNotEligible(invalidLines) {
    for (var i = 0; i < invalidLines.length; i++) {
      LiveOrder.removeLine(invalidLines[i].internalid)
    }
  }

  function handlePromotions(lines) {
    //var lines              = getOrderItems(); // no reference to line
    var promotionData      = getPromotionData();
    var promotionLines     = getPromotionLines(lines);
    var invalidLines       = [];
    var linesWrongQuantity = [];
    if (promotionLines.codes.length > 0) {
      _.each(promotionData.promotions, function (promo) {
        if (promotionLines.codes.indexOf(promo.promocode) > -1) {
          var linesToUpdate = getInvalidPromotionLinesByPromotion(lines, promo);
          nlapiLogExecution('DEBUG', 'handlePromotions linesToUpdate', JSON.stringify(linesToUpdate));
          if (linesToUpdate.linesToRemove.length > 0) {
            invalidLines = invalidLines.concat(linesToUpdate.linesToRemove)
          }
          if (linesToUpdate.linesToUpdate.length > 0) {
            linesWrongQuantity = linesWrongQuantity.concat(linesToUpdate.linesToUpdate)
          }
        }
      })
      if (invalidLines.length > 0) {
        nlapiLogExecution('DEBUG', 'handlePromotions invalidLines', JSON.stringify(invalidLines));
        removePromotionsNotEligible(invalidLines)
      }
      if (linesWrongQuantity.length > 0) {
        try {
          updateQuantityOnPromotionLines(linesWrongQuantity)
        } catch (e) {
          nlapiLogExecution('error', 'handlePromotions', JSON.stringify(e));
        }
      }
      //checkForRogueLines(lines, promotionLines);
    }

    var autoApplyPromotions = [];
    _.each(promotionData.promotions, function (promo) {
      if (promo.type === 1 && promo.autoApply) {// cleaning kit
        var lineAlreadyInCart = promotionLines.codes.indexOf(promo.promocode) > -1;
        nlapiLogExecution('DEBUG', 'handlePromotions lineAlreadyInCart', lineAlreadyInCart);
        if (!lineAlreadyInCart && Number(promo.redemptions.numberCanClaim) > 0) {
          autoApplyPromotions.push(getPromotionLineToAdd(CLEANING_KIT_ITEM_ID, Number(promo.redemptions.numberCanClaim), promo.promocode));
        }
      }
      else {
        if (promo.autoApply) {
          var givePromotion     = checkIfOrderQualifies(lines, promo);
          var lineAlreadyInCart = promotionLines.codes.indexOf(promo.promocode) > -1;
          if (!lineAlreadyInCart && givePromotion) {
            autoApplyPromotions.push(getPromotionLinesToAddFromPromotion(promo))
          }
        }
      }
    });

    if (autoApplyPromotions.length > 0) {
      try {
        nlapiLogExecution('DEBUG', 'before:LiveOrder.addPromotion linesToAdd[0]', JSON.stringify(autoApplyPromotions));
        var itemsAdded = LiveOrder.addLines(autoApplyPromotions);
        nlapiLogExecution('DEBUG', 'before:LiveOrder.addPromotion itemsAdded', JSON.stringify(itemsAdded));
      } catch (e) {
        nlapiLogExecution('ERROR', 'before:LiveOrder.addPromotion failed adding free lines', JSON.stringify(e))
      }
    }
  }

  if (LiveOrder && StoreItem) {
    Application.on('after:LiveOrder.addPromotion', function beforeAddPromotion(self, promo_code) {
      nlapiLogExecution('DEBUG', 'after:LiveOrder.addPromotion', JSON.stringify(arguments));
      return promo_code;
    });

    Application.on('after:LiveOrder.setPromoCodes', function beforeAddPromotion(self, promo_code) {
      nlapiLogExecution('DEBUG', 'after:LiveOrder.setPromoCodes', JSON.stringify(arguments));
      return promo_code;
    });

    Application.on('before:LiveOrder.addPromotion', function beforeAddPromotion(self, promo_code) {
      nlapiLogExecution('DEBUG', 'before:LiveOrder.addPromotion', JSON.stringify(self));
      if (ModelsInit.session.isLoggedIn2()) {
        var promotionData = getPromotionData();
        var linesToAdd    = [];
        var promoRecord   = _(promotionData.promotions).find(function (promo) {
          return promo.promocode.toLowerCase() == promo_code.toLowerCase();
        });

        nlapiLogExecution('DEBUG', 'before:LiveOrder.addPromotion', 'searching for promo that matches ' + promo_code);
        nlapiLogExecution('DEBUG', 'before:LiveOrder.addPromotion', 'matching ' + JSON.stringify(promoRecord));
        if (promoRecord) {
          var lines         = getOrderItems();
          var givePromotion = checkIfOrderQualifies(lines, promoRecord);
          nlapiLogExecution('DEBUG', 'before:LiveOrder.addPromotion', 'give promotion? ' + givePromotion);
          var promotionLines = getPromotionLines(lines);
          nlapiLogExecution('DEBUG', 'before:LiveOrder.addPromotion promotionLines', JSON.stringify(promotionLines));
          var alreadyInCart = promotionLines.codes.indexOf(promo_code) > -1;
          if (alreadyInCart) {
            nlapiLogExecution('DEBUG', 'before:LiveOrder.addPromotion', 'promotion already in cart? yes');
            return promo_code;
          }
          if (givePromotion) {
            var promotionLineInCart = getValidPromotionLinesByPromotion(lines, promoRecord);
            if (promotionLineInCart.length < 1) {
              linesToAdd = getPromotionLinesToAddFromPromotion(promoRecord);
              if (linesToAdd.length > 0) {
                try {
                  var itemsAdded = LiveOrder.addLines(linesToAdd);
                  nlapiLogExecution('DEBUG', 'before:LiveOrder.addPromotion itemsAdded', JSON.stringify(itemsAdded));
                } catch (e) {
                  nlapiLogExecution('ERROR', 'before:LiveOrder.addPromotion failed adding free lines', JSON.stringify(e))
                }
              }
            }
          }
        }
        else {
          nlapiLogExecution('DEBUG', 'before:LiveOrder.addPromotion', 'no custom match found');
        }
      }
      // on success returns full order object
      return promo_code;
    });

    Application.on('after:LiveOrder.get', function afterGet(self, result) {
      var lines = result.lines;
      nlapiLogExecution('DEBUG', 'after:LiveOrder.get', JSON.stringify(lines));
      // reconcile promotion lines
      handlePromotions(lines);
      var order_fields = self.getFieldValues();
      result.lines     = self.getLines(order_fields);
      return result;
    });
  }
});
