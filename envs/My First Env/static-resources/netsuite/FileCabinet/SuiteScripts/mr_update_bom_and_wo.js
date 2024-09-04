/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search', 'N/runtime', 'N/email'],

    function (record, search, runtime, email) {
        function getInputData() {
            var title = " getInputData()";
            log.debug(title, "<------------------ M/R SCRIPT START ------------------>");
            try {
                var dataArr = [];
                var currentDateObj = new Date();
                var currentDateFormated = (currentDateObj.getMonth() + 1) + "/" + currentDateObj.getDate() + "/" + currentDateObj.getFullYear();
                var currentDateMiliSec = (new Date(currentDateFormated)).getTime();
                var workOrderBomMapObj = getWorkOrderBomMapping();
                log.debug(title + "workOrderBomMapObj", workOrderBomMapObj);
                var woBomIdsArr = Object.keys(workOrderBomMapObj);
                if (woBomIdsArr.length > 0) {
                    var bomRevisisonMapObj = getBomRevisionMapping(woBomIdsArr);
                    log.debug(title + "bomRevisisonMapObj", bomRevisisonMapObj);
                    if (Object.keys(bomRevisisonMapObj).length > 0) {
                        for (var bomId in workOrderBomMapObj) {
                            bomWorkOrdersDataArr = workOrderBomMapObj[bomId];
                            if (bomRevisisonMapObj[bomId]) {
                                bomRevMapObj = bomRevisisonMapObj[bomId].bomRevisisonMapObj;
                                dataArr.push({
                                    bomWorkOrdersDataArr,
                                    bomRevMapObj,
                                    currentDateFormated,
                                    currentDateMiliSec
                                });
                            }
                        }
                    }
                }
                log.debug(title + "dataArr", dataArr);
                log.debug(title + "dataArr.length", dataArr.length);
                return [dataArr[0], dataArr[1], dataArr[2]];
            } catch (e) {
                log.error("ERROR IN" + title, e);
            }
        }

        function map(context) {
            var title = " map() ";
            try {
                var dataObj = JSON.parse(context.value);
                log.debug(title + "dataObj", dataObj);
                var bomRevIdFound = "";
                for (var bomRevId in dataObj.bomRevMapObj) {
                    var bomRevDataObj = dataObj.bomRevMapObj[bomRevId];
                    if ((bomRevDataObj.effectiveStartDateMiliSec <= dataObj.currentDateMiliSec) && (bomRevDataObj.effectiveEndDateMiliSec > dataObj.currentDateMiliSec || !bomRevDataObj.effectiveEndDate)) {
                        bomRevIdFound = bomRevId;
                        break;
                    } else {
                        var updatedBomRevId = record.submitFields({
                            type: record.Type.BOM_REVISION,
                            id: bomRevId,
                            values: {
                                'isinactive': true
                            }
                        });
                        log.debug(title + "updatedBomRevId", updatedBomRevId);
                    }
                }
                log.debug(title + "bomRevIdFound", bomRevIdFound);
                if (bomRevIdFound) {
                    for (var index in dataObj.bomWorkOrdersDataArr) {
                        var bomWorkOrdersDataObj = dataObj.bomWorkOrdersDataArr[index];
                        if (bomRevIdFound != bomWorkOrdersDataObj.bomRevisisonId) {
                            var updatedWorkOrderId = record.submitFields({
                                type: record.Type.WORK_ORDER,
                                id: bomWorkOrdersDataObj.workOrderId,
                                values: {
                                    'billofmaterialsrevision': bomRevIdFound
                                }
                            });
                            log.debug(title + "updatedWorkOrderId", updatedWorkOrderId);
                        }
                    }
                } else {
                    log.debug(title, "Correct BOM Revision Already Set")
                }
            } catch (e) {
                log.error("ERROR IN" + title, e);
            }
        }

        function summarize() {
            var title = " summarize() ";
            log.debug(title, "<------------------ M/R SCRIPT END ------------------>");
        }

        function getWorkOrderBomMapping() {
            var title = " getWorkOrderBomMapping() ";
            try {
                var mapObj = {};
                var transactionSearch = search.create({
                    type: search.Type.WORK_ORDER,
                    columns: [
                        search.createColumn({
                            name: "tranid"
                        }),
                        search.createColumn({
                            name: "internalid",
                            join: "bom"
                        }),
                        search.createColumn({
                            name: "name",
                            join: "bom"
                        }),
                        search.createColumn({
                            name: "internalid",
                            join: "bomRevision"
                        }),
                        search.createColumn({
                            name: "name",
                            join: "bomRevision"
                        }),
                        search.createColumn({
                            name: "effectivestartdate",
                            join: "bomRevision"
                        }),
                        search.createColumn({
                            name: "effectiveenddate",
                            join: "bomRevision"
                        }),
                        search.createColumn({
                            name: "isinactive",
                            join: "bomRevision"
                        })
                    ],
                    filters: [
                        search.createFilter({
                            name: "status",
                            operator: "anyof",
                            values: ['WorkOrd:A']
                        }),
                        search.createFilter({
                            name: "mainline",
                            operator: "is",
                            values: ['T']
                        })
                    ]
                });
                var searchResults = [];
                var count = 0;
                var pageSize = 1000;
                var start = 0;
                do {
                    var searchResData = transactionSearch.run().getRange({
                        start: start,
                        end: start + pageSize
                    });
                    searchResults = searchResults.concat(searchResData);
                    count = searchResData.length;
                    start += pageSize;
                } while (count == pageSize);
                for (var i = 0; i < searchResults.length; i++) {

                    var bomId = searchResults[i].getValue({
                        name: "internalid",
                        join: "bom"
                    });
                    if (!mapObj[bomId]) mapObj[bomId] = [];
                    var workOrderId = searchResults[i].id;
                    var bomRevisisonId = searchResults[i].getValue({
                        name: "internalid",
                        join: "bomRevision"
                    });
                    mapObj[bomId].push({
                        workOrderId,
                        bomId,
                        bomRevisisonId
                    })
                }
                return mapObj;
            } catch (e) {
                log.error("ERROR IN" + title, e);
            }
        }


        function getBomRevisionMapping(woBomIdsArr) {
            var title = " getBomRevisionMapping() ";
            try {
                var mapObj = {};
                var bomSearch = search.create({
                    type: "bom",
                    columns: [
                        search.createColumn({
                            name: "internalid"
                        }),
                        search.createColumn({
                            name: "name"
                        }),
                        search.createColumn({
                            name: "internalid",
                            join: "revision",
                            sort: search.Sort.ASC
                        }),
                        search.createColumn({
                            name: "name",
                            join: "revision"
                        }),
                        search.createColumn({
                            name: "effectivestartdate",
                            join: "revision"
                        }),
                        search.createColumn({
                            name: "effectiveenddate",
                            join: "revision"
                        }),
                        search.createColumn({
                            name: "isinactive",
                            join: "revision"
                        })
                    ],
                    filters: [
                        search.createFilter({
                            name: "internalid",
                            operator: "anyof",
                            values: woBomIdsArr
                        })
                    ]
                });
                var searchResults = [];
                var count = 0;
                var pageSize = 1000;
                var start = 0;
                do {
                    var searchResData = bomSearch.run().getRange({
                        start: start,
                        end: start + pageSize
                    });
                    searchResults = searchResults.concat(searchResData);
                    count = searchResData.length;
                    start += pageSize;
                } while (count == pageSize);
                for (var i = 0; i < searchResults.length; i++) {
                    var bomId = searchResults[i].id;
                    if (!mapObj[bomId]) {
                        mapObj[bomId] = {
                            bomId,
                            bomRevisisonMapObj: {}
                        }
                    }
                    var bomRevisisonId = searchResults[i].getValue({
                        name: "internalid",
                        join: "revision",
                        sort: search.Sort.ASC
                    });
                    if (!mapObj[bomId].bomRevisisonMapObj[bomRevisisonId]) {
                        var effectiveStartDate = searchResults[i].getValue({
                            name: "effectivestartdate",
                            join: "revision"
                        });
                        var effectiveEndDate = searchResults[i].getValue({
                            name: "effectiveenddate",
                            join: "revision"
                        });
                        var isInactive = searchResults[i].getValue({
                            name: "isinactive",
                            join: "revision"
                        });
                        mapObj[bomId].bomRevisisonMapObj[bomRevisisonId] = {
                            bomId,
                            bomRevisisonId,
                            effectiveStartDate,
                            effectiveStartDateMiliSec: effectiveStartDate ? (new Date(effectiveStartDate)).getTime() : "",
                            effectiveEndDate,
                            effectiveEndDateMiliSec: effectiveEndDate ? (new Date(effectiveEndDate)).getTime() : "",
                            isInactive
                        }
                    }
                }
                return mapObj;
            } catch (e) {
                log.error("ERROR IN" + title, e);
            }
        }
        return {
            getInputData,
            map,
            summarize
        }
    }
);