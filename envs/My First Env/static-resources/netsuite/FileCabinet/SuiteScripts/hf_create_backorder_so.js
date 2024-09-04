/*************************************************************
JIRA  ID      : 
Script Name   : 
Date          : 
Author        : Ayush Gehalot
UpdatedBy     : 
Description   : 
***************************************************************/

/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/record', 'N/runtime', 'N/search'], function (record, runtime, search) {

    function onAction(scriptContext) {
        log.debug({
            title: 'Start Script'
        });
        var newRecord = scriptContext.newRecord;
        var SalesOrderID = newRecord.id;

        var copyOfSO = record.copy({
            type: record.Type.SALES_ORDER,
            id: SalesOrderID,
            isDynamic: true
        });

        var myScript = runtime.getCurrentScript();
        var orderType = myScript.getParameter({
            name: 'custscript_so_order_type'
        });
        var AccountType = myScript.getParameter({
            name: 'custscript_depost_account'
        });

        // Get the line count
        var lineCount = copyOfSO.getLineCount({ sublistId: 'item' });

        // Iterate through the line items in reverse order to safely remove items
        for (var i = lineCount - 1; i >= 0; i--) {
            // Check if the "Inventory" checkbox is checked for the line item
            var inventoryChecked = copyOfSO.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_hf_stock_check',
                line: i
            });
            log.debug('inventoryChecked', inventoryChecked);
            if (inventoryChecked) {
                // Remove the line item
                copyOfSO.removeLine({ sublistId: 'item', line: i });
            } else {
                newRecord.removeLine({ sublistId: 'item', line: i });
            }
        }
        try {
            var lineCount = copyOfSO.getLineCount({ sublistId: 'item' });
            var lineCountSourceRecord = newRecord.getLineCount({ sublistId: 'item' });
            newRecord.setValue('custbody_hf_show_backorder_button_so', false);

            log.debug('lineCount', lineCount);
            log.debug('lineCountSourceRecord', lineCountSourceRecord);

            if (lineCount != 0 && lineCountSourceRecord != 0) {
                //assign Source SO ID
                copyOfSO.setValue('custbody_hf_backorder_so_created_from', SalesOrderID);
                copyOfSO.setValue('custbody_hf_show_backorder_button_so', false);
                copyOfSO.setValue('shippingcost', 0);

                if (orderType)
                    copyOfSO.setValue('custbody_hf_order_type', orderType);

                var newOrder = copyOfSO.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                });

                newRecord.setValue('custbody_hf_backorder_so_created_to', newOrder);

                //here newRecord is existing SO we are creating backorder of and newOrder is backordered so
                //updateAndCreateCustomerDeposit(newRecord, newOrder, AccountType);
                log.debug('neworder', newOrder);
                return newOrder;
            } else {
                log.debug({
                    title: 'End Script 0'
                });
                return SalesOrderID
            }
        } catch (e) {
            log.debug('e', e);
            return SalesOrderID;
        }
        if (!newOrder)
            log.debug({
                title: 'End Script 0'
            });
        return SalesOrderID;
    }

    function updateAndCreateCustomerDeposit(oldSo, NewSo, AccountType) {
        var customerdepositSearchObj = search.create({
            type: "customerdeposit",
            filters:
                [
                    ["type", "anyof", "CustDep"],
                    "AND",
                    ["salesorder", "anyof",  oldSo.id]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var searchResultCount = customerdepositSearchObj.runPaged().count;
        log.debug("customerdepositSearchObj result count", searchResultCount);
        var deposit = [];
        customerdepositSearchObj.run().each(function (result) {
            deposit.push(result.getValue('internalid'));
            return true;
        });
log.debug("deposit", deposit);
        if (deposit.length == 1) {
            var copyOfCustomerDeposit = record.copy({
                type: record.Type.CUSTOMER_DEPOSIT,
                id: deposit[0],
                isDynamic: true
            });
            var origalOrderTotal = oldSo.getValue('total');
            log.debug("origalOrderTotal", origalOrderTotal);
            var OriginalCustomerDeposit = record.load({
                type: record.Type.CUSTOMER_DEPOSIT,
                id: deposit[0],
                isDynamic: true
            });
            var payment = OriginalCustomerDeposit.getValue('payment');
            log.debug("payment", payment);
            var newOrder_payment_amount = Number(payment) - Number(origalOrderTotal);
            record.submitFields({
                "type": record.Type.CUSTOMER_DEPOSIT,
                "id": deposit[0],
                "values": {
                    "payment": origalOrderTotal
                }
            });
            log.debug("NewSo", NewSo);
            copyOfCustomerDeposit.setValue('salesorder', NewSo);
            copyOfCustomerDeposit.setValue('account', AccountType);
            var payment_copyOfCustomerDeposit = copyOfCustomerDeposit.getValue('payment');
            log.debug("payment_copyOfCustomerDeposit", payment_copyOfCustomerDeposit);
            log.debug("newOrder_payment_amount", newOrder_payment_amount);
            if (payment_copyOfCustomerDeposit != newOrder_payment_amount && newOrder_payment_amount > 0) {
                copyOfCustomerDeposit.setValue('payment', newOrder_payment_amount);
            }
            var newDeposit = copyOfCustomerDeposit.save({
                enableSourcing: false,
                ignoreMandatoryFields: true
            });
            log.debug('newDeposit', newDeposit);
        }
    }
    return {
        onAction: onAction
    }
});
