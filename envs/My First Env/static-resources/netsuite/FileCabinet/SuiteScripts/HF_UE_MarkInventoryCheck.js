/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 
  * Script Name : 
	 * Author : Pavan Kaleru
	 * Date : 13 July 2022
	 * Purpose : To check the Stock check and based on that mark the checkbox SO Inventory check  
	 * 
	 * 
	 * Change History:
	 * 
	 * Date                  Author                       Change descriptio
 */
//var arrayOne = [];
define(['N/record', 'N/search'], function(record, search) {

	/*function beforeSubmit(context){
    if(context.type!='delete'){
     // var objSalesOrder = context.newRecord;
      var objRecord = record.load({
    type: record.Type.INVENTORY_ITEM,
    id: 5359
});
      
      var lineCount = objRecord.getLineCount({
                    sublistId: 'locations'
                });
      log.debug('lineCount' , lineCount)
      log.debug('script is running before submit')
      
     var locationFieldId = objRecord.findSublistLineWithValue({
        sublistId: 'locations',
        fieldId: 'location',
        value: 46
    });      
      var preferredstocklevel = objRecord.getSublistValue({
                        sublistId: 'locations',
                        fieldId: 'preferredstocklevel',
                        line: locationFieldId
                    });
      
       log.debug('locationFieldId' , locationFieldId)
             log.debug('preferredstocklevel' , preferredstocklevel)

      
       for (var i = 0; i < lineCount; i++) { 
        var locationItem = objRecord.getSublistValue({
                        sublistId: 'locations',
                        fieldId: 'preferredstocklevel',
                        line: i
                    });
         log.debug('location' , locationItem)
       	if(locationItem){
          log.debug('preffered stock level is ' + locationItem , i)
        }
       }
       /*var lineCount = objSalesOrder.getLineCount({
                    sublistId: 'item'
                });
      
                log.debug('lineCount: ' + lineCount);
                for (var i = 0; i < lineCount; i++) { 
                  var item = objSalesOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });
                  
                  var itemType = objSalesOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'itemtype',
                        line: i
                    });
                  
                  log.debug('itemType' , itemType)
                  var location = objSalesOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'location',
                        line: i
                    });
                  log.debug('item',item)
                  log.debug('location',location)
                }
      
    }
  }

    function beforeSubmit(context) {
		if(context.type!='delete'){
          try{
        var salesOrderObj = context.newRecord;
		var customform = salesOrderObj.getValue('customform')
        log.debug('customform', customform)
        if(customform=='486'){
        var lineCount = salesOrderObj.getLineCount({
            sublistId: 'item'
        });
        log.debug('lineCount: ' + lineCount);
        var arr_item = [];
        var arr_location = [];
      	var arr_itemLocation = []
        var arr_quantity = []
        for (var i = 0; i < lineCount; i++) {
            var item = salesOrderObj.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i
            });
            arr_item.push(item)
            var location = salesOrderObj.getSublistValue({
                sublistId: 'item',
                fieldId: 'location',
                line: i
            });
            arr_location.push(location)
          
          arr_itemLocation.push(item+','+location) //to compare the item and location with the search results 
        }
      log.debug('arr_itemLocation',arr_itemLocation)

        if (arr_item.length > 0) {
            var filters = getFilters(arr_item, arr_location)
            searchItem(filters, arr_item, arr_location, salesOrderObj,arr_itemLocation)
        }
          }
          }
     catch(error){
      log.debug('error ' +error.message , error)
      
    }
        }
   
        }


   

    function afterSubmit(context) {
        try {
            if (context.type != 'delete') {
                var salesOrderObj = context.newRecord;
                var salesOrderId = salesOrderObj.id;
                var type = salesOrderObj.type;
                var newSalesOrderObj = record.load({
                    type: type,
                    id: salesOrderId
                })
                var lineCount = newSalesOrderObj.getLineCount({
                    sublistId: 'item'
                });
                var b_flag = true;
                log.debug('lineCount: ' + lineCount);

                for (var i = 0; i < lineCount; i++) {
                    var soStockCheck = newSalesOrderObj.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_hf_sostockcheck',
                        line: i
                    });
                    log.debug('soStockCheck', soStockCheck)
                    if (soStockCheck == '0' || soStockCheck == 0) {
                        b_flag = false
                        break;
                    }
                }
                log.debug('b_flag', b_flag)
                if (b_flag) {
                    log.debug('48', b_flag)
                    newSalesOrderObj.setValue('custbody_hf_so_inventory_check', b_flag);
                    //               	log.debug('after setting')
                    ///newSalesOrderObj.setValue('custbody_hf_so_financecheck', b_flag)
                    var id = newSalesOrderObj.save();
                    log.debug('id', id)
                }

            }
        } catch (error) {
            throw error
        }
    }

    function searchItem(filters, arr_item, arr_location, salesOrderObj,arr_itemLocation) {
      log.debug('filters', filters)
        var itemSearchObj = search.create({
            type: "item",
            filters: filters,
            columns: [
                search.createColumn({
                    name: "itemid",
                    sort: search.Sort.ASC,
                    label: "Name"
                }),
                search.createColumn({
                    name: "locationpreferredstocklevel",
                    label: "Location Preferred Stock Level"
                }),
                search.createColumn({
                    name: "inventorylocation",
                    label: "Inventory Location"
                }),
                search.createColumn({
                    name: "internalid",
                    label: "Internal ID"
                })

            ]
        });
      log.debug('itemSearchObj' , itemSearchObj)
        var searchResultCount = itemSearchObj.run().getRange({
            start: 0,
            end: 1000
        });
        log.debug("itemSearchObj result count", searchResultCount);
      

        var arr_SearchLocation = []
        var arr_SearchItem = []
        var arr_preferredStockLevel = []
        var arr_searchItemLocation = []
        if (searchResultCount.length > 0) {
            for (var i = 0; i < searchResultCount.length; i++) {
                var itemInSearch = searchResultCount[i].getValue('internalid')
                var locationInSearch = searchResultCount[i].getValue('inventorylocation');
              	log.debug('locationInSearch' , locationInSearch)
                var preferredStockLevel = searchResultCount[i].getValue('locationpreferredstocklevel');
              	log.debug('preferredStockLevel' , preferredStockLevel)
              

                if (preferredStockLevel) {
                    arr_preferredStockLevel.push(preferredStockLevel)
                    arr_searchItemLocation.push(itemInSearch+','+locationInSearch)
                }

            }
          log.debug('235 ' , arr_searchItemLocation)
          if(arr_searchItemLocation.length>0){
            for(var j=0;j<arr_searchItemLocation.length;j++){
              var itemwithLocation = arr_searchItemLocation[j];
              log.debug('itemwithLocation' , itemwithLocation)
              var stockLevel = arr_preferredStockLevel[j]
              var lineNumber = arr_itemLocation.indexOf(itemwithLocation)
              log.debug('241', lineNumber)
              salesOrderObj.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_hf_locationwisepreferredstock',
                                value: stockLevel,
                                line: lineNumber
                            });
            }
          }
        }
    }*/

	function beforeSubmit_new(context) {
		try {
          	log.debug('context.type' , context.type)
			if (context.type == 'create' || context.type == 'copy' || context.type=='edit') {
				var salesOrderObj = context.newRecord;
				var customform = salesOrderObj.getValue('customform')
				log.debug('customform', customform)
				if (customform == '486') {
					var lineCount = salesOrderObj.getLineCount({
						sublistId: 'item'
					});
					log.debug('lineCount: ' + lineCount);
					var arr_item = [];
					var arr_location = [];
					var arr_itemLocation = []
					var arr_quantity = []
					for (var i = 0; i < lineCount; i++) {
						var item = salesOrderObj.getSublistValue({
							sublistId: 'item',
							fieldId: 'item',
							line: i
						});


						arr_item.push(item)
						var quantity = salesOrderObj.getSublistValue({
							sublistId: 'item',
							fieldId: 'quantity',
							line: i
						});
						arr_quantity.push(quantity)

						var location = salesOrderObj.getSublistValue({
							sublistId: 'item',
							fieldId: 'location',
							line: i
						});
						arr_location.push(location)

						arr_itemLocation.push(item + ',' + location) //to compare the item and location with the search results 

					}
					log.debug('arr_itemLocation', arr_itemLocation)
					if (arr_item.length > 0) {
						var filters = getFilters(arr_item, arr_location)
						log.debug('filters', filters);
						searchAndSetItemValues(filters, arr_itemLocation, arr_quantity, salesOrderObj)
					}
				}
			}
		} catch (error) {
			log.debug('Error in before Submit ' + error.message, error)
		}
	}

	function searchAndSetItemValues(filters, arr_itemLocation, arr_quantity, salesOrderObj) {
		log.debug('filters', filters)
		var itemSearchObj = search.create({
			type: "item",
			filters: filters,
			columns: [
				search.createColumn({
					name: "formulanumeric",
					summary: "SUM",
					formula: "NVL(MAX({locationquantityavailable}),0) - NVL(SUM(case when {transaction.type} = 'Sales Order' AND {transaction.status} = 'Pending Approval' then {transaction.quantity} else 0 end),0)",
					label: "Total Demand"
				}),
				search.createColumn({
					name: "internalid",
					summary: "GROUP",
					label: "Name"
				}),
				search.createColumn({
					name: "inventorylocation",
					summary: "GROUP",
					label: "Inventory Location"
				})

			]
		});
		log.debug('itemSearchObj', itemSearchObj)
		var searchResultCount = itemSearchObj.run().getRange({
			start: 0,
			end: 1000
		});
		log.debug("itemSearchObj result count", searchResultCount);
		var arr_itemLocationSearch = []
		var inventoryCheck = true;
		if (searchResultCount.length > 0) {
			for (var i = 0; i < searchResultCount.length; i++) {
				var quantityAvailable = searchResultCount[i].getValue(searchResultCount[0].columns[0])
				var itemId = searchResultCount[i].getValue(searchResultCount[0].columns[1])
				var location = searchResultCount[i].getValue(searchResultCount[0].columns[2])
				log.debug('quantityAvailable', quantityAvailable)
				var itemLocationinSearch = itemId + ',' + location
				log.debug('itemId', itemId)
				log.debug('location', location)
				var index = arr_itemLocation.indexOf(itemLocationinSearch)
				log.debug('index', index)
				if (index != -1) {
					var quantityAtLineLevel = arr_quantity[index]
					salesOrderObj.setSublistValue({
						sublistId: 'item',
						fieldId: 'custcol_available_quantity_item',
						value: quantityAvailable,
						line: index
					});
					if (quantityAtLineLevel > quantityAvailable) {
						inventoryCheck = false;
						log.debug('Inventory is 0 Line is ' + index + ' where quantity is ' + quantityAtLineLevel  +' and available quantiy is ' + quantityAvailable)
						salesOrderObj.setSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_hf_sostockcheck',
							value: 0,
							line: index
						});
					} else {
                      log.debug('working ' + index + ' where quantity is ' + quantityAtLineLevel  +' and available quantiy is ' + quantityAvailable)
						salesOrderObj.setSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_hf_sostockcheck',
							value: 1,
							line: index
						});
					}
				}


			}
			log.debug('inventoryCheck', inventoryCheck);
			if (inventoryCheck) {
				salesOrderObj.setValue('custbody_hf_so_inventory_check', inventoryCheck);
			}


		}

	}

	function getFilters(arr_item, arr_location) {
		var result = [];
		if (arr_item.length > 0) {
			for (var i = 0; i < arr_item.length; i++) {
				result.push([
					['internalidnumber', 'equalto', arr_item[i]], 'AND', ['inventorylocation.internalid', 'anyof', arr_location[i]]
				])

				//result.push(['internalid', 'anyof', )

				result.push('OR');
			}
			result.pop(); // remove the last 'or'
		}
		log.debug('result', result);
		return result;
	}

	return {
		//afterSubmit: afterSubmit,
		beforeSubmit: beforeSubmit_new
	}
})