/**
 * @NApiVersion 2.1
 * @author Shelby Severin <shelby.severin@trevera.com>
 * @NModuleScope Public
 * @NScriptName HF | Loyalty - Update Customers
 * @NScriptType MapReduceScript
 */
define(["require", "exports", "N/log", "N/search", "./loyaltyGlobals"], function (require, exports, log, search, loyaltyGlobals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summarize = exports.reduce = exports.map = exports.getInputData = void 0;
    const getInputData = ctx => {
        const searchResults = mapResults('customsearch_hf_loyalty_customers'); //[SCRIPT] Loyalty Customers to Update
        log.audit('customers count', searchResults.length);
        return searchResults;
    };
    exports.getInputData = getInputData;
    const map = ctx => {
        try { // get all the lines for the order and write it to the values
            const valueObj = JSON.parse(ctx.value);
            ctx.write(valueObj.id, JSON.stringify(valueObj));
        }
        catch (e) {
            log.error('map fn error', e);
        }
    };
    exports.map = map;
    const reduce = (ctx) => {
        try {
            const latestPoints = (0, loyaltyGlobals_1.getLatestPointsEntry)(ctx.key);
            (0, loyaltyGlobals_1.updatePointsOnCustomer)(ctx.key, latestPoints);
        }
        catch (e) {
            log.error('error setting points', e);
        }
        ctx.write(ctx.key, JSON.stringify(ctx.values));
    };
    exports.reduce = reduce;
    var summarize = (context) => {
        log.debug('script complete', 'customers updated');
    };
    exports.summarize = summarize;
    function mapResults(searchID) {
        const searchObj = search.load({ id: searchID });
        const pageData = searchObj.runPaged({ pageSize: 1000 });
        let results = [];
        pageData.pageRanges.forEach(function (pageRange) {
            let page = pageData.fetch({ index: pageRange.index });
            page.data.forEach(function (result) {
                results.push({ id: result.id });
            });
        });
        return results;
    }
});
