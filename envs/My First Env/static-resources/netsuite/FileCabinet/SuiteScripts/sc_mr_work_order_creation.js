/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount 
 */
var WO_SUBSIDIARY_ID = '3'; //HF-United States
var WO_LOCATION_ID = "3"; //Production Whse
define(['N/search', 'N/record'],
    function (search, record) {
        function getInputData() {
            var title = " getInputData() ";
            try {
                var dataArr = [];
                var workOrdersDataObj = getCustomWorkOrders();
                var customWorkOrdersArr = workOrdersDataObj.customWorkOrdersArr;
                var itemIdsArr = workOrdersDataObj.itemIdsArr;
                if (itemIdsArr.length > 0) {
                    var itemBomMapObj = getItemBomMapObj(itemIdsArr);
                    log.debug(title + "itemBomMapObj", itemBomMapObj);
                    for (var i = 0; i < customWorkOrdersArr.length; i++) {
                        var dataObj = customWorkOrdersArr[i];
                        dataObj.itemBomMapObj = itemBomMapObj;
                        dataArr.push(dataObj);
                    }
                }
                log.debug(title + "dataArr", dataArr);
                return dataArr;
            } catch (e) {
                log.error("ERROR IN:" + title, e)
            }
        }

        function map(context) {
            var title = " map() ";
            try {
                log.debug(title + 'context.value', context.value);
                var dataObj = JSON.parse(context.value);
                if (dataObj && dataObj.subsidiaryId && dataObj.locationId && dataObj.itemId && dataObj.itemBomMapObj[dataObj.itemId] && dataObj.itemQty && dataObj.startDate) {
                    createWorkOrderRecord(dataObj);
                } else {
                    var infoObj = {};
                    infoObj.subsidiaryId = dataObj.subsidiaryId;
                    infoObj.locationId = dataObj.locationId;
                    infoObj.itemId = dataObj.itemId;
                    infoObj.itemBomId = dataObj.itemBomMapObj[dataObj.itemId];
                    infoObj.itemQty = dataObj.itemQty;
                    infoObj.startDate = dataObj.startDate;
                    infoObj.customRecId = dataObj.customRecId;
                    log.error(title + "REQUIRED INFORMATION MISSING IN:", infoObj);
                }
            } catch (e) {
                log.error("ERROR IN:" + title, e);
            }
        }

        function getCustomWorkOrders() {
            var title = " getCustomWorkOrders() ";
            try {
                var itemIdsArr = [];
                var customWorkOrdersArr = [];
                var customRecordSearch = search.create({
                    type: 'customrecord_sc_work_order_create',
                    columns: [
                        search.createColumn({
                            name: 'internalid'
                        }),
                        search.createColumn({
                            name: 'custrecord_sc_work_order_item'
                        }),
                        search.createColumn({
                            name: 'custrecord_sc_work_order_item_qty'
                        }),
                        search.createColumn({
                            name: 'custrecord_sc_work_order_date'
                        }),
                        search.createColumn({
                            name: 'custrecord_sc_work_order_subsidiary'
                        }),
                        search.createColumn({
                            name: 'custrecord_sc_work_order_location'
                        })
                    ],
                    filters: [
                        search.createFilter({
                            name: 'custrecord_sc_work_order_process',
                            operator: search.Operator.IS,
                            values: ['T']
                        }),
                        search.createFilter({
                            name: 'isinactive',
                            operator: search.Operator.IS,
                            values: ['F']
                        })
                    ]
                });
                var searchResults = [];
                var count = 0;
                var pageSize = 1000;
                var start = 0;
                do {
                    var searchObjArr = customRecordSearch.run().getRange(start, start + pageSize);
                    searchResults = searchResults.concat(searchObjArr);
                    count = searchObjArr.length;
                    start += pageSize;
                } while (count == pageSize);
                log.debug(title + "searchResults", searchResults);
                for (var i = 0; i < searchResults.length; i++) {
                    var recObj = {};
                    recObj.customRecId = searchResults[i].getValue({
                        name: 'internalid'
                    });
                    recObj.itemId = searchResults[i].getValue({
                        name: 'custrecord_sc_work_order_item'
                    });
                    if (recObj.itemId) {
                        if (itemIdsArr.indexOf(recObj.itemId) == -1) itemIdsArr.push(recObj.itemId);
                        recObj.itemQty = searchResults[i].getValue({
                            name: 'custrecord_sc_work_order_item_qty'
                        }) ? parseFloat(searchResults[i].getValue({
                            name: 'custrecord_sc_work_order_item_qty'
                        })) : 0;
                        recObj.startDate = searchResults[i].getValue({
                            name: 'custrecord_sc_work_order_date'
                        });
                        recObj.subsidiaryId = searchResults[i].getValue({
                            name: 'custrecord_sc_work_order_subsidiary'
                        }) ? searchResults[i].getValue({
                            name: 'custrecord_sc_work_order_subsidiary'
                        }) : WO_SUBSIDIARY_ID;
                        recObj.locationId = searchResults[i].getValue({
                            name: 'custrecord_sc_work_order_location'
                        }) ? searchResults[i].getValue({
                            name: 'custrecord_sc_work_order_location'
                        }) : WO_LOCATION_ID;
                        customWorkOrdersArr.push(recObj);
                    }
                }
                return {
                    customWorkOrdersArr: customWorkOrdersArr,
                    itemIdsArr: itemIdsArr
                };
            } catch (e) {
                log.error("ERROR IN:" + title, e)
            }
        }

        function getItemBomMapObj(itemIdsArr) {
            var title = " getItemBomMapObj() ";
            try {
                var mapObj = {};
                var itemSearch = search.create({
                    type: 'item',
                    columns: [
                        search.createColumn({
                            name: 'internalid'
                        }),
                        search.createColumn({
                            name: 'billofmaterialsid',
                            join: 'assemblyItemBillOfMaterials'
                        })
                    ],
                    filters: [
                        search.createFilter({
                            name: 'internalid',
                            operator: "anyof",
                            values: itemIdsArr
                        })
                    ]
                });
                var searchResults = [];
                var count = 0;
                var pageSize = 1000;
                var start = 0;
                do {
                    var searchObjArr = itemSearch.run().getRange(start, start + pageSize);
                    searchResults = searchResults.concat(searchObjArr);
                    count = searchObjArr.length;
                    start += pageSize;
                } while (count == pageSize);
                for (var i = 0; i < searchResults.length; i++) {
                    var assemblyItemId = searchResults[i].getValue({
                        name: "internalid"
                    });
                    var bomId = searchResults[i].getValue({
                        name: "billofmaterialsid",
                        join: "assemblyItemBillOfMaterials"
                    });
                    if (bomId && !mapObj[assemblyItemId]) mapObj[assemblyItemId] = bomId;
                }
                return mapObj;
            } catch (e) {
                log.error("ERROR IN:" + title, e)
            }
        }

        function createWorkOrderRecord(dataObj) {
            var title = " createWorkOrderRecord() ";
            try {
                var recObj = record.create({
                    type: record.Type.WORK_ORDER,
                    isDynamic: true
                });
                recObj.setValue({
                    fieldId: 'subsidiary',
                    value: dataObj.subsidiaryId
                });
                recObj.setValue({
                    fieldId: 'assemblyitem',
                    value: dataObj.itemId
                });
                recObj.setValue({
                    fieldId: 'billofmaterials',
                    value: dataObj.itemBomMapObj[dataObj.itemId]
                });
                recObj.setValue({
                    fieldId: 'quantity',
                    value: dataObj.itemQty
                });
                recObj.setText({
                    fieldId: 'startdate',
                    text: dataObj.startDate
                });
              
                recObj.setValue({
                    fieldId: 'location',
                    value: dataObj.locationId,
                    ignoreFieldChange: true

                });
                // recObj.setSublistValue({
                //     sublistId: 'item',
                //     fieldId: 'item',
                //     value: dataObj.itemId,
                //     line: 0
                // });
                // recObj.setSublistValue({
                //     sublistId: 'item',
                //     fieldId: 'quantity',
                //     value: dataObj.itemQty,
                //     line: 0
                // });
                // recObj.setSublistValue({
                //     sublistId: 'item',
                //     fieldId: 'bomquantity',
                //     value: dataObj.itemQty,
                //     line: 0
                // });
                var updatedRecId = recObj.save();
                log.debug(title + "updatedRecId", updatedRecId);
                if (updatedRecId && dataObj.customRecId) updateCustomWorkOrderRecord(dataObj.customRecId, updatedRecId);
            } catch (e) {
                log.error("ERROR IN:" + title, e)
            }
        }

        function updateCustomWorkOrderRecord(customRecId, updatedRecId) {
            var title = " createWorkOrderRecord() ";
            try {
                var updatedCustRecId = record.submitFields({
                    type: 'customrecord_sc_work_order_create',
                    id: customRecId,
                    values: {
                        'custrecord_sc_work_order_process': false,
                        'isinactive': true,
                        'custrecord_sc_work_order_savedid': updatedRecId
                    }
                });
                log.debug(title + "updatedCustRecId", updatedCustRecId);
            } catch (e) {
                log.error("ERROR IN:" + title, e)
            }
        }
        return {
            getInputData: getInputData,
            map: map
        }
    }
);