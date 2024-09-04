/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
 define(['N/url','N/record','N/currentRecord'],
 /**
  * @param{dataset} dataset
  */
 function(url,record,currentRecord) {
     
     /**
      * Function to be executed after page is initialized.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
      *
      * @since 2015.2
      */
     function pageInit(context) {
 
     }
 
     function CallforSuitelet(){
 
         var recObj = currentRecord.get();
         var recId  = recObj.id;
 
             log.debug('record-Id', recId);
 
         var recType = recObj.type
             
             log.debug('reccord-Type', recType);
         
         var rec = record.load({type: recType, id: recId, isDynamic: true });
 
         var tran_id = rec.getValue({fieldId:'tranid'});
 
             log.debug('tranNo', tran_id);
 
         var suiteletURL = url.resolveScript({
                         
                         scriptId:       'customscript_3rp_hf_epi_03', 
                         deploymentId:   'customdeploy_3rp_hf_epi_03',  
                         params: {'recId':recId, 'recType':recType, 'tranNo': tran_id }
  
                         });
            
         //window.open(suiteletURL,'_self');
         
          window.open(suiteletURL,'_blank');
         
         }
 
     return {
         pageInit: pageInit,
         CallforSuitelet : CallforSuitelet
     };
     
 });
 