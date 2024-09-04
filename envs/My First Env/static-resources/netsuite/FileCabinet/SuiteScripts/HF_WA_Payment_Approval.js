/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/search', 'N/email', 'N/url', 'N/record', 'N/runtime'], function(search, email, url, record, runtime) {
    function onAction(context) {
        log.debug({
            title: 'Start Script'
        });

        try {
            var billPaymentRecord = context.newRecord;

            var referenceId = billPaymentRecord.getValue('custbody_jpmc_bill_id');
            log.debug('referenceId', referenceId)
            log.debug('billPaymentRecord', billPaymentRecord)
            var newBillPaymentRecord = record.load({
                type: billPaymentRecord.type,
                id: billPaymentRecord.id
            });
            log.debug('billPaymentRecord.type ' + billPaymentRecord.type, billPaymentRecord.id)
            var s = newBillPaymentRecord.getValue('custbody_jpmc_bill_id');
            var lineCount = newBillPaymentRecord.getLineCount({
                sublistId: 'apply'
            })
            log.debug('s', s);
            log.debug('lineCount', lineCount)
            for (var i = 0; i < lineCount; i++) {
                var apply = newBillPaymentRecord.getSublistValue({
                    sublistId: 'apply',
                    fieldId: 'apply',
                    line: i
                })
                log.debug('apply', apply)
                var createdFromBill = newBillPaymentRecord.getSublistValue({
                    sublistId: 'apply',
                    fieldId: 'internalid',
                    line: i
                });

                log.debug('createdFromBill', createdFromBill)
                if (apply == true) {
                    log.audit('bill payment is created from ' + createdFromBill)
                    var type = newBillPaymentRecord.getSublistValue({
                        sublistId: 'apply',
                        fieldId: 'type',
                        line: i
                    });
                    log.debug('type', type)

                    if (type == 'Bill' || type == 'bill') {
                        var transactionLookup = search.lookupFields({
                            type: 'transaction',
                            id: createdFromBill,
                            columns: ['type', 'internalid', 'custbody_jpmc_bill_id']
                        });
                        log.debug('transactionLookup', transactionLookup)
                        var transactionType = transactionLookup.type[0].text
                        log.debug('transactionType', transactionType)
                        var billReferenceId = transactionLookup.custbody_jpmc_bill_id
                        log.debug('billReferenceId', billReferenceId)
                       

                        if (transactionType == 'Bill') {
                            log.debug('69 tran type is bill')
                            if (billReferenceId) {
                                log.debug('bill reference id is there so approving')
                                newBillPaymentRecord.setValue('approvalstatus', 2)
                                newBillPaymentRecord.save();
                                return
                            }
                        }
                        /*
                  if(paymentReferenceBill){
                    log.debug('45 ' , paymentReferenceBill)
                    return;
                  }*/

                    }
                }
            }
        } catch (e) {
            log.debug('error', e.message);
        }


    }


    return {
        onAction: onAction
    }
});