/**
 * reprocessCancelledOrders.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName HF | Loyalty - Reprocess Cancelled Order
 * @NScriptType MapReduceScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/format", "N/log", "N/search", "./loyaltyGlobals"], function (require, exports, format, log, search, loyaltyGlobals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summarize = exports.reduce = exports.map = exports.getInputData = void 0;
    const getInputData = ctx => {
        const searchResults = mapResults('customsearch_hf_loyalty_cancelled_so'); //HF | MR 9360 | Loyalty Points for Cancelled Orders
        log.debug('getInputData', `running process for ${searchResults.length} sales orders.`);
        return searchResults;
    };
    exports.getInputData = getInputData;
    const map = ctx => {
        try { // get all the lines for the customer and write it to the values
            const valueObj = JSON.parse(ctx.value);
            ctx.write(valueObj.customer.toString(), JSON.stringify(valueObj));
        }
        catch (e) {
            log.error('map fn error', e);
        }
    };
    exports.map = map;
    const reduce = (ctx) => {
        const valueObjs = ctx.values;
        if (valueObjs.length > 0) {
            valueObjs.forEach((val) => {
                const mapObj = JSON.parse(val);
                /** on cancel of an order, if points were redeemed against an order, add a pending points entry the pending points and points redeemed fields are set in the webstore on the sales order, revert points deduction */
                (0, loyaltyGlobals_1.cancelPointsRedemption)(mapObj.customer.toString(), mapObj.transactionId, format.parse({ value: mapObj.tranDate, type: format.Type.DATE }));
            });
        }
        ctx.write(ctx.key, ctx.values);
    };
    exports.reduce = reduce;
    var summarize = (context) => {
        log.debug('script complete', 'adjustments processed');
    };
    exports.summarize = summarize;
    function mapResults(searchID) {
        const searchObj = search.load({ id: searchID });
        const pageData = searchObj.runPaged({ pageSize: 1000 });
        let results = [];
        pageData.pageRanges.forEach(function (pageRange) {
            let page = pageData.fetch({ index: pageRange.index });
            page.data.forEach(function (result) {
                const obj = {
                    id: result.id,
                    customer: Number(result.getValue({ name: 'custrecord_hf_loyalty_customer', summary: search.Summary.GROUP })),
                    action: Number(result.getValue({ name: 'custrecord_hf_loyalty_action', summary: search.Summary.COUNT })),
                    transactionId: Number(result.getValue({ name: 'internalid', join: 'custrecord_hf_loyalty_transaction', summary: search.Summary.GROUP })),
                    tranDate: result.getValue({ name: 'datecreated', join: 'custrecord_hf_loyalty_transaction', summary: search.Summary.MAX })
                };
                //log.debug('mapResults', `transactionDate: ${obj.tranDate}, ${JSON.stringify(obj)}`);
                results.push(obj);
            });
        });
        return results;
    }
});
