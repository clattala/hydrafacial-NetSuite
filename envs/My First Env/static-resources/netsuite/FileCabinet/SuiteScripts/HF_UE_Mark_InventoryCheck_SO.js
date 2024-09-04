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
define(['N/record', 'N/search', 'N/runtime'], function(record, search, runtime) {

    function beforeLoad(context) {
        try {
            log.debug('context.type before load', context.type)

            if (context.type == 'copy') {
                var obj_SalesOrder = context.newRecord;
                obj_SalesOrder.setValue('custbody_hf_override_check', false);
                obj_SalesOrder.setValue('custbody_hf_so_financecheck', false);
                obj_SalesOrder.setValue('custbody_hf_so_inventory_check', false);
                obj_SalesOrder.setValue('custbody_hfde_deposit_confirm', false);
                obj_SalesOrder.setValue('custbody_hf_so_approval_status', '')
                obj_SalesOrder.setValue('custbody_hf_dhl_order_status', '');
                obj_SalesOrder.setValue('custbody_dhl_receiver_name', '');
                obj_SalesOrder.setValue('custbody_dhl_cancel_code', '');
                obj_SalesOrder.setValue('custbody_dhl_cancel_reason', '');
                log.debug('after setting')
            }
        } catch (error) {
            log.debug('error in beforeload ' + error.message, error)
        }
    }

    function beforeSubmit_new(context) {
        try {
            log.debug('context.type', context.type)
            log.debug('execcontext', runtime.executionContext)
            var scriptObj = runtime.getCurrentScript()
            var germanyForm = scriptObj.getParameter({
                name: 'custscript_hf_germany_form'
            })
            var dhlMainLocation = scriptObj.getParameter({
                name: 'custscript_hf_dhl_location'
            });

            log.debug('germanyForm', germanyForm)
            if ((context.type == 'create' || context.type == 'copy' || context.type == 'edit') && runtime.executionContext != 'USEREVENT') {
                var salesOrderObj = context.newRecord;
                var customform = salesOrderObj.getValue('customform')
                var subsidiary = salesOrderObj.getValue('subsidiary');
                log.debug('customform', customform)
              	if(germanyForm){
                  germanyForm = germanyForm.split(',')
                }
              	var index = germanyForm.indexOf(customform)
                log.audit('index', index)
				var itemJson  = {}
                if (index!=-1 && subsidiary == '6') { //Only for Germany Subsidiary
                    var workflowOverRide = salesOrderObj.getValue('custbody_hf_override_check')
                    log.debug('workflowOverRide', workflowOverRide)
                    if (workflowOverRide == false || !workflowOverRide) {
                        var lineCount = salesOrderObj.getLineCount({
                            sublistId: 'item'
                        });
                        log.debug('lineCount: ' + lineCount);
                        var arr_item = [];
                        var arr_quantity = []
                        var arr_index = [];
                        var b_flag = true;
                        for (var i = 0; i < lineCount; i++) {
                            var item = salesOrderObj.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                line: i
                            });
                           var itemType = salesOrderObj.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'itemtype',
                                line: i
                            });
                          	log.debug('itemType' , itemType)
                            var quantity = salesOrderObj.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                line: i
                            });
                            var location = salesOrderObj.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'location',
                                line: i
                            });
                          	var itemTypeIndex = ['Assembly' , 'InvtPart'].indexOf(itemType)
                            log.debug('itemTypeindex' , itemTypeIndex)
                            if (location == dhlMainLocation && itemTypeIndex!=-1) {
                                arr_index.push(i) //Getting the Line Number where location is Germany MainWhise
                                arr_quantity.push(quantity)
                                arr_item.push(item)
                              log.debug('itemJson[item]' , itemJson[item])
                              log.debug('hasOwnProperty'  ,itemJson.hasOwnProperty(item))
								if(itemJson.hasOwnProperty(item)){
                                  log.debug('105 already has value')
									itemJson[item] = itemJson[item] + ',' + i
								}else{
                                  log.debug('108 no value')
									itemJson[item] = i;
								}
                              log.debug('itemJson' , itemJson)
                            } else {
                                log.audit('54 so stock check should be false ' + 'line is ' + i + ' ite m type ' + itemType)
                              if(itemTypeIndex!=-1){
                                salesOrderObj.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_hf_stock_check',
                                    value: false,
                                    line: i
                                });
                                salesOrderObj.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_hf_total_available',
                                    value: 0,
                                    line: i
                                });
                                b_flag = false;
                              }
                            }
                          
                        }
                        if (arr_index.length > 0) {
                            //var filters = getFilters(arr_item)
                            //log.debug('filters', filters);
                            log.debug('arr_item', arr_item)
                            log.debug('arr_index', arr_index)
                            searchAndSetValues(arr_item, arr_quantity, arr_index, salesOrderObj ,itemJson, b_flag)

                        } else {
                          	if(b_flag){ //condition if only all items with diff location is used.
                            salesOrderObj.setValue('custbody_hf_so_inventory_check', true);
                            }else{
                               salesOrderObj.setValue('custbody_hf_so_inventory_check', false);

                            }
                        }
                    }
                }
            }
        } catch (error) {
            log.debug('Error in before Submit ' + error.message, error)
        }
    }

    function searchAndSetValues(arr_item, arr_quantity, arr_index, salesOrderObj , itemJson, b_flag) {
      	log.debug('itemJson' , itemJson)
        var savedSearchId = runtime.getCurrentScript().getParameter({
            name: 'custscript_inventory_check_search'
        })
        var arr_linesProcessed = []; //array to check which lines are processed by the saved search
        var itemSearchObj = search.load({
            id: savedSearchId //'customsearch_hf_inv_check_line'
        });
        var defaultFilters = itemSearchObj.filters;
        var customFilters = {};
        customFilters = {
            "name": "internalid",
            "operator": "anyof",
            "values": arr_item,
            "isor": false,
            "isnot": false,
            "leftparens": 0,
            "rightparens": 0
        };
        defaultFilters.push(customFilters);
        //We will add the new filter in customFilters
        log.debug('cu  customFiltersstomFilters', customFilters)
        //We will push the customFilters into defaultFilters
        defaultFilters.push(customFilters);
        log.debug('defaultFilters', defaultFilters)
        //We will copy the modified defaultFilters back into objSearch
        itemSearchObj.filters = defaultFilters;
        var searchResultCount = itemSearchObj.run().getRange({
            start: 0,
            end: 1000
        });
        log.debug("itemSearchObj result count", searchResultCount);
        if (searchResultCount.length > 0) {
            var inventoryCheck = true;
            for (var i = 0; i < searchResultCount.length; i++) {
                var sumOfUnApprovedQuantity = searchResultCount[i].getValue(searchResultCount[0].columns[6])
                log.debug('sumOfUnApprovedQuantity', sumOfUnApprovedQuantity)
                var sumOfTotalDemand = searchResultCount[i].getValue(searchResultCount[0].columns[7])
                log.debug('sumOfTotalDemand', sumOfTotalDemand)
                var itemInternalId = searchResultCount[i].getValue(searchResultCount[0].columns[8])
                log.debug('itemInternalId', itemInternalId)
                var itemIndex = itemJson[itemInternalId]
                log.debug('itemIndex' + itemIndex, itemIndex.length)
				if(itemIndex=== null || itemIndex === ""){
					itemIndex=[];
				}else{
					
                  itemIndex = itemIndex.toString().split(',')
				}
                log.debug('itemIndex', itemIndex)
                if (itemIndex.length > 0) {
                    for (var y = 0; y < itemIndex.length; y++) {
                      	itemIndex[y] = Number(itemIndex[y])
                        arr_linesProcessed.push(itemIndex[y])
                        var quantityAtLineLevel = salesOrderObj.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                line: itemIndex[y]
                            });
                        salesOrderObj.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_hf_total_available',
                            value: sumOfTotalDemand,
                            line: itemIndex[y]
                        });
                      	log.debug('quantityAtLineLevel' , quantityAtLineLevel)
                        if (quantityAtLineLevel > sumOfTotalDemand) {
                            inventoryCheck = false
                            log.debug('Inventory is 0 Line is ' + itemIndex[y] + ' where quantity is ' + quantityAtLineLevel + ' and available quantiy is ' + sumOfTotalDemand)
                            salesOrderObj.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_hf_stock_check',
                                value: false,
                                line: itemIndex[y]
                            });
                        } else {
                            log.debug('working ' + itemIndex[y] + ' where quantity is ' + quantityAtLineLevel + ' and available quantiy is ' + sumOfTotalDemand)
                            salesOrderObj.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_hf_stock_check',
                                value: true,
                                line: itemIndex[y]
                            });
                        }
                    }
                }
            }
            log.audit('arr_linesProcessed', arr_linesProcessed);
            log.audit('arr_index', arr_index)
            var arr_linesNotProcessed = arr_index.filter(function(lineNo) {
                return arr_linesProcessed.indexOf(lineNo) == -1;
            });
            //var arr_linesNotProcessed = arr_index.filter(x => arr_linesProcessed.indexOf(x) == -1); //to get the lines not processed
            log.debug('arr_linesNotProcessed', arr_linesNotProcessed)
            if (arr_linesNotProcessed.length > 0) {
                inventoryCheck = false;
                for (var line = 0; line < arr_linesNotProcessed.length; line++) {
                    setLineValues(salesOrderObj, 0, false, arr_linesNotProcessed[line])
                }
            }
            log.debug('inventoryCheck', inventoryCheck);
            //log.debug('b_flag', b_flag)
            if (inventoryCheck) {
                salesOrderObj.setValue('custbody_hf_so_inventory_check', inventoryCheck);
            }
          if (!b_flag || !inventoryCheck) {
                salesOrderObj.setValue('custbody_hf_so_inventory_check', false);
            }
             
        } else { // if saved search has zero results
            for (var id = 0; id < arr_item.length; id++) {
                var itemIndex = itemJson[itemInternalId]
				if(itemIndex=== null || itemIndex === ""){
                  itemIndex=[];
					
				}else{
					itemIndex = itemIndex.toString().split(',')
				}
                log.debug('no result itemIndex', itemIndex)
                if (itemIndex.length > 0) {
                    for (var y = 0; y < itemIndex.length; y++) {
                        setLineValues(salesOrderObj, 0, false, itemIndex[y])
                    }
                }
            }
            salesOrderObj.setValue('custbody_hf_so_inventory_check', false);
        }
    }
    function setLineValues(salesOrderObj, totalAvailable, stockcheck, line) {
        salesOrderObj.setSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_hf_total_available',
            value: totalAvailable,
            line: line
        });
        salesOrderObj.setSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_hf_stock_check',
            value: stockcheck,
            line: line
        });
    }


    function getAllIndexes(arr, val) {
        var indexes = [],
            i;
        for (i = 0; i < arr.length; i++)
            if (arr[i] === val)
                indexes.push(i);
        return indexes;
    }

    return {
        //afterSubmit: afterSubmit,
        beforeSubmit: beforeSubmit_new,
        beforeLoad: beforeLoad
    }
})