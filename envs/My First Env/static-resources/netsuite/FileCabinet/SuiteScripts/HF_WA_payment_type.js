/**
 *@NApiVersion 2.x
 *@NScriptType WorkflowActionScript
 */
define(['N/record', 'N/runtime', 'N/log'], function(record, runtime, log) {

    function onAction(context) {
        var salesOrder = context.newRecord;
        var customerId = salesOrder.getValue('entity');

        try {
            var customerRecord = record.load({
                type: record.Type.CUSTOMER,
                id: customerId
            });
            var customerShipType = customerRecord.getValue('custentity_hf_shiptype');
            salesOrder.setValue('custbody_hf_ship_pymt_type', customerShipType);
        } catch(e) {
            log.error({
                title: e.name,
                details: e.message
            });
            throw e;
        }
    }

    return {
        onAction : onAction
    };
});
