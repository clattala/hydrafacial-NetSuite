/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime'], function (runtime) {
    function beforeLoad(context) {

        var userRole = runtime.getCurrentUser().role;
      	log.debug('userRole' , userRole)
        if (context.type == context.UserEventType.VIEW ) {
          //&& (userRole == 1064 || userRole == 1236 || userRole == 1235 || userRole == 1222))
            var currentForm = context.form;
            var custID = context.newRecord.id;
            log.debug("Customer ID : ", custID);
            currentForm.clientScriptFileId = 209231;
            currentForm.addButton({
                id: 'custpage_updatecustfields',
                label: 'Update Financial Fields',
                functionName: 'CallforSuitelet(' + custID + ')'
            });
        }
    }
    return {
        beforeLoad: beforeLoad
    }
});