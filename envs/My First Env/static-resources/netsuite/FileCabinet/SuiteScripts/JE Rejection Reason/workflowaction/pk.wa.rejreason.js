/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */

define([
    'N/redirect',
    'N/runtime',
], function (
    redirect,
    runtime
) {
    'use strict';
    const onAction = context => {
        try {
            const { newRecord } = context;
            log.debug('ENTERED')

            const scriptObj = runtime.getCurrentScript();
            const rejReasonFieldId = scriptObj.getParameter({ name: 'custscript_rejreasonfldid_2' });
            const rejectBtnId = scriptObj.getParameter({ name: 'custscript_rejbtnid_2' });
            const workflowId = scriptObj.getParameter({ name: 'custscript_workflowid_2' });
            const approvalStatusFldId = scriptObj.getParameter({ name: 'custscript_appr_status_fld_2' });

            redirect.toSuitelet({
                scriptId: 'customscript_pk_rejreason_sl',
                deploymentId: 'customdeploy_pk_rejreason_sl',
                parameters: {
                    'custparam_rectype': newRecord.type,
                    'custparam_recid': newRecord.id,
                    'custparam_rejreasonfldid': rejReasonFieldId,
                    'custparam_rejbtnid': rejectBtnId,
                    'custparam_workflowid': workflowId,
                    'custparam_appr_status_fld': approvalStatusFldId
                }
            });

        } catch (E) {
            log.error('afterSubmit:Error:', E);
            throw E;
        }
    }

    return {
        onAction
    }
});