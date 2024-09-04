/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/redirect'], redirect => {

    function beforeLoad(context) {
        let { request, newRecord } = context
        let params = request.parameters

        if (params.bool) {
            newRecord.setValue({
                fieldId: 'custevent_from_fullio_cal',
                value: true
            })
        }
    }

    function afterSubmit(context) {
        let bool = context.newRecord.getValue({ fieldId: 'custevent_from_fullio_cal' })
        if (bool) {
            redirect.redirect({
                url: '/app/center/card.nl?sc=-29&whence='
            })
        }
    }

    return {
        beforeLoad,
        afterSubmit
    };
});
