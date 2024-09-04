/*************************************************************
JIRA  ID      : NGO - 7851 Update Customer Statement PDF Template
Script Name   : hf_mr_update_days_overdue_amount_due_overdue_invoice.js
Date          : 07/01/2023
Author        : Ayush Gehalot
UpdatedBy     : 
Description   : Calculate Days Overdue, Amount Due and Overdue on open invoice for statement pdf
***************************************************************/

/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */

define(['N/search', 'N/record'], function (search, record) {
    function getInputData() {
        return search.create({
            type: "invoice",
            filters:
                [
                    ["type", "anyof", "CustInvc"],
                    "AND",
                    ["status", "anyof", "CustInvc:A"],
                    "AND",
                    ["subsidiary", "anyof", "3"],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "tranid", label: "Document Number" })
                ]
        });

    }

    function map(context) {
        try {
            var searchResult = JSON.parse(context.value);
            log.debug('searchResult', searchResult);
            var invoice = record.load({
                type: record.Type.INVOICE,
                id: searchResult.id,
                isDynamic: true
            });
            var invoiceDueDate = invoice.getValue('duedate');
            var currentDate = new Date();
            var daysOverdue = 0;
            var AmountDue = 0;
            var AmountOverdue = 0;
            log.debug('currentDate', currentDate);
            var numInstallments = invoice.getLineCount({ sublistId: 'installment' });
            if (numInstallments == 0 && currentDate > invoiceDueDate) {
                // Calculate the days overdue if the invoice is past due date
                daysOverdue = Math.floor((currentDate - invoiceDueDate) / (1000 * 60 * 60 * 24));
                if(daysOverdue > 0){
                    AmountOverdue = invoice.getValue('amountremaining');
                }
            }else if (numInstallments == 0 && currentDate <= invoiceDueDate) {
               AmountDue = invoice.getValue('amountremaining');
            }else if (numInstallments > 0) {
                // Calculate the days overdue for each installment
                for (var i = 0; i < numInstallments; i++) {
                    var status = invoice.getSublistValue({ fieldId: 'status', sublistId: 'installment', line: i });
                    
                    log.debug('numInstallments', i);
                    if (status === 'Unpaid' || status === 'Partially Paid') {
                        var installmentDueDate = invoice.getSublistValue({ fieldId: 'duedate', sublistId: 'installment', line: i });
                        var installmentAmountDue = invoice.getSublistValue({ fieldId: 'amountdue', sublistId: 'installment', line: i });
                        log.debug('installmentDueDate', installmentDueDate);
                        if (currentDate > installmentDueDate) {
                            
                            var installmentDaysOverDue = Math.floor((currentDate - installmentDueDate) / (1000 * 60 * 60 * 24));
                            if (daysOverdue == '') {
                                daysOverdue = installmentDaysOverDue;
                            }

                            if(installmentDaysOverDue > 0){
                                AmountOverdue = AmountOverdue + installmentAmountDue;
                            }
                        } else {
                          AmountDue = AmountDue+installmentAmountDue;
                        }
                    }
                }
            }
          try {
            record.submitFields({
                "type": record.Type.INVOICE,
                "id": searchResult.id,
                "values": {
                    "custbody_hf_no_of_days_overdue": daysOverdue,
                    "custbody_hf_amount_overdue": AmountOverdue,
                    "custbody_amount_due": AmountDue
                }
            });
          } catch (error) {
            log.debug('Catch searchResult.id', searchResult.id);
          }
        } catch (ex) {
            log.error('exception in map', ex);
        }
    }

    // function reduce(context) {

    //     // Assuming 'invoice' is the reference to the invoice record

    //     context.write({
    //         key: context.key,
    //         value: context.values.length
    //     });
    // }

    function summarize(context) {
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

    // Link each entry point to the appropriate function.
    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
});