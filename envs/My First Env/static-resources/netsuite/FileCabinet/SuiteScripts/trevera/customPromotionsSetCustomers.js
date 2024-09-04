/**
 * customPromotionsSetCustomers.ts
 * by Trevera, Inc.
 *
 * @NScriptName Trevera Promotions | User Event
 * @NScriptType UserEventScript
 * @NApiVersion 2.1
 */
define(["N/record", "N/search"], function (record, search) {
    var exports = {};
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.afterSubmit = exports.beforeSubmit = exports.beforeLoad = void 0;
    function beforeLoad(context) {
        if (context.type == context.UserEventType.COPY) {
            context.newRecord.setValue({ fieldId: 'custrecord_trv_promo_code', value: '' });
            context.newRecord.setValue({ fieldId: 'custrecord_trv_promo_excluded_cust_ids', value: '' });
            context.newRecord.setValue({ fieldId: 'custrecord_qualifying_customer_ids', value: '' });
            //todo: on save don't allow dupelicate promo
        }
    }
    exports.beforeLoad = beforeLoad;
    function beforeSubmit(context) {
        //searchForPromotion(hasPromo)
    }
    exports.beforeSubmit = beforeSubmit;
    function afterSubmit(context) {
        if (context.type == context.UserEventType.DELETE)
            return;
        if (~[context.UserEventType.EDIT, context.UserEventType.COPY, context.UserEventType.CREATE].indexOf(context.type)) {
            var filterCustomers = context.newRecord.getValue({ fieldId: 'custrecord_trv_promo_qualifier' });
            var excludeCustomers = context.newRecord.getValue({ fieldId: 'custrecord_trv_promo_excluded_customers' });
            if (Number(filterCustomers) > 0) {
                var customers = getCustomersFromSearch(filterCustomers);
                setValueInField(context.newRecord.id, customers.toString(), 'custrecord_qualifying_customer_ids');
            }
            else {
                record.submitFields({
                    type: 'customrecord_trv_promotions', id: context.newRecord.id, values: { 'custrecord_qualifying_customer_ids': '' }
                });
            }
            if (Number(excludeCustomers) > 0) {
                var customers = getCustomersFromSearch(excludeCustomers);
                setValueInField(context.newRecord.id, customers.toString(), 'custrecord_trv_promo_excluded_cust_ids');
            }
            else {
                record.submitFields({
                    type: 'customrecord_trv_promotions',
                    id: context.newRecord.id,
                    values: {
                        'custrecord_trv_promo_excluded_cust_ids': ''
                    }
                });
            }
        }
    }
    exports.afterSubmit = afterSubmit;
    function setValueInField(recId, value, field) {
        var valuesObj = {};
        valuesObj[field] = '';
        if (value.length > 0) {
            valuesObj[field] = value.toString();
            record.submitFields({
                type: 'customrecord_trv_promotions',
                id: recId,
                values: valuesObj
            });
        }
        else {
            record.submitFields({
                type: 'customrecord_trv_promotions',
                id: recId,
                values: valuesObj
            });
        }
    }
    function getCustomersFromSearch(searchId) {
        var customers = [];
        var searchObj = search.load({ id: searchId });
        var pageData = searchObj.runPaged();
        pageData.pageRanges.forEach(function (pageRange) {
            var page = pageData.fetch({ index: pageRange.index });
            page.data.forEach(function (result) {
                customers.push(result.id);
                return true;
            });
        });
        return customers;
    }
    return exports;
});
