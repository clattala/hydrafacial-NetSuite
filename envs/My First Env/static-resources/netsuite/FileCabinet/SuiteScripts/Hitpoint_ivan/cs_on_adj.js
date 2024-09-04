/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/error','N/search','N/record', 'N/http', 'N/https',],
 /**
 * @param{error} error
 * @param{search} search
 * @param{record} record
 * @param{http} http
 * @param{https} https
 */

    function(error,search,record,http,https,currentRecord,uiTools) {
        function pageInit(context) {
          console.log('hello')
        }
        function lineInit(scriptContext) {
        }
        function fieldChanged(scriptContext) {
           var curr_rec = scriptContext.currentRecord;
           var sublistName = scriptContext.sublistId;
           var sublistFieldName = scriptContext.fieldId;
           if( sublistFieldName == 'custrecord_hpf_line_account' && sublistName == 'recmachcustrecord_hpf_china_journal_head'){
             var account_val = curr_rec.getCurrentSublistValue({sublistId: sublistName, fieldId: sublistFieldName});
              log.debug('account_val',account_val)
             if(account_val && account_val > 0){
                var period_value = curr_rec.getValue('custrecord_hpf_postingperiod')
                curr_rec.setCurrentSublistValue({sublistId: sublistName,fieldId: 'custrecord_hpf_line_period', value: period_value,ignoreFieldChange: true});
               }
           }
        }


        return {
             pageInit: pageInit,
            // lineInit:lineInit,
             fieldChanged: fieldChanged,
        };
    });