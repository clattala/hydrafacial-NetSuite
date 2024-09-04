/*************************************************************
JIRA  ID      : NGO-4193 Sale Revenue Report
Script Name   : HF | Execute Script From Record
Date          : 01/01/2023
Author        : Ayush Gehalot
UpdatedBy     :
Description   : Execute Map Reduce script for Sales Revenue Report for the given 
*************************************************************/

/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/task'], function(record, task) {

    function afterSubmit(context) {
        if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT)
            return;

        var customerRecord = context.newRecord;
        if(customerRecord.getValue('custrecord_run_report_now') == false)
            return;

        var startPeriod = customerRecord.getValue('custrecord_start_period');
        var endPeriod = customerRecord.getValue('custrecord_end_period');
        var scriptId = customerRecord.getValue('custrecord_script_id');
        var deploymentId = customerRecord.getValue('custrecord_script_deployment_id');
log.debug("scriptId", scriptId);        log.debug("deploymentId", deploymentId);
        var mrTask = task.create({
            taskType: task.TaskType.MAP_REDUCE,
            scriptId: scriptId,
            deploymentId: deploymentId,
            params: { "custscript_Period": startPeriod, "custscript_start_period": startPeriod, "custscript_end_period": endPeriod }
        });

        try{
          var mrTaskId = mrTask.submit();
          var taskStatus = task.checkStatus(mrTaskId);
          log.debug("taskStatus", taskStatus);
        }
      catch(e){
        log.debug("taskStatus", e);
      }
    }
    return {
        afterSubmit: afterSubmit
    };
});