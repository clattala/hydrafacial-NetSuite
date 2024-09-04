/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/record'], function (record) {
    function onAction(scriptContext) {
      try {
        
      
        var newRecord = scriptContext.newRecord;
        var billId = newRecord.id;
      
        var vendorBill = record.load({
            type: 'vendorbill',
            id: billId,
            isDynamic: true
        });
        var expenseCount = vendorBill.getLineCount({
          sublistId: "expense"
        });
      	var expenseCheck = "NO"
        
      	if(expenseCount>0){
          expenseCheck = "YES"
        }
      return expenseCheck
         } catch (error) {
       log.debug('error in onaction ' +error.message , error) 
      }
      }
     
    
    return {
        onAction: onAction
    }
});