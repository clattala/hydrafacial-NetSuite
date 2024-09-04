/*************************************************************
JIRA  ID      : https://hydrafacial.atlassian.net/browse/NGO-6255
Script Name   : hf_show_warning_message_on_view_mode.js
Date          : 01/24/2023
Author        : Ayush Gehalot
UpdatedBy     :
Description   : Show Financial Hold warning on view
*************************************************************/

/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType UserEventScript
 * @description Shows warning message on Customer when credit limit is true.
 */

define(['N/ui/serverWidget', 'N/runtime', "N/ui/message"],
function(serverWidget, runtime, message) {
	let beforeLoad = (context) => {
		let newRecord = context.newRecord;
        let subsidiary = newRecord.getValue('subsidiary')
        log.debug('subsidiary',subsidiary)
		let email = 'credit@hydrafacial.com'
        if(subsidiary=='11'){ //UK
          email= 'AR-UK@hydrafacial.com'
        }else if(subsidiary=='6'){
          email = 'AR-DE@hydrafacial.com'
        }
        let creditHold = newRecord.getValue('creditholdoverride');
		log.debug('creditHold', creditHold);
		if ((context.type === 'view' || context.type === 'edit') && runtime.executionContext === runtime.ContextType.USER_INTERFACE && (creditHold == 'ON')) {
          	context.form.addPageInitMessage({ title:"Financial Hold Warning", message:"The customer account has been placed on a financial hold; please contact the Account Reconciliation Team –" + email, type:message.Type.WARNING });
		}
	}
	return {
		beforeLoad: beforeLoad
	}
});