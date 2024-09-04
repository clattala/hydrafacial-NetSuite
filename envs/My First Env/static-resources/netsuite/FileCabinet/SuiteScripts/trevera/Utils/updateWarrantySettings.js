/**
 * @NApiVersion 2.1
 * @author Shelby Severin <shelby.severin@trevera.com>
 * @NModuleScope Public
 * @NScriptName HF | Update Warranty Settings
 * @NScriptType MapReduceScript
 */
define(["N/log", "N/record", "N/search"], function (log, record, search) {
    var exports = {};
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reduce = exports.map = exports.getInputData = void 0;
    exports.getInputData = function (ctx) {
        var searchResults = mapResults('customsearch4974'); //[SCRIPT] Invoiced Capital Equipment without Warranty
      log.debug('searchResults Returned', searchResults.length)
        return searchResults;
    };
    exports.map = function (ctx) {
        try { // get all the lines for the order and write it to the values
            var valueObj = JSON.parse(ctx.value);
            //log.debug('valueObj', valueObj);
            ctx.write(valueObj.id, JSON.stringify(valueObj));
        }
        catch (e) {
            log.error('map fn error', e);
        }
    };
    exports.reduce = function (ctx) {
        var valueObjs = ctx.values;
        log.debug('valueObjs', valueObjs);
        // get the items on this invoice that should be updated.
        var itemsOnRecord = [];
        valueObjs.forEach(function (val) {
            var mapObj = JSON.parse(val);
            itemsOnRecord.push(mapObj.item);
        });
        // load the invoice
        var invoiceRecord = record.load({ type: record.Type.INVOICE, id: ctx.key });
        var lines = invoiceRecord.getLineCount({ sublistId: 'item' });
        for (var line = 0; line < lines; line++) { // loop the lines. if the item is in our items array, then we set the warranty field
            var item = invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: line });
            if (~itemsOnRecord.indexOf(item)) {
                invoiceRecord.setSublistValue({ sublistId: 'item', fieldId: 'custcol_wrm_reg_warrantyreg', line: line, value: true }); // Register Warranty
                // warranty term list is custom record Warranty Terms customrecord_wrm_warrantyterms
                if (item == '3686')
                    invoiceRecord.setSublistValue({ sublistId: 'item', fieldId: 'custcol_wrm_reg_warrantyterms', line: line, value: 6 }); // Warranty Terms - 2 Years for Syndeo
                else
                    invoiceRecord.setSublistValue({ sublistId: 'item', fieldId: 'custcol_wrm_reg_warrantyterms', line: line, value: 1 }); // Warranty Terms - 1 Year for all others
                //date field: custcol_wrm_reg_warrantyexpire
            }
        }
        try {
            invoiceRecord.save({ ignoreMandatoryFields: true });
            log.debug("updated invoice record " + ctx.key + " to have warranty data", itemsOnRecord);
        }
        catch (e) {
            log.error('error updating warranty on invoice record', e);
        }
        ctx.write(ctx.key, JSON.stringify(ctx.values));
    };
    function mapResults(searchID) {
        var searchObj = search.load({ id: searchID });
        var pageData = searchObj.runPaged({ pageSize: 1000 });
      	log.debug('pagedata count', pageData.count)
        var results = [];
        pageData.pageRanges.forEach(function (pageRange) {
            var page = pageData.fetch({ index: pageRange.index });
            page.data.forEach(function (result) {
                results.push({
                    id: result.id,
                    item: result.getValue('item'),
                    trandate: result.getValue('trandate')
                });
            });
        });
        return results;
    }
    return exports;
});
