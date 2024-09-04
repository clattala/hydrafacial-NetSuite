/**
 * checkEligiblePromotionsSalesOrder.ts
 * by shelby.severin@trevera.com
 * API to load customer data
 *
 * @NScriptName Custom Promotions - Check Eligibility SO
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(["N/log", "N/record", "N/runtime", "N/search", "./cleaningKitsAutomation"], function (log, record, runtime, search, cleaningKitsAutomation_1) {
    var exports = {};
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.searchForPromotion = exports.afterSubmit = exports.beforeSubmit = void 0;
    function beforeSubmit(context) {
        if (context.type == context.UserEventType.DELETE)
            return;
        if (context.type == context.UserEventType.CREATE && runtime.executionContext == runtime.ContextType.WEBSTORE) {
            var lines = context.newRecord.getLineCount({ sublistId: 'item' });
            var linesToRemove = [];
            //order.removeLine({ sublistId: 'item', line: matchingLinePresaleSO, ignoreRecalc: false })
            for (var i = 0; i < lines; i++) {
                var hasPromo = context.newRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_custom_promotion_used', line: i });
                if (hasPromo && hasPromo.length > 0) {
                    var user = context.newRecord.getValue({ fieldId: 'entity' });
                    var promotion = searchForPromotion(hasPromo);
                    if (promotion.length == 1) {
                        var canClaim = false;
                        var promotionRec = promotion[0];
                        var redemption = searchForRedemption(promotionRec.internalid, user);
                        if (promotionRec.promotion_type === 1) { //cleaning kit
                            var eligibility = getPromotionEligibilityCleaningKits(user);
                            canClaim = redemption.numberClaimed < eligibility.numberWarranties;
                        }
                        if (promotionRec.promotion_type === 2 || promotionRec.promotion_type === 3) { //single or multiple;
                            if (promotionRec.promotion_type === 2)
                                canClaim = redemption.numberClaimed < 1;
                            if (promotionRec.promotion_type === 3)
                                canClaim = redemption.numberClaimed < promotionRec.numberUses;
                        }
                        if (!canClaim) {
                            linesToRemove.unshift(i); // push in reverse order so we don't change the order on bulk remove
                        }
                    }
                }
            }
            for (var i = 0; i < linesToRemove.length; i++) {
                context.newRecord.removeLine({ sublistId: 'item', line: linesToRemove[i], ignoreRecalc: false });
            }
        }
    }
    exports.beforeSubmit = beforeSubmit;
    function afterSubmit(context) {
        if (context.type == context.UserEventType.DELETE)
            return;
        if (~[context.UserEventType.CREATE, context.UserEventType.COPY, context.UserEventType.EDIT].indexOf(context.type)) {
            var lines = context.newRecord.getLineCount({ sublistId: 'item' });
            var user = context.newRecord.getValue({ fieldId: 'entity' });
            for (var i = 0; i < lines; i++) {
                var hasPromo = context.newRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_custom_promotion_used', line: i });
                if (hasPromo && hasPromo.length > 0) {
                    var promotion = searchForPromotion(hasPromo);
                    log.debug('results for promotion ' + hasPromo, promotion);
                    if (promotion && promotion.length > 0) {
                        var redemptionSearch = search.create({
                            type: 'customrecord_promotion_redemption',
                            columns: ['custrecord_trv_promo_redemption_qty'],
                            filters: [
                                ['isinactive', 'is', false],
                                'AND', ['custrecord_trv_promo_redemption_promo', 'is', promotion[0].internalid],
                                'AND', ['custrecord_trv_promo_redemption_cust', 'is', user]
                            ]
                        });
                        var results = redemptionSearch.runPaged();
                        log.debug('results for redemptions', results);
                        if (results.count < 1) {
                            //response.numberClaimed = Number(result.getValue({name: 'custrecord_trv_promo_redemption_qty', summary: search.Summary.SUM}))
                            var newRedemption = record.create({ type: 'customrecord_promotion_redemption', isDynamic: true });
                            newRedemption.setValue('custrecord_trv_promo_redemption_promo', promotion[0].internalid);
                            newRedemption.setValue('custrecord_trv_promo_redemption_cust', user);
                            newRedemption.setValue('custrecord_trv_promo_redemption_trans', context.newRecord.id);
                            newRedemption.setValue('custrecord_trv_promo_redemption_qty', context.newRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i }));
                            var saved = newRedemption.save();
                            log.debug('new redemption saved', "id: " + saved);
                        }
                    }
                }
            }
        }
    }
    exports.afterSubmit = afterSubmit;
    function getPromotionEligibilityCleaningKits(user) {
        log.debug('getPromotionEligibilityCleaningKits: user', JSON.stringify(user));
        var eligibilityFields = search.lookupFields({
            type: search.Type.CUSTOMER,
            id: user,
            columns: ['custentity_hf_account_has_warranty', 'custentity_hf_number_warranties']
        });
        log.debug('getPromotionEligibilityCleaningKits', eligibilityFields);
        var hasWarranty = eligibilityFields['custentity_hf_account_has_warranty'];
        var numberWarranties = eligibilityFields['custentity_hf_number_warranties'];
        return {
            hasWarranty: hasWarranty,
            numberWarranties: Number(numberWarranties)
        };
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
            var itemIDs = result.getValue('custrecord_trv_promo_qualifier_item');
            var qualifier = {
                itemIds: itemIDs.split(','),
                quantityToPurchase: Number(result.getValue('custrecord_trv_promo_qualifier_qty')),
                isOr: itemIDs.length > 0
            };
            if (qualifier.isOr) {
                qualifyingItems.quantifier = 'any';
            }
            qualifyingItems.items.push(qualifier);
            return true;
        });
        if (qualifyingItems.items.length > 0) {
            qualifyingItems.qualifier_type = qualifyingItems.items.length === 1 ? 'single' : 'multiple';
        }
        log.debug('searchForPromotion: getQualifyingItems', JSON.stringify(qualifyingItems));
        return qualifyingItems;
    }
    function getFreeItems(promotionID) {
        var itemsToAdd = {
            qualifier_type: 'all',
            items: [],
            quantifier: 'is'
        };
        var itemSearch = search.create({
            type: 'customrecord_trv_promo_free_items',
            columns: ['custrecord_trv_promo_free_item_item', 'custrecord_trv_promo_free_item_quantity'],
            filters: [['custrecord_trv_promo_free_item_promotion', 'anyof', [promotionID]]
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
    function searchForPromotion(couponString) {
        var dateObj = cleaningKitsAutomation_1.getFirstAndLastOfMonth();
        var promocodes = [];
        log.debug('searchForPromotion', JSON.stringify(dateObj));
        var promotionSearch = search.create({
            type: 'customrecord_trv_promotions',
            columns: [
                search.createColumn({ name: 'custrecord_trv_promo_code' }),
                search.createColumn({ name: 'custrecord_trv_promo_number_uses' }),
                search.createColumn({ name: 'custrecord_trv_promo_type' }),
                search.createColumn({ name: 'custrecord_trv_promo_code_form' }),
                search.createColumn({ name: 'custrecord_trv_promo_disc_type' }),
                search.createColumn({ name: 'custrecord_trv_promo_amount_off' }),
                search.createColumn({ name: 'custrecord_trv_promo_code_discount_item' }),
                search.createColumn({ name: 'custrecord_allow_multiple_uses_same_orde' }),
                search.createColumn({ name: 'custrecord_qualifying_customer_ids' })
            ],
            filters: [
                ['isinactive', 'is', false],
                'AND', ['custrecord_trv_promo_code', 'is', couponString],
                'AND', ['custrecord_trv_promo_start_date', 'onorbefore', dateObj.firstDayOfMonthStr],
                'AND', ['custrecord_trv_promo_end_date', 'onorafter', dateObj.lastDayOfMonthStr]
            ]
        });
        var pageData = promotionSearch.runPaged();
        pageData.pageRanges.forEach(function (pageRange) {
            var page = pageData.fetch({ index: pageRange.index });
            page.data.forEach(function (result) {
                var promocode = {
                    promocode: result.getValue({ name: 'custrecord_trv_promo_code' }),
                    internalid: Number(result.id),
                    numberUses: Number(result.getValue({ name: 'custrecord_trv_promo_number_uses' })),
                    eligibility: null,
                    promotion_type: Number(result.getValue({ name: 'custrecord_trv_promo_type' })),
                    rate: result.getValue({ name: 'custrecord_trv_promo_amount_off_formatte' }),
                    multipleOnSameOrder: result.getValue({ name: 'custrecord_allow_multiple_uses_same_orde' }),
                    qualifyingItems: getQualifyingItems(result.id),
                    itemsToAdd: getFreeItems(result.id)
                };
                promocodes.push(promocode);
                return true;
            });
        });
        return promocodes;
    }
    exports.searchForPromotion = searchForPromotion;
    function searchForRedemption(relatedPromocodeID, user) {
        var response = { relatedPromocodeID: relatedPromocodeID, numberClaimed: 0, canClaim: false };
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
                return true;
            });
        });
        return response;
    }
    return exports;
});
