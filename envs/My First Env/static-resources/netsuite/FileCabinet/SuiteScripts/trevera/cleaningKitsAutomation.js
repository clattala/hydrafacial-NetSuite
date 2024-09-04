/**
 * cleaningKitsAutomation.ts
 * by Trevera
 * shelby.severin@trevera.com
 *
 * @NScriptName HF - Cleaning Kits Automation
 * @NScriptType ScheduledScript
 * @NApiVersion 2.x
 */
define(["N/email", "N/format", "N/log", "N/record", "N/render", "N/runtime", "N/search"], function (email, format, log, record, render, runtime, search) {
    var exports = {};
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getFirstAndLastOfMonth = exports.execute = void 0;
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var monthAbbr = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
    function execute() {
        var dateObj = getFirstAndLastOfMonth();
        log.debug('date data', dateObj);
        var currentPromotion = getCurrentPromotionCode(dateObj);
        if (currentPromotion.internalid > 0) {
            search.load({ id: 'customsearch_customers_with_warranties' }) //[PROMOTION] Customers with Warranties
                .run().each(function (result) {
                sendEmailToCustomer(result.id, currentPromotion.code);
                return true;
            });
        }
    }
    exports.execute = execute;
    function sendEmailToCustomer(customerId, couponString) {
        var customerFields = search.lookupFields({ type: search.Type.CUSTOMER, id: customerId, columns: ['salesrep', 'email'] });
        var salesRep = customerFields['salesrep'];
        var customerEmail = customerFields['email'];
        var EMAIL_TEMPLATE_ID = runtime.getCurrentScript().getParameter({ name: 'custscript_hf_cleanningkit_email_templat' });
        var sender = '4'; //phil
        if (salesRep.length > 0)
            sender = salesRep[0].value;
        var mergeResult = render.mergeEmail({
            templateId: parseInt(EMAIL_TEMPLATE_ID.toString()),
            entity: { type: 'employee', id: Number(sender) },
            recipient: { type: 'customer', id: Number(customerId) },
        });
        log.debug('sender', sender);
        email.send({
            author: Number(sender),
            recipients: [customerEmail],
            subject: mergeResult.subject,
            body: mergeResult.body.replace('{{code}}', couponString),
            relatedRecords: {
                entityId: Number(customerId)
            }
        });
        log.debug('email sent to customer', "done for customer " + customerId + " at email " + customerEmail);
    }
    function getCurrentPromotionCode(dateObj) {
        var couponString = "CleaningKit" + dateObj.monthAbbr + dateObj.year2Digits;
        var promotionSearch = search.create({
            type: 'customrecord_trv_promotions',
            columns: ['custrecord_trv_promo_code'],
            filters: [
                ['isinactive', 'is', false],
                'AND', ['custrecord_trv_promo_code', 'is', couponString],
                'AND', ['custrecord_trv_promo_start_date', 'onorbefore', dateObj.firstDayOfMonthStr],
                'AND', ['custrecord_trv_promo_end_date', 'onorafter', dateObj.lastDayOfMonthStr]
            ]
        });
        var pageData = promotionSearch.runPaged();
        var promocode = { code: '', internalid: 0 };
        log.debug('promo code matches', pageData.count);
        if (pageData.count == 1) {
            pageData.pageRanges.forEach(function (pageRange) {
                var page = pageData.fetch({ index: pageRange.index });
                page.data.forEach(function (result) {
                    promocode.code = result.getValue({ name: 'custrecord_trv_promo_code' });
                    promocode.internalid = Number(result.id);
                    return true;
                });
            });
        }
        else if (pageData.count == 0) {
            var newPromo = record.create({ type: 'customrecord_trv_promotions', isDynamic: true });
            newPromo.setValue({ fieldId: 'name', value: couponString });
            newPromo.setValue({ fieldId: 'custrecord_trv_promo_code', value: couponString });
            newPromo.setValue({ fieldId: 'custrecord_trv_promo_start_date', value: dateObj.firstDayOfMonth });
            newPromo.setValue({ fieldId: 'custrecord_trv_promo_end_date', value: dateObj.lastDayOfMonth });
            newPromo.setValue({ fieldId: 'custrecord_trv_promo_type', value: 1 }); // cleaning kit
            newPromo.setValue({ fieldId: 'custrecord_trv_promo_qualifier', value: 144235 }); // [PROMOTION] Customers with Warranties
            newPromo.setValue({ fieldId: 'custrecord_trv_promo_disc_type', value: 3 }); // Free with Purchase
            newPromo.setValue({ fieldId: 'custrecord_trv_promo_number_uses', value: 1 });
            newPromo.setValue({ fieldId: 'custrecord_allow_multiple_uses_same_orde', value: false });
            newPromo.setValue({ fieldId: 'custrecord_trv_promo_auto_apply', value: true });
            var newPromoID = newPromo.save();
            log.debug('new promo record created', newPromoID + " for code " + couponString);
            promocode.code = couponString;
            promocode.internalid = Number(newPromoID);
        }
        else {
            log.error('multiple promotions with this code', 'cannot continue >:(');
        }
        return promocode;
    }
    function getFirstAndLastOfMonth() {
        var date = new Date();
        var reportingDateDate = format.parse({ value: date, type: format.Type.DATE });
        var now = new Date(reportingDateDate);
        var firstDayOfMonthStr = (now.getMonth() + 1).toString() + '/1/' + now.getFullYear();
        var firstDayOfMonth = new Date(firstDayOfMonthStr);
        var lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        var lastDayOfMonthStr = (now.getMonth() + 1).toString() + '/' + lastDayOfMonth.getDate() + '/' + now.getFullYear();
        return { firstDayOfMonthStr: firstDayOfMonthStr, firstDayOfMonth: firstDayOfMonth, lastDayOfMonthStr: lastDayOfMonthStr, lastDayOfMonth: lastDayOfMonth, year: now.getFullYear(), year2Digits: now.getFullYear().toString().substring(2), month: monthNames[now.getMonth()], monthAbbr: monthAbbr[now.getMonth()],
            today: date,
            todayStr: (now.getMonth() + 1).toString() + '/' + now.getDate() + '/' + now.getFullYear(), };
    }
    exports.getFirstAndLastOfMonth = getFirstAndLastOfMonth;
    return exports;
});
