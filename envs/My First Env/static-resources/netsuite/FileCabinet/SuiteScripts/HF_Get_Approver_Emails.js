/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/search', 'N/email', 'N/url', 'N/record', 'N/file', 'N/format', 'N/runtime'], function(search, email, url, record, file, format, runtime) {
    function onAction(scriptContext) {
        log.debug({
            title: 'Start Script'
        });
        var newRecord = scriptContext.newRecord;
        //var urlObj = getUrl(newRecord.id);
        var levelId = runtime.getCurrentScript().getParameter('custscript_hf_current_level_id');
		log.debug('levelId');
        var rolesSearch = search.lookupFields({
            type: 'customrecord_hf_vb_approver_limit_role',
            id: levelId,
            columns: ['custrecord_hf_approver_role']
        });
        var roleId = rolesSearch.custrecord_hf_approver_role;
        log.debug('roleId', roleId);
	    if(roleId && roleId.length == 1){
			  var employeeSearchObj = search.create({
            type: "employee",
            filters: [
                ["role", "anyof", roleId[0].value]
            ],
            columns: [
                search.createColumn({
                    name: "email",
                    label: "Email"
                }),
            ]
        });
        var searchResults = employeeSearchObj.run().getRange(0, 1000);
        var recipientEmailArray = [];
		if(searchResults.length >0){
			for(var i=0; i<searchResults.length;i++){
			   recipientEmailArray.push(searchResults[0].getValue('email'));
		   }
		}
		
        log.debug('recipientEmailArray',recipientEmailArray);
		return recipientEmailArray.join(',')
   
		}
      
       /* var scriptObj = runtime.getCurrentScript()
        var billSender = scriptObj.getParameter({
            name: 'custscript_hf_po_bill_sender'
        })
        try {
            email.send({
                author: billSender,
                recipients: recipientEmailArray,
                subject: 'Vendor Bill ' + tranId + ' has been submitted for approval',
                body: 'Hello,</br></br>The Vendor bill ' + tranId + ' has been submitted for approval </br></br></br> <a href="' + urlObj.recordUrl + '">View Vendor bill</a> </br></br> <a href="' + urlObj.approveUrl + '">Approve Bill </a></br></br>  <a href="' + urlObj.rejectUrl + '">Reject Bill </a></br></br> ',
                relatedRecords: {
                    transactionId: newRecord.id
                }
            });
        } catch (e) {
            log.debug('error', e);
        }*/

    }

    function getUrl(recId) {
        var scheme = 'https://';
        var host = url.resolveDomain({
            hostType: url.HostType.APPLICATION
        });
        var relativePath = url.resolveRecord({
            recordType: 'vendorbill',
            recordId: recId,
            isEditMode: false
        });
        var recordUrl = scheme + host + relativePath;
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_hf_sl_appr_reject_online',
            deploymentId: 'customdeploy_hf_sl_appr_reject_online',
            returnExternalUrl: true
        });
        var approveUrl = suiteletUrl + '&recId=' + recId + '&buttonClicked=' + 'approve'
        var rejectUrl = suiteletUrl + '&recId=' + recId + '&buttonClicked=' + 'reject'
        return {
            'recordUrl': recordUrl,
            'approveUrl': approveUrl,
            'rejectUrl': rejectUrl
        }
    }
 
    return {
        onAction: onAction
    }
});