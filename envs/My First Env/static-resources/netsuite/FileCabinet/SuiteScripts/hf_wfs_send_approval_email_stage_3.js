/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
 define(['N/search', 'N/email','N/url','N/record', 'N/runtime'], function (search, email, url, record, runtime) {
    function onAction(scriptContext) {
        log.debug({
            title: 'Start Script'
        });
        var newRecord = scriptContext.newRecord;

        var total = newRecord.getValue('total');
        var createdBy = newRecord.getValue('recordcreatedby');
      	var cmCreatedBy = newRecord.getValue('custbody_hf_credit_memo_created_by');
      	if(cmCreatedBy != ''){
          createdBy = cmCreatedBy;
        }
        var employeeSearchObj = search.load({
            id: 'customsearch_hf_controller'
        });

        var recipient = [];
        employeeSearchObj.run().each(function (result) {
            recipient.push(result.getValue('email'));
            return true;
        });
      	log.debug('createdBy',createdBy);      	log.debug('recipient',recipient);
		var creditMemoUrl = getUrl(newRecord.id);
        try {
            email.send({
                author: createdBy,
                recipients: recipient,
                subject: 'Review Request for Credit Memo',
                body: 'Hello,</br></br>The credit memo has been submitted for approval please review. </br></br> <a href="'+ creditMemoUrl +'">Credit Memo Link</a></br></br>The credit memo will need to go through the following approvals, depending on the credit memo total.</br></br>1. Credit Memo total > 1000 & total <= $25 000, approval should be from the Sr. AR Manager</br>2. Credit Memo total <= $50,000, approval should be from the Sr. AR Manager & Accounting Operations Director</br>3. Credit Memo total > $50 000, approval should be from the Sr. AR Manager, Accounting Operations Director, and Controller</br></br>Note: The credit memo approval is required when it is created from any record except the “Return Authorization”.',
                relatedRecords: {
                    transactionId: newRecord.id
                }
            });
        } catch (e) {
            log.debug('error', e);
        }
		acceptanceEmail(scriptContext);
        return 1;
    }
    function getUrl(recId){
        var scheme = 'https://';
        var host = url.resolveDomain({
            hostType: url.HostType.APPLICATION
        });
        var relativePath = url.resolveRecord({
            recordType: record.Type.CREDIT_MEMO,
            recordId: recId,
            isEditMode: true
        });
        var myURL = scheme + host + relativePath;

        return myURL;
    }
   	function acceptanceEmail(scriptContext) {
        log.debug({
            title: 'Start Script'
        });
      	var user = runtime.getCurrentUser();
      	var sendBy=-5;
        if(user.id != '' && user.email != ''){
            sendBy = user.id;
        }
        var newRecord = scriptContext.newRecord;
        var createdBy = newRecord.getValue('recordcreatedby');
      	var cmCreatedBy = newRecord.getValue('custbody_hf_credit_memo_created_by');
      	if(cmCreatedBy != ''){
          createdBy = cmCreatedBy;
        }
      	var submittedForApprovalBy = newRecord.getValue('custbody_hf_cm_submit_fr_approval_by');
      	var recipients = [];
        recipients.push(createdBy);
        if(createdBy != submittedForApprovalBy){
            recipients.push(submittedForApprovalBy);
        }
        var creditMemoUrl = getUrl(newRecord.id);
        try {
            email.send({
                author: sendBy,
                recipients: recipients,
                subject: 'Review Request for Credit Memo',
                body: 'Hello,</br></br>The credit memo you submitted for approval has been approved by the AR Manager and Accounting Operations Director. The credit memo is now waiting for final approval by the Controller.</br></br>You can see the credit memo by clicking the link below. </br></br> <a href="'+ creditMemoUrl +'">Credit Memo Link</a></br></br>The credit memo will need to go through the following approvals, depending on the credit memo total.</br></br>1.Credit Memo total <= $25 000, approval should be from the AR Manager</br>2.Credit Memo total <= $50,000, approval should be from the AR Manager & Accounting Operations Director</br>3.Credit Memo total > $50 000, approval should be from the AR Manager, Accounting Operations Director, and Controller</br></br>Note: The credit memo approval is required when it is created from any record except the “Return Authorization”.',
                relatedRecords: {
                    transactionId: newRecord.id
                }
            });
        } catch (e) {
            log.debug('error', e.message);
        }
        return 1;
    }
    return {
        onAction: onAction
    }
});