/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
/*define(['N/error'],
    function(error) {
        function pageInit(context) {
            if (context.mode !== 'create' & context.mode !== 'copy')
                return;

            var currentRecord = context.currentRecord;
			//alert(new Date());
            currentRecord.setValue({
                fieldId: 'custbody_hf_creation_date',
                value: new Date()
            });
        }
        return {
            pageInit: pageInit
        };
    });*/

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/currentRecord', 'N/runtime', 'N/log', 'N/error'], function(currentRecord, runtime, log, error) {
    function pageInit(context) {
        if (context.mode !== 'create' & context.mode !== 'copy')
            return;

        var currentRecord = context.currentRecord;
        currentRecord.setValue({
            fieldId: 'custbody_hf_creation_date',
            value: new Date()
        });
    }
// Below save function is related to CHN-490 (https://helpdesk.beautyhealth.com/itil/changes/490)
    function saveRecord(scriptContext) {
        var record = scriptContext.currentRecord;
        var createdFrom = record.getValue({fieldId: 'custbody_hf_created_from'});
        var executionContext = runtime.executionContext;

        // Check if the vendor bill is standalone and is created manually
        if (!createdFrom && executionContext === 'USERINTERFACE') { 
          record.setValue({
                fieldId: 'custbody_hf_indirect_purchase',
                value: true
            });
        }

        // Return true to continue with the save, or false to prevent it
        return true;
    }

    return {
        pageInit: pageInit,
        saveRecord: saveRecord
    };
});
