define('TreveraPromotions.Helpers',
  [
    'SC.Model',
    'SC.Models.Init',
    'LiveOrder.Model',
    'Configuration',
    'underscore'
  ], function (
    SCModel,
    ModelsInit,
    LiveOrder,
    Configuration,
    _
  ) {
    'use strict';

    var PROFILE_HAS_WARRANTY_FIELD = 'custentity_hf_account_has_warranty';
    var CLEANING_KIT_ITEM_ID       = 120; //
    var PROMO_CODE_FIELD           = 'custcol_custom_promotion_used'; // flag for items that are promo line items
    var PROMO_CODE_FIELD_MODEL     = 'CUSTCOL_CUSTOM_PROMOTION_USED'; // flag for items that are promo line items

    return {
      /* Get order items on live order model */
      getOrderItems: function getOrderItems() {
        var lines;
        try {
          lines = ModelsInit.order.getItems();
        } catch (e) {
          lines = [];
        }
        return lines;
      },

      /* Get order lines on live order model */
      getOrderLines: function getOrderLines() {
        var orderFields = LiveOrder.getFieldValues();
        var lines;
        try {
          lines = LiveOrder.getLines(orderFields);
        } catch (e) {
          lines = [];
        }
        return lines;
      },

      /* Apply and Reconcile Promotions */
      handlePromotions: function handlePromotions(lines) {
        var promotionData      = this.getPromotionData();
        var promotionLines     = this.getPromotionLines(lines);
        var invalidLines       = [];
        var linesWrongQuantity = [];
        var self = this;
        if (promotionLines.codes.length > 0) {
          _.each(promotionData.promotions, function (promo) {
            if (promotionLines.codes.indexOf(promo.promocode) > -1) {
              var linesToUpdate = self.getInvalidPromotionLinesByPromotion(lines, promo);
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
            this.removePromotionsNotEligible(invalidLines)
          }
          if (linesWrongQuantity.length > 0) {
            try {
              this.updateQuantityOnPromotionLines(linesWrongQuantity)
            } catch (e) {
              nlapiLogExecution('error', 'handlePromotions', JSON.stringify(e));
            }
          }
          //checkForRogueLines(lines, promotionLines);
        }
        var autoApplyPromotions = [];
        _.each(promotionData.promotions, function (promo) {
          if (promo.promotion_type === 1 && promo.autoApply) {// cleaning kit
            var lineAlreadyInCart = promotionLines.codes.indexOf(promo.promocode) > -1;
            nlapiLogExecution('DEBUG', 'handlePromotions lineAlreadyInCart', lineAlreadyInCart);
            if (!lineAlreadyInCart && Number(promo.redemptions.numberCanClaim) > 0) {
              autoApplyPromotions.push(self.getPromotionLineToAdd(CLEANING_KIT_ITEM_ID, Number(promo.redemptions.numberCanClaim), promo.promocode));
            }
          }
          else {
            if (promo.autoApply) {
              var givePromotion     = self.checkIfOrderQualifies(lines, promo);
              var lineAlreadyInCart = promotionLines.codes.indexOf(promo.promocode) > -1;
              if (!lineAlreadyInCart && givePromotion) {
                autoApplyPromotions.push(self.getPromotionLinesToAddFromPromotion(promo))
              }
            }
          }
        });

        if (autoApplyPromotions.length > 0) {
          try {
            var itemsAdded = LiveOrder.addLines(autoApplyPromotions);
          } catch (e) {
            nlapiLogExecution('ERROR', 'TreveraPromotions:handlePromotions failed adding free lines', JSON.stringify(e))
            return {
              success: false,
              message: 'Error auto applying promotions',
              itemsAdded: 0
            }
          }
        }

        return {
          itemsAdded: autoApplyPromotions.length
        }
      },

      isPromotionItem: function isPromotionItem(line) {
        var promotionField = _(line.options).findWhere({id: PROMO_CODE_FIELD_MODEL});
        return !!promotionField && promotionField.value;
      },

      isPromotionLine: function isPromotionLine(line) {
        var promotionField = _(line.options).findWhere({cartOptionId: PROMO_CODE_FIELD});
        return !!promotionField && promotionField.value;
      },

      checkIfOrderQualifies: function checkIfOrderQualifies(lines, promotion) {
        if (promotion.promotion_type === 1) {
          return Number(promotion.redemptions.numberCanClaim) > 0;
        }
        else if (promotion.qualifyingItems.qualifier_type === 'multiple') { // then must hit from each group
          if (!promotion.redemptions.canClaim) {
            nlapiLogExecution('DEBUG', 'checkIfOrderQualifies promotion.redemptions.numberClaimed', promotion.redemptions.numberClaimed);
            return false;
          }
          return this.qualifiesForMultipleItemPromos(lines, promotion)
        }
        else if (promotion.qualifyingItems.qualifier_type === 'single') {
          if (!promotion.redemptions.canClaim) {
            nlapiLogExecution('DEBUG', 'checkIfOrderQualifies promotion.redemptions.numberClaimed', promotion.redemptions.numberClaimed);
            return false;
          }
          return this.qualifiesForSingleItemPromotion(lines, promotion)
        }
        return false;
      },

      qualifiesForMultipleItemPromos: function qualifiesForMultipleItemPromos(lines, promotion) {
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
                  if (self.isPromotionLine(line)) qtyInCart += 0;
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
      },

      qualifiesForSingleItemPromotion: function qualifiesForSingleItemPromotion(lines, promotion) {
        var givePromotion = false;
        var self = this;
        var lineInCart      = {};
        var qualifier       = promotion.qualifyingItems.items[0]; // only one set on singles
        var qualifyingItems = qualifier.itemIds;
        var qtyRequired     = qualifier.quantityToPurchase;

        _(lines).each(function (line) {
          var isLinePromotion = self.isPromotionLine(line);
          var item = line.item.internalid;
          if(!isLinePromotion && qualifyingItems.indexOf(item) > -1 ){ // promotions lines don't count
            if(lineInCart[item]) {
              lineInCart[item] = lineInCart[item] + line.quantity;
            }
            else {
              lineInCart[item] = line.quantity
            }
          }
        });
        _(qualifyingItems).each(function (q) {
          if (lineInCart[q] >= qtyRequired) {
            givePromotion = true;
          }
        });

        return givePromotion;
      },

      getPromotionLines: function getPromotionLines(lines) {
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
      },

      getPromotionLinesToAddFromPromotion: function getPromotionLinesToAddFromPromotion(promotion) {
        var linesToAdd = []
        if (promotion.promotion_type === 1) {
          linesToAdd.push(this.getPromotionLineToAdd(CLEANING_KIT_ITEM_ID, Number(promotion.redemptions.numberCanClaim), promotion.promocode));
        }
        else {
          for (var i = 0; i < promotion.itemsToAdd.items.length; i++) {
            nlapiLogExecution('DEBUG', 'single: give promotion.promocode', promotion.promocode)
            linesToAdd.push(this.getPromotionLineToAdd(promotion.itemsToAdd.items[i].itemId, Number(promotion.itemsToAdd.items[i].quantityToAdd), promotion.promocode));
          }
        }
        return linesToAdd;
      },

      getInvalidPromotionLinesByPromotion: function getInvalidPromotionLinesByPromotion(lines, promotion) {
        var linesToUpdate  = {linesToRemove: [], linesToUpdate: []};
        var itemsEligible  = _.pluck(promotion.itemsToAdd.items, 'itemId');
        var orderQualifies = this.checkIfOrderQualifies(lines, promotion);
        nlapiLogExecution('DEBUG', 'getInvalidPromotionLinesByPromotion itemsEligible ' + promotion.promocode + ' orderQualifies ' + orderQualifies, JSON.stringify(itemsEligible))
        _(lines).each(function (line) {
          var isPromotionLine = _.findWhere(line.options, {cartOptionId: PROMO_CODE_FIELD});
          nlapiLogExecution('DEBUG', 'getInvalidPromotionLinesByPromotion check isPromotionLine', JSON.stringify(isPromotionLine));
          if (!!isPromotionLine && isPromotionLine.value.internalid === promotion.promocode) {
            nlapiLogExecution('DEBUG', 'getInvalidPromotionLinesByPromotion check if remove line that doesn\'t qualify ', JSON.stringify(line));
            if (!orderQualifies) { linesToUpdate.linesToRemove.push(line); }
            else {
              nlapiLogExecution('DEBUG', 'getInvalidPromotionLinesByPromotion promotion ', JSON.stringify(promotion));
              if (promotion.promotion_type !== 1) {
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
                var quantityWrong = line.quantity > quantityAllowedOfPromotion;
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
      },

      checkForRogueLines: function checkForRogueLines(lines, promotionsInCart) {
        var self             = this;
        var customPromocodes = _.pluck(promotionsInCart, 'promocode');
        var rougePromotions  = _(promotionsInCart.codes).difference(customPromocodes);
        nlapiLogExecution('DEBUG', 'checkForRogueLines promotionsInCart', JSON.stringify(promotionsInCart));
        nlapiLogExecution('DEBUG', 'checkForRogueLines ' + customPromocodes.toString(), JSON.stringify(rougePromotions));
        if (rougePromotions.length > 0) {
          _(rougePromotions).each(function (promocode) {
            this.removePromotionsNotEligible(lines, this.getPromotionLinesByPromotion(promocode))
          })
        }
      },

      getPromotionLinesByPromotion: function getPromotionLinesByPromotion(lines, promotion) { // string[]
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
      },

      updateQuantityOnPromotionLines: function updateQuantityOnPromotionLines(invalidLines) {
        invalidLines.forEach(function (line) {
          nlapiLogExecution('DEBUG', 'updateQuantityOnPromotionLines', JSON.stringify(line));
          var lineObj = line.line;
          nlapiLogExecution('DEBUG', 'updateQuantityOnPromotionLines lineObj', JSON.stringify(lineObj.internalid));
          try {
            ModelsInit.order.updateItemQuantity({orderitemid: lineObj.internalid, quantity: line.eligibleQuantity})
            //LiveOrder.updateLine(lineObj.internalid, {quantity: line.eligibleQuantity});
          } catch (e) {
            nlapiLogExecution('error', 'updateQuantityOnPromotionLines', JSON.stringify(e));
          }
        })
      },

      removePromotionsNotEligible: function removePromotionsNotEligible(invalidLines) {
        for (var i = 0; i < invalidLines.length; i++) {
          LiveOrder.removeLine(invalidLines[i].internalid)
        }
      },

      getValidPromotionLinesByPromotion: function getValidPromotionLinesByPromotion(lines, promotion) {
        var linesInCart = [];
        _(lines).each(function (line) {
          var promotionField = _(line.options).findWhere({id: PROMO_CODE_FIELD_MODEL});
          nlapiLogExecution('DEBUG', 'getValidPromotionLinesByPromotion: line', JSON.stringify(line.options));
          nlapiLogExecution('DEBUG', 'getValidPromotionLinesByPromotion: promotionField', JSON.stringify(promotionField));
          if (promotionField && promotionField.value) {
            var items = _(promotion.itemsToAdd.items).pluck('itemId')
            if (promotion.promotion_type === 1 && promotionField.value.internalid === promotion.promocode) {
              linesInCart.push(line);
            }
            else if (promotionField.value.internalid === promotion.promocode && items.indexOf(line.internalid.toString()) > -1) {
              linesInCart.push(line);
            }
          }
        });
        return linesInCart;
      },

      getPromotionLineToAdd: function getPromotionLineToAdd(item, quantity, promotion) {
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
      },

      getPromotionData: function getPromotionData() {
        var ctx                = ModelsInit.context;
        var promoData          = ctx.getSessionObject('trvPromos') || "";
        var promoDataRefreshed = ctx.getSessionObject('trvPromosRefreshTime') || "";
        var now                = new Date();
        var session            = 60 * 60 * 1000; // one hour
        var refreshData        = true;

        nlapiLogExecution('DEBUG', 'promoData', JSON.stringify(promoData));
        if (promoDataRefreshed.length > 0) {
          refreshData = now.getDate() - new Date(promoDataRefreshed) > session;
          ctx.setSessionObject('trvPromosRefreshTime', now.getDate().toString());
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
          nlapiLogExecution('ERROR', 'couldn\'t parse body', JSON.stringify(e));
          return {};
        }
      },

      findLineFromPromotionKey: function findLineFromPromotionKey(orderLines, lineKey, findDiscountItem) {
        var orderLine = _(orderLines).filter(function (line) {
          var isDiscount             = line.item && line.item.type === 'Discount';
          var relatedItemLineKey = _(line.options).findWhere({cartOptionId: PROMO_CODE_FIELD}) || {};
          if (relatedItemLineKey && relatedItemLineKey.value) {
            if (!findDiscountItem) {
              return !isDiscount && relatedItemLineKey.value.internalid === lineKey;
            }
            else {
              return isDiscount && relatedItemLineKey.value.internalid === lineKey;
            }
          }
          return false;
        });
        log('matching order line found for key ' + lineKey, ' searching for core? ' + findDiscountItem);
        return orderLine.length > 0 ? orderLine[0] : false;
      }
    }
  });
