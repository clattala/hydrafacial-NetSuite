/**
 * @NApiVersion 2.1
 * @NModuleScope TargetAccount
 */
define(['N/format', 'N/log', 'N/runtime', 'N/search'], function (format, log, runtime, search) {
  'use strict';

  var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var monthAbbr  = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

  var PromotionsHandler = {
    getPromotions: function (request) {
      var parameters  = request.parameters;
      var user        = runtime.getCurrentUser();
      var isLoggedIn  = this.isLoggedIn();
      var cleaningKit = request.parameters.cleaningkit;
      var response    = {eligibility: {}, promotions: {}, redemptions: {}, canClaim: false};

      //TODO: not going to be passing any coupon codes because everything is supposed to be automatic
      if (cleaningKit && cleaningKit === 'T' && isLoggedIn) {
        var eligibility   = this.getPromotionEligibilityCleaningKits(user.id);
        var dateObj       = this.getFirstAndLastOfMonth();
        var coupon        = 'CleaningKit' + dateObj.monthAbbr + '' + dateObj.year2Digits;
        var allPromotions = this.searchForPromotion(coupon, user.id);
        for (var key in allPromotions) {
          response.redemptions[key]          = this.searchForRedemption(key, user)
          response.redemptions[key].canClaim = response.redemptions[key].numberClaimed < eligibility.numberWarranties;
          if (canClaim) {
            response.promotions[key]            = allPromotions[key]
            response.canClaim                   = response.redemptions[key].numberClaimed < eligibility.numberWarranties;
            response.promotions[key].numberUses = Number(eligibility.numberWarranties);
            response.promotions[key].code       = response.promotions[key].promocode + "_" + user.id; // build key of actual promotion
            response.promotions[key].redemption = response.redemptions[key];
          }
        }
        response.eligibility = eligibility;
      }
      else {
        var coupon = request.parameters['coupon'];
        log.error('coupon', coupon);
        var allPromotions;
        if (coupon && coupon.length > 0) {
          allPromotions = this.searchForPromotion(coupon, user.id);
        }
        else {
          allPromotions = this.searchForPromotion('', user.id);
        }

        for (var key in allPromotions) {
          response.redemptions[key] = this.searchForRedemption(key, user)
          if (allPromotions[key].type === 1) { //cleaning kit
            var eligibility = this.getPromotionEligibilityCleaningKits(user.id);
            log.error('eligibility', eligibility);
            var canClaim = response.redemptions[key].numberClaimed < eligibility.numberWarranties;
            if (canClaim) {
              response.redemptions[key].canClaim   = canClaim;
              response.promotions[key]             = allPromotions[key];
              response.promotions[key].canClaim    = canClaim;
              response.promotions[key].numberUses  = Number(eligibility.numberWarranties);
              response.promotions[key].eligibility = eligibility;
              response.promotions[key].code        = response.promotions[key].promocode + "_" + user.id; // build key of actual promotion
              response.promotions[key].redemption  = response.redemptions[key];
            }
          }
          if (allPromotions[key].type === 2) { //single
            var canClaim = response.redemptions[key].numberClaimed < 1;
            if (canClaim) {
              response.redemptions[key].canClaim = canClaim;
              response.promotions[key]           = allPromotions[key];
              response.promotions[key].canClaim  = canClaim;
              response.promotions[key].code      = response.promotions[key].promocode/* + "_" + user.id*/; // build key of actual promotion - only need this if we're generating promotion codes

              response.promotions[key].redemption = response.redemptions[key];
            }
          }
          if (allPromotions[key].type === 3) { //multiple
            var canClaim = response.redemptions[key].numberClaimed < allPromotions[key].numberUses;
            if (canClaim) {
              response.redemptions[key].canClaim = canClaim;
              response.promotions[key]           = allPromotions[key];
              response.promotions[key].canClaim  = canClaim;
              response.promotions[key].code      = response.promotions[key].promocode/* + "_" + user.id*/; // build key of actual promotion - only need this if we're generating promotion codes

              response.promotions[key].redemption = response.redemptions[key];
            }
          }
        }
      }

      /*
      var suiteletURL = url.resolveScript(
        {scriptId: 'customscript_sca_get_promotions', deploymentId: 'customdeploy_sca_get_promotions', params: {user: user.id, cleaningkit: cleaningkit}, returnExternalUrl: true});
      var response    = https.get({url: suiteletURL, body: parameters});

      log.debug('response from suitelet in Promotions.Extension.Model', response.body);
      return JSON.parse(response.body);
      * */

      log.debug('response from Promotions.Extension.Model:get', JSON.stringify(response));
      return response;
    },

    addDiscountItem: function () {

    },

    checkForPromotion: function checkForPromotion() {

    },

    addPromotion: function addPromotion(promotion) {
      var ret = {};
      try {
        var dateObj = this.getFirstAndLastOfMonth();
        var user    = runtime.getCurrentUser();
        //var code       = promotion.promotioncode + "_" + user.id;

        var promoRecord = record.create({type: record.Type.PROMOTION_CODE, isDynamic: true});
        var newPromoID  = promoRecord.save();
        var newPromo    = record.load({type: record.Type.PROMOTION_CODE, id: newPromoID, isDynamic: true})
        newPromo.setValue({fieldId: 'name', value: promotion.code});
        newPromo.setValue({fieldId: 'customform', value: promotion.formId}); //172 payment form
        newPromo.setValue({fieldId: 'repeatdiscount', value: false});
        newPromo.setValue({fieldId: 'whatthecustomerneedstobuy', value: 'ANYTHING'});
        newPromo.setValue({fieldId: 'applydiscountto', value: 'FIRSTSALE'});
        newPromo.setValue({fieldId: 'discount', value: promotion.discountId}); //2246
        newPromo.setValue({fieldId: 'discounttype', value: promotion.type}); // percent or flat
        newPromo.setValue({fieldId: 'rate', value: promotion.rate}); // string with percent or number
        newPromo.setValue({fieldId: 'code', value: promotion.code});
        newPromo.setValue({fieldId: 'description', value: 'Code for Cleaning Kit for ' + dateObj.month + ' ' + dateObj.year + ' for customer ' + user.name});
        newPromo.setValue({fieldId: 'startdate', value: dateObj.firstDayOfMonth});
        newPromo.setValue({fieldId: 'enddate', value: dateObj.lastDayOfMonth});
        var updatedPromoID = newPromo.save();
        var updatedPromo   = record.load({type: record.Type.PROMOTION_CODE, id: updatedPromoID, isDynamic: true});
        updatedPromo.setValue({fieldId: 'audience', value: 'SPECIFICCUSTOMERS'});
        updatedPromo.setValue({fieldId: 'customers', value: user.id.toString()});
        updatedPromo.setValue({fieldId: 'saleschannels', value: 'ALL'});

        ret = {
          status  : 'OK',
          response: {
            promotionId: updatedPromoID,
          }
        }

      } catch (e) {
        nlapiLogExecution('ERROR', 'Error creating promotion code for customer', JSON.stringify(e));
        var response           = {success: true, message: "", response_code: ""};
        response.success       = false;
        response.message       = "There was a problem adding the promotion for this customer.";
        response.response_code = "ERR_PROBLEM_ADDING_PROMOTION";
        return response;
      }
      return ret;
    },

    getPromotionEligibility: function getPromotionEligibility(user, promotion) {

    },

    getPromotionEligibilityCleaningKits: function getPromotionEligibilityCleaningKits(user) {
      log.debug('getPromotionEligibilityCleaningKits: user', JSON.stringify(user));
      var eligibilityFields = search.lookupFields({
        type   : search.Type.CUSTOMER,
        id     : user,
        columns: ['custentity_hf_account_has_warranty', 'custentity_hf_number_warranties']
      });
      log.debug('getPromotionEligibilityCleaningKits', eligibilityFields)
      var hasWarranty      = eligibilityFields['custentity_hf_account_has_warranty'];
      var numberWarranties = eligibilityFields['custentity_hf_number_warranties'];
      return {
        hasWarranty       : hasWarranty
        , numberWarranties: Number(numberWarranties)
      }
    },

    searchForPromotion: function searchForPromotion(couponString, userId, cleaningKit) {
      /**
       'custrecord_trv_promo_code', 'custrecord_trv_promo_number_uses', 'custrecord_trv_promo_type', 'custrecord_trv_promo_code_form', 'custrecord_trv_promo_disc_type',
       'custrecord_trv_promo_amount_off', 'custrecord_trv_promo_code_discount_item'
       **/

      var dateObj    = this.getFirstAndLastOfMonth();
      var promocodes = {};
      log.debug('searchForPromotion', JSON.stringify(dateObj));

      var promotionSearch = search.create({
        type   : 'customrecord_trv_promotions',
        columns: [
          'custrecord_trv_promo_code', 'custrecord_trv_promo_number_uses', 'custrecord_trv_promo_type', 'custrecord_trv_promo_code_form', 'custrecord_trv_promo_disc_type', 'custrecord_trv_promo_amount_off',
          'custrecord_trv_promo_code_discount_item', 'custrecord_allow_multiple_uses_same_orde', 'custrecord_trv_promo_qualifier', 'custrecord_qualifying_customer_ids', 'custrecord_trv_promo_excluded_customers',
          'custrecord_trv_promo_excluded_cust_ids', 'custrecord_trv_promo_auto_apply'
        ],
        filters: [
          ['isinactive', 'is', false],
          'AND', ['custrecord_trv_promo_start_date', 'onorbefore', dateObj.todayStr],
          'AND', ['custrecord_trv_promo_end_date', 'onorafter', dateObj.todayStr]
        ]
      });

      var searchFilters = promotionSearch.filters;
      if (couponString.length > 0) {
        searchFilters.push('AND')
        searchFilters.push(['custrecord_trv_promo_code', 'is', couponString])
      }
      promotionSearch.filters = searchFilters;

      var self     = this;
      var pageData = promotionSearch.runPaged();
      pageData.pageRanges.forEach(function (pageRange) {
        var page = pageData.fetch({index: pageRange.index});
        page.data.forEach(function (result) {
          var checkForEligibleCustomers = Number(result.getValue({name: 'custrecord_trv_promo_qualifier'}));
          var eligibleCustomers         = result.getValue({name: 'custrecord_qualifying_customer_ids'});

          var checkForExcludedCustomers = Number(result.getValue({name: 'custrecord_trv_promo_excluded_customers'}));
          var excludedCustomers         = result.getValue({name: 'custrecord_trv_promo_excluded_cust_ids'});
          log.debug('checkForEligibleCustomers: ' + checkForEligibleCustomers, eligibleCustomers)
          log.debug('checkForExcludedCustomers: ' + checkForExcludedCustomers, excludedCustomers)

          var isEligible = checkForEligibleCustomers > 0 ? eligibleCustomers.indexOf(userId.toString()) > -1 : true;
          var isExcluded = checkForExcludedCustomers > 0 ? excludedCustomers.indexOf(userId.toString()) > -1 : false;

          log.debug(result.getValue({name: 'custrecord_trv_promo_code'}) + ' isEligible: ' + isEligible, 'userId: ' + userId + 'isExcluded: ' + isExcluded)

          if (isEligible && !isExcluded) {
            promocodes[result.id]                     = {}
            promocodes[result.id].promocode           = result.getValue({name: 'custrecord_trv_promo_code'});
            promocodes[result.id].internalid          = Number(result.id);
            promocodes[result.id].type                = Number(result.getValue({name: 'custrecord_trv_promo_type'})); // 1: cleaning kit, 2: single, 3 multiple use
            promocodes[result.id].numberUses          = Number(result.getValue({name: 'custrecord_trv_promo_number_uses'}));
            promocodes[result.id].eligibility         = ''; //todo build eligiblity
            promocodes[result.id].discountId          = result.getValue({name: 'custrecord_trv_promo_code_discount_item'});
            promocodes[result.id].formId              = result.getValue({name: 'custrecord_trv_promo_code_form'});
            promocodes[result.id].discountType        = Number(result.getValue({name: 'custrecord_trv_promo_disc_type'})); // 1: flat rate, 2: percentage off, 3: free with purhcase
            promocodes[result.id].rate                = result.getValue({name: 'custrecord_trv_promo_amount_off_formatte'});
            promocodes[result.id].qualifyingItems     = self.getQualifyingItems(result.id);
            promocodes[result.id].itemsToAdd          = self.getFreeItems(result.id);
            promocodes[result.id].multipleOnSameOrder = result.getValue({name: 'custrecord_allow_multiple_uses_same_orde'});
            promocodes[result.id].autoApply           = result.getValue({name: 'custrecord_trv_promo_auto_apply'});
          }
          return true;
        });
      });

      log.debug('searchForPromotion: promocodes', JSON.stringify(promocodes));
      return promocodes;
    },

    getQualifyingItems: function getQualifyingItems(promotionID) {
      var qualifyingItems = {
        type      : 'all',
        items     : [],
        quantifier: 'is'
      };

      search.create({
        type   : 'customrecord_trv_promo_qualifiers',
        columns: ['custrecord_trv_promo_qualifier_item', 'custrecord_trv_promo_qualifier_qty'],
        filters: [
          ['isinactive', 'is', false], 'AND', ['custrecord_trv_promo_qualifier_promo', 'anyof', [promotionID]]
        ]
      }).run().each(function (result) {
        var qualifier = {
          itemIds           : result.getValue('custrecord_trv_promo_qualifier_item').split(','), // array of objects value, text
          quantityToPurchase: Number(result.getValue('custrecord_trv_promo_qualifier_qty')),
          isOr              : result.getValue('custrecord_trv_promo_qualifier_item').length > 0
        }
        if (qualifier.isOr) {
          qualifyingItems.quantifier = 'any'
        }
        qualifyingItems.items.push(qualifier);
        return true;
      });

      if (qualifyingItems.items.length > 0) {
        qualifyingItems.type = qualifyingItems.items.length === 1 ? 'single' : 'multiple';
      }

      log.debug('searchForPromotion: getQualifyingItems', JSON.stringify(qualifyingItems));
      return qualifyingItems;
    },

    getFreeItems: function (promotionID) {
      var itemsToAdd = {
        type      : 'all', //todo: support for picking from list - probably set at parent?
        items     : [],
        quantifier: 'is'
      };
      var itemSearch = search.create({
        type   : 'customrecord_trv_promo_free_items',
        columns: ['custrecord_trv_promo_free_item_item', 'custrecord_trv_promo_free_item_quantity'],
        filters: [
          ['isinactive', 'is', false], 'AND', ['custrecord_trv_promo_free_item_promotion', 'anyof', [promotionID]]
        ]
      });

      itemSearch.run().each(function (result) {
        itemsToAdd.items.push({
          itemId       : result.getValue('custrecord_trv_promo_free_item_item'),
          quantityToAdd: result.getValue('custrecord_trv_promo_free_item_quantity'),
        })
        return true;
      });

      log.debug('searchForPromotion: getFreeItems', JSON.stringify(itemsToAdd));
      return itemsToAdd;
    },

    searchForRedemption: function searchForRedemption(relatedPromocodeID, user) {
      var response        = {relatedPromocodeID: relatedPromocodeID, numberClaimed: 0, canClaim: false}
      var promotionSearch = search.create({
        type   : 'customrecord_promotion_redemption',
        columns: [search.createColumn({name: 'custrecord_trv_promo_redemption_qty', summary: search.Summary.SUM})],
        filters: [
          ['isinactive', 'is', false],
          'AND', ['custrecord_trv_promo_redemption_promo', 'is', relatedPromocodeID],
          'AND', ['custrecord_trv_promo_redemption_cust', 'is', user.id]
        ]
      });

      var pageData = promotionSearch.runPaged();
      pageData.pageRanges.forEach(function (pageRange) {
        var page = pageData.fetch({index: pageRange.index});
        page.data.forEach(function (result) {
          response.numberClaimed = Number(result.getValue({name: 'custrecord_trv_promo_redemption_qty', summary: search.Summary.SUM}));
          response.numberCanClaim = 1 - response.numberClaimed;
          response.canClaim = result.numberCanClaim > 0;
          return true;
        });
      });

      return response;
    },

    getFirstAndLastOfMonth: function getFirstAndLastOfMonth() {
      var date               = new Date();
      var reportingDateDate  = format.parse({value: date, type: format.Type.DATE});
      var now                = new Date(reportingDateDate);
      var firstDayOfMonthStr = (now.getMonth() + 1).toString() + '/1/' + now.getFullYear();
      var firstDayOfMonth    = new Date(firstDayOfMonthStr);
      var lastDayOfMonth     = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      var lastDayOfMonthStr  = (now.getMonth() + 1).toString() + '/' + lastDayOfMonth.getDate() + '/' + now.getFullYear();
      return {
        firstDayOfMonthStr: firstDayOfMonthStr,
        firstDayOfMonth   : firstDayOfMonth,
        lastDayOfMonthStr : lastDayOfMonthStr,
        lastDayOfMonth    : lastDayOfMonth,
        today             : date,
        todayStr          : (now.getMonth() + 1).toString() + '/' + now.getDate() + '/' + now.getFullYear(),
        year              : now.getFullYear(),
        year2Digits       : now.getFullYear().toString().substring(2),
        month             : monthNames[now.getMonth()],
        monthAbbr         : monthAbbr[now.getMonth()]
      }
    },

    isLoggedIn: function isLoggedIn() {
      var user = runtime.getCurrentUser();
      return user.id > 0 && user.role !== 17
    }
  }

  return PromotionsHandler;
})
