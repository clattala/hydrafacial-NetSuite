/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * 
 */
define(['N/ui/serverWidget', 'N/record', 'N/redirect', 'N/search', 'N/runtime', 'N/email', 'N/url'],

    function(ui, record, redirect, search, runtime, email, url) {

        function onRequest(context) {
            try {
                if (context.request.method === "GET") {
                    var form = ui.createForm({
                        title: 'Enter Rejection Reason'
                    });
                    var rejectionReason = form.addField({
                        id: 'custpage_reject_reason',
                        type: ui.FieldType.TEXT,
                        label: 'Rejection Reason'
                    });
                    rejectionReason.isMandatory = true;
                    var recID = context.request.parameters.recid;
                    var nextApprover = context.request.parameters.nextapprover
                    var onBehalfOf = context.request.parameters.onBehalfOf
                    var tranid = context.request.parameters.tranid
                    var trantype = context.request.parameters.trantype
                    var entity = context.request.parameters.entity
                    var fieldValuesJson = recID + ',' + nextApprover + ',' + onBehalfOf + ',' + tranid + ',' + trantype + ',' + entity
			

                    var fieldJson = form.addField({
                        id: 'custpage_fieldjson',
                        type: ui.FieldType.TEXT,
                        label: 'field JSON',
                    });
                    fieldJson.defaultValue = fieldValuesJson;
                    fieldJson.updateDisplayType({
                        displayType: 'HIDDEN'
                    });
                    
                    form.addSubmitButton({
                        label: 'Save'
                    });

                    context.response.writePage(form);
                } else {
                    var rejectionReason = context.request.parameters.custpage_reject_reason;

                    var fieldJson = context.request.parameters.custpage_fieldjson
                    log.debug('fieldjson', fieldJson)
                    var fieldValuesArray = fieldJson.split(',')
                    //recID + ',' + nextApprover + ',' + onBehalfOf + ',' + tranid
                    var recId = fieldValuesArray[0] //context.request.parameters.custpage_rec_id; 
                    var nextApprover = fieldValuesArray[1] //context.request.parameters.custpage_nextapprover 
                    var onbehalfof = fieldValuesArray[2]
                    var tranId = fieldValuesArray[3]
                    var tranType = fieldValuesArray[4]
                    var creator = fieldValuesArray[5]
                    
                    var valuesJson = {
                        custbody_hf_rejection_reason: rejectionReason,
                        nextapprover: '',
                        approvalstatus: 3
                    }
                    if (tranType != 'vendorbill') {
                        var requisitionUrl = getUrl(recId);
                        log.debug('requisitionUrl', requisitionUrl)
                        



                        var id = submitFields(tranType, recId , valuesJson)

                        var approvalHistoryRecord = record.create({
                            type: 'customrecord_requisition_approval_routin'
                        });

                        approvalHistoryRecord.setValue('custrecord_parent_requisiton', recId)
                        approvalHistoryRecord.setValue('custrecord_requisition_action', 'REJECTED')
                        approvalHistoryRecord.setValue('custrecord_requisition_approver', runtime.getCurrentUser().id)
                        approvalHistoryRecord.setValue('custrecord_requisition_actual_approver', nextApprover)
                        //approvalHistoryRecord.setValue('custrecord_requisition_approver_limit', purchaseorderapprovalLimit)
                        approvalHistoryRecord.setValue('custrecord_requisition_date_approved', new Date())
                        approvalHistoryRecord.setValue('custrecord_requisition_rejection_reason', rejectionReason);
                        approvalHistoryRecord.save();
                        redirect.toRecord({
                            type: tranType,
                            id: recId
                        });
                        email.send({
                            author: 112877,
                            recipients: onbehalfof,
                          	cc : [creator],
                            subject: 'Requistion ' + tranId + ' is rejected',
                            body: 'Hello,</br></br>The Requistion ' + tranId + ' has been rejected by ' + runtime.getCurrentUser().name + ' and the rejection comments are ' + rejectionReason + '<br></br> Please make the necessary changes and send the requisition for approvals .</br></br> <a href="' + requisitionUrl + '">Purchase Requisition</a></br></br>'

                        });
                    } else {
                      log.debug('tranType', tranType)
                      log.debug('valuesJson' , valuesJson)
						var id = submitFields(tranType, recId , valuesJson);
						redirect.toRecord({
                            type: tranType,
                            id: recId
                        });
                    }

                }

            } catch (error) {
                var errorMessage = '';
                if (error.getDetails != undefined) {
                    errorMessage = error.getCode() + ': ' + error.getDetails();
                    log.error({
                        title: 'afterSubmit',
                        details: 'Error = ' + errorMessage
                    });
                    //throw errorMessage;
                } else {
                    errorMessage = error.toString();
                    log.error({
                        title: 'afterSubmit',
                        details: 'Unexpected Error = ' + errorMessage
                    });
                    //throw errorMessage;
                }
            }
        }

        function getUrl(recId) {
            var scheme = 'https://';
            var host = url.resolveDomain({
                hostType: url.HostType.APPLICATION
            });
            var relativePath = url.resolveRecord({
                recordType: record.Type.PURCHASE_REQUISITION,
                recordId: recId,
                isEditMode: true
            });
            var myURL = scheme + host + relativePath;

            return myURL;
        }
		
		
		function submitFields(tranType, recId , valuesJson){
          var scriptObj = runtime.getCurrentScript();
log.debug('governance units: before submit fields ' + scriptObj.getRemainingUsage());

			var id = record.submitFields({
                            type: tranType,
                            id: recId,
                            values: valuesJson,
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            }
                        });
          log.debug('governance units: after submit fields ' + scriptObj.getRemainingUsage());

			return id;
		}


        return {
            onRequest: onRequest
        };

    });