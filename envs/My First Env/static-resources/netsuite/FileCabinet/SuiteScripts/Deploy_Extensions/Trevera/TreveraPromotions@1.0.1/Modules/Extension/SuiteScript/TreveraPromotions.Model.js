define('TreveraPromotions.Model',
  [
    'SC.Model',
    'SC.Models.Init',
    'LiveOrder.Model',
    'TreveraPromotions.Helpers',
    'Configuration',
    'underscore'
  ], function (
    SCModel,
    ModelsInit,
    LiveOrder,
    Helpers,
    Configuration,
    _
  ) {
    'use strict';

    return SCModel.extend({
      name: 'TreveraPromotions.Model',

      checkForAutoApplyPromotions: function () {
        var lines      = Helpers.getOrderLines();
        var linesCount = 0;
        nlapiLogExecution('DEBUG', 'checkForAutoApplyPromotions', JSON.stringify(lines));
        // reconcile promotion lines
        var linesAdded = Helpers.handlePromotions(lines);
        return {
          success     : true
          , linesAdded: linesAdded
          , message   : 'checked for auto apply promotions complete'
        };
      },

      addPromotion: function (data) { // data is request body with promo code on it. Do we need user id?
        nlapiLogExecution('DEBUG', 'TreveraPromotions.Model:addPromotion', JSON.stringify(data));

        var promo_code = data.promo_code;
        if (this.isPromotionCustom(promo_code)) {
          var promotionData = Helpers.getPromotionData();
          var linesToAdd    = [];
          var promoRecord   = _(promotionData.promotions).find(function (promo) {
            return promo.promocode.toLowerCase() === promo_code.toLowerCase();
          });

          if (promoRecord) {
            var lines         = Helpers.getOrderLines();
            var givePromotion = Helpers.checkIfOrderQualifies(lines, promoRecord);
            var promotionLines = Helpers.getPromotionLines(lines);
            var alreadyInCart = promotionLines.codes.indexOf(promo_code) > -1;
            if (alreadyInCart) {
              nlapiLogExecution('DEBUG', 'TreveraPromotions.Model:addPromotion', 'promotion already in cart? yes');
              return {
                success: true,
                message: 'Promotion already in cart'
              };
            }
            if (givePromotion) {
              var promotionLineInCart = Helpers.getValidPromotionLinesByPromotion(lines, promoRecord);
              if (promotionLineInCart.length < 1) {
                linesToAdd = Helpers.getPromotionLinesToAddFromPromotion(promoRecord);
                if (linesToAdd.length > 0) {
                  try {
                    var itemsAdded = LiveOrder.addLines(linesToAdd);
                    nlapiLogExecution('DEBUG', 'TreveraPromotions.Model:addPromotio itemsAdded', JSON.stringify(itemsAdded));

                    return {
                      success: true,
                      message: 'Promotion added'
                    };
                  } catch (e) {
                    nlapiLogExecution('ERROR', 'TreveraPromotions.Model:addPromotio failed adding free lines', JSON.stringify(e))
                    return {
                      success: false,
                      message: 'There was a problem adding the promotion'
                    };
                  }
                }
              }
            }
          }
          else {
            nlapiLogExecution('DEBUG', 'TreveraPromotions.Model:addPromotion', 'no custom match found');
            return {
              success: false,
              message: 'There was a problem adding the promotion'
            };
          }
        }
        else {
          return {
            success : false,
            applyStd: true,
            message : 'Apply Standard'
          };
        }

        return {
          success: false,
          message: 'Failed to add promotion'
        };
      },

      isPromotionCustom: function (couponString) {
        var ctx              = ModelsInit.context;
        var customPromotions = ctx.getSessionObject('trvCustomPromotions') || "";
        if (customPromotions.length > 0) {
          nlapiLogExecution('DEBUG', 'isPromotionCustom ' + couponString, JSON.stringify(customPromotions));
          nlapiLogExecution('DEBUG', 'isPromotionCustom ' + couponString, customPromotions.indexOf(couponString));
          return customPromotions.indexOf(couponString) > -1;
        }
        else {
          var filters  = new Array();
          var now      = new Date();
          var todayStr = (now.getMonth() + 1).toString() + '/' + now.getDate() + '/' + now.getFullYear();
          filters[0]   = new nlobjSearchFilter('isinactive', null, 'is', 'F')
          filters[1]   = new nlobjSearchFilter('custrecord_trv_promo_start_date', null, 'onorbefore', todayStr);
          filters[2]   = new nlobjSearchFilter('custrecord_trv_promo_end_date', null, 'onorafter', todayStr);
          //filters[3]   = new nlobjSearchFilter('custrecord_trv_promo_code', null, 'is', couponString);

          var columns = new Array();
          columns[0]  = new nlobjSearchColumn('custrecord_trv_promo_code');

          var searchResults = nlapiSearchRecord('customrecord_trv_promotions', null, filters, columns);
          var promotionsArr = [];
          nlapiLogExecution('DEBUG', 'isPromotionCustom', JSON.stringify(searchResults));

          if(!!searchResults && searchResults.length > 0) {
            for (var i = 0; i < searchResults.length; i++) {
              promotionsArr.push(searchResults[i].getValue(columns[0]))
            }
          }
          ctx.setSessionObject('trvCustomPromotions', promotionsArr.toString());
          return promotionsArr.toString().indexOf(couponString) > -1;
        }

      },

      listPromotions: function (promotionsApplied) {
        var ctx              = ModelsInit.context;
        var customPromotions = ctx.getSessionObject('trvCustomPromosApplied') || "";
        if (customPromotions.length > 0) {
          var promotions = JSON.parse(customPromotions);
          nlapiLogExecution('DEBUG', 'listPromotions', JSON.stringify(promotions));
          var returnObj = [];
          for (var promo in promotions) {
            if (promotionsApplied.indexOf(promo) > -1) {
              returnObj.push(promotions[promo]);
            }
          }
          return returnObj;
        }
        else {
          var filters  = new Array();
          var now      = new Date();
          var todayStr = (now.getMonth() + 1).toString() + '/' + now.getDate() + '/' + now.getFullYear();
          filters[0]   = new nlobjSearchFilter('isinactive', null, 'is', 'F')
          filters[1]   = new nlobjSearchFilter('custrecord_trv_promo_start_date', null, 'onorbefore', todayStr);
          filters[2]   = new nlobjSearchFilter('custrecord_trv_promo_end_date', null, 'onorafter', todayStr);

          var columns = new Array();
          columns[0]  = new nlobjSearchColumn('custrecord_trv_promo_code');
          columns[1]  = new nlobjSearchColumn('custrecord_trv_promo_auto_apply');

          var searchResults = nlapiSearchRecord('customrecord_trv_promotions', null, filters, columns);
          var promotionsMap = {};

          if(!!searchResults && searchResults.length > 0) {
            for (var i = 0; i < searchResults.length; i++) {
              promotionsMap[searchResults[i].getValue(columns[0])] = {
                promo_code   : searchResults[i].getValue(columns[0]),
                is_auto_apply: searchResults[i].getValue(columns[1])
              }
            }
          }
          nlapiLogExecution('DEBUG', 'listPromotions', JSON.stringify(promotionsMap));
          ctx.setSessionObject('trvCustomPromosApplied', JSON.stringify(promotionsMap)); // cache all promotions
          // return subset based on values passed
          var returnObj = [];
          for (var promo in promotionsMap) {
            if (promotionsApplied.indexOf(promo) > -1) {
              returnObj.push(promotionsMap[promo]);
            }
          }
          return returnObj;
        }
      }
    });
  });
