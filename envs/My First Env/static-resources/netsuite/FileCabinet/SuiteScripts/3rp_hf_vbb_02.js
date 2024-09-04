/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
 define(['N/url','N/currentRecord'],
 /**
  * @param{dataset} dataset
  */
 function(url,currentRecord) {
     
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
 
     function CallforSuiteletOne(){
 
         var recObj = currentRecord.get();
         var recId = recObj.id;
         var recType = recObj.type
         
         var suiteletURL = url.resolveScript({
                         
                         scriptId:       'customscript_3rp_hf_vbb_03', 
                         deploymentId:   'customdeploy_3rp_hf_vbb_03',  
                         params: {'recId':recId, 'recType':recType, 'recButton': 1}
  
                         });
             
             window.open(suiteletURL,'_self');
         
        }

        function CallforSuiteletTwo(){
 
            var recObj = currentRecord.get();
            var recId = recObj.id;
            var recType = recObj.type
            
            var suiteletURL = url.resolveScript({
                            
                            scriptId:       'customscript_3rp_hf_vbb_03', 
                            deploymentId:   'customdeploy_3rp_hf_vbb_03',  
                            params: {'recId':recId, 'recType':recType,'recButton': 2}
     
                            });
                
            window.open(suiteletURL,'_self');
            
           }

     return {
         pageInit: pageInit,
         CallforSuiteletOne : CallforSuiteletOne,
         CallforSuiteletTwo : CallforSuiteletTwo,

     };
     
 });
 