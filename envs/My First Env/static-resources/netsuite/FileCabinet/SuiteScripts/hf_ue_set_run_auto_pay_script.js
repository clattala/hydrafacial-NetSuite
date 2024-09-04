/*************************************************************
JIRA  ID      : 
Script Name   : HF | US | Set Run Auto Payment Script
Date          : 09/06/2022
Author        : Ayush Gehalot
UpdatedBy     :
Description   : Set Run AUto Payment Script to Yes
*************************************************************/
/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/record'], function(record) {
    function beforeLoad(context) {
        if (context.type !== context.UserEventType.CREATE)
                return;
        
        var customerRecord = context.newRecord;
        customerRecord.setValue('custbody_hf_run_auto_payment_script', '1');
    }
    return {
        beforeLoad: beforeLoad
    };
});