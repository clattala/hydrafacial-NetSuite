/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript

     ********************
     * CHN-482
     * Ayush Ghehalot
     ********************
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
        var downPayment = getTermsFromRecord(term, subsidiary);
        var termHasInstallment_ = false;
        if (term != '') {
            termHasInstallment_ = termHasInstallment(term);
        }
        if(DownPaymentOnSO != ''){
            downPayment.downpaymentAmt = DownPaymentOnSO;
        }
        if(!downPayment.term) {
            return 'F';
        } else if((downPayment.downpaymentAmt != '' && Number(downPayment.downpaymentAmt) != 0) || (downPayment.downpaymentPercent != '' && Number(downPayment.downpaymentPercent) != 0)) {
            return 'T';
        } else if (termHasInstallment_) {
            return 'T';
        } else {
            return 'F';
        }
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