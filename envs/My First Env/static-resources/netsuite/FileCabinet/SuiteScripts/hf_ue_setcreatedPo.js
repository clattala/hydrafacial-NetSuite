/**
 * 
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * 
 *
 Ticket name : NGO-6523 GRIR Issues - Over Receipt, Under Receipt, Duplicate Receipt
 Purpose : to set the PO creator which is later used to send the emails for GRIR/3way match 
 */
define(['N/runtime'], function(runtime) {

    function beforeSubmit(context) {
        //log.debug('beforeload is running', context)
      try {
        var functionName = 'beforeSubmit'
        log.debug('functioinName' , functionName)
        log.debug('context.type',context.type)
        if (context.type =='create' || context.type=='copy') {
            var purchaseOrder = context.newRecord
            var creator = runtime.getCurrentUser().id
            log.debug('creator', creator)
            purchaseOrder.setValue('custbody_hf_po_creator', creator)
            
        }
      } catch (error) {
        log.debug(functionName + error.message , error)
      }
        
    }

    return {
       // beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        //afterSubmit: afterSubmit
    }
});