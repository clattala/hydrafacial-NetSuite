/**
 * customerPromotionsUpdateEligibility.ts
 * by Trevera, Inc.
 *
 * @NScriptName Trevera Promotions | Update Eligibility
 * @NScriptType MapReduceScript
 * @NApiVersion 2.1
 */
define(["N/log", "N/record", "N/search"], function (log, record, search) {
    var exports = {};
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summarize = exports.map = exports.getInputData = void 0;
    //TODO on migration:
    // create search
    exports.getInputData = function () {
        var records = [];
        var searchObj = search.load({ id: 'customsearch_trv_promos_search' }); //[SCRIPT] Promotions Search
        var pageData = searchObj.runPaged();
        pageData.pageRanges.forEach(function (pageRange) {
            var page = pageData.fetch({ index: pageRange.index });
            page.data.forEach(function (result) {
                records.push(result.id);
            });
        });
        return records;
    };
    exports.map = function (mapContext) {
        var rec = record.load({ type: 'customrecord_trv_promotions', id: mapContext.value });
        var saved = rec.save(); // save to trigger UE
        log.debug('record saved successfully', "id: " + saved);
    };
    exports.summarize = function (context) {
        log.debug('summarize', 'Execution complete');
    };
    return exports;
});
