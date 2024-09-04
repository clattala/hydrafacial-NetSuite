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
        if(user.id != '' && user.email != ''){
            sendBy = user.id;
        }
        var newRecord = scriptContext.newRecord;
        var createdBy = newRecord.getValue('custentity_hf_credit_limit_updated_by');
        var submittedForApprovalBy = newRecord.getValue('custentity_hf_cred_limit_sub_fr_appro_by');
        var approverRole = newRecord.getValue('custentity_hf_next_approver_step_1');

        //get Script Parameter
        var myScript = runtime.getCurrentScript();
        var ar_manager_role = myScript.getParameter({
            name: 'custscript_hf_ar_manager_role'
        });
        var ac_operations_director_role = myScript.getParameter({
            name: 'custscript_ac_operations_director_role'
        });
        var controller_role = myScript.getParameter({
            name: 'custscript_controller_role'
        });

        var recipients = [];
        recipients.push(createdBy);
        if(createdBy != submittedForApprovalBy){
            recipients.push(submittedForApprovalBy);
        }
        if(approverRole == ar_manager_role || approverRole == ac_operations_director_role || approverRole == controller_role)
        {
            //Send approval confirmations to credit manager
            var employeeSearchObj1 = search.load({
                id: 'customsearch_hf_credit_manager_level_app'
            });
            employeeSearchObj1.run().each(function (result) {
                if(recipients.indexOf(result.getValue('email')) == -1)
                recipients.push(result.getValue('email'));
                
                return true;
            });
            
            if(approverRole == ac_operations_director_role || approverRole == controller_role)
            {
                //Send approval confirmations to AR manager
                var employeeSearchObj2 = search.load({
                    id: 'customsearch_hf_ar_manager'
                });
                employeeSearchObj2.run().each(function (result) {
                    if(recipients.indexOf(result.getValue('email')) == -1)
                    recipients.push(result.getValue('email'));
                
                    return true;
                });

                if(approverRole == controller_role)
                {
                    //Send approval confirmations to Finance Operations Dir
                    var employeeSearchObj3 = search.load({
                        id: 'customsearch_hf_accounting_operation_dir'
                    });
                    employeeSearchObj3.run().each(function (result) {
                        if(recipients.indexOf(result.getValue('email')) == -1)
                        recipients.push(result.getValue('email'));

                        return true;
                    });
                }
            }
        }
        var customerUrl = getUrl(newRecord.id);
        try {
            email.send({
                author: sendBy,
                recipients: recipients,
                subject: 'Review Request for Credit Limit (Rejected)',
                body: 'Hello,</br></br>The credit Limit you have submitted to review has been <b>rejected</b>. You can edit the credit limit and resubmit. </br></br> Please review the customer by clicking on the link below: </br></br><a href="'+ customerUrl +'">Customer Link</a></br></br>Customer credit limit changes will require one or more approvals depending on the credit limit amount:</br></br>1. Credit Limit < = $50,000, approval should be from the Credit Manager only.</br>2. Credit Limit < = $100,000, approval should be from the Credit Manager & Sr. AR Manager.</br>3. Credit Limit < = $200,000, approval should be from the Credit Manager, Sr. AR Manager, & Accounting Operations Director.</br>4. Credit Limit > $200,000, approval should be from the Credit Manager, Sr. AR Manager, Accounting Operations Director, & Controller.</br>',
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
