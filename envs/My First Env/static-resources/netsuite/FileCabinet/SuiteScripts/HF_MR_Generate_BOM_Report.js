/**
  /*********************************************************************************
         * JIRA  		:  SR-5790 spaces in bom report
         * Description	: Removing the blank spaces in between the report.
         * Modified By : Pavan Kaleru
         *********************************************************************************

 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/query', 'N/file', 'N/runtime'],
    function(search, query, file, runtime) {
        // denotes the number of levels of sub assemblies that will be checked for
        const SUB_ASSEMBLY = {
            zero: 0,
            one: 1,
            two: 2,
            three: 3,
            four: 4,
            five: 5
        }

        // takes in an array and convert it to comma separated values
        function convertArrtoCsv(arr) {

            return arr.map(function(item) {
                return item.join(",").trim();
            }).join("\n");
        }


        //returns a unique time stamp that will be appended to file name generated
        function getTimeStamp() {
            let currentDate = new Date();
            let currentday = currentDate.getDate().toString();
            let dayLen = currentday.length;
            if (dayLen == 1) {
                currentday = '0' + currentday;
            }
            let currentmonth = (currentDate.getMonth() + 1).toString();
            let len = currentmonth.length;
            if (len == 1) {
                currentmonth = '0' + currentmonth;
            }
            let currentyear = currentDate.getFullYear().toString();
            let hours = currentDate.getHours().toString();
            let minutes = currentDate.getMinutes().toString();
            let seconds = currentDate.getSeconds().toString();


            return currentday + '_' + currentmonth + '_' + currentyear + '_' + hours + minutes + seconds;
        }

        // generates the query columns data for assembly item ids provided
        function fetchQueryResults(assemblyItemIDs) {

            let bomReport = query.create({
                type: query.Type.BOM,
            });

            let bomRevisionJoin = bomReport.autoJoin({
                fieldId: 'bomRevision'
            });

            let bomRevisionComponentJoin = bomRevisionJoin.autoJoin({
                fieldId: 'component'
            });

            let itemJoin = bomRevisionComponentJoin.joinTo({
                fieldId: 'item',
                target: 'item'
            });

            let assemblyJoin = bomReport.autoJoin({
                fieldId: 'assembly'
            });

            let myFirstCondition = assemblyJoin.createCondition({
                fieldId: 'assembly',
                operator: query.Operator.ANY_OF,
                values: assemblyItemIDs
            });
            let secondCondition = bomRevisionJoin.createCondition({
                fieldId: 'isinactive',
                operator: query.Operator.IS,
                values: false
            })
            let thirdCondition = itemJoin.createCondition({
                fieldId: 'isinactive',
                operator: query.Operator.IS,
                values: false
            })

            /*let thirdCondition = bomRevisionJoin.createCondition({
            fieldId : 'effectivestartdate',
            operator : query.Operator.ONORBEFORE,
            values : "today"
          })
            let fourthCondition = bomRevisionJoin.createCondition({
            fieldId : 'effectivestartdate',
            operator : query.Operator.ISEMPTY,
            values : ""
          }) */
            //bomReport.condition = bomReport.and(myFirstCondition,secondCondition,bomReport.or(thirdCondition,fourthCondition))
            bomReport.condition = bomReport.and(myFirstCondition, secondCondition, thirdCondition)
            // Create query columns
            bomReport.columns = [
                assemblyJoin.createColumn({
                    fieldId: 'assembly'
                }),
                // bomReport.createColumn({
                //     fieldId: 'name'
                // }),
                // bomRevisionJoin.createColumn({
                //     fieldId: 'name'
                // }),
                itemJoin.createColumn({
                    fieldId: 'itemid'
                }),
                itemJoin.createColumn({
                    fieldId: 'itemtype'
                }),
                bomRevisionComponentJoin.createColumn({
                    fieldId: 'description'
                }),
                bomRevisionComponentJoin.createColumn({
                    fieldId: 'bomquantity'
                }),
                bomRevisionComponentJoin.createColumn({
                    fieldId: 'item'
                })
            ];

            bomReport.sort = [
                bomReport.createSort({
                    column: bomReport.columns[0]
                })
            ]
            // Run the query
            let resultQuery = bomReport.run();
            let theResults = resultQuery.results;

            return theResults;
        }

        // returns the data in the array format
        function getAssemblyBomData(assemblyItemNum, bomName, assemblyItemIDs, assemblyItemsWithBOM, level) {

            let theResults = fetchQueryResults(assemblyItemIDs);
            let itemsJson = getItemsJson(assemblyItemIDs); // provides mapping between assembly item name and internal id
            //log.debug('itemsJson', itemsJson);
            //log.debug('theResults', theResults);
            let assemblyItems = new Array();
            let bomData = new Array();
            let assemblyItemsWithoutBoms = [];

            for (let i = 0; i < theResults.length; i++) {

                let currentResult = theResults[i];

                let assemblyItemNumber = currentResult.values[0];
                let itemName = currentResult.values[1];
                let itemType = currentResult.values[2];
                let description = currentResult.values[3];
                let bomQuantity = currentResult.values[4];
                let itemId = currentResult.values[5];


                //log.debug(itemId, itemType);
                if (itemType == "Assembly" && assemblyItemsWithBOM.indexOf(itemId.toString()) != -1) {
                    assemblyItems.push(itemId)
                } else {
                    if (itemType == "Assembly" && assemblyItemsWithBOM.indexOf(itemId.toString()) == -1) {
                        assemblyItemsWithoutBoms.push(itemId)
                    }
                    if (level == SUB_ASSEMBLY.zero) {
                        bomData.push([bomName, assemblyItemNum, itemName, bomQuantity])
                    } else if (level == SUB_ASSEMBLY.one) {
                        bomData.push([bomName, itemsJson[assemblyItemNumber], itemName, bomQuantity])
                    } else if (level == SUB_ASSEMBLY.two) {
                        bomData.push([bomName, itemsJson[assemblyItemNumber], itemName, bomQuantity])
                    } else if (level == SUB_ASSEMBLY.three) {
                        bomData.push([bomName, itemsJson[assemblyItemNumber], itemName, bomQuantity])
                    } else if (level == SUB_ASSEMBLY.four) {
                        bomData.push([bomName, itemsJson[assemblyItemNumber], itemName, bomQuantity])
                    } else if (level == SUB_ASSEMBLY.five) {
                        bomData.push([bomName, itemsJson[assemblyItemNumber], itemName, bomQuantity])
                    }


                }

                // if (level == SUB_ASSEMBLY.zero) {
                //     bomData.push([bomName, assemblyItemNum, , , , , , itemName, bomQuantity])
                // } else if (level == SUB_ASSEMBLY.one) {
                //     bomData.push([bomName, assemblyItemNum, itemsJson[assemblyItemNumber], , , , , itemName, bomQuantity])
                // } else if (level == SUB_ASSEMBLY.two) {
                //     bomData.push([bomName, assemblyItemNum, , itemsJson[assemblyItemNumber], , , , itemName, bomQuantity])
                // } else if (level == SUB_ASSEMBLY.three) {
                //     bomData.push([bomName, assemblyItemNum, , , itemsJson[assemblyItemNumber], , , itemName, bomQuantity])
                // } else if (level == SUB_ASSEMBLY.four) {
                //     bomData.push([bomName, assemblyItemNum, , , , itemsJson[assemblyItemNumber], , itemName, bomQuantity])
                // } else if (level == SUB_ASSEMBLY.five) {
                //     bomData.push([bomName, assemblyItemNum, , , , , itemsJson[assemblyItemNumber], itemName, bomQuantity])
                // }


            }

            return {
                'bomData': bomData,
                'assemblyItems': assemblyItems,
                'assemblyItemsWithoutBoms': assemblyItemsWithoutBoms
            }
        }

        // returns a json with internal id key and item name as value.
        function getItemsJson(array) {
            var assemblyitemSearchObj = search.create({
                type: "assemblyitem",
                filters: [
                    ["type", "anyof", "Assembly"],
                    "AND",
                    ["internalid", "anyof", array]
                ],
                columns: [
                    search.createColumn({
                        name: "internalid",
                        label: "Internal ID"
                    }),
                    search.createColumn({
                        name: "itemid",
                        sort: search.Sort.ASC,
                        label: "Name"
                    }),
                    search.createColumn({
                        name: "billofmaterials",
                        join: "assemblyItemBillOfMaterials",
                        label: "Bill of Materials"
                    }),
                    search.createColumn({
                        name: "custitem_hf_revision",
                        label: "Revision"
                    }),
                    search.createColumn({
                        name: "custitem_hf_has_no_parent",
                        label: "HAS NO PARENT ASSEMBLY"
                    })
                ]
            });
            var searchResultCount = assemblyitemSearchObj.runPaged().count;
            //log.debug("assemblyitemSearchObj result count", searchResultCount);
            var itemJson = {};
            assemblyitemSearchObj.run().each(function(result) {
                key = result.getValue({
                    name: 'internalid'
                });
                value = result.getValue({
                    name: 'itemid'
                });
                itemJson[key] = value;
                return true;
            });

            //log.debug('itemJson',itemJson);
            return itemJson;
        }

        function getAssemblyItemWithBOM() {
            // returns  a saved search array data which contains all assembly items having atleast one BOM associated with it.
            let assemblyItemsWithBOMSearch = search.load({
                id: 'customsearch_hr_assembly_items_bom'
            });

            let assemblyItemsWithBOMArray = [];

            assemblyItemsWithBOMSearch.run().each(function(result) {
                let assemblyItem = result.getValue({
                    name: 'internalid'
                });

                assemblyItemsWithBOMArray.push(assemblyItem);
                return true;
            });

            return assemblyItemsWithBOMArray;
        }

        function getInputData() {
            // returns all top level assembly items which does not have any parent assembly items
            return search.load({
                type: 'assemblyitem',
                id: 'customsearch_top_level_assembly_bom_repo'
            });
        }

        function map(context) {

            try {

                let searchResult = JSON.parse(context.value);
              //  log.debug('searchResult', searchResult);

                let assemblyItemId = searchResult.id;
                let bomName = searchResult.values["billofmaterials.assemblyItemBillOfMaterials"].text;
                let assemblyItemNum = searchResult.values.itemid;

                let assemblyItemsWithBOM = getAssemblyItemWithBOM();
                var csvFileContents = '';


                // BOM Level 0 check
                let result1 = getAssemblyBomData(assemblyItemNum, bomName, [assemblyItemId], assemblyItemsWithBOM, 0);
                let assemblyItems1 = result1.assemblyItems;

                if (result1.bomData.length > 0) { //SR-5790 Spaces in BOM report
                    csvFileContents += convertArrtoCsv(result1.bomData) + "\n";
                }

                // BOM Level 1 check
                if (assemblyItems1.length != 0) {

                    let result2 = getAssemblyBomData(assemblyItemNum, bomName, assemblyItems1, assemblyItemsWithBOM, 1);
                    // log.debug('bom data 2', result2.bomData);
                    //log.debug('assembly items 2', result2.assemblyItems);

                    let assemblyItems2 = result2.assemblyItems;
                    if (result2.bomData.length > 0) { //SR-5790 Spaces in BOM report
                        csvFileContents += convertArrtoCsv(result2.bomData) + "\n";

                    }
                    // BOM Level 2 check
                    if (assemblyItems2.length != 0) {

                        let result3 = getAssemblyBomData(assemblyItemNum, bomName, assemblyItems2, assemblyItemsWithBOM, 2);
                        //log.debug('bom data 3', result3.bomData);
                        //log.debug('assembly items 3', result3.assemblyItems);

                        let assemblyItems3 = result3.assemblyItems;
                        if (result3.bomData.length > 0) { //SR-5790 Spaces in BOM report
                            csvFileContents += convertArrtoCsv(result3.bomData) + "\n";

                        }

                        // BOM Level 3 check
                        if (assemblyItems3.length != 0) {
                            let result4 = getAssemblyBomData(assemblyItemNum, bomName, assemblyItems3, assemblyItemsWithBOM, 3);
                            //      log.debug('bom data 4', result4.bomData);
                            //    log.debug('assembly items 4', result4.assemblyItems);

                            let assemblyItems4 = result4.assemblyItems;
                            if (result4.bomData.length > 0) { //SR-5790 Spaces in BOM report
                                csvFileContents += convertArrtoCsv(result4.bomData) + "\n";

                            }

                            // BOM Level 4 check
                            if (assemblyItems4.length != 0) {
                                let result5 = getAssemblyBomData(assemblyItemNum, bomName, assemblyItems4, assemblyItemsWithBOM, 4);
                                //      log.debug('bom data 5', result5.bomData);
                                //    log.debug('assembly items 4', result5.assemblyItems);
                                let assemblyItems5 = result5.assemblyItems;
                                if (result5.bomData.length > 0) { //SR-5790 Spaces in BOM report
                                    csvFileContents += convertArrtoCsv(result5.bomData) + "\n";
                                }
                                // log.debug('assembly items 5', assemblyItems5);

                                // BOM Level 5 check
                                if (assemblyItems5.length != 0) {

                                    let result6 = getAssemblyBomData(assemblyItemNum, bomName, assemblyItems5, assemblyItemsWithBOM, 5);
                                    let assemblyItems6 = result6.assemblyItems;
                                    if (result6.bomData.length > 0) { //SR-5790 Spaces in BOM report

                                        csvFileContents += convertArrtoCsv(result6.bomData) + "\n";
                                    }
                                    //log.debug('assembly items 6', csvFileContents);
                                }
                            }
                        }
                    }
                }
                if (csvFileContents) {
                    //log.debug('csvFileContents final', csvFileContents)
                    context.write({
                        key: assemblyItemId,
                        value: csvFileContents
                    });
                }

            } catch (ex) {
                log.error('exception in map', ex);
            }

        }

        function summarize(summary) {

            //var csvFile = 'BOM PARENT, ASSEMBLY ITEM PARENT NAME, SUB ASSEMBLY LVL1,SUB ASSEMBLY LVL2, SUB ASSEMBLY LVL3, SUB ASSEMBLY LVL4, SUB ASSEMBLY LVL5, COMPONENT NAME, BOM QUANTITY PER ASSEMBLY \n';
            var csvFile = 'BOM PARENT, ASSEMBLY ITEM PARENT NAME, COMPONENT NAME, BOM QUANTITY PER ASSEMBLY \n';

            summary.output.iterator().each(function(key, value) {
                csvFile += value;
                return true;
            });

            // retreive folder id from script parameter
            let folderId = runtime.getCurrentScript().getParameter({
                name: 'custscript_hf_bom_report_folder_id'
            });

            var fileObj = file.create({
                //To make each file unique and avoid overwriting, append date on the title
                name: 'BOM REPORT -' + getTimeStamp() + '.csv',
                fileType: file.Type.CSV,
                contents: csvFile,
                description: 'BOM REPORT',
                encoding: file.Encoding.UTF8,
                folder: folderId
            });
           // log.debug('csvfile', csvFile)

            fileObj.save();
            log.debug('file generated!')
        }

        return {
            getInputData: getInputData,
            map: map,
            summarize: summarize
        };
    });