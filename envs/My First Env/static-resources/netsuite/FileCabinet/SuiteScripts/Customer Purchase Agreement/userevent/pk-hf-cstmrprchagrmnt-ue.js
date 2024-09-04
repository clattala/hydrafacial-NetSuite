/**
* @NApiVersion 2.1
* @NScriptType UserEventScript
*/

/**
 * user event script to display a button as a part of custom solution for printing customer purchase agreement
 * @author sahil v <emailsahilv@gmail.com>
 */

define([
    'N/record'
], function (
    record
) {
    const beforeLoad = context => {
        try {
            const { newRecord, form } = context;
            const { type, id } = newRecord;

            switch (type) {
                //case record.Type.SALES_ORDER:
                case record.Type.ESTIMATE:
                    // const subsidiary = newRecord.getValue({ fieldId: 'subsidiary' });
                    if (
                        context.type !== context.UserEventType.DELETE
                    ) {
                        form.clientScriptModulePath = '../client/pk-hf-cstmrprchagrmnt-cs-adtl.js'
                    }

                    if (
                        context.type === context.UserEventType.VIEW
                    ) {
                        form
                            .addButton({
                                id: "custpage_btn_cstmrpurchagrmnt",
                                label: "Customer Purchase Agreement",
                                functionName: 'printCstmrPrchAgrmnt'
                            });
                    }
                    break;
                default:
                    break;
            }

        } catch (E) {
            log.error("beforeLoad:Error:", E);
        }
    }

    return {
        beforeLoad
    };
})
