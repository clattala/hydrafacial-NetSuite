/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/record', 'N/ui/message', "N/runtime", "N/redirect"],
    /**
   * @param{record} record
   */
    function (search, record, message, runtime, redirect) {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        function afterSubmit(context) {


            if ((context.type == 'create' || context.type == 'edit')) {

                try{
                var objUser = runtime.getCurrentUser().role;
                var recObj = context.newRecord;
                // var sub_id   = order.getValue({fieldId:'subsidiary'}); 
                var recId = recObj.id;

                log.debug('record-Id', recId);

                var recType = recObj.type
                log.debug('record-recType', recType);

                var soObj = record.load({
                    type: recType,
                    id: recId
                });
                var isItemGroupChecked = soObj.getValue('custbody_hf_item_group_process');
                log.debug('isItemGroupChecked', isItemGroupChecked);
                if (isItemGroupChecked) {
                    var soObjCount = soObj.getLineCount({
                        sublistId: 'item'
                    });
                    log.debug('soObjCount', soObjCount);
                    for (var i = 0; i < soObjCount; i++) {
                        if (i >= 1) {
                            log.debug("itemgroupSearchObj result count in i", soObjCount);

                            var itemName = soObj.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'rate',
                                line: i,
                                value: 0
                            });
                        }
                    }
                    soObj.save();
                }
            }
            catch(e)
            {
                log.debug('error'+ e);

            }
            }

        }

        return {
            afterSubmit: afterSubmit
        };

    });
