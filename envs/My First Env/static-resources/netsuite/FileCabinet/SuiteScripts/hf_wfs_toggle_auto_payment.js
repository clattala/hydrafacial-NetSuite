/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
 define(['N/record','N/runtime'], function (record, runtime) {
    function onAction(scriptContext) {
        log.debug({
            title: 'Start Script'
        });
        var newRecord = scriptContext.newRecord;
        var autoInv = newRecord.getValue('custbody_hf_run_auto_payment_script');

        log.debug('autoInv', autoInv);
        var myScript = runtime.getCurrentScript();
        var runAutoPayScript_yes = myScript.getParameter({
            name: 'custscript_hf_run_auto_pay_script_y'
        });
        var runAutoPayScript_no = myScript.getParameter({
            name: 'custscript_hf_run_auto_pay_script_n'
        });

        if (autoInv == runAutoPayScript_no || (autoInv != runAutoPayScript_no && autoInv != runAutoPayScript_yes)) {
            autoInv = runAutoPayScript_yes;
        } else {
            autoInv = runAutoPayScript_no;
        }
        record.submitFields({
            "type": 'invoice',
            "id": newRecord.id,
            "values": {
                "custbody_hf_run_auto_payment_script": autoInv,
              	"custbody_hf_atmpts_fr_creating_pay_rec": '0'
            }
        });
        return 1;
    }

    return {
        onAction: onAction
    }
});