/*************************************************************
JIRA  ID      : 
Script Name   : HF | WA | Number of Payment downpayment
Date          : 08/28/2024
Author        : Pavan Kaleru
UpdatedBy     :
Description   : Validate No of Payments and downpayment fields on SO
*************************************************************/

/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define(['N/record', 'N/search' , 'N/runtime'], function (record, search, runtime) {
    function onAction(scriptContext) {
        log.debug({
            title: 'Start Script'
        });

        const newRecord = scriptContext.newRecord;
        const term = newRecord.getValue('terms');
        const subsidiary = newRecord.getValue('subsidiary');
        const DownPaymentOnSO = newRecord.getValue('custbody_hf_term_first_amt');
        const total = newRecord.getValue('total');
		const noOfPayments = newRecord.getValue('custbody_hf_number_of_payments');
        const scriptObj = runtime.getCurrentScript()
        const fieldTobeChecked = scriptObj.getParameter({
                name: 'custscript_hf_field_to_check_validation'
            });
        log.debug('fieldTobeChecked ' , fieldTobeChecked)
      
              
        if (term != '') {
            let installmentTerm = termHasInstallment(term);
            if (installmentTerm == true && Number(noOfPayments) == '' && fieldTobeChecked == 'numberofpayments') {
                log.debug('36 fieldTobeChecked '  , fieldTobeChecked)
                return 'FAILED';
            }else if (installmentTerm == true && Number(DownPaymentOnSO) == '' && fieldTobeChecked == 'downpayment') {
                log.debug('39 fieldTobeChecked '  , fieldTobeChecked)
                return 'FAILED'
            }
         log.debug('fieldTobeChecked and returning passed')
          return 'PASSED'
       }
       return 'FAILED'
        
    }


 

    function getAmountFromPercent(total, downpaymentPercent) {
        return ((downpaymentPercent/ 100) * total).toFixed(2)
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