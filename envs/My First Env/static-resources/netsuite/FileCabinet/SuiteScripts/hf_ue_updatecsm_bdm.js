/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
         * FreshService :  SR-17028 
         * Description	: Added the logic to update the Customers based on the mapping table when the RTS is changed
         * Script Owner : Pavan Kaleru - 3/20/2024
         *********************************************************************************
       
 */
define(['N/record', 'N/task', 'N/runtime', 'N/redirect', 'N/ui/message'], function(record, task, runtime, redirect, message) {
    function beforeLoad(context) {
        try {
            if (context.type == 'view') {
                var parameters = context.request.parameters;
                log.debug('parameters', parameters)
                var showMessage = parameters.showmessage
                log.debug('showMessage', showMessage)
                if (showMessage == 'T') {
                    context.form.addPageInitMessage({
                        type: message.Type.INFORMATION,
                        message: 'A schedule script is started to update the CSM/BDM on the Customer record , We will update you once its done ',
                        duration: 7000
                    });

                }

            }
        } catch (error) {
            log.debug('error in beforeLoad', error.message)

        }
    }

    function beforeSubmit(context) {
        try {
           log.debug('context', context.type)
            if (context.type == 'edit' || context.type=='xedit') {
                var oldRecord = context.oldRecord
                var newRecord = context.newRecord
                
                var postCode = newRecord.getValue('custrecord_hf_csm_bdm_postcode')
                var subsidiary = newRecord.getValue('custrecord_hf_csm_bdm_subsidiary')
              //SR-17028 Start
				var arr_fieldsToCheck = ['custrecord_hf_csm','custrecord_hf_bdm', 'custrecord_hf_csm_bdm_credit_controller' , 'custrecord_hf_credit_controller_corporat', 'custrecord_hf_rsd' , 'custrecord_hf_emea_ibdm' , 'custrecord_hf_rts']
             //SR-17028 End  
              for(var i=0;i<arr_fieldsToCheck.length; i++){
					var fieldId = arr_fieldsToCheck[i];
					var newValue = newRecord.getValue(fieldId)
					var oldValue = oldRecord.getValue(fieldId)
					if(newValue!=oldValue && newValue){
						log.debug('fieldId ' + fieldId)
                        newRecord.setValue('custrecord_hf_update_customers', true);
						//callMapReduce(newRecord, postCode, subsidiary)
                        return;
					}
				}				
             
            }
        } catch (error) {
            log.debug('error in beforeSubmit ' + error.message, error)
        }

    }

    function callMapReduce(newRecord, postCode, subsidiary) {
        var scriptTask = task.create({
            taskType: task.TaskType.MAP_REDUCE,
            scriptId: 'customscript_mr_update_csm_bdm_customer',

        });

        log.debug('runtime', runtime)

        var currentUser = runtime.getCurrentUser().id
        log.debug('currentUser', currentUser)
        // Set input parameters for the MapReduce script
        scriptTask.params = {
            
            custscript_hf_send_email: currentUser,
            custscript_hf_post_code: postCode,
            custscript_hf_cust_subsidiary: subsidiary
            // Add any additional parameters as needed
        };
        log.debug('scriptTask', scriptTask)
        // Submit the MapReduce script task
        var scriptTaskId = scriptTask.submit();
        log.debug('scriptTaskId', scriptTaskId)
        if (scriptTaskId) {
            redirect.toRecord({
                type: newRecord.type,
                id: newRecord.id,
                parameters: {
                    'showmessage': 'T'
                }
            });
        }
    }


    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit
    };
});