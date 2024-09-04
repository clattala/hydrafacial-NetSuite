/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/record'], function (record) {

    function beforeSubmit(context) {
        var rec = context.newRecord;
        var duedate = rec.getValue({
            fieldId: "duedate"
        });
        var linecount = rec.getLineCount({
            sublistId: "item"
        });
        log.debug("duedate",duedate);
        if (duedate) {
            for (var i = 0; i < linecount; i++) {
                var expecteddate = rec.getSublistValue({
                    sublistId: "item",
                    fieldId: "expectedreceiptdate",
                    line: i
                });
                log.debug("expdate",expecteddate);
                var expdate = expecteddate.getTime();
                var duedatetime = duedate.getTime();
                log.debug("exp date", expdate + "duedate" + duedatetime);
                if (expdate != null && expdate == duedatetime) {
                    log.debug("In")
                    rec.setSublistValue({
                        sublistId: "item",
                        fieldId: "expectedreceiptdate",
                        line: i,
                        value: duedate
                    })
                }else{
                    rec.setSublistValue({
                        sublistId: "item",
                        fieldId: "expectedreceiptdate",
                        line: i,
                        value: expecteddate
                    })
                }

            }
        }
    }

    return {
        beforeSubmit: beforeSubmit
    }
});