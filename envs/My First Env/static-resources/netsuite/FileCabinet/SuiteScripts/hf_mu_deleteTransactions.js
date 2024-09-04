/*
* To delete the transactions in the mass Update 
*/

/**
* @NApiVersion 2.x
* @NScriptType MassUpdateScript
*/

define(['N/record'],
	function(record) {

		var scriptName = "hf_mu_deleteTransactions.js.";
		
		function each(params) {
	
			var funcName = scriptName + "each " + params.type + " | " + params.id;
			
			try {
				record.delete({type: params.type, id: params.id});
				log.audit(funcName, "deleted.");
				
			} catch (e) {
	    		log.error(funcName, "Unable to delete:  " + params.id + 'because of '  + e.toString());				
			}
		}

		return {
			each: each
		};
	}
);