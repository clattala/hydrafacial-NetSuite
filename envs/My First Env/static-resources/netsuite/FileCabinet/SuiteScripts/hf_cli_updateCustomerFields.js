/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/url'], function (url) {

    function pageInit(context) {

    }
    function CallforSuitelet(id) {

        // alert('Customer ID:' + id);
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_hf_sl_update_cust_fin_flds',
            deploymentId: 'customdeploy_hf_sl_update_custfinflds_01',
            params: {
                'recId': id
            }
        });
        document.location = suiteletURL;
    }

    return {
        pageInit: pageInit,
        CallforSuitelet: CallforSuitelet

    }
});