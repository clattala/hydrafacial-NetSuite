/**
 * sendFulfillmentEmailMR.ts
 * © 2022 shelby.severin@trevera.com
 *
 * @NScriptName HF | Send Fulfillment Emails
 * @NScriptType MapReduceScript
 * @NApiVersion 2.1
 */
define(["N/log", "N/record", "N/search", "./itemFulfillmentUserEvent"], function (log, record, search, itemFulfillmentUserEvent_1) {
    var exports = {};
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summarize = exports.reduce = exports.getInputData = void 0;
    exports.getInputData = function () {
        var searchResults = mapResults('customsearch_trv_fulfillment_emails'); //[SCRIPT] Fulfillments that Need an Email
        return searchResults;
    };
    exports.reduce = function (context) {
        var valueObjs = context.values;
        log.debug('reduce values', valueObjs);
        valueObjs.forEach(function (val) {
            var mapObj = JSON.parse(val);
            var fulfillmentID = mapObj.id;
            log.debug("fulfillmentID " + mapObj.id, mapObj);
            var fulfillmentRec = record.load({ type: record.Type.ITEM_FULFILLMENT, id: fulfillmentID });
            itemFulfillmentUserEvent_1.setTrackingNumbers(fulfillmentRec);
            fulfillmentRec.save();
            var emailSent = itemFulfillmentUserEvent_1.sendEmailConfirmation(fulfillmentRec);
            log.debug("email sent? " + emailSent + " " + fulfillmentID, mapObj);
            if (emailSent) {
                log.debug('email was sent', 'update fulfillment');
                try {
                    if (fulfillmentID && Number(fulfillmentID) > 0) {
                        record.submitFields({ type: record.Type.ITEM_FULFILLMENT, id: fulfillmentID, values: { 'custbody_trv_fulfillment_em_sent': true }, options: { ignoreMandatoryFields: true } });
                    }
                }
                catch (e) {
                    log.error('error updating fulfillment', e);
                }
            }
        });
        context.write(context.key, JSON.stringify(context.values));
    };
    exports.summarize = function (context) {
        log.debug('script complete', 'emails sent');
    };
    function mapResults(searchID) {
        var searchObj = search.load({ id: searchID });
        var pageData = searchObj.runPaged({ pageSize: 1000 });
        var results = [];
        pageData.pageRanges.forEach(function (pageRange) {
            var page = pageData.fetch({ index: pageRange.index });
            page.data.forEach(function (result) {
                results.push({ id: result.id });
            });
        });
        return results;
    }
    return exports;
});
