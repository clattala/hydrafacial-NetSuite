/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/format'], function(record, search, format) {

    var allowedSubsidaries = ['3', '11']

    function afterSubmit(context) {
        if (context.type != 'delete') {
            try {
                var transactionRecord = context.newRecord;
                var subsidiary = transactionRecord.getValue('subsidiary')
                var tranType = transactionRecord.type

                log.debug('subsidiary', subsidiary)
                log.debug('tranType', tranType)
                var allowedSubsidiaryIndex = allowedSubsidaries.indexOf(subsidiary)
               log.debug('allowedSubsidiaryIndex', allowedSubsidiaryIndex) 
              
                if (allowedSubsidiaryIndex== -1) {
                    return;
                }

                //log.debug('transactionRecord', transactionRecord)
                var invTerms = transactionRecord.getValue({
                    fieldId: 'terms'
                });
              log.debug('temrs' , invTerms)
                //adding
                var createdFrom = transactionRecord.getValue({
                    fieldId: 'createdfrom'
                })
                if (createdFrom || tranType == 'salesorder' || tranType == 'estimate') {

                    transactionRecord = record.load({
                        type: tranType,
                        id: transactionRecord.id
                    })
                    var soID = transactionRecord.getValue({
                        fieldId: 'createdfrom'
                    })

                    var installCount = transactionRecord.getLineCount({
                        sublistId: 'installment'
                    });
                    var firstAmount = transactionRecord.getValue('custbody_hf_term_first_amt')
                    var soTotal = transactionRecord.getValue('total');
                    log.debug('Sales Order Lookup Values: ', ' Amount: ' + soTotal);

                    var firstAmount = transactionRecord.getValue('custbody_hf_term_first_amt')
                    //log.debug('firstAmount', firstAmount);
                    var numberOfPayments = transactionRecord.getValue('custbody_hf_number_of_payments');
                    log.debug('numberOfPayments', numberOfPayments);
                    if (numberOfPayments && (tranType == 'salesorder' || tranType == 'estimate')) {
                        var termsOnSalesOrder = transactionRecord.getValue('terms')
                        log.debug('termsOnSalesOrder', termsOnSalesOrder)
                        //if(!termsOnSalesOrder){
                        var termField = getTerms(numberOfPayments, subsidiary)
                        log.debug('termField', termField)
                        if (termField > 0) {
                            transactionRecord.setValue('terms', termField);
                            transactionRecord.save();
                            log.debug('saved');
                        }
                        //}
                    }
                    log.audit('54 ', firstAmount)
                    if (firstAmount == 0 && tranType == 'invoice') {
                        var existingInvoice = alreadyInvoicePresent(transactionRecord.id, createdFrom)

                        log.debug('existingInvoice in 297 ', existingInvoice)
                        if (existingInvoice) {
                            var firstInvoiceRecord = record.load({
                                type: 'invoice',
                                id: existingInvoice
                            })
                            var firstInvoiceInstallmentCount = firstInvoiceRecord.getLineCount({
                                sublistId: 'installment'
                            });
                            if (firstInvoiceInstallmentCount > 0) {
                                var firstInvoiceSecondDueDate = firstInvoiceRecord.getSublistValue({
                                    sublistId: "installment",
                                    fieldId: "duedate",
                                    line: 1
                                });
                                //Setting the 2nd Installment date of the first invoice on which the down payment is applied as the first installment of this invoice
                                for (var i = 0; i < installCount; i++) {
                                    //log.debug('firstInvoiceSecondDueDate', firstInvoiceSecondDueDate);
                                    if (i != 0) {
                                        firstInvoiceSecondDueDate = getNextMonth(firstInvoiceSecondDueDate, 1)
                                    }
                                    var formattedDate = format.format({
                                        value: firstInvoiceSecondDueDate,
                                        type: format.Type.DATE
                                    })
                                    // log.debug('firstInvoiceSecondDudeDate' , firstInvoiceSecondDueDate)

                                    transactionRecord.setSublistValue({
                                        sublistId: "installment",
                                        fieldId: "duedate",
                                        line: i,
                                        value: new Date(formattedDate),
                                        ignoreFieldChange: true
                                    });

                                }

                            }
                        }
                        var id = transactionRecord.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });
                        log.debug('id saved' + id)
                    }
                }

            } catch (error) {
                log.debug('error in aftersubmit ' + error.message, error)
            }


        }
    }

    function getFirstAmount(transactionId) {
        var lookupObj = search.lookupFields({
            type: 'transaction',
            id: transactionId,
            columns: ['custbody_hf_term_first_amt']
        });
        if (lookupObj.custbody_hf_term_first_amt) {
            return lookupObj.custbody_hf_term_first_amt
        } else {
            return;
        }
    }


    function getTerms(numberOfPayments, subsidiary) {
        var customrecord_hf_sales_approval_term_confSearchObj = search.create({
            type: "customrecord_hf_sales_approval_term_conf",
            filters: [
                ["isinactive", "is", "F"],
                "AND",
                ["custrecord_hf_number_of_payments", "equalto", numberOfPayments],
                "AND",
                ["custrecord_subsidiary", "anyof", subsidiary]
            ],
            columns: [
                search.createColumn({
                    name: "custrecord_terms",
                    label: "Terms"
                }),

            ]
        });
        var searchResult = customrecord_hf_sales_approval_term_confSearchObj.run().getRange({
            start: 0,
            end: 1
        });
        log.debug('searchResult', searchResult)
        if (searchResult.length > 0) {
            var recId = searchResult[0].getValue('custrecord_terms')
            return recId
        } else {
            return 0;
        }
    }

    function beforeSubmit(context) {
        try {
            if (context.type != 'delete') {
                var transactionRecord = context.newRecord;
                var subsidiary = transactionRecord.getValue('subsidiary')
                if (allowedSubsidaries.indexOf(subsidiary) == -1) {
                    return;
                }
                if (transactionRecord.type == 'invoice') {
                    var createdFrom = transactionRecord.getValue('createdfrom');
                    log.debug('createdFrom', createdFrom)
                    var depositTransaction = transactionRecord.getValue('custbody_hf_so_deposit');
                    log.debug('depositTransaction', depositTransaction)
                    var invoiceId = transactionRecord.id;
                    if (createdFrom) {
                        var existingInvoice = alreadyInvoicePresent(invoiceId, createdFrom)
                        log.debug('existingInvoice', existingInvoice);
                        if (!depositTransaction && createdFrom && existingInvoice > 0) {
                            var depositId = getDeposit(createdFrom)
                            if (depositId > 0) {
                                transactionRecord.setValue('custbody_hf_so_deposit', depositId)
                                transactionRecord.setValue('custbody_hf_term_first_amt', 0);
                            }
                        }
                        var installCount = transactionRecord.getLineCount({
                            sublistId: 'installment'
                        });

                        var firstAmount = transactionRecord.getValue('custbody_hf_term_first_amt')
                        var soTotal = transactionRecord.getValue('total');

                        transactionRecord.setValue({
                            fieldId: "overrideinstallments",
                            value: true
                        });
                        if (firstAmount > 0) { //Setting the Down payment as the first installment and remaining installments as equal parts
                            log.debug('firstAmoujt', firstAmount)
                            var remainingInstallmentAmount = soTotal - firstAmount;
                            log.debug('remainingInstallmentAmount', remainingInstallmentAmount)
                            var otherLineCount = installCount - 1;
                            log.debug('otherLineCount ' + otherLineCount, 'installCount ' + installCount)
                            var eachInstallment = (remainingInstallmentAmount / otherLineCount).toFixed(2)
                            var lastAmount = eachInstallment
                            var installmentMultiplied = (eachInstallment * otherLineCount).toFixed(2)
                            if (remainingInstallmentAmount != installmentMultiplied) {
                                lastAmount = (remainingInstallmentAmount - (installmentMultiplied - eachInstallment)).toFixed(2)
                            }
                            for (var i = 0; i < installCount; i++) {
                                if (i == 0) {
                                    transactionRecord.setSublistValue({
                                        sublistId: "installment",
                                        fieldId: "amount",
                                        line: i,
                                        value: firstAmount,
                                        ignoreFieldChange: true
                                    });
                                } else if (i == installCount - 1) {
                                    transactionRecord.setSublistValue({
                                        sublistId: "installment",
                                        fieldId: "amount",
                                        line: i,
                                        value: lastAmount,
                                        ignoreFieldChange: true
                                    });
                                } else {
                                    transactionRecord.setSublistValue({
                                        sublistId: "installment",
                                        fieldId: "amount",
                                        line: i,
                                        value: eachInstallment,
                                        ignoreFieldChange: true
                                    });
                                }
                            }
                        }
                    }
                }

            }
        } catch (error) {
            log.debug('Error in beforeSubmit' + error.message, error)
            //throw error;
        }
    }


    function getNextMonth(nextDate) {
        nextDate.setMonth(nextDate.getMonth() + 1);
        return nextDate

    }

    function getDeposit(soid) {
        var customerdepositSearchObj = search.create({
            type: "customerdeposit",
            filters: [
                ["type", "anyof", "CustDep"],
                "AND",
                ["salesorder", "anyof", soid]
            ],
            columns: [
                search.createColumn({
                    name: "amount",
                    label: "Amount"
                }),
                search.createColumn({
                    name: "internalid",
                    label: "internalid"
                })
            ]
        });
        var searchResultCount = customerdepositSearchObj.runPaged().count;
        var depositInternalId = 0;
        log.debug("customerdepositSearchObj result count", searchResultCount);
        customerdepositSearchObj.run().each(function(result) {
            // .run().each has a limit of 4,000 results
            depositInternalId = result.getValue({
                name: "internalid"
            });
            return true;
        });
        return depositInternalId;
    }

    function alreadyInvoicePresent(internalId, salesOrderId) {
        var searchFilters =
            internalId > 0 ? [
                ["type", "anyof", "CustInvc"],
                "AND",
                ["createdfrom", "anyof", salesOrderId],
                "AND",
                ["mainline", "is", "T"],
                "AND",
                ["internalidnumber", "notequalto", internalId]
            ] : [
                ["type", "anyof", "CustInvc"],
                "AND",
                ["createdfrom", "anyof", salesOrderId],
                "AND",
                ["mainline", "is", "T"],

            ]
        log.debug('searchFilters', searchFilters)
        var invoiceSearchObj = search.create({
            type: "invoice",
            filters: searchFilters,
            columns: [
                search.createColumn({
                    name: "internalid",
                    label: "internalid"
                })
            ]
        });
        var searchResultCount = invoiceSearchObj.runPaged().count;
        //log.debug("invoiceSearchObj result count", searchResultCount);
        var existingInvoiceId = 0
        invoiceSearchObj.run().each(function(result) {
            // .run().each has a limit of 4,000 results
            existingInvoiceId = result.getValue('internalid');
            return true;
        });
        return existingInvoiceId;
    }

    function beforeLoad(context) {
        try {
            if (context.type == 'create') {

                var transactionRecord = context.newRecord
                if (transactionRecord.type != 'invoice') {
                    return;
                }
                var subsidiary = transactionRecord.getValue('subsidiary')
                if (allowedSubsidaries.indexOf(subsidiary) == -1) {
                    return;
                }
                var internalId = transactionRecord.id;
                var createdFrom = transactionRecord.getValue('createdfrom')
                log.debug('createdFrom', createdFrom)
                if (createdFrom) {
                    var isPresent = alreadyInvoicePresent(internalId, createdFrom)
                    //That means that already 1 invoice is there and down payment is applied in installment , so we make this downpayment as zero
                    if (isPresent > 0) {
                        transactionRecord.setValue('custbody_hf_term_first_amt', 0)
                    }
                }
            }
        } catch (error) {
            log.debug('error in before Load ' + error.message, error)
        }

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});