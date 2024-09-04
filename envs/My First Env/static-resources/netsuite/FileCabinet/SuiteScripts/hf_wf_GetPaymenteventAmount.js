/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/record'], function (record) {
    function onAction(scriptContext) {
        var newRecord = scriptContext.newRecord;
        var soid = newRecord.id;
        var salesord = record.load({
            type: record.Type.SALES_ORDER,
            id: soid,
            isDynamic: true
        });
        var eventcount = salesord.getLineCount({
          sublistId: "paymentevent"
        });
      var paymenteventamount = 0;
        if(eventcount > 0){
         paymenteventamount = salesord.getSublistValue({
            sublistId: "paymentevent",
            fieldId: "amount",
            line: 0
        });
        }
        var totalamt = salesord.getValue({
            fieldId: "total"
        });
        var amount = "FAILED";
        if(paymenteventamount == totalamt){
            amount = "PASSED";
        }
        log.debug("Event amount :", paymenteventamount + "Result :" + amount);
        return amount;
    }
    return {
        onAction: onAction
    }
});