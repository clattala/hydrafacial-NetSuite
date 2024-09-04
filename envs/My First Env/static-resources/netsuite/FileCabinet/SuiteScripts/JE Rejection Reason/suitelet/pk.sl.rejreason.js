/**
 *@NApiVersion 2.1
*@NScriptType Suitelet
*@NModuleScope Public
*/
define([
    'N/ui/serverWidget',
    'N/record',
    'N/redirect',
    'N/workflow'
], function (
    serverWidget,
    record,
    redirect,
    workflow
) {
    const addFormField = (form, options) => {
        try {
            const { id, label, type, source, container, displayType, isMandatory, value } = options;
            let field = form.addField({ id, label, type, source, container });
            if (value) field.defaultValue = value;
            if (displayType) field.updateDisplayType({ displayType });
            field.isMandatory = !!isMandatory

            return field;
        } catch (E) {
            log.error('error', E);
            throw 'Trouble adding field with id: ' + options.id;
        }
    }

    const onRequest = (context) => {
        try {
            const rejectReasonForm = serverWidget.createForm({ title: 'ENTER REJECTION REASON' });
            log.debug(JSON.stringify(context))
            const { request, response } = context;
            const { parameters, method } = request;

            switch (method.toUpperCase()) {
                case 'GET':
                    addFormField(rejectReasonForm, {
                        id: 'custpage_reason',
                        type: serverWidget.FieldType.TEXTAREA,
                        label: 'Rejection Reason',
                        container: 'custpage_rejreason_tab',
                        isMandatory: true
                    });

                    addFormField(rejectReasonForm, {
                        id: 'custpage_rectype',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Rec Type',
                        container: 'custpage_rejreason_tab',
                        displayType: serverWidget.FieldDisplayType.HIDDEN,
                        value: parameters.custparam_rectype
                    });

                    addFormField(rejectReasonForm, {
                        id: 'custpage_recid',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Rec Id',
                        container: 'custpage_rejreason_tab',
                        displayType: serverWidget.FieldDisplayType.HIDDEN,
                        value: parameters.custparam_recid
                    });

                    addFormField(rejectReasonForm, {
                        id: 'custpage_rejreasonfieldid',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Rec Id',
                        container: 'custpage_rejreason_tab',
                        displayType: serverWidget.FieldDisplayType.HIDDEN,
                        value: parameters.custparam_rejreasonfldid
                    });

                    addFormField(rejectReasonForm, {
                        id: 'custpage_rejbtnid',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Rec Btn Id',
                        container: 'custpage_rejreason_tab',
                        displayType: serverWidget.FieldDisplayType.HIDDEN,
                        value: parameters.custparam_rejbtnid
                    });

                    addFormField(rejectReasonForm, {
                        id: 'custpage_workflowid',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Workflow Id',
                        container: 'custpage_rejreason_tab',
                        displayType: serverWidget.FieldDisplayType.HIDDEN,
                        value: parameters.custparam_workflowid
                    });

                    addFormField(rejectReasonForm, {
                        id: 'custpage_appr_status_fld',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Approval Fld Id',
                        container: 'custpage_rejreason_tab',
                        displayType: serverWidget.FieldDisplayType.HIDDEN,
                        value: parameters.custparam_appr_status_fld
                    });

                    rejectReasonForm.addSubmitButton();
                    response.writePage({ pageObject: rejectReasonForm });

                    break;
                case 'POST':
                    let values = {};
                    log.debug('POST:parameters:', {
                        reason: parameters.custpage_reason,
                        recordType: parameters.custpage_rectype,
                        recordId: parameters.custpage_recid,
                        workflowId: parameters.custpage_workflowid,
                        actionId: parameters.custpage_rejbtnid
                    });

                    values[`custbody_hf_appr_appremarks`] = parameters.custpage_reason || ` `;
                    values[`approvalstatus`] = '3'; // Reject Value

                    try {
                        const rec = record.load({
                            type: parameters.custpage_rectype,
                            id: parameters.custpage_recid
                        })

                        for (let fieldId in values) {
                            if (values.hasOwnProperty(fieldId)) {
                                const value = values[fieldId];
                                rec.setValue({ fieldId, value })
                            }
                        }

                        rec.save({
                            ignoreMandatoryFields: true
                        })

                        // record.submitFields({
                        //     type: parameters.custpage_rectype,
                        //     id: parameters.custpage_recid,
                        //     values: values,
                        //     options: { enableSourcing: false, ignoreMandatoryFields: true }
                        // });

                        // workflow.trigger({
                        //     recordType: parameters.custpage_rectype,
                        //     recordId: parameters.custpage_recid,
                        //     workflowId: parameters.custpage_workflowid,
                        //     actionId: parameters.custpage_rejbtnid
                        // });
                    } catch (E) {
                        log.error('Error in Rejection Reason Submission:', E)
                    }

                    redirect.toRecord({ type: parameters.custpage_rectype, id: parameters.custpage_recid });

                    break;
                default:
                    break;
            }
        } catch (E) {
            log.error('Rejection Reason:onRequest:Error', E)
        }
    }

    return {
        onRequest
    }
});