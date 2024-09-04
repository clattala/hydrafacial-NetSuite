/**
 * scaGetEligiblePromotions.ts
 * by Head in the Cloud Development
 * API to load customer data
 *
 * @NScriptName SCA | Get Eligible Promotions
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(["N/log", "N/search", "./cleaningKitsAutomation"], function (log, search, cleaningKitsAutomation_1) {
    var exports = {};
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRequest = void 0;
    function onRequest(context) {
        var method = context.request.method;
        var user = context.request.parameters.user;
        log.debug('context.request.parameters', context.request.parameters);
        if (Number(user) > 0) {
            if (method === 'GET') {
                var response = { eligibility: {}, promotions: {}, redemptions: {}, canClaim: false };
                var cleaningKit = context.request.parameters['cleaningkit'];
                //TODO: not going to be passing any coupon codes because everything is supposed to be automatic
                if (cleaningKit && cleaningKit == 'T') {
                    var eligibility = getCleaningKitEligibility(user);
                    var dateObj = cleaningKitsAutomation_1.getFirstAndLastOfMonth();
                    var coupon = "CleaningKit" + dateObj.monthAbbr + dateObj.year2Digits;
                    response.promotions = searchForPromotion(user, coupon);
                    for (var key in response.promotions) {
                        response.redemptions[key] = searchForRedemption(user, key);
                        response.redemptions[key].canClaim = response.redemptions[key].numberClaimed < eligibility.numberWarranties;
                        response.canClaim = response.redemptions[key].numberClaimed < eligibility.numberWarranties;
                        response.promotions[key].numberUses = Number(eligibility.numberWarranties);
                    }
                    response.eligibility = eligibility;
                }
                else {
                    var coupon = context.request.parameters['coupon'];
                    log.error('coupon', coupon);
                    if (coupon && coupon.length > 0) {
                        response.promotions = searchForPromotion(user, coupon);
                    }
                    else {
                        response.promotions = searchForPromotion(user, '');
                    }
                    for (var key in response.promotions) {
                        if (response.promotions[key].promotion_type == 1) {
                            var eligibility = getCleaningKitEligibility(user);
                            var redemption = searchForRedemption(user, key);
                            response.redemptions[key] = redemption;
                            response.promotions[key].redemptions = {
                                relatedPromocodeID: response.promotions[key].internalid.toString(),
                                numberClaimed: redemption.numberClaimed,
                                canClaim: redemption.numberClaimed < eligibility.numberWarranties,
                                numberCanClaim: eligibility.numberWarranties - redemption.numberClaimed
                            };
                        }
                        else {
                            var redemption = searchForRedemption(user, key);
                            response.redemptions[key] = redemption;
                            response.promotions[key].redemptions = redemption;
                        }
                    }
                }
                context.response.write({ output: JSON.stringify(response) });
            }
            else {
                log.error({ title: 'Script Failed', details: 'parameters are missing.' });
                var response = { success: true, message: "", response_code: "" };
                response.success = false;
                response.message = "There are required parameters or configurations missing from this script. Please check with your developer.";
                response.response_code = "ERR_MISSING_REQUIRED_ARGUMENTS";
                context.response.write({ output: JSON.stringify(response) });
                return;
            }
        }
        else {
            log.error({ title: 'Unauthorized Access', details: 'User Check failed' });
            var response = { success: true, message: "", response_code: "" };
            response.success = false;
            response.message = "There are required parameters or configurations missing from this script. Please check with your developer.";
            response.response_code = "ERR_MISSING_REQUIRED_ARGUMENTS";
            context.response.write({ output: JSON.stringify(response) });
            return;
        }
    }
    exports.onRequest = onRequest;
    function getCleaningKitEligibility(user) {
        var eligibilityFields = search.lookupFields({
            type: search.Type.CUSTOMER,
            id: user,
            columns: ['custentity_hf_account_has_warranty', 'custentity_hf_number_warranties']
        });
        log.debug('getPromotionEligibility', eligibilityFields);
        var hasWarranty = eligibilityFields['custentity_hf_account_has_warranty'];
        var numberWarranties = eligibilityFields['custentity_hf_number_warranties'];
        return {
            hasWarranty: hasWarranty,
            numberWarranties: Number(numberWarranties)
        };
    }
    function searchForPromotion(user, couponString) {
        var dateObj = cleaningKitsAutomation_1.getFirstAndLastOfMonth();
        var promocodes = {};
        log.debug('searchForPromotion', JSON.stringify(dateObj));
        var promotionSearch = search.create({
            type: 'customrecord_trv_promotions',
            columns: ['custrecord_trv_promo_code', 'custrecord_trv_promo_number_uses', 'custrecord_trv_promo_type', 'custrecord_trv_promo_code_form', 'custrecord_trv_promo_disc_type', 'custrecord_trv_promo_amount_off',
                'custrecord_trv_promo_code_discount_item', 'custrecord_allow_multiple_uses_same_orde', 'custrecord_trv_promo_qualifier', 'custrecord_qualifying_customer_ids', 'custrecord_trv_promo_excluded_customers',
                'custrecord_trv_promo_excluded_cust_ids', 'custrecord_trv_promo_auto_apply'
            ],
            filters: [
                ['isinactive', 'is', false],
                'AND', ['custrecord_trv_promo_start_date', 'onorbefore', dateObj.todayStr],
                'AND', ['custrecord_trv_promo_end_date', 'onorafter', dateObj.todayStr]
            ]
        });
        var searchFilters = promotionSearch.filterExpression;
        if (couponString.length > 0) {
            searchFilters.push('AND');
            searchFilters.push(['custrecord_trv_promo_code', 'is', couponString]);
        }
        promotionSearch.filterExpression = searchFilters;
        var pageData = promotionSearch.runPaged();
        pageData.pageRanges.forEach(function (pageRange) {
            var page = pageData.fetch({ index: pageRange.index });
            page.data.forEach(function (result) {
                var checkForEligibleCustomers = Number(result.getValue({ name: 'custrecord_trv_promo_qualifier' }));
                var eligibleCustomers = result.getValue({ name: 'custrecord_qualifying_customer_ids' });
                var checkForExcludedCustomers = Number(result.getValue({ name: 'custrecord_trv_promo_excluded_customers' }));
                var excludedCustomers = result.getValue({ name: 'custrecord_trv_promo_excluded_cust_ids' });
                log.debug('checkForEligibleCustomers: ' + checkForEligibleCustomers, eligibleCustomers);
                log.debug('checkForExcludedCustomers: ' + checkForExcludedCustomers, excludedCustomers);
                var isEligible = checkForEligibleCustomers > 0 ? eligibleCustomers.indexOf(user) > -1 : true;
                var isExcluded = checkForExcludedCustomers > 0 ? excludedCustomers.indexOf(user) > -1 : false;
                if (isEligible && !isExcluded) {
                    promocodes[result.id] = {};
                    promocodes[result.id].promocode = result.getValue({ name: 'custrecord_trv_promo_code' });
                    promocodes[result.id].internalid = Number(result.id);
                    promocodes[result.id].promotion_type = Number(result.getValue({ name: 'custrecord_trv_promo_type' })); // 1: cleaning kit, 2: single, 3 multiple use
                    promocodes[result.id].numberUses = Number(result.getValue({ name: 'custrecord_trv_promo_number_uses' }));
                    promocodes[result.id].eligibility = ''; //todo build eligiblity
                    promocodes[result.id].discountId = result.getValue({ name: 'custrecord_trv_promo_code_discount_item' });
                    promocodes[result.id].formId = result.getValue({ name: 'custrecord_trv_promo_code_form' });
                    promocodes[result.id].discountType = Number(result.getValue({ name: 'custrecord_trv_promo_disc_type' })); // 1: flat rate, 2: percentage off, 3: free with purhcase
                    promocodes[result.id].rate = result.getValue({ name: 'custrecord_trv_promo_amount_off_formatte' });
                    promocodes[result.id].qualifyingItems = getQualifyingItems(result.id);
                    promocodes[result.id].itemsToAdd = getFreeItems(result.id);
                    promocodes[result.id].multipleOnSameOrder = result.getValue({ name: 'custrecord_allow_multiple_uses_same_orde' });
                    promocodes[result.id].autoApply = result.getValue({ name: 'custrecord_trv_promo_auto_apply' });
                }
                log.debug(result.getValue({ name: 'custrecord_trv_promo_code' }) + ' isEligible: ' + isEligible, 'userId: ' + user + 'isExcluded: ' + isExcluded);
                return true;
            });
        });
        return promocodes;
    }
    function getQualifyingItems(promotionID) {
        var qualifyingItems = {
            qualifier_type: 'all',
            items: [],
            quantifier: 'is'
        };
        search.create({
            type: 'customrecord_trv_promo_qualifiers',
            columns: ['custrecord_trv_promo_qualifier_item', 'custrecord_trv_promo_qualifier_qty'],
            filters: [
                ['isinactive', 'is', false], 'AND', ['custrecord_trv_promo_qualifier_promo', 'anyof', [promotionID]]
            ]
        }).run().each(function (result) {
            var qualifier = {
                itemIds: result.getValue('custrecord_trv_promo_qualifier_item').split(','),
                quantityToPurchase: Number(result.getValue('custrecord_trv_promo_qualifier_qty')),
                isOr: result.getValue('custrecord_trv_promo_qualifier_item').length > 0
            };
            if (qualifier.isOr) {
                qualifyingItems.quantifier = 'any';
            }
            qualifyingItems.items.push(qualifier);
            return true;
        });
        if (qualifyingItems.items.length > 0) {
            qualifyingItems.qualifier_type = (qualifyingItems.items.length <= 1 ? 'single' : 'multiple');
        }
        log.debug('searchForPromotion: getQualifyingItems', JSON.stringify(qualifyingItems));
        return qualifyingItems;
    }
    function getFreeItems(promotionID) {
        var itemsToAdd = {
            type: 'all',
            items: [],
            quantifier: 'is'
        };
        var itemSearch = search.create({
            type: 'customrecord_trv_promo_free_items',
            columns: ['custrecord_trv_promo_free_item_item', 'custrecord_trv_promo_free_item_quantity'],
            filters: [
                ['isinactive', 'is', false], 'AND', ['custrecord_trv_promo_free_item_promotion', 'anyof', [promotionID]]
            ]
        });
        itemSearch.run().each(function (result) {
            itemsToAdd.items.push({
                itemId: result.getValue('custrecord_trv_promo_free_item_item'),
                quantityToAdd: result.getValue('custrecord_trv_promo_free_item_quantity'),
            });
            return true;
        });
        log.debug('searchForPromotion: getFreeItems', JSON.stringify(itemsToAdd));
        return itemsToAdd;
    }
    function searchForRedemption(user, relatedPromocodeID) {
        var response = { relatedPromocodeID: relatedPromocodeID, numberClaimed: 0, canClaim: false, numberCanClaim: 0 };
        var promotionSearch = search.create({
            type: 'customrecord_promotion_redemption',
            columns: [search.createColumn({ name: 'custrecord_trv_promo_redemption_qty', summary: search.Summary.SUM })],
            filters: [
                ['isinactive', 'is', false],
                'AND', ['custrecord_trv_promo_redemption_promo', 'is', relatedPromocodeID],
                'AND', ['custrecord_trv_promo_redemption_cust', 'is', user]
            ]
        });
        var pageData = promotionSearch.runPaged();
        pageData.pageRanges.forEach(function (pageRange) {
            var page = pageData.fetch({ index: pageRange.index });
            page.data.forEach(function (result) {
                response.numberClaimed = Number(result.getValue({ name: 'custrecord_trv_promo_redemption_qty', summary: search.Summary.SUM }));
                response.numberCanClaim = 1 - response.numberClaimed;
                response.canClaim = response.numberCanClaim > 0;
                return true;
            });
        });
        return response;
    }
    return exports;
});
