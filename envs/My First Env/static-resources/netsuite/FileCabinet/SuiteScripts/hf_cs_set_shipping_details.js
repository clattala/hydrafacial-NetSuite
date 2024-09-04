/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/url', 'N/https', 'N/error'],
    function(url, https, error) {
        function fieldChanged(context) {
            var currentRecord = context.currentRecord;
          	log.error("context.fieldId", context.fieldId);
            if(context.fieldId == 'custbody_hf_ship_service_desc'){
                var shipServiceDesc = currentRecord.getValue({
                    fieldId: 'custbody_hf_ship_service_desc'
                });
                var suiteletURL = url.resolveScript({
                    scriptId: 'customscript_hf_us_get_shipping_detail',
                    deploymentId: 'customdeploy_hf_us_get_shipping_detail',
                    returnExternalUrl: false,
                    params: {
                        'wmsshipservice': shipServiceDesc,
                    }
                });
                https.get.promise({
                    url: suiteletURL
                }).then(function (response) {
                    showSuccess(response, currentRecord);
                }).catch(function (reason) {
                    log.error("failed to send email", reason);
                });
            }
        }
        function showSuccess(response, currentRecord){
            log.debug("success", response.body);
          	if(response.body == '' || response.body == 'none'){
              	currentRecord.setValue('shipmethod','');
            } else if(response.body != 'none' && response.body != ''){
              	currentRecord.setValue('shipmethod',response.body);
            }
        }
        return {
            fieldChanged: fieldChanged
        };
    });