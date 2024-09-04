/*************************************************************
JIRA  ID      : NGO-3374
Script Name   : HF | UE | Set Order Priority
Date          : 09/06/2022
Author        : Ayush Gehalot
UpdatedBy     :
Description   : Set Order Priority to 1 when order type is RMA
*************************************************************/

/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/runtime'],
    function (runtime) {
        function beforeSubmit(context) {
          	log.debug('context',context.type);
            if (context.type === context.UserEventType.EDIT || context.type === context.UserEventType.CREATE) {
                var recObj = context.newRecord;
                var myScript = runtime.getCurrentScript();
                var orderTypeToCompare = myScript.getParameter({
                    name: 'custscript_order_type'
                });
              	log.debug('orderTypeToCompare',orderTypeToCompare);
                var orderType = recObj.getValue({
                    fieldId: "custbody_hf_order_type"
                });
              	log.debug('orderType',orderType);
                if(orderType == orderTypeToCompare){
                    recObj.setValue('custbody_hf_order_priority', '1');
                 }else{
                    recObj.setValue('custbody_hf_order_priority', '');
                 }
            }
            return;
        }
        return {
            beforeSubmit: beforeSubmit
        }
    }
);