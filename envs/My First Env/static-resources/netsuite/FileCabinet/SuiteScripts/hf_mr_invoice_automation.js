/*************************************************************
JIRA  ID      :
Script Name   : HF_mr_invoice_automation.js
Date          : 08/03/2022
Author        : Ayush Gehalot
Description   : Create invoices from item fulfillment record
*************************************************************/

/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */

 define(['N/record','N/search'], function (record,search) {
    function getInputData() {
        return search.load({ id: 'customsearch_hf_auto_invoice' });
    }

    function map(context) {
        var Elog = {};
        log.debug('context', context.value);
        var rowJson = JSON.parse(context.value);

        var recordType = rowJson.recordType;
        var recordId = rowJson.id;
        var salesOrderId = rowJson.values['createdfrom'].value;
		var terms = rowJson.values['terms.createdFrom'].value;
        var paymentMethod = rowJson.values['paymentmethod.createdFrom'].value;
        Elog.recordId = recordId;
        Elog.salesOrderId = salesOrderId;
        try {
            var recordObj = record.load({
                type: recordType,
                id: recordId
            });

            if (salesOrderId) {
                var invRecObj = record.transform({
                    fromType: record.Type.SALES_ORDER,
                    fromId: salesOrderId,
                    toType: (rowJson.values['terms.createdFrom'] == '' ? record.Type.CASH_SALE : record.Type.INVOICE),
                    isDynamic: true
                });
                try {
                    // Submit Invoice record
                    var invId = invRecObj.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                    log.debug("invId : ", invId);
                    if (invId) {
                        recordObj.setValue({
                            fieldId: 'custbody_hf_auto_invoice',
                            value: true
                        });
                    }
                } catch (e) {
                    log.error({
                        title: e.name,
                        details: e.message
                    });
                    Elog.err = {
                        'title': e.name,
                        'details': e.message
                    };
                    storeError(Elog);
                }
            }
            try {
                // Submit Item Fulfillment record
                var itemFulfillmentId = recordObj.save();
                log.debug("itemFulfillmentId : ", itemFulfillmentId);
            } catch (e) {
                log.error({
                    title: e.name,
                    details: e.message
                });
                Elog.err = {
                    'title': e.name,
                    'details': e.message
                };
                storeError(Elog);
            }

        } catch (e) {
            log.error({
                title: e.name,
                details: e
            });
            Elog.err = {
                'title': e.name,
                'details': e.message
            };
            storeError(Elog);
        }
    }

   function storeError(data) {
        var itemfulfillmentSearchObj = search.create({
            type: "customrecord_hf_failed_auto_inv_generate",
            filters:
                [
                    ["custrecord_hf_fulfillment", "is", data.recordId],
                    "AND",
                    ["custrecord_hf_sales_order", "is", data.salesOrderId]
                ],
            columns:
                [
                    search.createColumn({
                        name: "internalid",
                        sort: search.Sort.DESC,
                        label: "Internal ID"
                    })
                ]
        });
        var recordId;
        var resultset = itemfulfillmentSearchObj.run();
        var results = resultset.getRange(0, 1);
        for (var i in results) {
            var result = results[i];
            recordId = result.getValue('internalid');
        }
        log.error({
            'title': 'data',
            'details': data
        });
        var failedInvoiceGenrationRecord;
        if (recordId) {
            failedInvoiceGenrationRecord = record.load({
                type: 'customrecord_hf_failed_auto_inv_generate',
                id: recordId
            });
            log.error({
                'title': 'load',
                'details': recordId
            });
        } else {
            failedInvoiceGenrationRecord = record.create({
                type: 'customrecord_hf_failed_auto_inv_generate',
                isDynamic: true
            });
            log.error({
                'title': 'create',
                'details': data.recordId
            });
            failedInvoiceGenrationRecord.setValue('custrecord_hf_fulfillment', data.recordId);
            failedInvoiceGenrationRecord.setValue('custrecord_hf_sales_order', data.salesOrderId);
        }
        failedInvoiceGenrationRecord.setValue('custrecord_hf_error_log', JSON.stringify(data.err));

        failedInvoiceGenrationRecord.save();
    }

    function summarize(context) {
        // Log details about the script's execution.
        log.audit({
            title: 'Usage units consumed',
            details: context.usage
        });
        log.audit({
            title: 'Concurrency',
            details: context.concurrency
        });
        log.audit({
            title: 'Number of yields',
            details: context.yields
        });
    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
});