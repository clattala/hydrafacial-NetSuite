/**
 * @NApiVersion 2.1
 * @NScriptType  MapReduceScript
 * @NModuleScope SameAccount
 */

define(['N/record', 'N/search','N/runtime'],
function (record, search, runtime){
			
	function getInputData() {
		
		var scriptObj = runtime.getCurrentScript();
		SEARCH_TO_USE = scriptObj.getParameter({name: 'custscript_sos_with_no_inv_nums_search'});

		log.debug('running search');
		var soLineSearchLoaded = search.load({id: SEARCH_TO_USE});
		
		return soLineSearchLoaded;

	}

	function map(context)
	{
	
		try{

			var searchResult = JSON.parse(context.value);
			var soId = searchResult.id;
			log.audit("MAP now working on SO:", soId);
			log.debug('searchResult object is:', JSON.stringify(searchResult));
			log.debug('soId is:', soId);
		
			var item = searchResult.values['item'].value;
			//var VENDOR_ID = searchResult.values['vendor.item'].value;
			var luk = searchResult.values.lineuniquekey;
			var qty = searchResult.values.quantity;
			var qtyuom = searchResult.values.quantityuom;
			var locationid = searchResult.values.location.value;
			var unit = searchResult.values.unit;

			context.write({key: soId, value: {
				item: item,
				locationid: locationid,				
				luk: luk, 
				qty: qty,
				qtyuom: qtyuom,
				unit: unit

			}});

		}
		catch(e){
			log.error(e.name, e.message);
		}

	}
	
	function reduce(context){
	
	try{	
		log.debug('Starting REDUCE / context', JSON.stringify(context));
		
		var soIdKey = context.key;
		log.debug('soIdKey is:', soIdKey);
		if ( context.values.length > 0 ) {
			
			var dataInput = [];
		
			for ( var i = 0 ; i < context.values.length ; i++ ) {
				dataInput.push(JSON.parse(context.values[i]));
			}
			
		} else {
				var dataInput = JSON.parse(context.values[0]);
		}
		var objInput = {};
		objInput[soIdKey] = dataInput; // If you feel like
		//The key here is to loop through the array elements and parse them individually.
		log.debug('objInput is:', JSON.stringify(objInput));
		
		
		var soRec = record.load({type: record.Type.SALES_ORDER, id: soIdKey, isDynamic: true});
		log.debug('Loaded SO:', soIdKey);
		
		var invDetailsArray = [];
		
		for(var z = 0; z < objInput[soIdKey].length; z++){
			
			var lineNumber = soRec.findSublistLineWithValue({
				sublistId: 'item',
				fieldId: 'lineuniquekey',
				value: objInput[soIdKey][z].luk
			});
			log.debug('lineNumber found is:', lineNumber)
			
			if(lineNumber == -1) continue
			
			log.debug('Processing sublist line ' + lineNumber +' for SO:', soIdKey);
			
			soRec.selectLine({sublistId: 'item', line: lineNumber});
			log.debug('objInput[soIdKey][z].item is:', objInput[soIdKey][z].item);

			var lineUnits = objInput[soIdKey][z].unit
			//var lineUnits = Number(objInput[soIdKey][z].qty / objInput[soIdKey][z].qtyuom)  //what about UOM of 'EA' or 'each' ?
			log.debug('lineUnits is:', lineUnits)
			
			//get item type
			var searchLookupObj = search.lookupFields({type: search.Type.ITEM, id: objInput[soIdKey][z].item, columns: ['type', 'islotitem']});
			var itemType = searchLookupObj.type[0].value;
				
			var inventoryNumberToExclude = '@NONE@';
			
			//iterate through array of objects to set Inventory Detail fields
			var invDetailSubRecord = soRec.getCurrentSublistSubrecord({sublistId: 'item', fieldId: 'inventorydetail'});

			var qtyAssigned = Number(0)
			//var qtyLeftToAssign = Number(objInput[soIdKey][z].qtyuom)
					
				while(qtyAssigned < Number(objInput[soIdKey][z].qtyuom)){
						
						log.debug('in while, qtyAssigned / total qty needed / qty remaining is:', qtyAssigned +' / '+ objInput[soIdKey][z].qtyuom +' / '+ (Number(objInput[soIdKey][z].qtyuom) - Number(qtyAssigned)));
						log.debug('invDetailSubrecord is now:', JSON.stringify(soRec.getCurrentSublistSubrecord({sublistId: 'item', fieldId: 'inventorydetail'})))
												
						var returnArray = returnOldestInventoryNumberAvailablePerItemPerLocation(objInput[soIdKey][z].item, objInput[soIdKey][z].locationid, lineUnits, inventoryNumberToExclude);
						
							//if we returned the array and if the qty available is enough to satisfy the line qty
							if(returnArray.length && returnArray[1] > 0 && (Number(returnArray[1]) >= (Number(objInput[soIdKey][z].qtyuom) - Number(qtyAssigned)))){
								
									log.debug('in if, TOTAL LINE QTY / INVENTORY NUMBER AVAILABLE returned:', Number(objInput[soIdKey][z].qtyuom) +' / '+ Number(returnArray[1]));

									log.debug('In if, attempting to set inventory number / quantity:', returnArray[0] +' / '+ (Number(objInput[soIdKey][z].qtyuom) - Number(qtyAssigned)))
									inventoryNumberToExclude = returnArray[0]
									
									invDetailSubRecord.selectNewLine({sublistId: 'inventoryassignment'});	
									invDetailSubRecord.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'issueinventorynumber', value: returnArray[0]});
									invDetailSubRecord.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'quantity', value: (Number(objInput[soIdKey][z].qtyuom) - Number(qtyAssigned))});	
									invDetailSubRecord.commitLine({sublistId: 'inventoryassignment'});
									log.debug('committed inventory detail line in if')
									
									qtyAssigned = Number(qtyAssigned) + (Number(objInput[soIdKey][z].qtyuom) - Number(qtyAssigned))
									
									log.debug('qtyAssigned in if is now:', qtyAssigned)
										
										
							}//if we returned the array and if the qty available is not enough to satisfy the line qty
							else if(returnArray.length && returnArray[1] > 0 && (Number(returnArray[1]) - Number(qtyAssigned) > 0) && (Number(returnArray[1]) < (Number(objInput[soIdKey][z].qtyuom) - Number(qtyAssigned)))){
								
									log.debug('in else if, TOTAL LINE QTY / INVENTORY NUMBER AVAILABLE returned:', Number(objInput[soIdKey][z].qtyuom) +' / '+ Number(returnArray[1]));
									
									log.debug('In else if, attempting to set inventory number id / quantity:', returnArray[0] +' / '+ (Number(returnArray[1]) - Number(qtyAssigned)))
									inventoryNumberToExclude = returnArray[0]
									
									invDetailSubRecord.selectNewLine({sublistId: 'inventoryassignment'});
									invDetailSubRecord.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'issueinventorynumber', value: returnArray[0]});
									invDetailSubRecord.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'quantity', value: (Number(returnArray[1]) - Number(qtyAssigned))});	
									invDetailSubRecord.commitLine({sublistId: 'inventoryassignment'});
									log.debug('committed inventory detail line in else if')
									
									qtyAssigned = Number(qtyAssigned) + (Number(returnArray[1]) - Number(qtyAssigned))
									
									log.debug('qtyAssigned in else if is now:', qtyAssigned)
										
								
							}else{
								

								log.debug('in else, breaking out of while');
								break;
								
							}

							
				}//while loop	
					
				
			log.debug('Now attempting to commit SO line:', lineNumber)
			soRec.commitLine({sublistId: 'item'});	
			
			
			
		}//end ITEM line for loop
		
		var soRecIdSaved = soRec.save({enableSourcing: false, ignoreMandatoryFields: true});
		log.debug('Finished editing SO:', soRecIdSaved);
		log.debug('invDetailsArray is:', JSON.stringify(invDetailsArray));
		
		
	}catch(e){
		log.error(e.name, e.message);
	}
		
	}
	
	
	
	function returnOldestInventoryNumberAvailablePerItemPerLocation(iteminternalid, locationid, lineunits, inventorynumbertoexclude){
		
		var returnArray = [];
		var INVENTORY_NUMBER_ID = 0;
		var INVENTORY_NUMBER_AVAILABLE = 0;
		var ITEM_NAME = '';
		var INVENTORY_NUMBER_NAME = '';
		
		
		var itemSearchObj = search.create({
		   type: "item",
		   filters:
		   [
			  ["internalid","anyof", iteminternalid],
			  "AND", 
			 // ["locationquantityavailable","greaterthan","0"],
			  //"AND", 
			  ["inventorynumber.internalid","noneof", inventorynumbertoexclude],
			  "AND", 
              ["inventorynumber.quantityavailable","greaterthan","0"], 
              "AND", 
              ["inventorynumber.location","anyof", locationid],
			   "AND", 
              ["inventorylocation","anyof", locationid]
		   ],
		   columns:
		   [
			  search.createColumn({name: "itemid", label: "Name"}),
			  search.createColumn({name: "displayname", label: "Display Name"}),
			  search.createColumn({name: "inventorylocation", label: "Inventory Location"}),
			  search.createColumn({name: "quantityavailable", join: "inventoryNumber", label: "Available"}),
			  search.createColumn({name: "expirationdate", join: "inventoryNumber", sort: search.Sort.ASC, label: "Expiration Date"}),
			  search.createColumn({name: "internalid", join: "inventoryNumber", label: "Internal ID"}),
			  search.createColumn({name: "inventorynumber", join: "inventoryNumber", label: "Number"})
		   ]
		});
		var searchResultCount = itemSearchObj.runPaged().count;
		log.debug("returnOldestInventoryNumberAvailablePerItemPerLocation result count",searchResultCount);
		var results = itemSearchObj.run().getRange({start: 0, end: 1});
		
		if(results.length != 0){
			
			INVENTORY_NUMBER_ID = results[0].getValue({name: "internalid", join: "inventorynumber"});
			ITEM_NAME = results[0].getValue({name: "itemid"});
			INVENTORY_NUMBER_AVAILABLE = results[0].getValue({name: "quantityavailable", join: "inventorynumber"});
			INVENTORY_NUMBER_NAME = results[0].getValue({name: "inventorynumber", join: "inventorynumber"});
			
			returnArray.push(INVENTORY_NUMBER_ID)
			returnArray.push(Number(INVENTORY_NUMBER_AVAILABLE))
			returnArray.push(ITEM_NAME)
			returnArray.push(INVENTORY_NUMBER_NAME)
		}
		
		log.debug('returning itemid / invnumbertext / invnumberid / invnumberavailable / iteminternalid:', returnArray[2] +' / '+returnArray[3] +' / '+ returnArray[0] +' / '+ returnArray[1] +' / '+ iteminternalid);
		
		return returnArray;
	}
		

	return {

		getInputData: getInputData,
		map: map,
		reduce: reduce
		//summarize: summarize
	};

});