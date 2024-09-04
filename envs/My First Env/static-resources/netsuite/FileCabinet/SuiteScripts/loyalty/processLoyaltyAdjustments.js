/**
 * processRepAllowances.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName HF | Loyalty - Process Adjustments
 * @NScriptType MapReduceScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/log", "N/record", "N/runtime", "N/search", "./loyaltyGlobals"], function (require, exports, log, record, runtime, search, loyaltyGlobals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summarize = exports.reduce = exports.map = exports.getInputData = void 0;
    const getInputData = ctx => {
        const searchResults = mapResults('customsearch_hf_loyalty_points_adjustmen'); //[SCRIPT] Loyalty Points Adjustments
        const runForResults = Number(runtime.getCurrentScript().getParameter({ name: 'custscript_hf_loyalty_adjust_results' }));
        if (runForResults > 0)
            return searchResults.slice(0, runForResults);
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
        const pointsAdjustments = [];
        if (valueObjs.length > 0) {
            const first = JSON.parse(valueObjs[0]);
            const config = (0, loyaltyGlobals_1.getCustomerTier)(first.customer.toString());
            const treatmentRedemptionEntries = []; // place to store all the redemption entries
            let createTreatmentRedemptionInvoice = true;
            log.debug('checking config in reduce', config);
            valueObjs.forEach((val) => {
                const mapObj = JSON.parse(val);
                if (config && config.optedIn) {
                    log.debug('customer tier', config);
                    try {
                        const args = {
                            customerId: mapObj.customer.toString(),
                            action: mapObj.action,
                            newPoints: mapObj.points,
                            tierExpireDays: config.tierConfig.tierExpireDays,
                            transactionId: mapObj.transactionId,
                            transactionDate: new Date(),
                            memo: mapObj.memo,
                            apexId: mapObj.apexId
                        };
                        const resp = (0, loyaltyGlobals_1.createPointsEntry)(args);
                        if (resp.success) {
                            if (mapObj.action == loyaltyGlobals_1.commandIds.treatmentRedemption)
                                treatmentRedemptionEntries.push(mapObj);
                            record.submitFields({
                                type: 'customrecord_hf_loyalty_points_adjustmnt',
                                id: mapObj.id,
                                values: { 'custrecord_hf_points_processed': true, 'custrecocrd_hf_points_logs': resp.message || '' }
                            });
                        }
                        else {
                            createTreatmentRedemptionInvoice = false;
                            record.submitFields({
                                type: 'customrecord_hf_loyalty_points_adjustmnt',
                                id: mapObj.id,
                                values: { 'custrecord_hf_points_logs': resp.message }
                            });
                        }
                    }
                    catch (e) {
                        record.submitFields({
                            type: 'customrecord_hf_loyalty_points_adjustmnt',
                            id: mapObj.id,
                            values: { 'custrecord_hf_points_logs': e.message }
                        });
                        log.error('error adding points adjustment ' + mapObj.id, e);
                        createTreatmentRedemptionInvoice = false;
                    }
                }
                else {
                    createTreatmentRedemptionInvoice = false;
                    record.submitFields({
                        type: 'customrecord_hf_loyalty_points_adjustmnt',
                        id: mapObj.id,
                        values: { 'custrecord_hf_points_logs': `Config couldn't be loaded for customer. Confirm customer is opted in to loyalty with a tier set.` }
                    });
                }
            });
            if (treatmentRedemptionEntries.length > 0 && createTreatmentRedemptionInvoice) {
                // create an invoice for this customer and zero it out.
                const loyaltyItem = Number(runtime.getCurrentScript().getParameter({ name: 'custscript_hf_loyalty_adjust_item' }));
                const loyaltyDiscount = Number(runtime.getCurrentScript().getParameter({ name: 'custscript_hf_loyalty_adjust_disc' }));
                if (loyaltyItem > 0 && loyaltyDiscount > 0) {
                    const invoiceRec = record.create({ type: record.Type.INVOICE });
                    // other defaults?
                    invoiceRec.setValue('entity', first.customer);
                    invoiceRec.selectNewLine({ sublistId: 'item' });
                    invoiceRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: loyaltyItem });
                    invoiceRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: treatmentRedemptionEntries.length });
                    invoiceRec.commitLine({ sublistId: 'item' });
                    invoiceRec.selectNewLine({ sublistId: 'item' });
                    invoiceRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: loyaltyDiscount });
                    invoiceRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'amount', value: 100 }); // 100%?
                    invoiceRec.commitLine({ sublistId: 'item' });
                    try {
                        const saved = invoiceRec.save();
                        log.audit(`invoice was created for customer redemptions: `, `invoice id: ${saved}`);
                        //todo: dupe check and we will need clean up for failures?
                    }
                    catch (e) {
                        log.error('error saving invoice', e);
                    }
                }
                else {
                    log.error('Script is missing required parameters', 'Please set the loyalty item and discount item');
                }
            }
            else {
                log.audit('Skipping invoice generation', 'Invoice generation was skipped because there were no redemption entries or something went wrong when updating them.');
            }
            /** earnPoints handles updating the customer totals so no future processing is needed... */
        }
        ctx.write(ctx.key, JSON.stringify({ pointsAdjustments: pointsAdjustments }));
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
                results.push({
                    id: result.id,
                    customer: Number(result.getValue('custrecord_hf_points_customer')),
                    action: Number(result.getValue('custrecord_hf_points_action')),
                    transactionId: Number(result.getValue('custrecord_hf_loyalty_points_transaction')),
                    points: Number(result.getValue('custrecord_hf_points_amount')),
                    memo: result.getValue('custrecord_hf_points_memo'),
                    processed: result.getValue('custrecord_hf_points_processed'),
                    apexId: result.getValue('custrecord_hf_points_apex_adjustment_id')
                });
            });
        });
        return results;
    }
});
