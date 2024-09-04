/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search', 'N/runtime'],

    function (record, search, runtime) {

        function getInputData() {
            try {
                var scriptObj = runtime.getCurrentScript();
                var paramSearchId = scriptObj.getParameter({
                    name: 'custscript_wo_planned_bom_update'
                });
                var searchObj = search.load({
                    id: paramSearchId ? paramSearchId : "customsearch_wo_planned_bom_update"
                });
                var getSearchObjData = getSearchData(searchObj);

                return getSearchObjData;
            } catch (ex) {
                log.error('Error Get: ', ex.message);
            }
        }

        function map(context) {
            try {
                var searchResult = JSON.parse(context.value);
                // log.debug('searchResult: map', JSON.stringify(searchResult.wo_ID))
                if (searchResult.wo_ID) {
                    var woRecord = record.load({
                        type: record.Type.WORK_ORDER,
                        id: searchResult.wo_ID,
                        isDynamic: true,
                    });

                    var old_BOM_Revision = woRecord.getValue('billofmaterialsrevision');
                    var qty_BOM_Revision = woRecord.getValue('quantity');
                    // log.debug('old_BOM_Revision', old_BOM_Revision);

                    if (old_BOM_Revision) {
                        woRecord.setValue('billofmaterialsrevision', '');
                        var new_BOM_Revision = woRecord.getValue('billofmaterialsrevision');
                        // log.debug('new_BOM_Revision', new_BOM_Revision);
                        if (!new_BOM_Revision) {
                            woRecord.setValue('billofmaterialsrevision', old_BOM_Revision);
                            woRecord.setValue('quantity', qty_BOM_Revision);
                            woRecord.setValue('quantity', qty_BOM_Revision);
                            woRecord.setValue('custbody_update_bom_revision_historica', true);

                            var save_WOID = woRecord.save()
                            log.debug('save_WOID', save_WOID);
                        }
                    }
                }
            } catch (ex) {
                log.error("Error Map", JSON.stringify(ex));
            }
        }

        function getSearchData(searchObj) {
            try {
                var arrResults = new Array();
                var woIDsArr = new Array();
                var searchResults = [];
                var count = 0;
                var pageSize = 1000;
                var start = 0;
                do {
                    var searchResData = searchObj.run().getRange({
                        start: start,
                        end: start + pageSize
                    });
                    searchResults = searchResults.concat(searchResData);
                    count = searchResData.length;
                    start += pageSize;
                } while (count == pageSize);

                // log.debug('searchResults', JSON.stringify(searchResults))

                if (searchResults && searchResults.length > 0) {

                    for (var i = 0; i < searchResults.length; i++) {
                        var wo_ID = searchResults[i].getValue({
                            name: "internalid"
                        });
                        if (!woIDsArr.includes(wo_ID)) {
                            woIDsArr.push(wo_ID)
                            arrResults.push({
                                "wo_ID": wo_ID
                            });
                        }
                    }
                }
                log.debug('Saerch arrResults', JSON.stringify(arrResults))
                return arrResults;
            } catch (ex) {
                log.error('getSearchData error: ', ex.message);
            }
        }

        return {
            getInputData: getInputData,
            map: map
        };
    });