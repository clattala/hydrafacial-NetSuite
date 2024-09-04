/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/search'], function (search) {

    function beforeSubmit(context) {
        try {
            var trnsfrOrdID = context.newRecord;
            log.debug("TO Order ID::", trnsfrOrdID);
            var custID = trnsfrOrdID.getValue({
                fieldId: 'custbody_hf_transfer_customer'
            });
            var custLookup = search.lookupFields({
                type: search.Type.CUSTOMER,
                id: custID,
                columns: ['custentity_hf_class']
            });
            log.debug("Cust Region ID::", custLookup);
            var regionID = custLookup.custentity_hf_class[0].value;
            log.debug("Lookup Region ID::", regionID);
            trnsfrOrdID.setValue({
                fieldId: 'class',
                value: regionID
            })
            var itemCount = trnsfrOrdID.getLineCount({
                sublistId: "item"
            });
            for (var i = 0; i < itemCount; i++) {
                trnsfrOrdID.setSublistValue({
                    sublistId: "item",
                    fieldId: "class",
                    line: i,
                    value: regionID,
                    ignoreFieldChange: true
                });
            }
        } catch (e) {
            log.error('Error: ' + e);
        }
    }
    return {
        beforeSubmit: beforeSubmit
    }
});
