/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */

define(['N/record', 'N/search', 'N/runtime'], function(record, search, runtime) {
    try {
    function beforeSubmit(context) {
        if(context.type == 'create' || context.type == 'edit'){
        //if(context.type == 'print')
        var salesOrderObj = context.newRecord;
        var Terms = salesOrderObj.getValue('terms')
		var Subsidiary = salesOrderObj.getValue('subsidiary')
        log.debug('Terms', Terms);
		var scriptObj = runtime.getCurrentScript()
        var ger_subsidiary = scriptObj.getParameter({
			name: 'custscript_subsidiary_parameter'
		})
		log.debug('ger_subsidiary' , ger_subsidiary);
        if ( Terms == 60  && Subsidiary == ger_subsidiary ) {
            var print = salesOrderObj.setValue({
                fieldId: 'customform',
                value: 494,// put new pdf id
                ignoreFieldChange: true
            });
            log.debug("print", print);

        }
    }
}
} catch(error) {
    log.debug('Error in before Submit ' + error.message, error)
}
    return {
        beforeSubmit: beforeSubmit
    }
});
