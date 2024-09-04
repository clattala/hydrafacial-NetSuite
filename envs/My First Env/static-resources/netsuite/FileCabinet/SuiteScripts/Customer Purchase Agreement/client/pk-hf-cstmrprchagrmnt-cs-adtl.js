/**
* @NApiVersion 2.0
* @NScriptType ClientScript
*/

/**
 * Client script that opens a custom suitelet screen for printing customer purchase agreement.
 * @author sahil v <emailsahilv@gmail.com>
 */

define([
    'N/url'
    , 'N/currentRecord'
], function (
    url
    , currentRecordModule
) {
    'use strict';

    /**
     * PK| Customer Purchase Agreement SL - URL DETAILS
     * @const {Object.<string, string} 
     */
    var SUITELET_URL = {
        SCRIPT: 'customscript_pk_cstmrprchagrmnt_sl',
        DEPLOYMENT: 'customdeploy_pk_cstmrprchagrmnt_sl'
    };

    function pageInit(context) { }

    function printCstmrPrchAgrmnt(params) {
        var suiteletUrl = url.resolveScript({
            scriptId: SUITELET_URL.SCRIPT,
            deploymentId: SUITELET_URL.DEPLOYMENT,
            returnExternalUrl: false
        });

        /** Open a suitelet page which prints a billofmaterial template */
        window.open(suiteletUrl + '&custparam_salesorderid=' + Number(currentRecordModule.get().id), '_blank')
    }

    function saveRecord(context) {
        console.log(context);
        var rec = context.currentRecord;
        var terms = rec.getValue({ fieldId: 'terms' });
        var paymentmethod = rec.getValue({ fieldId: 'paymentoption' });
   //   var paymentmethod = rec.getValue({ fieldId: 'paymentmethod' });      
      	
      //Do not run for US subsidiary
		var subsidiaryId = rec.getValue({ fieldId: 'subsidiary' });
		if(subsidiaryId == 3) return true;
		//	
      
        if (!terms && !paymentmethod) return false;
        return true;
    }

    return {
        pageInit: pageInit,
        printCstmrPrchAgrmnt: printCstmrPrchAgrmnt,
        saveRecord: saveRecord
    }
});