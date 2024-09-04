/*************************************************************
JIRA  ID      : NGO-6269
Script Name   : HF | Validate Estimate Unit Cost
Date          : 03/03/2023
Author        : Ayush Gehalot
UpdatedBy     :
Description   : Validate Estimate Unit Cost for 0 value and throw the error.
*************************************************************/

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/error'], function (record, error) {

    function beforeSubmit(context) {
        if (context.type === context.UserEventType.CREATE || context.type === context.UserEventType.EDIT) {
            var inventoryAdjustment = context.newRecord;

            // Retrieve the unit cost from the inventory sublist
            //var inventorySublist = inventoryAdjustment.getSublist('inventory');
            //var numLines = inventorySublist.lineCount;
          	var numLines = inventoryAdjustment.getLineCount({
                sublistId: "inventory"
            });
			log.debug('numLines', numLines);
            for (var i = 0; i < numLines; i++) {
                var unitCost = inventoryAdjustment.getSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'unitcost',
                    line: i
                });
				log.debug('unitCost', unitCost);
                // Validate the estimate unit cost
                if (unitCost === 0) {
                    throw error.create({
                        name: 'INVALID_ESTIMATED_UNIT_COST',
                        message: 'The estimated unit cost on line ' + (i + 1) + ' is zero. Please enter a valid estimated unit cost.',
                        notifyOff: true
                    });
                }
            }
        }
    }

    return {
        beforeSubmit: beforeSubmit
    };

});  