/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/runtime'], function (runtime) {

    function beforeLoad(context) {
        if (context.type == context.UserEventType.CREATE) {
            var recObj = context.newRecord;

            var todayDate = new Date();
            var newDate = addDays(todayDate, 60);
            log.debug('new date', newDate);
            recObj.setValue('trandate', newDate)
        }
    }

    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    function beforeSubmit(context) {

        if (context.type == context.UserEventType.CREATE) {
            var recObj = context.newRecord;
            var userId = runtime.getCurrentUser().name;
            log.debug('userId', userId);

            recObj.setText('custbody_hf_order_creator', userId);
        }


    }

    function afterSubmit(context) {

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
