/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 *
 * Detect if an ITEM with same name as existing ITEM is being attempted to be saved.  If so block save.
 *
 *
 */
define(['N/record', 'N/search', 'N/error'],

function(record, search, error) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
	 
	 function beforeSubmit(scriptContext){
		 
		try{
								
			if(scriptContext.type !== scriptContext.UserEventType.CREATE && scriptContext.type !== scriptContext.UserEventType.EDIT && scriptContext.type !== scriptContext.UserEventType.XEDIT) return;
			
			var rec = scriptContext.newRecord;
			var recId = rec.id;
			var recType = rec.type;					
			log.debug('Firing beforeSubmit on '+ recType +' with ID:', recId);

			var itemName = rec.getValue({fieldId: 'itemid'});
			var ITEM_NAME_FOUND = '';
		if(recId){
					var itemSearchObj = search.create({
					   type: "item",
					   filters:
					   [
						  ["name","is", itemName],
						   "AND",
                          ["internalid", "noneof", recId]
					   ],
					   columns:
					   [
						  search.createColumn({name: "itemid", sort: search.Sort.ASC, label: "Name"}),
						  search.createColumn({name: "displayname", label: "Display Name"}),
						  search.createColumn({name: "salesdescription", label: "Description"}),
						  search.createColumn({name: "type", label: "Type"})
					   ]
					});
		}else{
					var itemSearchObj = search.create({
					   type: "item",
					   filters:
					   [
						  ["name","is", itemName]
					   ],
					   columns:
					   [
						  search.createColumn({name: "itemid", sort: search.Sort.ASC, label: "Name"}),
						  search.createColumn({name: "displayname", label: "Display Name"}),
						  search.createColumn({name: "salesdescription", label: "Description"}),
						  search.createColumn({name: "type", label: "Type"})
					   ]
					});
			
			
		}
					var searchResultCount = itemSearchObj.runPaged().count;
					log.debug("itemSearchObj result count",searchResultCount);
					itemSearchObj.run().each(function(result){
                      if(result.getValue({name: "itemid"}) == itemName) ITEM_NAME_FOUND = result.getValue({name: "itemid"})
					   return true;
					});
			
				if(ITEM_NAME_FOUND.length > 0){

					 var itemCreateError = error.create({
						name: 'DUPLICATE_NAMED_ITEM',
						message: 'There is already ITEM with the name '+ ITEM_NAME_FOUND +'.  Please choose another name.',
						notifyOff: true
					});
					
					throw itemCreateError;
					
				}
				

				log.debug('Finished script');
								

					
				
			}catch(e){
				
				log.error(e.name, e.message);
				
				if(e.name == 'DUPLICATE_NAMED_ITEM'){
					
					 var itemCreateError = error.create({
						name: 'DUPLICATE_NAMED_ITEM',
						message: 'There is already ITEM with the name '+ ITEM_NAME_FOUND +'.  Please choose another name.',
						notifyOff: true
					});
					
					throw itemCreateError;
				}
			}		

    }//end afterSubmit function

    return {
        
		beforeSubmit: beforeSubmit,
  
    };
    
});
