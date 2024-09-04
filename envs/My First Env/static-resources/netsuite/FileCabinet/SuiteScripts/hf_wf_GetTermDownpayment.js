/*************************************************************
JIRA  ID      : 
Script Name   : HF | Get Term Down Payment
Date          : 09/18/2023
Author        : Ayush Gehalot
UpdatedBy     :
Description   : Validate Downpayment on SO
*************************************************************/

/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define(['N/record', 'N/search'], function (record, search) {
    function onAction(scriptContext) {
        log.debug({
            title: 'Start Script'
        });

        const newRecord = scriptContext.newRecord;
        const term = newRecord.getValue('terms');
        const subsidiary = newRecord.getValue('subsidiary');
        
        const DownPaymentOnSO = newRecord.getValue('custbody_hf_term_first_amt');
        const total = newRecord.getValue('total');

        var downPayment = getTermsFromRecord(term, subsidiary);
        var deposit = getDepositAmount(newRecord.id);
        if(DownPaymentOnSO != ''){
             downPayment.downpaymentAmt = DownPaymentOnSO;
        }
        if (term != '') {
            var termHasInstallment_ = termHasInstallment(term);
            if (termHasInstallment_ == true && Number(DownPaymentOnSO) == '') {
                return 'F';
            }
        }
        if(downPayment.downpaymentAmt != '' && Number(total) != 0) {
            if(downPayment.downpaymentAmt == 0 || deposit >= downPayment.downpaymentAmt){
                return 'T';
            } else {
                return 'F';
            }
        } else if (downPayment.downpaymentPercent != '' && Number(total) != 0) {
            if(downPayment.downpaymentPercent == 0){
                return 'T';
            } else {
                var downPaymentAmount = getAmountFromPercent(total, downPayment.downpaymentPercent);
                if(deposit >= downPaymentAmount){
                    return 'T';
                } else {
                    return 'F';
                }
            }

        } else if(!downPayment.term) {
            return 'F';
        } else {
            return 'T';
        }
    }

    function getAmountFromPercent(total, downpaymentPercent) {
        return ((downpaymentPercent/ 100) * total).toFixed(2)
    }

    function getTermsFromRecord(term, subsidiary) {
        var customrecord_hf_sales_approval_term_confSearchObj = search.create({
            type: "customrecord_hf_sales_approval_term_conf",
            filters:
                [
                    ["isinactive","is","F"], 
                    "AND",
                    ["custrecord_terms", "anyof", term],
                    "AND",
                    ["custrecord_subsidiary", "anyof", subsidiary]
                ],
            columns:
                [
                    search.createColumn({ name: "custrecord_terms", label: "Terms" }),
                    search.createColumn({ name: "custrecord_subsidiary", label: "Subsidiary" }),
                    search.createColumn({ name: "custrecord_auto_payment", label: "Auto Payment" }),
                    search.createColumn({ name: "custrecord_down_payment_amount", label: "Down Payment ($)" }),
                    search.createColumn({ name: "custrecord_down_payment_percent", label: "Down Payment (%)" }),
                    search.createColumn({ name: "custrecord_special_rules", label: "Special Rules" })
                ]
        });

        var searchResultCount = customrecord_hf_sales_approval_term_confSearchObj.runPaged().count;
        if (searchResultCount > 0) {
            var recId = {};
            customrecord_hf_sales_approval_term_confSearchObj.run().each(function (result) {
                recId.term = result.getValue('custrecord_terms');
                recId.downpaymentAmt = result.getValue('custrecord_down_payment_amount');
                recId.downpaymentPercent = result.getValue('custrecord_down_payment_percent');
                return false;
            });
            return recId;
        } else {
            return {};
        }
    }

    function getDepositAmount(soid) {
        var customerdepositSearchObj = search.create({
            type: "customerdeposit",
            filters:
                [
                    ["type", "anyof", "CustDep"],
                    "AND",
                    ["salesorder", "anyof", soid]
                ],
            columns:
                [
                    search.createColumn({ name: "amount", label: "Amount" }),
                    search.createColumn({ name: "fxamount", label: "Amount (Foreign Currency)" })
                ]
        });
        var searchResultCount = customerdepositSearchObj.runPaged().count;
        var amount = 0;
        log.debug("customerdepositSearchObj result count", searchResultCount);
        customerdepositSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results
            amount = result.getValue({ name: "fxamount" });
            return true;
        });
        return amount;
    }

    function termHasInstallment(term) {
        var termSearchObj = search.create({
            type: "term",
            filters:
                [
                    ["installment", "is", "T"],
                    "AND",
                    ["internalid", "anyof", term],
                    "AND",
                    ["isinactive", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "name",
                        sort: search.Sort.ASC,
                        label: "Name"
                    })
                ]
        });
        var searchResultCount = termSearchObj.runPaged().count;
        if (searchResultCount > 0) {
            return true;
        } else {
            return false;
        }
    }
  
    return {
        onAction: onAction
    }
});