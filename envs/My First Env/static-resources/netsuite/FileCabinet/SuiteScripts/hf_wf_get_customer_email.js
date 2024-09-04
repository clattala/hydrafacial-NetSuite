/*************************************************************
Fresh Service ID: 
Script Name   : HF | US | Get Customer Email
Applies To    : Item Fulfillment
Date          : 11/22/2023
Author        : Ayush Gehalot
UpdatedBy     :
Description   : If customer dont have email return false
***************************************************************/

/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/search'], function (search) {
    function onAction(scriptContext) {
        log.debug({
            title: 'Start Script'
        });
        var newRecord = scriptContext.newRecord;

        var entity = newRecord.getValue('entity');

        var customerSearchObj = search.create({
            type: "customer",
            filters:
                [
                    ["internalid", "anyof", entity],
                    "AND",
                    ["email", "isnotempty", ""]
                ],
            columns:
                [
                    search.createColumn({ name: "email", label: "Email" })
                ]
        });

        if (customerSearchObj.runPaged().count > 0) {
            return 'TRUE';
        } else {
            return 'FALSE';
        }
    }
    return {
        onAction: onAction
    }
});
