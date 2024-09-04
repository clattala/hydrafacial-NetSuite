/*************************************************************
JIRA  ID      : 
Script Name   : 
Date          : 
Author        : Ayush Gehalot
UpdatedBy     : 
Description   : 
***************************************************************/

/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define([], function () {

    function onAction(scriptContext) {
        log.debug({
            title: 'Start Script'
        });
        var newRecord = scriptContext.newRecord;

        // Get the line count
        var lineCount = newRecord.getLineCount({ sublistId: 'item' });
        var outOfStockItem = 'F';
        var stockCheck = [];
        for (var i = lineCount - 1; i >= 0; i--) {
            // Check if the "Inventory" checkbox is checked for the line item
            var inventoryChecked = newRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_hf_stock_check',
                line: i
            });
            if(stockCheck.indexOf(inventoryChecked) === -1) {
                stockCheck.push(inventoryChecked);
            }
        }
        log.debug('stockCheck', stockCheck);
        if(stockCheck.length == 2){
            outOfStockItem = 'T';
        }
        // newRecord.setValue('custbody_hf_show_backorder_button_so', outOfStockItem);
        return outOfStockItem;
    }
    
    return {
        onAction: onAction
    }
});