/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript

    **************** 
    *CHN-482
    *Ayush Ghehalot
    ****************
 */
define(['N/record', 'N/search', 'N/runtime'], function (record, search, runtime) {
    function onAction(scriptContext) {
        log.debug({
            title: 'Start Script'
        });

        const newRecord = scriptContext.newRecord;
        const term = newRecord.getValue('terms');
        const subsidiary = newRecord.getValue('subsidiary');
        const noOfPayments = newRecord.getValue('custbody_hf_number_of_payments');
        const termHasInstallment_ = termHasInstallment(term);

        if(termHasInstallment_ == true && Number(noOfPayments) == 0){
            return 'F'
        }

        var SOTerm = reviewTerms(term, subsidiary);

        if(SOTerm){
          log.debug({
                title: 'SOTerm T ' + SOTerm
            });
            return 'T';
        } else {
          log.debug({
                title: 'SOTerm F ' + SOTerm
            });
            return 'F'
        }
    }

    function reviewTerms(term, subsidiary) {
        let termsAndDownPayment = getTermsFromRecord(term, subsidiary);
        if(termsAndDownPayment.term){
            return termsAndDownPayment.term;
        }
    }

    function getTermsFromRecord(term, subsidiary) {
        var customrecord_hf_sales_approval_term_confSearchObj = search.create({
            type: "customrecord_hf_sales_approval_term_conf",
            filters:
                [
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