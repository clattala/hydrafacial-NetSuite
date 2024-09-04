/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
 define(['N/currentRecord'], function(currentRecord) {
    function validateLine(context) {
      var currentRecord = context.currentRecord;
        var sublistName = context.sublistId;
        if (sublistName === 'inventory'){
            if (currentRecord.getCurrentSublistValue({
                sublistId: sublistName,
                fieldId: 'unitcost'
            }) === 0){
                alert('Estimate Unit Cost cannot be 0');
                return false;
            }
        }
        return true;
    }
  
    return {
      validateLine: validateLine
    };
  });
  