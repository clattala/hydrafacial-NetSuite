/*************************************************************
JIRA  ID      : 
Script Name   : HF | WF | Cancel Recurring Journal
Date          : 05/27/2023
Author        : Ayush Gehalot
UpdatedBy     :
Description   : Cancel Recurring Journal
*************************************************************/

/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/runtime', 'N/record'], function (runtime, record) {
    function onAction(scriptContext) {
        log.debug({
            title: 'Start Script'
        });
        var newRecord = scriptContext.newRecord;
        var user = runtime.getCurrentUser();
        record.submitFields({
            "type": record.Type.JOURNAL_ENTRY,
            "id": newRecord.id,
            "values": {
                "custbody_hf_je_number_remaining": 0,
                "custbody_hf_recurring_cancel_comment": 'Recurring journal cancelled By ' + user.name + ' On ' + new Date(),
                "custbody_hf_approve_cancel": user.id
            }
        });
    }
    return {
        onAction: onAction
    }
});