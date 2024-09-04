 /**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/redirect'], function(redirect) {
    function onAction(scriptContext){
		var purchaseRequisition = scriptContext.newRecord;
		var reqId = purchaseRequisition.id;
      	var nextApprover = purchaseRequisition.getValue('nextapprover')
        var onBehalfOf = purchaseRequisition.getValue('custbody_hf_on_behalf_of');
      	var tranid = purchaseRequisition.getValue('tranid');
      	var entity = purchaseRequisition.getValue('entity')

		redirect.toSuitelet({
		scriptId: 'customscript_hf_sl_enter_reject_reason',
		deploymentId: 'customdeploy_hf_sl_enter_reject_reason',
		parameters: {'recid':reqId,'trantype': scriptContext.newRecord.type,'nextapprover' : nextApprover, 'onBehalfOf': onBehalfOf ,'tranid' : tranid , 'entity' : entity}
		}); 
      return null
    }
    return {
        onAction: onAction
    }
}); 

        