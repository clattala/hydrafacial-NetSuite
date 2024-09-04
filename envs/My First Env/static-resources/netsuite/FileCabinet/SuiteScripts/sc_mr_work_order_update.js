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
                if (dataObj && dataObj.subsidiaryId && dataObj.locationId && dataObj.itemId && dataObj.itemBomMapObj[dataObj.itemId] && dataObj.itemQty && dataObj.startDate && dataObj.endDate && dataObj.workOrderId) {
                    updateWorkOrderRecord(dataObj);
                } else {
                    var infoObj = {};
                    infoObj.workOrderId = dataObj.workOrderId;
                    infoObj.subsidiaryId = dataObj.subsidiaryId;
                    infoObj.locationId = dataObj.locationId;
                    infoObj.itemId = dataObj.itemId;
                    infoObj.itemBomId = dataObj.itemBomMapObj[dataObj.itemId];
                    infoObj.itemQty = dataObj.itemQty;
                    infoObj.startDate = dataObj.startDate;
                    infoObj.endDate = dataObj.endDate;
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
                        }),
                        search.createColumn({
                            name: 'custrecord_sc_work_order_savedid'
                        }),
                        search.createColumn({
                            name: 'custrecord_sc_work_order_end_date'
                        })
                    ],
                    filters: [
                        search.createFilter({
                            name: 'custrecord_update_work_order',
                            operator: search.Operator.IS,
                            values: ['T']
                        }),
                        search.createFilter({
                            name: 'isinactive',
                            operator: search.Operator.IS,
                            values: ['F']
                        }),
                        search.createFilter({
                            name: 'custrecord_sc_work_order_savedid',
                            operator: "isnotempty",
                        }),
                        // search.createFilter({
                        //     name: 'internalid',
                        //     operator: 'anyof',
                        //     values: ['485', '486'] //
                        // })
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
                        recObj.endDate = searchResults[i].getValue({
                            name: 'custrecord_sc_work_order_end_date'
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
                        recObj.workOrderId = searchResults[i].getValue({
                            name: 'custrecord_sc_work_order_savedid'
                        });
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

        function updateWorkOrderRecord(dataObj) {
            var title = " updateWorkOrderRecord() ";
            try {
                var recObj = record.load({
                    id: dataObj.workOrderId,
                    type: record.Type.WORK_ORDER,
                    isDynamic: true
                });

                var workOrderStatus = recObj.getText('status');
                log.debug('workOrderStatus',workOrderStatus)
                if (workOrderStatus.toLowerCase() == "planned") {
                    recObj.setValue({
                        fieldId: 'assemblyitem',
                        value: '',
                    });
                    recObj.setValue({
                        fieldId: 'billofmaterials',
                        value: '',
                    });
                    recObj.setValue({
                        fieldId: 'quantity',
                        value: 1,
                    });
                    recObj.setText({
                        fieldId: 'startdate',
                        text: '',
                    });
                    recObj.setText({
                        fieldId: 'enddate',
                        text: '',
                    });
                    //------------------------------->
                    recObj.setValue({
                        fieldId: 'assemblyitem',
                        value: dataObj.itemId,
                    });
                    recObj.setValue({
                        fieldId: 'billofmaterials',
                        value: dataObj.itemBomMapObj[dataObj.itemId]
                    });
                    recObj.setValue({
                        fieldId: 'quantity',
                        value: dataObj.itemQty,
                    });
                    recObj.setText({
                        fieldId: 'startdate',
                        text: dataObj.startDate,
                    });
                    recObj.setText({
                        fieldId: 'enddate',
                        text: dataObj.endDate,
                    });
                    //------------------------------->
                    recObj.setValue({
                        fieldId: 'location',
                        value: dataObj.locationId,
                        ignoreFieldChange: true
                    });

                    var updatedRecId = recObj.save();
                    log.debug(title + "updatedRecId", updatedRecId);
                    if (updatedRecId && dataObj.customRecId) updateCustomWorkOrderRecord(dataObj.customRecId, updatedRecId);
                }

            } catch (e) {
                log.error("ERROR IN:" + title, e)
            }
        }

        function updateCustomWorkOrderRecord(customRecId, updatedRecId) {
            var title = " updateCustomWorkOrderRecord() ";
            try {
                var updatedCustRecId = record.submitFields({
                    type: 'customrecord_sc_work_order_create',
                    id: customRecId,
                    values: {
                        'custrecord_update_work_order': false,
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