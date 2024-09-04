/**
 * loyaltyGlobals.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName Loyalty Globals
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/error", "N/format", "N/log", "N/query", "N/record", "N/runtime", "N/search"], function (require, exports, err, format, log, query, record, runtime, search) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ITEMTYPE = exports.queryPointsHistory = exports.getRepAllowanceConfig = exports.getNetAmountForLinesOnSalesOrder = exports.isCreatedFromSO = exports.getTotalEligibleForPoints = exports.cancelPointsRedemption = exports.queuePointsRedemption = exports.updateLifetimePointsOnCustomer = exports.updatePointsOnCustomer = exports.earnPoints = exports.getCustomerTier = exports.getLatestPointsEntry = exports.updatePendingPointsEntry = exports.allowanceEntryExists = exports.entryExists = exports.createPointsEntry = exports._setConfig = exports._getConfig = exports._LOYALTY_CONFIG = exports.allowanceFrequency = exports.commandIds = exports.commandIdsSBX = exports.generatorScriptDeployment = exports.generatorScriptRecord = exports.loyaltyTiers = exports.loyaltyActions = exports.loyaltyTierOverrideFieldId = exports.loyaltyPointsOptInFieldId = exports.loyaltyPointsTierFieldId = exports.loyaltyPointsTotalFieldId = exports.loyaltyPointsCurrentFieldId = exports.loyaltyPointsRecordId = exports.loyaltyConfigRecordId = void 0;
    exports.loyaltyConfigRecordId = 'customrecord_hf_loyalty_tier_config';
    exports.loyaltyPointsRecordId = 'customrecord_hf_loyalty';
    exports.loyaltyPointsCurrentFieldId = 'custentity_hf_avail_loyalty_points';
    exports.loyaltyPointsTotalFieldId = 'custentity_hf_total_loyalty_points';
    exports.loyaltyPointsTierFieldId = 'custentity_hf_current_loyalty_tier';
    exports.loyaltyPointsOptInFieldId = 'custentity_hf_loyalty_optin';
    exports.loyaltyTierOverrideFieldId = 'custentity_hf_exclude_tier_pricelevel';
    exports.loyaltyActions = 'customlist_hf_loyalty_actions';
    exports.loyaltyTiers = 'customlist_hf_loyalty_tiers_2';
    exports.generatorScriptRecord = 'customscript_hf_generate_points';
    exports.generatorScriptDeployment = 'customdeploy_hf_generate_points';
    /*export const loyaltyCommands = {
     pointsEarned    : 'earn',
     pointsRedeemed  : 'redeem',
     pointsPending   : 'pending',
     bonusPoints     : 'bonus',
     cancelRedemption: 'cancel'
     }*/
    exports.commandIdsSBX = {
        'pointsEarned': 1,
        'pointsRedeemed': 2,
        'bonusPoints': 3,
        'pointsPending': 4,
        'openingBalance': 5,
        'cancelRedemption': 7,
        'correction': 8,
        'allowance': 9,
        //'treatment'          : 10,
        'pointsExpired': 11,
        'treatmentRedemption': 12
    };
    exports.commandIds = {
        'pointsEarned': 1,
        'pointsRedeemed': 2,
        'bonusPoints': 3,
        'pointsPending': 4,
        'openingBalance': 5,
        'cancelRedemption': 6,
        'correction': 7,
        'allowance': 8,
        'pointsExpired': 9,
        'treatmentRedemption': 10
    };
    exports.allowanceFrequency = {
        'Monthly': 1,
        'BiMonthly': 2,
        'Quarterly': 3,
        'Yearly': 4
    };
    exports._LOYALTY_CONFIG = {
        initialized: false,
        tiers: {}
    };
    function _getConfig() {
        if (exports._LOYALTY_CONFIG.initialized) {
            return exports._LOYALTY_CONFIG;
        }
        else {
            _setConfig();
            return exports._LOYALTY_CONFIG;
        }
    }
    exports._getConfig = _getConfig;
    function _setConfig() {
        const tierMap = {};
        const queryObj = query.create({ type: exports.loyaltyConfigRecordId });
        const inActive = queryObj.createCondition({ fieldId: 'isinactive', operator: query.Operator.IS, values: false });
        queryObj.condition = queryObj.and(inActive);
        queryObj.columns = [
            queryObj.createColumn({ fieldId: 'id' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_loyalty_tier', alias: 'tierId' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_loyalty_tier', alias: 'tierName', context: query.FieldContext.DISPLAY }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_price_level', alias: 'tierPriceLevel' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_price_level', alias: 'tierPriceLevelName', context: query.FieldContext.DISPLAY }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_points_multiplier', alias: 'tierRate' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_ytd_spend_req', alias: 'spendRequired' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_config_days_expire', alias: 'tierDaysExpire' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_tier_currency', alias: 'currency' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_tier_subsidiary', alias: 'subsidiary' })
        ];
        // sort on spend required so that they're ordered
        queryObj.sort = [
            queryObj.createSort({ column: queryObj.columns[6], ascending: true })
        ];
        const runQuery = queryObj.run();
        const iterator = runQuery.iterator();
        iterator.each(function (result) {
            const resultObj = result.value.asMap();
            //log.debug('tier result', resultObj);
            const key = `${resultObj.tierId}:${resultObj.currency}:${resultObj.subsidiary}`;
            tierMap[key] = {
                tierName: resultObj.tierName,
                tierId: Number(resultObj.tierId),
                tierMultiplier: resultObj.tierRate,
                tierPriceLevel: Number(resultObj.tierPriceLevel),
                tierExpireDays: Number(resultObj.tierDaysExpire),
                tierSpendRequired: Number(resultObj.spendRequired),
                currency: Number(resultObj.currency),
                subsidiary: Number(resultObj.subsidiary)
            };
            return true;
        });
        exports._LOYALTY_CONFIG.tiers = tierMap;
        exports._LOYALTY_CONFIG.initialized = true;
    }
    exports._setConfig = _setConfig;
    function createPointsEntry(args) {
        //customerId: string, action: number, newPoints: number, tierExpireDays: number, apexId: string, transactionId?: number, transactionDate?: Date, memo?: string): {success: boolean, id?: number, message?: string
        if (!entryExists(args.transactionId, args.action.toString())) {
            const currentPointTotal = getLatestPointsEntry(args.customerId);
            const points = args.newPoints + currentPointTotal;
            const pointsEntryRec = record.create({ type: exports.loyaltyPointsRecordId });
            const tranDate = new Date(format.parse({ value: args.transactionDate, type: format.Type.DATE })); // convert to date object
            const expires = new Date(tranDate.getFullYear(), tranDate.getMonth(), tranDate.getDate() + args.tierExpireDays);
            log.debug(`points ${points} `, `currentPointTotal ${currentPointTotal} newPoints ${args.newPoints}, tranDate ${tranDate}, expires ${expires}`);
            pointsEntryRec.setValue('custrecord_hf_loyalty_customer', args.customerId);
            if (args.transactionId > 0)
                pointsEntryRec.setValue('custrecord_hf_loyalty_transaction', args.transactionId);
            pointsEntryRec.setValue('custrecord_hf_loyalty_action', args.action);
            pointsEntryRec.setValue('custrecord_hf_loyalty_points', args.newPoints);
            pointsEntryRec.setValue('custrecord_hf_loyalty_total', points.toFixed(2));
            if (args.memo && args.memo.length > 0)
                pointsEntryRec.setValue('custrecord_hf_loyalty_memo', args.memo);
            if (args.apexId && args.apexId.length > 0)
                pointsEntryRec.setValue('custrecord_hf_loyalty_apex_id', args.apexId);
            if (points < 0) {
                throw err.create({ name: 'ERR_NEGATIVE_LOYALTY_POINTS', message: 'Points balance cannot be less than zero.' });
            }
            pointsEntryRec.setValue('custrecord_hf_loyalty_trandate', format.parse({ type: format.Type.DATE, value: args.transactionDate }));
            log.debug('expires ' + expires, `tierExpireDays ${args.tierExpireDays}, tran date: ${tranDate}, new days ${tranDate.getDate() + args.tierExpireDays}`);
            if (args.tierExpireDays > 0) {
                const actionNotExpired = runtime.accountId == '6248126_SB2' ? args.action != exports.commandIdsSBX.pointsExpired : args.action != exports.commandIds.pointsExpired;
                if (actionNotExpired)
                    pointsEntryRec.setValue('custrecord_hf_loyalty_expiration_date', expires);
                else
                    pointsEntryRec.setValue('custrecord_hf_loyalty_expiration_date', args.transactionDate);
            }
            pointsEntryRec.setValue('custrecord_hf_loyalty_is_expired', false);
            try {
                const saved = pointsEntryRec.save();
                if (saved > 0) {
                    try {
                        updatePointsOnCustomer(args.customerId, Number(points.toFixed(2)));
                        return {
                            success: true,
                            id: saved
                        };
                    }
                    catch (e) {
                        return {
                            success: true,
                            id: saved,
                            message: e.message
                        };
                    }
                }
            }
            catch (e) {
                return {
                    success: false,
                    message: e.message
                };
            }
        }
        else {
            return {
                success: false,
                message: `An entry already exists for this transaction and action`
            };
        }
    }
    exports.createPointsEntry = createPointsEntry;
    function entryExists(transactionId, command) {
        const queryObj = query.create({ type: exports.loyaltyPointsRecordId });
        const inActive = queryObj.createCondition({ fieldId: 'isinactive', operator: query.Operator.IS, values: false });
        const transactionFilter = queryObj.createCondition({ fieldId: 'custrecord_hf_loyalty_transaction', operator: query.Operator.ANY_OF, values: transactionId.toString() });
        if (command) {
            const actionFilter = queryObj.createCondition({ fieldId: 'custrecord_hf_loyalty_action', operator: query.Operator.ANY_OF, values: command });
            queryObj.condition = queryObj.and(inActive, transactionFilter, actionFilter);
        }
        else {
            queryObj.condition = queryObj.and(inActive, transactionFilter);
        }
        queryObj.columns = [
            queryObj.createColumn({ fieldId: 'id' })
        ];
        log.debug(`running query for existing entries`, `transactionId: ${transactionId} command: ${command}`);
        const runQuery = queryObj.run(); // get the latest entry
        let results = runQuery.results;
        return results.length > 0;
    }
    exports.entryExists = entryExists;
    function allowanceEntryExists(command, customer, date) {
        const queryObj = query.create({ type: exports.loyaltyPointsRecordId });
        const inActive = queryObj.createCondition({ fieldId: 'isinactive', operator: query.Operator.IS, values: false });
        const transactionFilter = queryObj.createCondition({ fieldId: 'custrecord_hf_loyalty_trandate', operator: query.Operator.ON, values: date });
        const actionFilter = queryObj.createCondition({ fieldId: 'custrecord_hf_loyalty_action', operator: query.Operator.ANY_OF, values: command });
        const customerFilter = queryObj.createCondition({ fieldId: 'custrecord_hf_loyalty_customer', operator: query.Operator.ANY_OF, values: customer });
        queryObj.condition = queryObj.and(inActive, transactionFilter, actionFilter, customerFilter);
        queryObj.columns = [
            queryObj.createColumn({ fieldId: 'id' })
        ];
        log.debug(`running query for existing allowance entries`, `date: ${date} customer: ${customer} command: ${command}`);
        const runQuery = queryObj.run(); // get the latest entry
        let results = runQuery.results;
        return results.length > 0;
    }
    exports.allowanceEntryExists = allowanceEntryExists;
    function updatePendingPointsEntry(transactionId) {
        const queryObj = query.create({ type: exports.loyaltyPointsRecordId });
        const inActive = queryObj.createCondition({ fieldId: 'isinactive', operator: query.Operator.IS, values: false });
        const transactionFilter = queryObj.createCondition({ fieldId: 'custrecord_hf_loyalty_transaction', operator: query.Operator.ANY_OF, values: transactionId });
        const pointsPendingAction = runtime.accountId == '6248126_SB2' ? exports.commandIdsSBX.pointsPending : exports.commandIds.pointsPending;
        const actionFilter = queryObj.createCondition({ fieldId: 'custrecord_hf_loyalty_action', operator: query.Operator.ANY_OF, values: pointsPendingAction.toString() });
        queryObj.condition = queryObj.and(inActive, transactionFilter, actionFilter);
        queryObj.columns = [
            queryObj.createColumn({ fieldId: 'id' })
        ];
        queryObj.sort = [
            queryObj.createSort({ column: queryObj.columns[0], ascending: true })
        ];
        const runQuery = queryObj.run(); // get the latest entry
        let results = runQuery.results;
        if (results.length > 1)
            log.error('only one entry should be returned', 'failed');
        if (results.length == 1) {
            const values = results[0].values;
            log.debug('values', values);
            const pointsRedeemedAction = runtime.accountId == '6248126_SB2' ? exports.commandIdsSBX.pointsRedeemed : exports.commandIds.pointsRedeemed;
            record.submitFields({ type: exports.loyaltyPointsRecordId, id: values[0], values: { 'custrecord_hf_loyalty_action': pointsRedeemedAction } });
            for (let i = results.length - 1; i >= 0; i--) {
                log.debug('result', results[i].values);
            }
        }
        else {
            log.debug(`no pending points for this transaction`, `${transactionId}`);
        }
    }
    exports.updatePendingPointsEntry = updatePendingPointsEntry;
    function getLatestPointsEntry(customerId) {
        const queryObj = query.create({ type: exports.loyaltyPointsRecordId });
        const inActive = queryObj.createCondition({ fieldId: 'isinactive', operator: query.Operator.IS, values: false });
        const customerFilter = queryObj.createCondition({ fieldId: 'custrecord_hf_loyalty_customer', operator: query.Operator.ANY_OF, values: customerId });
        queryObj.condition = queryObj.and(inActive, customerFilter);
        queryObj.columns = [
            queryObj.createColumn({ fieldId: 'id' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_loyalty_total' })
        ];
        queryObj.sort = [
            queryObj.createSort({ column: queryObj.columns[0], ascending: true })
        ];
        const runQuery = queryObj.runPaged({ pageSize: 1 }); // get the latest entry
        const iterator = runQuery.iterator();
        let currentPointsTotal = 0;
        iterator.each(function (resultPage) {
            const currentPageData = resultPage.value.data.asMappedResults();
            for (let result of currentPageData) {
                currentPointsTotal = Number(result.custrecord_hf_loyalty_total);
            }
            return true;
        });
        return currentPointsTotal;
    }
    exports.getLatestPointsEntry = getLatestPointsEntry;
    function getCustomerTier(customerId) {
        log.debug('getting customer tier:', `customer id: ${customerId}`);
        const resp = { optedIn: false, tierConfig: {} };
        const currentCustomerTier = search.lookupFields({ type: search.Type.CUSTOMER, id: customerId, columns: [exports.loyaltyPointsOptInFieldId, exports.loyaltyPointsTierFieldId, 'currency', 'subsidiary'] });
        //log.debug('currentCustomerTier', currentCustomerTier)
        const isOptedIn = currentCustomerTier[exports.loyaltyPointsOptInFieldId];
        if (isOptedIn) {
            const LOYALTY_CONFIG = _getConfig();
            const currentTier = currentCustomerTier[exports.loyaltyPointsTierFieldId];
            if (currentTier && currentTier.length > 0) {
                const tierId = currentTier[0].value;
                const subsidiary = currentCustomerTier['subsidiary'];
                const currency = currentCustomerTier['currency'];
                const key = `${tierId}:${currency[0].value}:${subsidiary[0].value}`;
                const tierConfig = LOYALTY_CONFIG.tiers[key];
                //log.debug('tierConfig', tierConfig);
                if (!tierConfig) {
                    log.error(`no config found for this tier ${key} for customer ${customerId}`, LOYALTY_CONFIG.tiers);
                    resp.optedIn = false;
                }
                else {
                    resp.tierConfig = tierConfig;
                    resp.optedIn = true;
                }
            }
            else {
                resp.optedIn = false;
            }
        }
        else {
            log.debug(`no points were earned`, `customer ${isOptedIn} isn't opted in to loyalty`);
        }
        return resp;
    }
    exports.getCustomerTier = getCustomerTier;
    function earnPoints(customerId, transactionTotal, invoiceInternalId, invoiceDate) {
        const config = getCustomerTier(customerId);
        log.debug(`earn points: ${transactionTotal}`, config);
        if (config.optedIn) {
            const multiplier = config.tierConfig.tierMultiplier / 100;
            const points = Number((multiplier * transactionTotal).toFixed(2));
            log.debug('points to add:', points);
            if (points > 0) {
                const pointsEarnedAction = runtime.accountId == '6248126_SB2' ? exports.commandIdsSBX.pointsEarned : exports.commandIds.pointsEarned;
                const args = {
                    customerId,
                    action: pointsEarnedAction,
                    newPoints: points,
                    tierExpireDays: config.tierConfig.tierExpireDays,
                    transactionId: invoiceInternalId,
                    transactionDate: invoiceDate
                };
                const resp = createPointsEntry(args);
                if (resp.success) {
                    log.debug(`points entry created`, `earn points is complete.`);
                }
                else {
                    log.error(`no points were earned`, resp.message);
                }
            }
            else {
                log.debug(`no points were passed`, `no action was taken`);
            }
        }
    }
    exports.earnPoints = earnPoints;
    function updatePointsOnCustomer(customerId, newPointsCurrent) {
        /** update points total on customer */
        const values = {};
        const lifeTimePoints = updateLifetimePointsOnCustomer(customerId);
        values[exports.loyaltyPointsCurrentFieldId] = newPointsCurrent;
        values[exports.loyaltyPointsTotalFieldId] = lifeTimePoints;
        record.submitFields({ type: record.Type.CUSTOMER, id: customerId, values, options: { ignoreMandatoryFields: true } });
    }
    exports.updatePointsOnCustomer = updatePointsOnCustomer;
    function updateLifetimePointsOnCustomer(customerId) {
        const searchObj = search.load({ id: 'customsearch_hf_loyalty_lifetime_total' }); //[SCRIPT] Customer Lifetime Total
        const filterExpression = searchObj.filterExpression;
        let lifetimePoints = 0;
        if (filterExpression.length > 0)
            filterExpression.push('AND');
        filterExpression.push(['custrecord_hf_loyalty_customer', 'anyof', customerId]);
        searchObj.filterExpression = filterExpression;
        const result = searchObj.run().getRange({ start: 0, end: 1 });
        if (result.length == 1) {
            lifetimePoints += Number(result[0].getValue({ name: 'custrecord_hf_loyalty_points', summary: search.Summary.SUM }));
        }
        return lifetimePoints;
    }
    exports.updateLifetimePointsOnCustomer = updateLifetimePointsOnCustomer;
    /** on create, if points were redeemed against an order, add a pending points entry
     * the pending points and points redeemed fields are set in the webstore on the sales order
     * */
    function queuePointsRedemption(customerId, points, transactionId, transactionDate, isEdit) {
        const config = getCustomerTier(customerId);
        const pointsPendingAction = runtime.accountId == '6248126_SB2' ? exports.commandIdsSBX.pointsPending : exports.commandIds.pointsPending;
        const args = {
            customerId,
            action: pointsPendingAction,
            newPoints: points,
            tierExpireDays: config.tierConfig.tierExpireDays,
            transactionId: transactionId,
            transactionDate: transactionDate
        };
        if (isEdit) {
            const pendingPointsEntry = entryExists(args.transactionId, args.action.toString());
            if (!pendingPointsEntry) {
                log.debug(`no pending points entry was found`, `check for redemption`);
                const redemptionPointsEntry = entryExists(args.transactionId, exports.commandIds.pointsRedeemed.toString());
                if (redemptionPointsEntry) {
                    log.debug(`redemption already handled`, `no actions necessary`);
                    return;
                }
            }
        }
        const resp = createPointsEntry(args);
        if (resp.success) {
            log.audit(`points entry created`, `queuePointsRedemption is complete.`);
        }
        else {
            log.error(`no points were queued`, resp.message);
        }
    }
    exports.queuePointsRedemption = queuePointsRedemption;
    function cancelPointsRedemption(customerId, transactionId, transactionDate) {
        let points = 0;
        const pointsPendingAction = runtime.accountId == '6248126_SB2' ? exports.commandIdsSBX.pointsPending : exports.commandIds.pointsPending;
        const results = query.runSuiteQL({
            query: `SELECT id, custrecord_hf_loyalty_points as points
        FROM ${exports.loyaltyPointsRecordId} 
        WHERE isinactive = 'F' 
        AND custrecord_hf_loyalty_transaction = ${transactionId} 
        AND custrecord_hf_loyalty_action = ${pointsPendingAction}`,
            params: []
        }).asMappedResults();
        results.forEach((pointsEntry) => {
            points += pointsEntry.points;
        });
        log.debug('cancelPointsRedemption', `Points found for transaction ${transactionId}:  ${points}, action: ${pointsPendingAction}`);
        if (Math.abs(points) > 0) {
            /** cancel the points redemption by adding a cancelation entry */
            const config = getCustomerTier(customerId);
            const cancelRedemptionAction = runtime.accountId == '6248126_SB2' ? exports.commandIdsSBX.cancelRedemption : exports.commandIds.cancelRedemption;
            const args = {
                customerId,
                action: cancelRedemptionAction,
                newPoints: Math.abs(points),
                tierExpireDays: config.tierConfig.tierExpireDays,
                transactionId: Number(transactionId),
                transactionDate: transactionDate
            };
            const resp = createPointsEntry(args);
            if (resp.success) {
                log.debug('cancelPointsRedemption', `points entry created: cancelPointsRedemption is complete.`);
            }
            else {
                log.error('cancelPointsRedemption', `no points were cancelled, ${resp.message}`);
            }
        }
        else {
            log.error('cancelPointsRedemption', `no points were calculated to be returned.`);
        }
    }
    exports.cancelPointsRedemption = cancelPointsRedemption;
    function getTotalEligibleForPoints(rec) {
        const lineCount = rec.getLineCount({ sublistId: 'item' });
        const lineMap = getNetAmountForLinesOnSalesOrder(rec.id);
        let itemTotal = 0;
        for (let line = 0; line < lineCount; line++) {
            const item = rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line });
            const itemType = rec.getSublistValue({ sublistId: 'item', fieldId: 'itemtype', line });
            if (itemType != 'EndGroup' && itemType != 'Discount') {
                //log.debug('itemtype', itemType);
                const itemLookup = search.lookupFields({ type: exports.ITEMTYPE[itemType], id: item, columns: ['custitem_hf_applicable_loyalty'] });
                const isEligibleForLoyalty = itemLookup['custitem_hf_applicable_loyalty'];
                if (isEligibleForLoyalty) {
                    const lineId = rec.getSublistValue({ sublistId: 'item', fieldId: 'line', line });
                    for (let line of lineMap) {
                        if (line.id == Number(lineId) && line.item == Number(item)) {
                            itemTotal += Math.abs(line.netamount); // net amount is negative...
                        }
                    }
                }
            }
        }
        return itemTotal;
    }
    exports.getTotalEligibleForPoints = getTotalEligibleForPoints;
    function isCreatedFromSO(createdFrom) {
        if (Number(createdFrom) > 0) {
            const fieldLookup = search.lookupFields({ type: search.Type.TRANSACTION, id: createdFrom, columns: ['type'] });
            const createdFromType = fieldLookup['type'];
            if (createdFromType && createdFromType.length > 0 && createdFromType[0].value == 'SalesOrd') {
                return true;
            }
        }
        return false;
    }
    exports.isCreatedFromSO = isCreatedFromSO;
    function getNetAmountForLinesOnSalesOrder(salesOrderId) {
        const sqlQuery = `SELECT transactionLine.netamount, transactionLine.id, transactionLine.itemType, transactionLine.item, item.custitem_hf_applicable_loyalty
      FROM transactionLine
       JOIN transaction on transaction.id = transactionLine.transaction 
       JOIN item on item.id = transactionLine.item 
      WHERE 
       transaction.id = ${salesOrderId}
      and transactionLine.mainLine = 'F'
      and transactionLine.taxLine= 'F'
      and transactionLine.isCogs = 'F'
      and transactionLine.itemType != 'ShipItem'
      and item.custitem_hf_applicable_loyalty = 'T'
      `;
        const lines = query.runSuiteQL({
            query: sqlQuery,
            params: []
        }).asMappedResults();
        return lines;
    }
    exports.getNetAmountForLinesOnSalesOrder = getNetAmountForLinesOnSalesOrder;
    function getRepAllowanceConfig(salesRole) {
        const date = new Date();
        const day = date.getDate();
        const result = search.create({
            type: 'customrecord_hf_sales_allowance_by_role',
            filters: [['isinactive', 'is', false], 'and', ['custrecord_hf_sales_allowance_role', 'anyof', [salesRole]], 'and', ['custrecord_hf_sales_allowance', 'equalto', day]],
            columns: ['custrecord_hf_sales_allowance_role', 'custrecord_hf_sales_allowance_amount', 'custrecord_hf_sales_allowance', 'custrecord_hf_sales_allowance_subsidiary']
        }).run().getRange({ start: 0, end: 1 });
        if (result.length == 1) {
            return {
                roleName: result[0].getText('custrecord_hf_sales_allowance_role'),
                role: Number(result[0].getValue('custrecord_hf_sales_allowance_role')),
                points: Number(result[0].getValue('custrecord_hf_sales_allowance_amount')),
                dayOfMonth: Number(result[0].getValue('custrecord_hf_sales_allowance')),
                subsidiary: Number(result[0].getValue('custrecord_hf_sales_allowance_subsidiary'))
            };
        }
    }
    exports.getRepAllowanceConfig = getRepAllowanceConfig;
    function queryPointsHistory(customerId) {
        const queryObj = query.create({ type: exports.loyaltyPointsRecordId });
        const inActive = queryObj.createCondition({ fieldId: 'isinactive', operator: query.Operator.IS, values: false });
        const customer = queryObj.createCondition({ fieldId: 'custrecord_hf_loyalty_customer', operator: query.Operator.ANY_OF, values: customerId });
        const transactionJoin = queryObj.autoJoin({ fieldId: 'custrecord_hf_loyalty_transaction' });
        queryObj.condition = queryObj.and(inActive, customer);
        queryObj.columns = [
            queryObj.createColumn({ fieldId: 'id' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_loyalty_action', alias: 'actionId' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_loyalty_action', alias: 'actionName', context: query.FieldContext.DISPLAY }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_loyalty_points', alias: 'points' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_loyalty_total', alias: 'newTotal' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_loyalty_expiration_date', alias: 'expirationDate' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_loyalty_is_expired', alias: 'isExpired' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_loyalty_transaction', alias: 'transactionID' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_loyalty_transaction', alias: 'transactionName', context: query.FieldContext.DISPLAY }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_loyalty_trandate', alias: 'transactionDate' }),
            transactionJoin.createColumn({ fieldId: '', alias: 'otherrefnum' })
        ];
        queryObj.sort = [
            queryObj.createSort({ column: queryObj.columns[0], ascending: false })
        ];
    }
    exports.queryPointsHistory = queryPointsHistory;
    exports.ITEMTYPE = {
        'Assembly': 'assemblyitem',
        'LotNumberedInventoryItem': 'lotnumberedinventoryitem',
        'Description': 'descriptionitem',
        'Discount': 'discountitem',
        'GiftCert': 'giftcertificateitem',
        'InvtPart': 'inventoryitem',
        'Group': 'itemgroup',
        'Kit': 'kititem',
        'Markup': 'markupitem',
        'NonInvtPart': 'noninventoryitem',
        'OthCharge': 'otherchargeitem',
        'Payment': 'paymentitem',
        'Service': 'serviceitem',
        'Subtotal': 'subtotalitem'
    };
});
