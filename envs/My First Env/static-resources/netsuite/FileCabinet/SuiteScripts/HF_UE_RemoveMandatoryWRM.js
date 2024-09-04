/**
* @NApiVersion 2.1
* @NScriptType UserEventScript
*/

/**
 * * Script Name : 
	 * Author : Pavan Kaleru
	 * Date : 22 Feb 2023
	 * Purpose : To Make the WRM fields mandatory as the original script which created the fields is locked 
	 * JIRA : NGO-6590 need to find custom field id on warranty claim
	 *
	 *
 * 
 */

define([
    'N/record'
    , 'N/ui/serverWidget'
    , 'N/runtime'
], function (
    record
    , serverWidget
    , runtime
) {

    
    function beforeLoad(context){
		try{
      	var newRecord = context.newRecord;
      //failureReasonField.isMandatory = false;
		var form = context.form
		log.debug('form' , form)
            var failureReasonField = form.getField('custpage_wrm_failurereason')
            log.debug('failureReasonField',failureReasonField)
      		failureReasonField.isMandatory = false;
      		var actionField = form.getField('custpage_wrm_action');
      		actionField.isMandatory = false
		}catch(error){
			log.error('Error in beforeLoad ' + error.message, error);
		}

    }

    return {
        beforeLoad,
    };
})