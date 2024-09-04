/*************************************************************
FS ID       : 
Script Name : HF | US | Validate Items On Credit Memo
Date        : 11/11/2023
Author      : Ayush Gehalot
UpdatedBy   :
Description : If CM cntains only excudable items then auto approve else should flow through approval.
*************************************************************/
/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
 define(['N/record', 'N/runtime', 'N/search'], function (record, runtime, search) {
    function onAction(scriptContext) {
        log.debug({
            title: 'Start Script'
        });
        var user = runtime.getCurrentUser();
        var itemsToExclude = [];
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["type", "anyof", "Assembly", "Description", "Discount", "GiftCert", "InvtPart", "Group", "Kit", "Markup", "NonInvtPart", "OthCharge", "Payment", "Service", "Subtotal"],
                    "AND",
                    ["isinactive", "is", "F"],
                    "AND",
                    ["custitem_skip_for_cm_approval_flow", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "custitem_skip_for_cm_approval_flow", label: " SKIP ITEM FOR CREDIT MEMO APPROVAL FLOW" }),
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        itemSearchObj.run().each(function (result) {
            itemsToExclude.push(result.getValue('internalid'));
            return true;
        });
        log.debug('itemsToExclude', itemsToExclude);
        var newRecord = scriptContext.newRecord;
        var total = newRecord.getValue('total');
        var itemLine = newRecord.getLineCount({ sublistId: 'item' });
        var items = [];
        for (var i = 0; i < itemLine; i++) {
            newRecord.selectLine({ sublistId: 'item', line: i });
            var itemId = newRecord.getCurrentSublistValue({ fieldId: 'item', sublistId: 'item' });
            if(itemsToExclude.indexOf(itemId) == -1){
                items.push(itemId);
            }
            log.debug('line item:', itemId);
        }
        if(user.id != null && user.id != ''){
           newRecord.setValue('custbody_hf_credit_memo_created_by', user.id);
        }
        if(items.length>0 || total > 25000){
            return 'FALSE';
        }else{
            return 'TRUE';
        }
    }

    return {
        onAction: onAction
    }
});