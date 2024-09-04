/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/record', 'N/search', 'N/format'], function (record, search, format) {

    function beforeSubmit(context) {
        var invRecord = context.newRecord;
        var invTerms = invRecord.getValue({
            fieldId: 'terms'
        });

        if (invTerms == 18 || invTerms == 14 || invTerms == 20 || invTerms == 21) {
            var soID = invRecord.getValue({
                fieldId: 'createdfrom'
            });
            var depositAmt = 0.00; var depositDate;
            var customerdepositSearchObj = search.create({
                type: "customerdeposit",
                filters:
                    [
                        ["type", "anyof", "CustDep"],
                        "AND",
                        ["salesorder", "anyof", soID]
                    ],
                columns:
                    [
                        search.createColumn({ name: "amount", label: "Amount" }),
                        search.createColumn({ name: "trandate", label: "Date" })
                    ]
            });
            var searchResultCount = customerdepositSearchObj.runPaged().count;
            log.debug("customerdepositSearchObj result count", searchResultCount);
            customerdepositSearchObj.run().each(function (result) {
                depositAmt = result.getValue({ name: "amount" });
                depositDate = result.getValue({ name: "trandate" });
                return true;
            });

            var formattedDepDt = format.parse({
                value: depositDate,
                type: format.Type.DATE
            });
            log.debug('Deposit AMounts: ', depositAmt + ' DepDate: ' + depositDate + 'Formatted Date: ' + formattedDepDt);

            invRecord.setValue({
                fieldId: "overrideinstallments",
                value: true
            });
            if (invTerms == 18 && depositAmt >= 7500) { // 12-month Financing
                var installCount = invRecord.getLineCount({
                    sublistId: "installment"
                });
                var soLookup = search.lookupFields({
                    type: search.Type.SALES_ORDER,
                    id: soID,
                    columns: ['trandate', 'total']
                });
                log.debug('Sales Order Lookup: ', soLookup);
                var soDate = soLookup.trandate;
                var formattedSoDt = format.parse({
                    value: soDate,
                    type: format.Type.DATE
                });

                var soTotal = soLookup.total;
                log.debug('Sales Order Lookup Values: ', soDate + ' Amount: ' + soTotal);
                var remainingAmt = (Number(soTotal) - Number(depositAmt)).toFixed(2);
                var eachInstallment = (Number(remainingAmt) / 11).toFixed(2);
                var balAmt = (Number(remainingAmt) - Number(eachInstallment) * 11).toFixed(2);
                var lastInstallAmt = (Number(eachInstallment) + Number(balAmt)).toFixed(2);
                log.debug(' Amounts are, Remaining: ', remainingAmt + 'Each install: ' + eachInstallment + 'Bal Amt: ' + balAmt)



                for (var i = 0; i < installCount; i++) {
                    if (i == 0) {
                        
                        invRecord.setSublistValue({
                            sublistId: "installment",
                            fieldId: "duedate",
                            line: i,
                            value: formattedDepDt,
                            ignoreFieldChange: true
                        });
                        invRecord.setSublistValue({
                            sublistId: "installment",
                            fieldId: "amount",
                            line: i,
                            value: depositAmt,
                            ignoreFieldChange: true
                        });
                    } else {
                        log.debug('datestring: ', soDate.split('/'));
                        var sosplit = soDate.split('/');
                        var instadate = (Number(sosplit[0]) + 2) + '/' + sosplit[1] + '/' + sosplit[2];
                        var formattedinvDt = format.parse({
                           value: instadate,
                           type: format.Type.DATE
                       });
                        log.debug('formattedIndtallDueDts: ', formattedinvDt);
                        
                        invRecord.setSublistValue({
                            sublistId: "installment",
                            fieldId: "duedate",
                            line: i,
                            value: formattedinvDt,
                            ignoreFieldChange: true
                        });
                        
                        if (i == Number(installCount)-1) {
                            invRecord.setSublistValue({
                                sublistId: "installment",
                                fieldId: "amount",
                                line: i,
                                value: lastInstallAmt,
                                ignoreFieldChange: true
                            });
                        } else {
                            invRecord.setSublistValue({
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

    return {
        beforeSubmit: beforeSubmit
    }
});