/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript

    ******************************************
    * CHN - 468
    * Ayush Ghehalot
    ******************************************
 */
define(['N/record', 'N/runtime'], function (record, runtime) {
  function onAction(scriptContext) {
    var currentScript = runtime.getCurrentScript();
    var currentState = currentScript.getParameter({ name: 'custscript_workflow_state' });
    var newRecord = scriptContext.newRecord;
    var soid = newRecord.id;
    var salesord = '';
    if (currentState == 'Enter & Submit For Approval') {
      salesord = record.load({
        type: record.Type.SALES_ORDER,
        id: soid,
        isDynamic: true
      });
    } else {
      salesord = newRecord;
    }

    var eventcount = salesord.getLineCount({
      sublistId: "paymentevent"
    });
    var terms = salesord.getValue({
      fieldId: "terms"
    });
    log.debug("Event count", eventcount);
    var paymenteventamount = 0;
    var status = "";
    if (eventcount > 0) {
      var type = salesord.getSublistValue({
        sublistId: "paymentevent",
        fieldId: "type",
        line: eventcount - 1
      });
      if (type == 'Authorization') {
        paymenteventamount = salesord.getSublistValue({
          sublistId: "paymentevent",
          fieldId: "amount",
          line: eventcount - 1
        });
        status = salesord.getSublistValue({
          sublistId: "paymentevent",
          fieldId: "holdreason",
          line: eventcount - 1
        });
      }
      log.debug("Status", status);
    }
    var totalamt = salesord.getValue({
      fieldId: "total"
    });

    var result = "";
    if (terms) {
      result = "Not Applicable";
    } else if (currentState == 'Enter & Submit For Approval') {
      result = "FAILED";
      result = paymentEventStatusAndAmountValidation(result, totalamt, paymenteventamount, status);
    } else if (currentState == 'Approved') {
      result = "FALSE";
      result = triggerValidation(result, totalamt, paymenteventamount, status, type);
    }
    return result;
  }

  function paymentEventStatusAndAmountValidation(result, totalamt, paymenteventamount, status) {
    if (paymenteventamount == totalamt && status == "Operation was successful") {
      result = "PASSED";
    }
    return result;
  }

  function triggerValidation(result, totalamt, paymenteventamount, status, type) {
    if (status == "Operation was successful" && type == 'Void Authorization') {
      result = "FALSE";
    } else if (paymenteventamount != totalamt && (status == "Operation was successful" && type == 'Authorization')) {
      result = "TRUE";
    }
    return result;
  }

  return {
    onAction: onAction
  }
});