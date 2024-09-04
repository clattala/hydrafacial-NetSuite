/*************************************************************
Fresh Service ID: 
Script Name   : 
Applies To    : 
Date          : 
Author        : 
UpdatedBy     :
Description   : 
***************************************************************/
/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/record'], function(record) {
    function beforeLoad(context) {
        // if (context.type !== context.UserEventType.CREATE)
        //     return;
        var customerRecord = context.newRecord;
        log.error("beforeLoad customerRecord.getValue('paymentmethod')", customerRecord.getValue('paymentmethod'));
        log.error("beforeLoad customerRecord.getValue('paymentoption')", customerRecord.getValue('paymentoption'));
        log.error("beforeLoad customerRecord.getValue('terms')", customerRecord.getValue('terms'));
        if (customerRecord.getValue('terms') != '' && (customerRecord.getValue('paymentmethod') != '' || customerRecord.getValue('paymentoption') != '')){
            customerRecord.setValue('paymentoption', '');
            customerRecord.setValue('paymentmethod', '');
        }
    }
    function beforeSubmit(context) {
        // if (context.type !== context.UserEventType.CREATE)
        //     return;
        var customerRecord = context.newRecord;
        log.debug("beforeSubmit customerRecord.getValue('paymentmethod')", customerRecord.getValue('paymentmethod'));
        log.debug("beforeSubmit customerRecord.getValue('paymentoption')", customerRecord.getValue('paymentoption'));
        log.debug("beforeSubmit customerRecord.getValue('terms')", customerRecord.getValue('terms'));
        if (customerRecord.getValue('terms') != '' && (customerRecord.getValue('paymentmethod') != '' || customerRecord.getValue('paymentoption') != '')){
            customerRecord.setValue('paymentoption', '');
            customerRecord.setValue('paymentmethod', '');
        }
    }
    function afterSubmit(context) {
        // if (context.type !== context.UserEventType.CREATE)
        //     return;
        var customerRecord = context.newRecord;
        log.error("afterSubmit customerRecord.getValue('paymentmethod')", customerRecord.getValue('paymentmethod'));
        log.error("afterSubmit customerRecord.getValue('paymentoption')", customerRecord.getValue('paymentoption'));
        log.error("afterSubmit customerRecord.getValue('terms')", customerRecord.getValue('terms'));
        // if (customerRecord.getValue('terms') != '' && (customerRecord.getValue('paymentmethod') != '' || customerRecord.getValue('paymentoption') != '')){
        //     record.submitFields({
        //         "type": customerRecord.type,
        //         "id": customerRecord.id,
        //         "values": {
        //             "paymentoption": '',
        //             "paymentmethod": ''
        //         }
        //     });
        // }
    }
    return {
        //beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        //afterSubmit: afterSubmit
    };
});