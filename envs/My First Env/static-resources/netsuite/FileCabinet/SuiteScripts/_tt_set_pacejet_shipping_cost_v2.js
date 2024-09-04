/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define(["N/currentRecord", 'N/runtime'], function (currentRecord, runtime) {


    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {


        if (scriptContext.fieldId == 'custbody_tt_pj_shipping_cost') {

            log.debug("Update Shipping Cost 2.0", "custbody_tt_pj_shipping_cost");
            

            try {

                var rec = currentRecord.get();
                var tt_shippingCost = rec.getValue({ fieldId: 'custbody_tt_pj_shipping_cost' });


                log.debug("Update tt_shippingCost", tt_shippingCost);

                scriptContext.currentRecord.setValue({
                    fieldId: 'shippingcost',
                    value: tt_shippingCost
                });


            } catch (e) {

                var errorObj = {
                    name: e.name,
                    message: e.message,
                    stack: e.stack
                };

                log.error({
                    title: 'Field Changed',
                    details: errorObj
                });
            }
        }
    }



    return {
        fieldChanged: fieldChanged
    };

});
