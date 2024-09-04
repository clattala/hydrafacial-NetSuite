/**
 *
 * HF_SL_ApprovalRouting_RejectTrans.js
 *
 * Description:
 * Provides an interface for rejecting the transaction under Pending Approval status
 *
 * Version      Date            Author          Notes
 * 1.0          2021 Jul 06     cfrancisco      Initial version
 *
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/record', 'N/search', 'N/runtime', '../library/HF_LIB_GeneralHelpers', '../library/HF_LIB_ApprovalRouting'],
function(SERVERWIDGET, RECORD, SEARCH, RUNTIME, LIB_GENHELPERS, LIB_APPROVALROUTING ) {

    const HELPERS = LIB_GENHELPERS.INITIALIZE();
    const {_RECORDS, _HELPERS} = LIB_APPROVALROUTING;

    const runtimeUser = RUNTIME.getCurrentUser();

    const formGetConstructor = () => ({
        form: SERVERWIDGET.createForm({
            title: 'Reject Transaction',
            hideNavBar: true
        }),
        submitButtonLabel: 'Submit Rejection',
        fieldGroups: {
            main: {
                id: 'fieldgrp_main',
                label: 'Information',
                tab: null,
            }
        },
        fields: {
            transtype: {
                id: 'custpage_transtype',
                label: 'Transaction Type',
                type: SERVERWIDGET.FieldType.TEXT,
                container: 'fieldgrp_main',
                displayType: SERVERWIDGET.FieldDisplayType.INLINE,
            },
            recordType: {
                id: 'custpage_transtypeid',
                label: 'Record Type ID',
                type: SERVERWIDGET.FieldType.TEXT,
                container: 'fieldgrp_main',
                displayType: SERVERWIDGET.FieldDisplayType.HIDDEN,
            },
            transintid: {
                id: 'custpage_transintid',
                label: 'Transaction Internal ID',
                type: SERVERWIDGET.FieldType.INTEGER,
                container: 'fieldgrp_main',
                displayType: SERVERWIDGET.FieldDisplayType.HIDDEN,
            },
            tranid: {
                id: 'custpage_tranid',
                label: 'Transaction ID',
                type: SERVERWIDGET.FieldType.TEXT,
                container: 'fieldgrp_main',
                displayType: SERVERWIDGET.FieldDisplayType.INLINE,
            },
            approvalstatus: {
                id: 'custpage_approvalstatus',
                label: 'Approval Status',
                type: SERVERWIDGET.FieldType.TEXT,
                container: 'fieldgrp_main',
                displayType: SERVERWIDGET.FieldDisplayType.INLINE,
                breakType: SERVERWIDGET.FieldBreakType.STARTCOL,
                // breakType: SERVERWIDGET.FieldBreakType.STARTROW,
            },
            rejectionMemo: {
                id: 'custpage_rejectionmemo',
                label: 'Rejection Reason',
                type: SERVERWIDGET.FieldType.TEXTAREA,
                container: 'fieldgrp_main',
                isMandatory: true,
                displayType: SERVERWIDGET.FieldDisplayType.NORMAL,
                breakType: SERVERWIDGET.FieldBreakType.STARTCOL,
            }
        }
    });

    const formPostConstructor = () => ({
        form: SERVERWIDGET.createForm({
            title: 'Post Reject Transaction',
            hideNavBar: true
        }),
        fields: {
            inlinejs: {
                id: 'custpage_js_inlinehtml_exit',
                type: 'inlinehtml',
                label: 'Inline HTML JS Exit Field',
                defaultValue: '<script>window.opener.location.reload();window.close();</script>'
            }
        }
    });

    const formErrorConstructor = (errorMessage) => ({
        form: SERVERWIDGET.createForm({
            title: 'Request Error',
            hideNavBar: true
        }),
        fields: {
            errorPrompt: {
                id: 'custpage_error_notice',
                type: 'textarea',
                label: 'Error Procesing Request Form',
                defaultValue: 'Unable to render form. Please try again or contact your administrator. ' + errorMessage,
                displayType: 'inline'
            }
        }
    });


    const generateGetForm = function(transInternalId, transInfo) {
        let objFormCon = formGetConstructor();

        let formMain = objFormCon.form;
        formMain.addSubmitButton({ label: objFormCon.submitButtonLabel });

        formMain.addFieldGroup(objFormCon.fieldGroups.main);

        let arrFieldAliases = Object.keys(objFormCon.fields);
        for (let fieldAlias of arrFieldAliases) {
            let fldThisField = formMain.addField(objFormCon.fields[fieldAlias]);

            if ('displayType' in objFormCon.fields[fieldAlias]) {
                fldThisField.updateDisplayType({displayType: objFormCon.fields[fieldAlias].displayType});
            }

            if ('breakType' in objFormCon.fields[fieldAlias]) {
                fldThisField.updateBreakType({breakType: objFormCon.fields[fieldAlias].breakType});
            }


            if ('isMandatory' in objFormCon.fields[fieldAlias]) {
                fldThisField.isMandatory = objFormCon.fields[fieldAlias].isMandatory;
                //  fldThisField.updateBreakType({breakType: objFormCon.fields[fieldAlias].breakType});
            }

            switch (fieldAlias) {
                case 'transtype':
                    if ('type' in transInfo) {
                        fldThisField.defaultValue = transInfo.type[0].text;
                    }
                    break;
                case 'recordType':
                    if ('recordtype' in transInfo) {
                        fldThisField.defaultValue = transInfo.recordtype;
                    }
                    break;
                case 'transintid':
                    fldThisField.defaultValue = transInternalId;
                    break;
                case 'tranid':
                    fldThisField.defaultValue = transInfo.tranid;
                    break;
                case 'approvalstatus':
                    fldThisField.defaultValue = transInfo.approvalstatus[0].text;
                    break
            }
        }

        return formMain;
    };

    const generatePostForm = () => {
        let objFormCon = formPostConstructor();
        let formMain = objFormCon.form;
        let arrFieldAliases = Object.keys(objFormCon.fields);

        for (let fieldAlias of arrFieldAliases) {
            let fldThisField = formMain.addField(objFormCon.fields[fieldAlias]);

            if ('defaultValue' in objFormCon.fields[fieldAlias]) {
                fldThisField.defaultValue = objFormCon.fields[fieldAlias].defaultValue;
            }
        }

        return formMain;
    }

    const generateErrorPromptForm = (errorMessage) => {
        let objFormCon = formErrorConstructor(errorMessage);
        let formMain = objFormCon.form;
        let arrFieldAliases = Object.keys(objFormCon.fields);

        for (let fieldAlias of arrFieldAliases) {
            let fldThisField = formMain.addField(objFormCon.fields[fieldAlias]);

            if ('defaultValue' in objFormCon.fields[fieldAlias]) {
                fldThisField.defaultValue = objFormCon.fields[fieldAlias].defaultValue;
            }

            if ('displayType' in objFormCon.fields[fieldAlias]) {
                fldThisField.updateDisplayType({displayType: objFormCon.fields[fieldAlias].displayType});
            }
        }

        return formMain;
    }

    const getTransInfo = (transInternalId) => {
        let objLookup = SEARCH.lookupFields({ type: 'transaction', id: transInternalId, columns: ['type', 'tranid', 'approvalstatus', 'recordtype'] });
        return objLookup;
    };



    const rejectTransaction = (options) => {
        const { recordType, transId, rejectionReason, approverId } = options;

        if (recordType == null || recordType == '')             { throw 'Reject Transaction: Missing "record type" value.'; }
        if (transId == null || transId == '')                   { throw 'Reject Transaction: Missing "transaction id" value.'; }
        if (rejectionReason == null || rejectionReason == '')   { throw 'Reject Transaction: Missing "rejection reason" value.'; }
        if (approverId == null || approverId == '')             { throw 'Reject Transaction: Missing "approver" value.'; }

        let objSubmitVals = {};
        objSubmitVals[_RECORDS.TRANSACTION.FIELDS.editedby]   = approverId;
        objSubmitVals[_RECORDS.TRANSACTION.FIELDS.remarks]    = rejectionReason;
        objSubmitVals[_RECORDS.TRANSACTION.FIELDS.trigreject] = true;

        RECORD.submitFields({
            type: recordType,
            id: transId,
            values: objSubmitVals
        });
    };





    const onRequest = (context) => {
        const { request, response } = context;
        let { parameters, body, method } = request;

        log.debug( 'parameters', JSON.stringify(parameters));

        try {
            switch (method) {
                case 'GET': {
                    const { custparam_transtype: transtype, custparam_transid: transId } = parameters;

                    let objTransInfo = getTransInfo(transId);
                    let objForm = generateGetForm(transId, objTransInfo);

                    response.writePage(objForm);
                }
                break;
                case 'POST': {
                    const { custpage_transtypeid: recordType, custpage_transintid: transId, custpage_rejectionmemo: rejectionReason } = parameters;
                    rejectTransaction({ recordType: recordType, transId: transId, rejectionReason: rejectionReason, approverId: runtimeUser.id });
                    let objForm = generatePostForm();

                    response.writePage(objForm);
                    break;
                }
            }
        }
        catch (ex) {
            let stErrorMessage = HELPERS.getErrorMessage(ex);
            let objForm = generateErrorPromptForm(stErrorMessage);

            response.writePage(objForm);
        }
    }

    return {
        onRequest: onRequest
    }
});
