/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record'],
    function(record) {

        function beforeLoad(context) {
            try {
            	if(context.type == 'view'){
            		var subsidiary = context.newRecord.getValue('subsidiary');
            		if (subsidiary == 11){
            			log.error('subsidiary-'+subsidiary);
            			var currentForm = context.form;
            			currentForm.clientScriptModulePath = "SuiteScripts/3rp_cl_profoma_invoice.js";

		
            			currentForm.addButton({
            				id: 'custpage_print_proforma',
            				label: 'Print Proforma Invoice',
            				functionName: 'printProformaSuitelet()'
            			});
            		}
            	}
				
			} catch (err) {
                log.error('Error in UE Script', JSON.stringify(err));
            }
        }
        return {
            beforeLoad: beforeLoad
        }
    });