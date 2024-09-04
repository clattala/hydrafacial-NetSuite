/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
 define(['N/search', 'N/email','N/url','N/record','N/runtime'], function (search, email, url, record, runtime) {
    function onAction(scriptContext) {
        log.debug({
            title: 'Start Script'
        });
      	var user = runtime.getCurrentUser();
      	var sendBy=-5;
      	var newRecord = scriptContext.newRecord;
        if(user.id != '' && user.email != ''){
            sendBy = user.id;
        }
        var createdBy = newRecord.getValue('custentity_hf_credit_limit_updated_by');
        var submittedForApprovalBy = newRecord.getValue('custentity_hf_cred_limit_sub_fr_appro_by');
        var recipients = [];
        recipients.push(createdBy);
      	log.debug('createdBy', createdBy);
        if(submittedForApprovalBy != ''){
            return;
        }
        var customerUrl = getUrl(newRecord.id);
        try {
            email.send({
                author: sendBy,
                recipients: recipients,
                subject: 'Credit Limit Update Process',
                body: 'Hello,</br></br>We noticed that you have updated the credit limit for a customer, please click on "submit credit limit for approval" button on the customer record to initiate the approval process. The link is below: </br></br><a href="'+ customerUrl +'">Customer Link</a></br></br>Customer credit limit changes will require one or more approvals depending on the credit limit amount:</br></br>1. Credit Limit < = $50,000, approval should be from the Credit Manager only.</br>2. Credit Limit < = $100,000, approval should be from the Credit Manager & Sr. AR Manager.</br>3. Credit Limit < = $200,000, approval should be from the Credit Manager, Sr. AR Manager, & Accounting Operations Director.</br>4. Credit Limit > $200,000, approval should be from the Credit Manager, Sr. AR Manager, Accounting Operations Director, & Controller.</br>',
                relatedRecords: {
                    entityId: newRecord.id
                }
            });
        } catch (e) {
            log.debug('error', e.message);
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