define(
  'Promotions.Helpers'
  , [
    'Promotions.Extension.SS2Model',
    'underscore'
  ]
  , function (
    PromotionsModel,
    _
  ) {
    'use strict';

    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var monthAbbr  = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

    return {
      setPromotionsInCart: function () {
        var self               = this;
        var lines              = [];
        var promotionsInCart   = self.getPromotionLines();
        var eligiblePromotions = _.pluck(self.promotions.promotions, 'promocode');
        var invalidLines       = [];
        var linesWrongQuantity = [];
        _.each(self.promotions.promotions, function (promo) {
          var linesToUpdate = self.getInvalidPromotionLinesByPromotion(promo);
          console.log(linesToUpdate);
          if (linesToUpdate.linesToRemove.length > 0) {
            invalidLines = invalidLines.concat(linesToUpdate.linesToRemove)
          }
          if (linesToUpdate.linesToUpdate.length > 0) {
            linesWrongQuantity = linesWrongQuantity.concat(linesToUpdate.linesToUpdate)
          }
        })

        if (invalidLines.length > 0) {
          self.removePromotionsNotEligible(invalidLines)
        }

        if (linesWrongQuantity.length > 0) {
          self.updateQuantityOnPromotionLines(linesWrongQuantity)
        }

        self.checkForRougeLines();

        _.each(self.promotions.promotions, function (promotion) {
          if (promotion.type === 1) {// cleaning kit
            var lineAlreadyInCart = self.checkIfPromotionInOrder(self.lines, promotion);
            if (!lineAlreadyInCart) {
              lines.push({
                item    : {
                  internalid: 120 // cleaning kit
                },
                quantity: promotion.eligibility.numberWarranties,
                options : [{
                  value       : {
                    internalid: promotion.promocode
                  },
                  cartOptionId: 'custcol_custom_promotion_used',
                  label       : 'Promotion Used'
                }]
              })
            }
          }
          else {
            var givePromotion       = self.checkIfOrderQualifies(self.lines, promotion);
            var promotionLineInCart = self.getValidPromotionLinesByPromotion(promotion);
            if (givePromotion) {
              for (var i = 0; i < promotion.itemsToAdd.items.length; i++) { //todo: support for pick from list
                if (promotionLineInCart.length > 0) {
                  //todo: reconcile quantity
                }
                else if(promotion.autoApply) {
                  lines.push({
                    item    : {
                      internalid: Number(promotion.itemsToAdd.items[i].itemId) // cleaning kit
                    },
                    quantity: Number(promotion.itemsToAdd.items[i].quantityToAdd),
                    options : [{
                      value       : {
                        internalid: promotion.promocode
                      },
                      cartOptionId: 'custcol_custom_promotion_used',
                      label       : 'Promotion Used'
                    }]
                  })
                }
              }
            }
            else {
              if (promotionLineInCart.length > 0) {
                promotionLineInCart.forEach(function (line) {
                  self.CART.removeLine({
                    line_id: line.internalid
                  }).then(function () {
                  });
                })
              }
            }
          }
        });
        self.addLinesToCart(lines)
      },

      addLinesToCart: function (CART, lines) {
        var self = this;
        try {
          if (lines.length > 0) {
            CART.addLines({lines: lines}).fail(function (resp) {
              console.log(resp);
              // TODO: show message
            }).then(function (resp) {
              console.log('success', resp);
              // TODO: show message
              // TODO: custom formatting based on if custcol_custom_promotion_used is used
            });
          }
        } catch
          (e) {
          console.log(e)
        }
      },

      isPromotionCustom: function (promotions, code) {
        var customPromocodes = _.pluck(promotions, 'promocode');
        customPromocodes = _.map(customPromocodes, function (code) {return  code.toLowerCase();})
        console.log(customPromocodes);
        return customPromocodes.indexOf(code.toLowerCase()) > -1
      },

      checkForRougeLines: function () {
        var self = this;
        var promotionsInCart = self.getPromotionLines();
        var customPromocodes = _.pluck(this.promotions.promotions, 'promocode');
        var rougePromotions = _.difference(promotionsInCart.codes, customPromocodes);
        console.log(rougePromotions);
        if(rougePromotions.length > 0) {
          _.each(rougePromotions, function (promocode) {
            self.removePromotionsNotEligible(self.getPromotionLinesByPromotion(promocode))
          })
        }
      },

      removePromotionsNotEligible: function removePromotionsNotEligible(CART, invalidLines) {
        var self     = this;
        invalidLines = _.sortBy(invalidLines, function (line) { return line.internalid});
        invalidLines.forEach(function (line) {
          CART.removeLine({
            line_id: line.internalid
          }).then(function () {
            console.log(line.internalid + ' removed because it isn\'t eligible or the promotion no longer qualifies: ', line)
          });
        })
      },

      updateQuantityOnPromotionLines: function updateQuantityOnPromotionLines(CART, invalidLines) {
        var self = this;
        invalidLines.forEach(function (line) {
          CART.updateLine({
            line: {
              internalid: line.line.internalid,
              quantity  : line.eligibleQuantity
            }
          }).then(function () {
            console.log("Line updated successfully", line);
          });
        })
      },

      isPromotionLine: function isPromotionLine(line) {
        var cartLine = line;
        if (cartLine.line) cartLine = cartLine.line;
        var promotionField = _.findWhere(cartLine.options, {cartOptionId: 'custcol_custom_promotion_used'});
        return !!promotionField && promotionField.value;
      },

      getPromotionLines: function getPromotionLines(lines) {
        var linesInCart = {
          codes         : [],
          promotionLines: [],
          promotionCount: 0
        };
        var self        = this;
        _.each(lines, function (line) {
          var promotionField = _.findWhere(line.options, {cartOptionId: 'custcol_custom_promotion_used'});
          if (promotionField && promotionField.value) {
            linesInCart.codes.push(promotionField.value.internalid);
            linesInCart.promotionLines.push(line);
          }
        });
        linesInCart.promotionLines = _.sortBy(linesInCart.promotionLines, function (line) { return line.internalid});
        linesInCart.promotionCount = _.countBy(linesInCart.codes, function (code) {return code})
        return linesInCart;
      },

      getValidPromotionLinesByPromotion: function getValidPromotionLinesByPromotion(promotion) {
        var linesInCart = [];
        var self        = this;
        _.each(self.lines, function (line) {
          var promotionField = _.findWhere(line.options, {cartOptionId: 'custcol_custom_promotion_used'});
          if (promotionField && promotionField.value) {
            var items = _.pluck(promotion.itemsToAdd.items, 'itemId')
            if (promotionField.value.internalid === promotion.promocode && items.indexOf(line.item.internalid.toString()) > -1) {
              linesInCart.push(line);
            }
          }
        });

        return linesInCart;
      },

      getInvalidPromotionLinesByPromotion: function getInvalidPromotionLinesByPromotion(promotion) {
        var linesToUpdate = {
          linesToRemove: [],
          linesToUpdate: []
        };
        var self          = this;
        _.each(self.lines, function (line) {
          var promotionField = _.findWhere(line.options, {cartOptionId: 'custcol_custom_promotion_used'});
          if (promotionField && promotionField.value) {
            var removeLines = [];
            var itemsEligible = _.pluck(promotion.itemsToAdd.items, 'itemId');
            _.each(promotion.itemsToAdd.items, function (itemToAdd) {
              if (promotionField.value.internalid === promotion.promocode) {
                var itemsWrong    = itemsEligible.indexOf(line.item.internalid.toString()) < 0;
                var quantityWrong = line.quantity > Number(itemToAdd.quantityToAdd) || line.quantity < Number(itemToAdd.quantityToAdd);
                if (itemsWrong) {
                  linesToUpdate.linesToRemove.push(line)
                }
                if (quantityWrong) {
                  linesToUpdate.linesToUpdate.push({
                    line            : line,
                    eligibleQuantity: Number(itemToAdd.quantityToAdd)
                  })
                }
              }
            })
          }
        });

        return linesToUpdate
      },

      getPromotionLinesByPromotion: function getPromotionLinesByPromotion(promotion) { // string[]
        var linesInCart = [];
        var self        = this;
        _.each(self.lines, function (line) {
          var promotionField = _.findWhere(line.options, {cartOptionId: 'custcol_custom_promotion_used'});
          if (promotionField && promotionField.value) {
            if (promotionField.value.internalid === promotion) {
              linesInCart.push(line);
            }
          }
        });

        return _.sortBy(linesInCart, function (line) { return line.internalid});
      },

      checkIfPromotionInOrder: function checkIfPromotionInOrder(cartLines, promotion) {
        var lineAlreadyInCart = false;
        _.each(cartLines, function (line) {
          var promotionField = _.findWhere(line.options, {cartOptionId: 'custcol_custom_promotion_used'});
          if (promotionField && promotionField.value) {
            if (promotionField.value.internalid === promotion.promocode) lineAlreadyInCart = true;
          }
        });

        return lineAlreadyInCart;
      },

      /*
      * "items": [
          {
            "itemIds": [
            "1223"
            ],
            "quantityToPurchase": 2,
            "isOr": true
          },
          {
            "itemIds": [
            "550",
            "974"
            ],
            "quantityToPurchase": 3,
            "isOr": true
          }
        ],
        "quantifier": "any"
      * */

      checkIfOrderQualifies: function checkIfOrderQualifies(cartLines, promotion) {
        var self = this;
        if (promotion.qualifyingItems.type === 'multiple') { // then must hit from each group
          var qualificationMap   = {};
          var qualificationIndex = 0;
          for (var i in promotion.qualifyingItems.items) {
            var itemIndex     = 0;
            var mapObj        = promotion.qualifyingItems.items[i];
            var caseMetForReq = false;
            var isOr          = mapObj.isOr;
            var qtyRequired   = mapObj.quantityToPurchase;

            for (var i = 0; i < mapObj.itemIds.length; i++) {
              var key               = 'case' + '_' + qualificationIndex;
              qualificationMap[key] = false;
              if (isOr) {
                var lineInCart = _.filter(cartLines, function (line) {
                  return line.item.internalid === Number(mapObj.itemIds[i])
                });

                if (_.size(lineInCart) > 0) {
                  var qtyInCart = _.reduce(
                    _.map(lineInCart, function (line) {
                      console.log('pluck', line);
                      if (line.extras.discount > 0) return 0;
                      if (self.isPromotionLine(line)) return 0;
                      return line.quantity;
                    }),
                    function (memo, num) { return memo + num}, 0)

                  console.log('qtyInCart', qtyInCart, 'qtyRequired', qtyRequired);
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
                _.each(cartLines, function (line) {
                  var itemID = line.item.internalid.toString();
                  var qty    = line.quantity;
                  if (mapObj.indexOf(itemID) > -1) {
                    caseMet[itemID] = qty >= qtyRequired;
                  }
                });
                var summary = _.countBy(caseMet, function (met) {
                  return met;
                });
                console.log(summary);
              }
              itemIndex++;
            }
            qualificationIndex++;
          }

          console.log(qualificationMap);
        }
        else if (promotion.qualifyingItems.type === 'single') {
          var givePromotion = false;
          for (var i in promotion.qualifyingItems.items) {
            var mapObj      = promotion.qualifyingItems.items[i];
            var qtyRequired = mapObj.quantityToPurchase;
            var lineInCart  = _.filter(cartLines, function (line) {
              return line.item.internalid === Number(mapObj.itemIds[i])
            });

            if (_.size(lineInCart) > 0) {
              var qtyInCart = _.reduce(
                _.map(lineInCart, function (line) {
                  if (line.extras.discount > 0) return 0;
                  if (self.isPromotionLine(line)) return 0;
                  return line.quantity;
                }),
                function (memo, num) { return memo + num}, 0)

              console.log('qtyInCart', qtyInCart, 'qtyRequired', qtyRequired);
              if (qtyInCart >= qtyRequired) {
                givePromotion = true;
                break;
              }
            }
          }

          console.log('single: give promotion', givePromotion)
          return givePromotion;
        }

        return false;
      },

      getFirstAndLastOfMonth: function getFirstAndLastOfMonth() {
        var now               = new Date();
        var firstDayOfMonthStr = (now.getMonth() + 1).toString() + '/1/' + now.getFullYear();
        var firstDayOfMonth    = new Date(firstDayOfMonthStr);
        var lastDayOfMonth     = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        var lastDayOfMonthStr  = (now.getMonth() + 1).toString() + '/' + lastDayOfMonth.getDate() + '/' + now.getFullYear();
        return {
          firstDayOfMonthStr: firstDayOfMonthStr,
          firstDayOfMonth   : firstDayOfMonth,
          lastDayOfMonthStr : lastDayOfMonthStr,
          lastDayOfMonth    : lastDayOfMonth,
          year              : now.getFullYear(),
          year2Digits       : now.getFullYear().toString().substring(2),
          month             : monthNames[now.getMonth()],
          monthAbbr         : monthAbbr[now.getMonth()]
        }
      },

      getCleaningKitPromotion: function getCleaningKitPromotion() {
        var dateObj = this.getFirstAndLastOfMonth();
        return 'CleaningKit' + dateObj.monthAbbr + '' + dateObj.year2Digits;
      }

    };
  });
