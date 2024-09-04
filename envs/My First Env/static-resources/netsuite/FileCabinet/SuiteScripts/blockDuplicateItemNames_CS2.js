/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 *
 * Block the creation of a duplicate Item name, no matter what ITEM TYPE 
 * 
 */
define(['N/record', 'N/search', 'N/currentRecord'],

function(record, search, currentRecord) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function saveRecord(context){
    

	try{
				
				var rec = context.currentRecord;
				var recId = rec.id;
				console.log('Firing saveRecord on recId:', recId);

				var itemName = rec.getValue({fieldId: 'itemid'});
      
      			log.debug('context is:', JSON.stringify(context));
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
					
					alert('There is already ITEM with the name '+ ITEM_NAME_FOUND +'.  Please choose another name.')
					return false;
					
				}
				else{
					
					return true;
				}
				

				log.debug('Finished script');
			
				
			}catch(e){
				
				log.error(e.name, e.message);
                return true;
				
			}		

    }//end afterSubmit function

    return {
        
		saveRecord: saveRecord
  
    };
    
});
