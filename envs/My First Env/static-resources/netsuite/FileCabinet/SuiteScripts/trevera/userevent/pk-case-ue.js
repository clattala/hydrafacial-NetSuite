/**
* @NApiVersion 2.1
* @NScriptType UserEventScript
*/

/**
 * User event script for cases
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

    const beforeLoad = context => {
        try {
            const { newRecord, form } = context;
            const { type, id } = newRecord;

            switch (type) {
                case record.Type.SUPPORT_CASE:
                    if (
                        context.type === context.UserEventType.EDIT ||
                        context.type === context.UserEventType.CREATE ||
                        context.type === context.UserEventType.COPY
                    ) {
                        form.clientScriptModulePath = '../client/pk-case-cs-adtl.js'
                        const fieldCaseStatus = form.getField({ id: 'status' });
                        const optionsStatus = fieldCaseStatus.getSelectOptions();
                        const fieldDummyCaseStatus = form.addField({
                            id: 'custpage_case_status',
                            type: serverWidget.FieldType.SELECT,
                            label: 'Case Status'
                        });
                        fieldDummyCaseStatus.isMandatory = true;

                        // [{"value":"1","text":"Not Started"},{"value":"2","text":"In Progress"},{"value":"3","text":"Escalated"},{"value":"4","text":"Re-Opened"},{"value":"5","text":"Closed"}]
                        optionsStatus.forEach(o => {
                            const { value, text } = o;
                            if (value <= 3)
                                fieldDummyCaseStatus.addSelectOption({
                                    value
                                    , text
                                })
                        })

                        form.insertField({
                            field: fieldDummyCaseStatus,
                            nextfield: 'status'
                        })
                        log.debug('optionsStatus', optionsStatus);
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
        beforeLoad,
    };
})
