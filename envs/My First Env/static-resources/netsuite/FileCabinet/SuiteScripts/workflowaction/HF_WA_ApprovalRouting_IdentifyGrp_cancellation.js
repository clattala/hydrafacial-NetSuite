/**
 *
 * HF_WA_ApprovalRouting_IdentifyGrp.js
 *
 * Description:
 * Searches for the approval group to use in a transaction
 *
 * Version      Date            Author          Notes
 * 1.0          2021 Jul 01     cfrancisco      Initial version
 *
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define([
    'N/search',
    'N/record',
    '../library/HF_LIB_GeneralHelpers',
    '../library/HF_LIB_ApprovalRouting',
    'N/email',
    'N/url',
    'N/runtime'
], function (
    SEARCH,
    RECORD,
    LIB_GENHELPERS,
    LIB_APPROVALROUTING,
    EMAIL,
    url,
    runtime
) {

    var HELPERS = LIB_GENHELPERS.INITIALIZE();
    var { _RECORDS, _HELPERS } = LIB_APPROVALROUTING;
    var APP_ROUTING_HELPERS = _HELPERS;


    function onAction_setApproverInfo(scriptContext) {
        let stLogTitle = 'onAction_setApproverInfo';

        try {

            let { newRecord, oldRecord, form, type, workflowId } = scriptContext;

            let intCreatedBy = newRecord.getValue({ fieldId: _RECORDS.TRANSACTION.FIELDS.cancelrequestedby }),
                intSubsidiary = newRecord.getValue({ fieldId: _RECORDS.TRANSACTION.FIELDS.subsidiary });
            let stTransType = newRecord.type;

            if (HELPERS.isEmpty(intCreatedBy)) {
                var user = runtime.getCurrentUser();
                if(user.id != '' && user.email != ''){
                    intCreatedBy = user.id;
                }

                if(HELPERS.isEmpty(intCreatedBy))
                    throw 'No Created By field value.';
            }

            let objReqAppGrp = APP_ROUTING_HELPERS.getRequestorApprGroup({ requestor: intCreatedBy, transType: stTransType });

            log.debug(`objReqAppGrp`, objReqAppGrp)

            // Expected results
            // custrecord_hf_apprgrp_approvers: "429,455,462,3502"
            // custrecord_hf_apprgrp_notifyusers: "429,455,462,3502"
            // custrecord_hf_apprgrp_requestors: "868,1013,1014,3706"
            // custrecord_hf_apprgrp_transtype: "1"
            // internalid: "1"
            // name: "JE Approver - US - Group 1"

            // Validate if returned data has the approval group
            if (objReqAppGrp.internalid && objReqAppGrp.name) {
                let arrApprovers = objReqAppGrp[_RECORDS.APPROVAL_GROUP.FIELDS.approvers].split(',');
                log.debug(`arrApprovers split value`, arrApprovers);

                newRecord.setValue({ fieldId: _RECORDS.TRANSACTION.FIELDS.cancelapprovalgroup, value: objReqAppGrp.internalid }); // Approval Group
                newRecord.setValue({ fieldId: _RECORDS.TRANSACTION.FIELDS.cancelgrpapprovers, value: arrApprovers }); // Approvers
                newRecord.setValue({ fieldId: _RECORDS.TRANSACTION.FIELDS.trigreject, value: false }); // TRIGGER REJECT
                newRecord.setValue({ fieldId: _RECORDS.TRANSACTION.FIELDS.editedby, value: '' }); // Edited by

                const recordLink = url.resolveRecord({
                    recordType: newRecord.type,
                    recordId: newRecord.id,
                    // isEditMode: true
                });

                const notifyUsers = objReqAppGrp[_RECORDS.APPROVAL_GROUP.FIELDS.notifyusers].split(',');
                if (notifyUsers && notifyUsers.length > 0) {
                    sendEmail(intCreatedBy, notifyUsers, newRecord.getValue({ fieldId: 'tranid' }), recordLink);
                }

                return 'SUCCESS';
            }
            // Check if Subsidiary Approval Group exists for transaction
            else {
                return attemptSubAppGroupCheck(newRecord);
            }

        }
        catch (ex) {
            let stErrorMessage = HELPERS.getErrorMessage(ex);
            log.error(stLogTitle, stErrorMessage);

            return stErrorMessage;
        }
    }

    function attemptSubAppGroupCheck(newRecord) {
        let intSubsidiary = newRecord.getValue({ fieldId: _RECORDS.TRANSACTION.FIELDS.subsidiary });
        let stTransType = newRecord.type;

        let objReqAppGrp = APP_ROUTING_HELPERS.getTransSubAppGroup({ subsidiary: intSubsidiary, transType: stTransType });

        if (objReqAppGrp.internalid && objReqAppGrp.name) {
            let arrApprovers = objReqAppGrp[_RECORDS.APPROVAL_GROUP.FIELDS.approvers].split(',');

            newRecord.setValue({ fieldId: _RECORDS.TRANSACTION.FIELDS.cancelapprovalgroup, value: objReqAppGrp.internalid }); // Approval Group
            newRecord.setValue({ fieldId: _RECORDS.TRANSACTION.FIELDS.cancelgrpapprovers, value: arrApprovers }); // Approvers
            newRecord.setValue({ fieldId: _RECORDS.TRANSACTION.FIELDS.trigreject, value: false }); // TRIGGER REJECT
            newRecord.setValue({ fieldId: _RECORDS.TRANSACTION.FIELDS.editedby, value: '' }); // Edited by

            return 'SUCCESS';
        }
        else {
            return 'No available approval groups found.';
        }
    }

    const sendEmail = (creator, approvers, tranId, recordLink) => {
        try {
            EMAIL.send({
                author: creator,
                recipients: approvers,
                subject: `Journal Entry ${tranId} is pending your approval.`,
                body: `
                    Journal Entry ${tranId} is pending your approval.<br/>
                    <a href="${recordLink}">View Record Link</a>
                    `
            });
        } catch (E) {
            log.error('sendEmail:Error', E)
        }
    }

    return {
        onAction: onAction_setApproverInfo
    }
});