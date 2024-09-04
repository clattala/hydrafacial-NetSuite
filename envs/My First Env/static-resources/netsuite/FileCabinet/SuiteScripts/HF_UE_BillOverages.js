/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/error'],
    function (record, search, error) {
  
  		function beforeLoad(context) {
        //log.debug('beforeload is running', context)
        var functionName = 'beforeLoad'

        if (context.type == 'create') {
            var vendorBill = context.newRecord
            var createdFrom = vendorBill.getValue('podocnum');
            log.debug(functionName, 'createdFrom ' + createdFrom);
            if (createdFrom) {
                vendorBill.setValue('custbody_hf_created_from', createdFrom)
            }
        }
    }


        function beforeSubmit(context) {
            var title = " beforeSubmit() ";
            try {
                log.debug('after submit',"runnnnnnnnnn")
                if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT || context.type == context.UserEventType.COPY) {

                    var vendorBill = context.newRecord;
					var createdFrom = vendorBill.getValue('custbody_hf_created_from')
                    var onBehalfOf = vendorBill.getValue('custbody_hf_on_behalf_of');
					if(createdFrom && onBehalfOf){
						var vendorbillTotal = vendorBill.getValue('usertotal');
                      log.debug('vendorbillTotal',vendorbillTotal)
						var purchaseOrderTotal = search.lookupFields({
                            type: 'transaction',
                            id: createdFrom,
                            columns: ['total']
                        }).total
                         log.debug('purchaseOrderTotal',purchaseOrderTotal)
                      var otherBillsAmount =  0;
                      log.debug('otherBillsAmount' , otherBillsAmount)
						if(context.type=='create'){
                          otherBillsAmount = getBillAmount(createdFrom)
                        }else{
                          otherBillsAmount = getBillAmount(createdFrom, vendorBill.id)
                          log.debug('otherBillsAmount', otherBillsAmount)
                        }
                                                vendorbillTotal = vendorbillTotal + parseFloat(otherBillsAmount)

                      log.debug('vendorbillTotal ' +  vendorbillTotal  , ' purchaseOrderTotal ' + purchaseOrderTotal)
						if(purchaseOrderTotal<vendorbillTotal){
							var myCustomError = error.create({
                        name: 'GREATER_THAN_PO_AMOUNT',
                        message: "Vendor bill's amount is greater than Purchase Order Amount , Please check",
                        notifyOff: true
                    });

                    throw myCustomError;
						}
                        
                       
					}
                  }
            } catch (e) {
                log.error("ERROR IN" + title, e)
              if (e.name == "GREATER_THAN_PO_AMOUNT"){
                throw e.message;
              }

        
            }
        }
  		
  		function getBillAmount(purchaseOrderId,billInternalId){
          var arr_filters = []
          arr_filters.push(search.createFilter({
                    name: 'type',
                    operator: search.Operator.ANYOF,
                    values: "VendBill"
                }));
          arr_filters.push(search.createFilter({
                    name: 'custbody_hf_created_from',
                    operator: search.Operator.ANYOF,
                    values: purchaseOrderId
                }));
          arr_filters.push(search.createFilter({
                    name: 'mainline',
                    operator: search.Operator.IS,
                    values: ['T']
                }));
          if(billInternalId){
             arr_filters.push(search.createFilter({
                    name: 'internalidnumber',
                    operator: search.Operator.NOTEQUALTO,
                    values: billInternalId
                }));
          }
          
          log.debug('arr_filters',arr_filters)
          var vendorbillSearchObj = search.create({
   type: "vendorbill",
   filters:arr_filters,
   columns:
   [
      search.createColumn({
         name: "amount",
         summary: "SUM",
         label: "Amount"
      }),
     search.createColumn({
         name: "internalid",
         summary: "COUNT",
         label: "Internal ID"
      }),
   ]
   
});
var searchResultCount = vendorbillSearchObj.runPaged().count;
log.debug("vendorbillSearchObj result count",searchResultCount);
          
/*vendorbillSearchObj.id="customsearch1673421241900";
vendorbillSearchObj.title="createdrrom search (copy)";
var newSearchId = vendorbillSearchObj.save();*/

 var amountTotal = 0
vendorbillSearchObj.run().each(function(result){
  log.debug('result' , result)
   amountTotal = result.getValue({
         name: "amount",
         summary: "SUM",
         label: "Amount"
      })
  if(!amountTotal || amountTotal==""){
    log.debug('amount is not there')
    amountTotal = 0
  }
   return false;
});
          return amountTotal;

        }

        
        return {
          	beforeLoad : beforeLoad,
            beforeSubmit : beforeSubmit
        }
    }
);