/*************************************************************
JIRA  ID      : NGO-5295 Indirect PO 
Date          : 11/25/2022
Author        : Pavan Kaleru
Description   : To set the Next Approvers hierarchy and also to hide the expense tab.

Date           Version        Change History
10/25/2023      1.1           SR#7176-Additional logic implemented to populate the buyer from 
                              item master to Buyer field on requisition for direct purchases
*************************************************************/

/**
  * @NApiVersion 2.x
  * @NScriptType UserEventScript
  * 
  */
 define(['N/record', 'N/ui/serverWidget', 'N/search'], function(record, serverWidget, search) {

   /*SR#7176 - Added the below new function */
	function beforeSubmit(scriptContext) {
		try {
			if (scriptContext.newRecord.type === 'purchaserequisition' && scriptContext.type == 'create') {
				var purchaseRequisition = scriptContext.newRecord;
				var itemId = purchaseRequisition.getSublistValue({
					sublistId: 'item',
					fieldId: 'item',
					line: 0
				});

				if (itemId) {
					var itemLookup = search.lookupFields({
						type: search.Type.ITEM,
						id: itemId,
						columns: ['custitem_hf_mainbuyer']
					});

					var Buyer = itemLookup.custitem_hf_mainbuyer[0].value;

					if (Buyer) {
						purchaseRequisition.setValue('custbody_hf_on_behalf_of', Buyer);
					}
				}
			}
		// Additional logic for purchase order
		else if (scriptContext.newRecord.type === 'purchaseorder' && (scriptContext.type == 'edit' || scriptContext.type == 'create')) {
			var purchaseOrder = scriptContext.newRecord;
			var oldRecord = scriptContext.oldRecord;
			var newWarehouseEdgeStatus = purchaseOrder.getValue('custbody_a1wms_orderstatus');
			var oldWarehouseEdgeStatus = oldRecord.getValue('custbody_a1wms_orderstatus');

			if (oldWarehouseEdgeStatus !== 'DOWNLOAD' && newWarehouseEdgeStatus === 'DOWNLOAD') {
				purchaseOrder.setValue('custbody_a1wms_orderlocked', true);
			} 
		}
		} catch (error) {
			log.debug('Error in beforeSubmit' + error.message, error)
		}
	}
    /*End of changes for SR#7176 */

	function afterSubmit(scriptContext) {
	try{
	 if (scriptContext.type == 'edit') {

		 var purchaseRequisition = scriptContext.newRecord;
		 var type = purchaseRequisition.type
		 var oldPurchaseRequisition = scriptContext.oldRecord;
		 
		 log.debug('type', type)
		 if (type != 'purchaseorder') {
			 var reqId = purchaseRequisition.id;
			 purchaseRequisition = record.load({
				 type: purchaseRequisition.type,
				 id: reqId
			 })
			 var oldNextApprover = oldPurchaseRequisition.getValue('nextapprover')
			 var onBehalfOf = purchaseRequisition.getValue('custbody_hf_on_behalf_of');
			 log.debug('onBehalfOf', onBehalfOf);
			 var arr_Approvers = [];
			 var jobTitle = 'Supervisor';
			 var superVisor = onBehalfOf;
			 var nextApprover = purchaseRequisition.getValue('nextapprover');
			log.debug('oldNextApprover ' + oldNextApprover ,  ' nextApprover ' + nextApprover)
		   //when previous old approver is not empty and if next approver is changed then we change the next approvers list
			 if(oldNextApprover!=-1 && oldNextApprover!= nextApprover && nextApprover!='-1') {
			 log.debug('setting 39')
			 while (jobTitle.toLowerCase() != 'chief financial officer') {
				 var employeeLookup = search.lookupFields({
					 type: 'employee',
					 id: nextApprover,
					 columns: ['supervisor', 'title', 'purchaseorderapprovallimit']
				 });
				 log.debug('employeeLookup', employeeLookup)
				 var superVisorObj = employeeLookup.supervisor
				 log.debug('superVisorObj', superVisorObj);
			   if(superVisorObj){
				 if (superVisorObj.length > 0) {
					 superVisor = superVisorObj[0].value;
					 arr_Approvers.push(superVisor)
					 nextApprover = superVisor
				 } else {
					 log.debug('no employee')
					 break;
				 }
			   }else{
				break;
			   }
				 jobTitle = employeeLookup.title
				
				 log.debug('jobTitle', jobTitle)

			 }
			 }
			 log.debug('arr_Approvers', arr_Approvers);
			 purchaseRequisition.setValue('custbody_hf_next_approvers', arr_Approvers)
			 log.debug('before saving')
			 // purchaseRequisition.setValue('approvalstatus','')
			 purchaseRequisition.save()
		 }
	 }
	}catch(error){
		 log.debug('Error in Aftersubmit' + error.message, error)

	}
	}

	function beforeLoad(context) {
	 try {
		 //create an inline html field
		 if (context.type == 'create' || context.type == 'edit' || context.type=='view') {
			 var recordObj = context.newRecord;
			 var onBehalfOf = recordObj.getValue('custbody_hf_on_behalf_of');
			 var recType = recordObj.type
			 log.debug('recType', recType)
			 if ((recType == 'purchaseorder' && onBehalfOf) || recType == 'purchaserequisition') {

				 var hideAttachAndNewFile = context.form.addField({
					 id: 'custpage_hide_exp',
					 label: 'Hide Expense tab',
					 type: serverWidget.FieldType.INLINEHTML
				 });

				 var hideAttachNewFileString = "";
				 hideAttachNewFileString += 'jQuery("#expensetxt").hide();'; //To remove Attach

				 hideAttachAndNewFile.defaultValue = "<script>jQuery(function($){require([], function(){" + hideAttachNewFileString + ";})})</script>";
			 }
		 }
	 } catch (error) {
		 log.debug('Error in before load' + error.message, error)
	 }
	}
	
	return {
	 beforeSubmit: beforeSubmit,   /* Added for SR#7176 */
	 afterSubmit: afterSubmit,
	 beforeLoad: beforeLoad
	}
 });
