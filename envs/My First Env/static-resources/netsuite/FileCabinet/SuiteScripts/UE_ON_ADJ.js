/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * 
 * Version      Date            Author          Remarks
 */
define(['N/runtime','N/record', 'N/search'],

function(runtime, record, search) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
        var obj = scriptContext.newRecord;
        var form = scriptContext.form;
        if('copy' == scriptContext.type) {
            var params = scriptContext.request.parameters;
            var tarId = params.id;
            var tarRec = record.load({ type: 'customrecord_hpf_china_adjust_journal', id: tarId, isDynamic: false,});
            var lineId = 'recmachcustrecord_hpf_china_journal_head';
            var count = tarRec.getLineCount({  sublistId: lineId});
            for(var i = 0;i < count;i++){
              var account = tarRec.getSublistValue({sublistId: lineId,fieldId: 'custrecord_hpf_line_account', line: i});
              log.debug('account',account)
              var debit = tarRec.getSublistValue({sublistId: lineId,fieldId: 'custrecord_hpf_line_debit', line: i});
              var credit = tarRec.getSublistValue({sublistId: lineId,fieldId: 'custrecord_hpf_line_credit', line: i});
              var department = tarRec.getSublistValue({sublistId: lineId,fieldId: 'custrecord_hpf_line_department', line: i});
              var grossamt = tarRec.getSublistValue({sublistId: lineId,fieldId: 'custrecord_hpf_line_grossamount', line: i});
              var entity = tarRec.getSublistValue({sublistId: lineId,fieldId: 'custrecord_hpf_entity', line: i});
              var memo = tarRec.getSublistValue({sublistId: lineId,fieldId: 'custrecord_hpf_line_memo', line: i});
              var period = tarRec.getSublistValue({sublistId: lineId,fieldId: 'custrecord_hpf_line_period', line: i});
              var susidiary = tarRec.getSublistValue({sublistId: lineId,fieldId: 'custrecord_hpf_line_susidiary', line: i});
              var location = tarRec.getSublistValue({sublistId: lineId,fieldId: 'custrecord_hpf_line_location', line: i});
              obj.setSublistValue({sublistId: lineId, line: i,fieldId: 'custrecord_hpf_line_account', value: account});
              obj.setSublistValue({sublistId: lineId, line: i,fieldId: 'custrecord_hpf_line_debit', value: debit});
              obj.setSublistValue({sublistId: lineId, line: i,fieldId: 'custrecord_hpf_line_credit', value: credit});
              obj.setSublistValue({sublistId: lineId, line: i,fieldId: 'custrecord_hpf_line_department', value: department});
              obj.setSublistValue({sublistId: lineId, line: i,fieldId: 'custrecord_hpf_line_grossamount', value: grossamt});
              obj.setSublistValue({sublistId: lineId, line: i,fieldId: 'custrecord_hpf_entity', value: entity});
              obj.setSublistValue({sublistId: lineId, line: i,fieldId: 'custrecord_hpf_line_memo', value: memo});
              obj.setSublistValue({sublistId: lineId, line: i,fieldId: 'custrecord_hpf_line_period', value: period});
              obj.setSublistValue({sublistId: lineId, line: i,fieldId: 'custrecord_hpf_line_susidiary', value: susidiary});
              obj.setSublistValue({sublistId: lineId, line: i,fieldId: 'custrecord_hpf_line_location', value: location});
            }
        }

    }


    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {

     }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {
      
    }



    return {
        beforeLoad: beforeLoad,
        //beforeSubmit: beforeSubmit,
        //afterSubmit: afterSubmit
    };
    
});
