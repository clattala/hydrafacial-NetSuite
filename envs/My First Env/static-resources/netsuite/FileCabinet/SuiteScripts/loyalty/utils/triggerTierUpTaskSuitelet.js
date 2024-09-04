/**
 * triggerTierUpTaskSuitelet.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName HF | Loyalty - Trigger Tier Up
 * @NScriptType Suitelet
 * @NApiVersion 2.1
 *
 * Start scheduled and mr tasks from a deployment.
 */
define(["require", "exports", "N/error", "N/log", "N/task"], function (require, exports, err, log, task) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRequest = void 0;
    function onRequest(context) {
        if (context.request.method == 'GET') {
            const parameters = context.request.parameters;
            const customerId = Number(parameters.custscript_hf_call_customer);
            log.debug(`executing task`, `customerId ${customerId}`);
            if (customerId < 1)
                throw err.create({ name: 'ERR_MISSING_PARAMETERS', message: `You are missing required parameters.` });
            const scriptTask = task.create({ taskType: task.TaskType.MAP_REDUCE });
            scriptTask.scriptId = 'customscript_hf_trv_update_pricelevel';
            scriptTask.params = { 'custscript_hf_pricetier_customer': customerId, custscript_hf_pricetier_results: 10 };
            try {
                scriptTask.submit();
                context.response.write({ output: 'success' });
            }
            catch (e) {
                if (e.name.includes('FAILED_TO_SUBMIT_JOB_REQUEST'))
                    return context.response.write({ output: 'This process is already running. Please wait until it completes to start it again.' });
                else
                    return context.response.write({ output: 'Error trying to submit script: ' + JSON.stringify(e) });
            }
        }
    }
    exports.onRequest = onRequest;
});
