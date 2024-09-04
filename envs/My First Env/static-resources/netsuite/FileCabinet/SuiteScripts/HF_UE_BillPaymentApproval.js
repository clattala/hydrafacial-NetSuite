/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record','N/search'],
    function (record,search) {
   
  		function afterSubmit(context){
          try{
          if(context.type=='xedit'){
            log.debug('running ', context.type)
            var paymentRef = context.newRecord.getValue('custrecord_jpmc_tran_ref')
            log.debug('after submit paymentRef' , paymentRef)
          	var jpMorganRecord = record.load({
              type : context.newRecord.type,
              id : context.newRecord.id
            });
            log.debug('jpMorganRecord '  + context.newRecord.id , jpMorganRecord)
            var billPaymentRef= jpMorganRecord.getValue('custrecord_jpmc_tran_ref')
            log.debug('billPaymentRef' , billPaymentRef)
            var index = billPaymentRef.indexOf('bill-payment-');
            log.debug('index' , index)
            if(index!=-1){
             	var billPaymentDetails = billPaymentRef.split('bill-payment-')
                var billPaymentId = billPaymentDetails[1]
                var billPaymentRecord = record.load({
                  type : record.Type.VENDOR_PAYMENT,
                  id : Number(billPaymentId)
                })
                log.debug('billPaymentRecord' , billPaymentRecord)
              var approvalStatus = billPaymentRecord.getValue('approvalstatus')
              log.debug('approvalStatus', approvalStatus)
              if(approvalStatus!='2'){
                log.debug('approving the payment')
                billPaymentRecord.setValue('approvalstatus' ,2)
                billPaymentRecord.save();
              }
            }
            }
          }catch(error){
            log.debug('error in afterSubmit ' + error.message , error)
          }
        }
        return {
        
            afterSubmit: afterSubmit
        }
    }
);