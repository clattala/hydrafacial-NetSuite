/**
 * @Description Set "ADDRESS COUNT IN NETSUITE" to 1 if defaultBilling and defaultShipping is on same line else set 2
 * @NScriptType UserEventScript
 * @NApiVersion 2.x
=========================================================================================================================
Date                     Version                Change History
=========================================================================================================================
10/27/2023                1.1                   SR#11296 - For Japan Customers include the phone number in " - CL
11/27/2023                1.2                   SR-12570 - Address Count Field should be only set for german subsidiary - PK
05/20/2024                1.3                   CHN#578-Remove the + sign and " double quotes from the JP Customer's 
                                                phone number fields. The latest version of KorberOne (A1Ship)T-Force and UPS API
												does not support both double quotes and + sign. - CL
=========================================================================================================================
         
*/



define([
  'N/record',
  'N/search',
  'N/runtime' //#SR-12570 N/record module
], function(record, search, runtime) { //#SR-12570 add record varialble
  function beforeSubmit(context) {
    try {
      var rec = context.newRecord;

      if (!rec) {
        rec = context.oldRecord;
      }
      var entity = rec.getValue({
        fieldId: 'entity'
      });

      var subsidiary = rec.getValue('subsidiary') //#SR-12570 Start
      var scriptObj = runtime.getCurrentScript()
      var germanSubsidiary = scriptObj.getParameter({
                name: 'custscript_hf_german_subsidary'
            });
      //#SR-12570 end
	  var numLines = rec.getLineCount('addressbook');
	  
	  var addressCount = 2;
      
      for (var i = 0; i < numLines; i++) {
		
		var defaultShipping = rec.getSublistValue({
          sublistId: 'addressbook',
          fieldId: 'defaultshipping',
		  line: i
        });
		
		var defaultBilling = rec.getSublistValue({
          sublistId: 'addressbook',
          fieldId: 'defaultbilling',
		   line: i
        });
		
		 //log.debug('defaultshipping',defaultShipping);
		 //log.debug('defaultBilling',defaultBilling);
		 
		 if(defaultShipping && defaultBilling)
		 {
			 addressCount = 1;
		 }


		/*CHN#578-Remove the + sign and " double quotes from the JP Customer's phone number fields*/
        /*SR#11296 - Japan Customers*/
		/*
        
         var addressSubrecord = rec.getSublistSubrecord({
            sublistId: 'addressbook',
            fieldId: 'addressbookaddress',
            line: i
        });
        var shipcountry = addressSubrecord.getValue({
          fieldId: 'country'
        });
        var phonenumber = addressSubrecord.getValue({
          fieldId: 'addrphone'
        });
        
        if (shipcountry == 'JP' && phonenumber.indexOf('"')== -1 && phonenumber != '')
        {
          phonenumber = '"'+ phonenumber +'"'

           addressSubrecord.setValue({
            sublistId: 'addressbook',
            fieldId: 'addrphone',
            value: phonenumber,
            line: i
           });        
        }
        */
        /* End of changes for SR#11296 */
		/* End of changes for CHN#578*/
        
	  }	  
      log.debug('subsidiary ' + subsidiary , 'germanSubsidiary ' + germanSubsidiary)
    if(subsidiary==germanSubsidiary){ //#SR-12570 if condition
	    rec.setValue({
        fieldId: 'custentity_address_count',
        value: addressCount
      });
    }
      
    } catch (e) {
      log.debug('Error',e);
    }
  }



  return {
    beforeSubmit: beforeSubmit
  };
});
