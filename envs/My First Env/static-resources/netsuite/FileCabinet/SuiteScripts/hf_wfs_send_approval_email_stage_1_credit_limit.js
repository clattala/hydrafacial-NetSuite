/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
 define(['N/search', 'N/email','N/url','N/record'], function (search, email, url,record) {
    function onAction(scriptContext) {
        log.debug({
            title: 'Start Script'
        });
        var newRecord = scriptContext.newRecord;

        var total = newRecord.getValue('custentity_hf_credit_limit');
        var updatedBy = newRecord.getValue('custentity_hf_credit_limit_updated_by');
        var SubmittedForApprovalBy = newRecord.getValue('custentity_hf_cred_limit_sub_fr_appro_by');
        
        var employeeSearchObj = search.load({
            id: 'customsearch_hf_credit_manager_level_app'
        });
        
        var recipient = [];
        employeeSearchObj.run().each(function (result) {
            recipient.push(result.getValue('email'));
            return true;
        });
      	log.debug('createdBy',updatedBy);      	log.debug('recipient',recipient);
		var customerUrl = getUrl(newRecord.id);
        try {
            email.send({
                author: SubmittedForApprovalBy,
                recipients: recipient,
                subject: 'Review Request for Credit Limit',
                body: 'Hello,</br></br>The credit Limit has been submitted for approval please review. </br></br> <a href="'+ customerUrl +'">Customer Link</a></br></br>Customer credit limit changes will require one or more approvals depending on the credit limit amount:</br></br>1. Credit Limit < = $50,000, approval should be from the Credit Manager only.</br>2. Credit Limit < = $100,000, approval should be from the Credit Manager & Sr. AR Manager.</br>3. Credit Limit < = $200,000, approval should be from the Credit Manager, Sr. AR Manager, & Accounting Operations Director.</br>4. Credit Limit > $200,000, approval should be from the Credit Manager, Sr. AR Manager, Accounting Operations Director, & Controller.</br>',
                relatedRecords: {
                    entityId: newRecord.id
                }
            });
        } catch (e) {
            log.debug('error', e);
        }

        return 1;
    }
    function getUrl(recId){
        var scheme = 'https://';
        var host = url.resolveDomain({
            hostType: url.HostType.APPLICATION
        });
        var relativePath = url.resolveRecord({
            recordType: record.Type.CUSTOMER,
            recordId: recId,
            isEditMode: false
        });
        var myURL = scheme + host + relativePath;

        return myURL;
    }
    return {
        onAction: onAction
    }
});