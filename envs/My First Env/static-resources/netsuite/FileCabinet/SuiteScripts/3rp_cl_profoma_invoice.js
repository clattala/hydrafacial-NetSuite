/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url','N/record','N/currentRecord'],
	function(url,record,currentRecord) {
		    function pageInit(context) {
			}
		    function printProformaSuitelet(){

		    	var recObj = currentRecord.get();
		    	var recId = recObj.id;
		    	var recType = recObj.type
	   
		    	var tranRec = record.load({
		    		type: recType,
		    		id: recId,
		    		isDynamic: true,
		    	});
		    	var tranNo = tranRec.getValue({fieldId:'tranid'});
		    	//log.debug('tranNo', tranNo+', recId-'+recId+', recType-'+recType);
		    	var suiteletURL = url.resolveScript({
		    		scriptId:'customscript_3rp_sl_print_profoma_inv',
		    		deploymentId: 'customdeploy_3rp_sl_print_profoma_inv',
		    		params: {
		    			'recId':recId,
		    			'recType':recType,
		    			'tranNo':tranNo
		    		}

		    	});
		    	window.open(suiteletURL,'_blank');
		    }

	return {
		pageInit : pageInit,
		printProformaSuitelet : printProformaSuitelet
	}
});