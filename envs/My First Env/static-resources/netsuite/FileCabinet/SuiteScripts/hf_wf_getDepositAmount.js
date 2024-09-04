/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/search'], function(search) {
    function onAction(scriptContext){
        log.debug({
            title: 'Start Script'
        });
        var newRecord = scriptContext.newRecord;
      var soid = newRecord.id;
var customerdepositSearchObj = search.create({
   type: "customerdeposit",
   filters:
   [
      ["type","anyof","CustDep"], 
      "AND", 
      ["salesorder","anyof",soid]
   ],
   columns:
   [
      search.createColumn({name: "amount", label: "Amount"}),
      search.createColumn({name: "fxamount", label: "Amount (Foreign Currency)"})
   ]
});
var searchResultCount = customerdepositSearchObj.runPaged().count;
      var amount = 0;
log.debug("customerdepositSearchObj result count",searchResultCount);
customerdepositSearchObj.run().each(function(result){
   // .run().each has a limit of 4,000 results
    amount = result.getValue({name:"fxamount"});
   return true;
});
        return amount;
    }
    return {
        onAction: onAction
    }
});