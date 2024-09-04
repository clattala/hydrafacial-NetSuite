/**
 * processRepAllowances.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName HF | Loyalty - Process Allowances
 * @NScriptType MapReduceScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/error", "N/format", "N/log", "N/runtime", "N/search", "./loyaltyGlobals"], function (require, exports, err, format, log, runtime, search, loyaltyGlobals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summarize = exports.reduce = exports.map = exports.getInputData = void 0;
    const getInputData = ctx => {
        /** search will return the results where the allocation day is equal to today. The max is 28. */
        const allocationRecordsToProcess = mapAllocationResults('customsearch_hf_rep_allowances'); //[SCRIPT] Reps for Allowances
        const repsToProcess = getRepsForAllocations(allocationRecordsToProcess);
        return repsToProcess;
    };
    exports.getInputData = getInputData;
    const map = ctx => {
        try { // get all the lines for the customer and write it to the values
            const valueObj = JSON.parse(ctx.value);
            ctx.write(valueObj.id.toString(), JSON.stringify(valueObj));
        }
        catch (e) {
            log.error('map fn error', e);
        }
    };
    exports.map = map;
    const reduce = (ctx) => {
        const valueObjs = ctx.values;
        if (valueObjs.length > 1)
            throw err.create({ name: 'ERR_MULTIPLE_CUSTOMERS', message: 'Multiple customers were found.' });
        const repObj = JSON.parse(valueObjs[0]);
        log.debug('reduce', repObj);
        const date = new Date();
        const pointsToAdd = repObj.repAllocationConfig.amount - repObj.currentPoints; // they should get topped off to the total amount
        if (pointsToAdd > 0) {
            try {
                const args = {
                    customerId: repObj.id.toString(),
                    action: loyaltyGlobals_1.commandIds.allowance,
                    newPoints: pointsToAdd,
                    tierExpireDays: 365,
                    transactionDate: new Date(),
                    transactionId: 0,
                    memo: `${repObj.repAllocationConfig.salesRole} Allowance adjustment for ${date.toLocaleString('default', { month: 'long' })}`
                };
                if (!(0, loyaltyGlobals_1.allowanceEntryExists)(args.action.toString(), args.customerId, format.format({ type: format.Type.DATE, value: args.transactionDate }))) {
                    log.debug('args', args);
                    const resp = (0, loyaltyGlobals_1.createPointsEntry)(args);
                    log.debug(`resp`, resp);
                    if (resp.success)
                        log.debug(`Sales Rep Allowance Added`, repObj);
                    else
                        log.debug(resp.message, repObj);
                }
                else {
                    log.debug(`this entry already exists`, `skipping processing.`);
                }
            }
            catch (e) {
                log.error('error processing points', e);
            }
        }
        else
            log.debug(`Already at max points for allowance`, `skipping processing.`);
        ctx.write(ctx.key, JSON.stringify(repObj));
    };
    exports.reduce = reduce;
    var summarize = (context) => {
        log.debug('script complete', 'rep allowances processed');
    };
    exports.summarize = summarize;
    function mapAllocationResults(searchID) {
        const searchObj = search.load({ id: searchID });
        const pageData = searchObj.runPaged({ pageSize: 1000 });
        const configs = [];
        pageData.pageRanges.forEach(function (pageRange) {
            let page = pageData.fetch({ index: pageRange.index });
            page.data.forEach(function (result) {
                const frequency = Number(result.getValue('custrecord_hf_sales_allowance_frequency'));
                const now = new Date();
                const month = now.getMonth() + 1;
                let processAllowance = false;
                log.debug('checking frequency', `${frequency}, ${loyaltyGlobals_1.allowanceFrequency.Monthly}`);
                let monthsForQuarterly = ['1', '4', '7', '10'];
                let monthForYearly = 1;
                const customYear = runtime.getCurrentScript().getParameter({ name: 'custscript_hf_loyalty_yearly' });
                if (Number(customYear) > 0)
                    monthForYearly = Number(customYear);
                const customMonths = runtime.getCurrentScript().getParameter({ name: 'custscript_hf_loyalty_quarters' });
                if (customMonths.length > 0) {
                    const customMonthsArr = customMonths.split(',');
                    const monthsClean = [];
                    for (let month of customMonthsArr) {
                        monthsClean.push(month.trim());
                    }
                    monthsForQuarterly = monthsClean;
                }
                if (frequency == loyaltyGlobals_1.allowanceFrequency.Monthly)
                    processAllowance = true;
                if (frequency == loyaltyGlobals_1.allowanceFrequency.BiMonthly)
                    processAllowance = month % 2 > 0;
                if (frequency == loyaltyGlobals_1.allowanceFrequency.Quarterly)
                    processAllowance = monthsForQuarterly.includes(month.toString());
                if (frequency == loyaltyGlobals_1.allowanceFrequency.Yearly)
                    processAllowance = month == monthForYearly;
                if (processAllowance) {
                    configs.push({
                        id: result.id,
                        amount: Number(result.getValue('custrecord_hf_sales_allowance_amount')),
                        subsidiary: Number(result.getValue('custrecord_hf_sales_allowance_subsidiary')),
                        salesRole: Number(result.getValue('custrecord_hf_sales_allowance_role')),
                        frequency
                    });
                }
                return true;
            });
        });
        return configs;
    }
    function getRepsForAllocations(allocations) {
        const results = [];
        log.debug('mapping allocations: ', allocations);
        for (let config of allocations) {
            log.debug(`starting processing allocation`, config);
            const seachObj = search.create({
                type: search.Type.CUSTOMER,
                filters: [['isinactive', 'is', false], 'and', ['custentity_hf_sales_role', 'anyof', config.salesRole]],
                columns: ['custentity_hf_avail_loyalty_points']
            });
            const pageData = seachObj.runPaged({ pageSize: 1000 });
            pageData.pageRanges.forEach(function (pageRange) {
                let page = pageData.fetch({ index: pageRange.index });
                page.data.forEach(function (result) {
                    results.push({
                        id: result.id,
                        repAllocationConfig: config,
                        currentPoints: Number(result.getValue('custentity_hf_avail_loyalty_points'))
                    });
                });
            });
        }
        log.debug(`found ${results.length} reps to process`, results);
        return results;
    }
});
