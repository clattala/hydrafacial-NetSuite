/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
//=========================================================================================================================
//Date                     Version                Change History
//=========================================================================================================================
//06/03/2024                1.1                   CHN-533-Client Script to auto-populate Account and Payment Option for 
//                                                UK Orders and Prepaid Terms
//========================================================================================================================= 
*/
define(["N/record", "N/search", "N/log"], function (record, search, log) {

  function getTermsFromSalesOrder(salesOrderId) {
    if (!salesOrderId) {
      return null;
    }
    var salesOrderLookup = search.lookupFields({
      type: search.Type.SALES_ORDER,
      id: salesOrderId,
      columns: ['terms']
    });
    return salesOrderLookup.terms[0].value;
  }

  function pageInit(scriptContext) {
    var rec = scriptContext.currentRecord;
    var subsidiary = rec.getValue({ fieldId: "subsidiary" });
    var salesOrderId = rec.getValue({ fieldId: "salesorder" });
    var terms = getTermsFromSalesOrder(salesOrderId);

    if (subsidiary == '11' && terms == '60') {	// 60 = Prepaid
      log.debug("within if statement");
      rec.setValue({ fieldId: "undepfunds", value: "F", ignoreFieldChange: false });
      rec.setValue({ fieldId: "account", value: 1523, ignoreFieldChange: false });
      rec.setValue({ fieldId: "paymentoption", value: 1, ignoreFieldChange: false });
      log.debug("PageInit", 'Within PageInit Executed');
    }
    return true;
  }

  function postSourcing(scriptContext) {
    var rec = scriptContext.currentRecord;
    var subsidiary = rec.getValue({ fieldId: "subsidiary" });
    var salesOrderId = rec.getValue({ fieldId: "salesorder" });
    var terms = getTermsFromSalesOrder(salesOrderId);

    setTimeout(function() {
      if (subsidiary == '11' && terms == '60') {	// 60 = Prepaid
        log.debug("within if statement post sourcing");
        rec.setValue({ fieldId: "undepfunds", value: "F", ignoreFieldChange: false });
        rec.setValue({ fieldId: "account", value: 1523, ignoreFieldChange: false });
        log.debug("PostSourcing", 'Within PostSourcing Executed');
      }
    }, 2000);

    return true;    
  }

  function fieldChanged(scriptContext) {
    var rec = scriptContext.currentRecord;
    var fieldId = scriptContext.fieldId;
    log.debug('Field Id', fieldId + ' : ' + rec.getValue({ fieldId: fieldId }));
    if (fieldId == 'undepfunds') {
      var funds = rec.getValue({
        fieldId: "undepfunds",
      });
      log.debug('Funds', 'Funds value is ' + funds);
      if (funds != 'F') {
        log.debug('Funds', 'Funds value set');
        rec.setValue({
          fieldId: "undepfunds",
          value: "F",
          ignoreFieldChange: false,
        });
        rec.setValue({
          fieldId: "account",
          value: 1523,
          ignoreFieldChange: false,
        });
        log.debug('Field Changed', "within field changed executed");
      }
    }
    return true;
  }

  return {
    pageInit: pageInit,
    postSourcing: postSourcing,
  //  fieldChanged: fieldChanged
  };
});
