/**
 * taskGeneratorSuitelet.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName HF | Loyalty - Task Generator
 * @NScriptType Suitelet
 * @NApiVersion 2.1
 *
 * Start scheduled and mr tasks from a deployment.
 */
define(["require", "exports", "N/error", "N/log", "N/redirect", "N/runtime", "N/task"], function (require, exports, err, log, redirect, runtime, task) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRequest = void 0;
    function onRequest(context) {
        if (context.request.method == 'GET') {
            const scriptID = runtime.getCurrentScript().getParameter({ name: 'custscript_hf_task_scriptid' });
            const scriptDeployment = runtime.getCurrentScript().getParameter({ name: 'custscript_hf_task_scriptdeployment' });
            const taskType = runtime.getCurrentScript().getParameter({ name: 'custscript_hf_task_tasktype' });
            const scriptInternalId = runtime.getCurrentScript().getParameter({ name: 'custscript_hf_task_scriptinternalid' });
            const deploymentInternalId = runtime.getCurrentScript().getParameter({ name: 'custscript_hf_task_deploymentinternalid' });
            log.debug(`executing task`, `script ${scriptID} deployment ${scriptDeployment}`);
            if (scriptID.length < 1 || scriptDeployment.length < 1)
                throw err.create({ name: 'ERR_MISSING_PARAMETERS', message: `You are missing required parameters.` });
            const taskTypeLookup = getTaskType(taskType);
            if (taskTypeLookup) {
                //@ts-ignore
                const scriptTask = task.create({ taskType: taskTypeLookup });
                scriptTask.scriptId = scriptID;
                scriptTask.deploymentId = scriptDeployment;
                try {
                    scriptTask.submit();
                    // redirect to status page //
                    if (taskType == 'MAP_REDUCE')
                        redirect.redirect({ url: `/app/common/scripting/mapreducescriptstatus.nl?sortcol=dcreated&sortdir=DESC&date=TODAY&scripttype=${scriptInternalId}&primarykey=${deploymentInternalId}` });
                    else
                        redirect.redirect({ url: `/app/common/scripting/scriptstatus.nl?sortcol=dcreated&sortdir=DESC&date=TODAY&scripttype=${scriptInternalId}&primarykey=${deploymentInternalId}` });
                }
                catch (e) {
                    if (e.name.includes('FAILED_TO_SUBMIT_JOB_REQUEST'))
                        return context.response.write({ output: 'This process is already running. Please wait until it completes to start it again.' });
                    else
                        return context.response.write({ output: 'Error trying to submit script: ' + JSON.stringify(e) });
                }
            }
        }
    }
    exports.onRequest = onRequest;
    function getTaskType(taskType) {
        switch (taskType) {
            case 'SCHEDULED_SCRIPT':
                return task.TaskType.SCHEDULED_SCRIPT;
            case 'MAP_REDUCE':
                return task.TaskType.MAP_REDUCE;
        }
    }
});
