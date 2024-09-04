/**
 *@NApiVersion 2.0
 *@NScriptType MapReduceScript
 
 /**
 * * Script Name : 
	 * Author : Pavan Kaleru
	 * Date : 3rd March 2023
	 * Purpose : To update the bom revision on the Workorder
	 * JIRA : NGO-6194 CAB_Script Reactivation Request
	 *
	 *
 
 */
define(['N/record', 'N/log', 'N/search', 'N/runtime'], function(record, log, search, runtime) {

    function getInputData() {
        var title = 'getInputData()::';
        try {
            var bomrevisionSearchObj = search.create({
                type: "bomrevision",
                filters: [
                    [
                        ["isinactive", "is", "F"], "AND", ["custrecord_hf_rev_updated", "is", "T"]
                    ],
                    "AND",
                    [
                        ["effectiveenddate", "isempty", ""], "OR", ["effectiveenddate", "onorafter", "today"]
                    ]
                ],
                columns: [
                    'billofmaterials',
                    'isinactive'
                ]
            });
            log.debug('bomrevisionSearchObj', bomrevisionSearchObj)
            return bomrevisionSearchObj
        } catch (error) {
            log.error(title + error.name, error.message);
        }
        return bomrevisionSearchObj || [];
    }

    function map(context) {
        var title = 'map()::';
        log.debug(title, "<--------------- MAP START--------------->");

        try {
            log.debug(title + 'context', context)
            var revision = context.key
            log.debug('revision', revision)
            log.debug('context.values', context.value)
            var dataObjValues = JSON.parse(context.value)
            log.debug('dataObjValues', dataObjValues)
            var billOfMaterials = dataObjValues.values.billofmaterials.value
            log.debug('billofMaterials', billOfMaterials)
            var isInactive = dataObjValues.values.isinactive
            log.debug('isInactive', isInactive)
            if (isInactive == 'T') {
                revision = getActiveRevision(billOfMaterials)
                log.debug('active rvvision is ' + revision)
            }
            var resultRange = getWorkOrders(billOfMaterials)

            log.debug('r ,resultRangeesultRange', resultRange)

            for (var i = 0; i < resultRange.length; i++) {
                var internalId = resultRange[i].id;

                context.write(internalId, revision)


            }
            //updateWorkOrders(context.key);
        } catch (error) {
            log.error(title + error.name, error.message)
        }
    }

    function reduce(context) {
        var title = 'reduce()::';

        try {
            var workOrderInternalId = context.key
            //log.debug(title, "<--------------- REDUCE START--------------->" + context);

            var workOrderId = context.key;
            var revision = context.values[0]
            //log.debug('billOfmaterials reduce' + revision, 'workOrderId ' + workOrderId)

            updateWorkOrders(revision, workOrderId);
            context.write(revision, workOrderId)


        } catch (error) {
            log.error(title + error.name, error.message)
        }
    }

    function summarise(summary) {
        try {
            log.debug('summarise start')
            var mapKeys = [];
            summary.mapSummary.keys.iterator().each(function(key) {
                mapKeys.push(key);
                log.debug('key', key)
                var revisionRec = record.load({
                    type: record.Type.BOM_REVISION,
                    id: Number(key),
                    isDynamic: false
                });

                revisionRec.setValue({
                    fieldId: 'custrecord_hf_rev_updated',
                    value: false
                });
                revID = revisionRec.save();
                return true;
            });
            log.audit('MAP keys processed', mapKeys);
            summary.mapSummary.errors.iterator().each(function(key, error) {
                log.error('Map Error for key: ' + key, error);
                return true;
            });
            summary.reduceSummary.errors.iterator().each(function(key, error, executionNo) {
                log.error({
                    title: 'Reduce error for key: ' + key + ', execution no. ' + executionNo,
                    details: error
                });
                return true;
            });
            var totalRecordsUpdated = 0;

            summary.output.iterator().each(function(key, value) {
                /*log.audit({
                    title: ' summary.output.iterator',
                    details: 'key: ' + key + ' / value: ' + value
                });*/
                totalRecordsUpdated++;
                return true;
            });
            log.debug('totalRecordsUpdated', totalRecordsUpdated)
        } catch (error) {
            log.debug('error in summarise', error)
        }

    }

    function updateWorkOrders(revision, workOrderId) {

        var revisionRec = record.load({
            type: record.Type.BOM_REVISION,
            id: revision,
            isDynamic: false
        });
        var revisionLineCount = revisionRec.getLineCount('component')
        //log.debug('revisionLineCount ', revisionLineCount);
        //log.audit('i is 102 ' + i, resultRange.length)
        var objwok = record.load({
            type: record.Type.WORK_ORDER,
            id: workOrderId,
            isDynamic: false
        });
        objwok.setValue({
            fieldId: 'billofmaterialsrevision',
            value: ''
        });

        var quantity = objwok.getValue('quantity')
        //log.debug('quantity ' + resultRange[i].id, quantity)

        objwok.setValue({
            fieldId: 'billofmaterialsrevision',
            value: revision
        });

        var lineCount = objwok.getLineCount('item')
        lineCount = lineCount - 1
        for (var x = lineCount; x >= 0; x--) {

            objwok.removeLine({
                sublistId: 'item',
                line: x,
                ignoreRecalc: true
            });
        }
        for (var j = 0; j < revisionLineCount; j++) {
            var revisionItem = revisionRec.getSublistValue({
                sublistId: 'component',
                fieldId: 'item',
                line: j
            })
            //log.debug('revisionItem' , revisionItem)
            var revisionQuantity = revisionRec.getSublistValue({
                sublistId: 'component',
                fieldId: 'quantity',
                line: j
            })
            var revisionBomQuantity = revisionRec.getSublistValue({
                sublistId: 'component',
                fieldId: 'bomquantity',
                line: j
            })
            //  log.debug('revisionQuantity ' + revisionQuantity , 'revisionBomQuantity ' + revisionBomQuantity);
            objwok.setSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: revisionItem,
                line: j
            })
            //log.debug('setting the *quantity' , revisionQuantity*quantity)
            objwok.setSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                value: revisionQuantity * quantity,
                line: j
            })
        }
        try {
            var workOrderId = objwok.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });
            var remainingUsage = runtime.getCurrentScript().getRemainingUsage();
            log.debug("Revision " + revision + " after generating workOrderId" + workOrderId, 'the goverance is ' + remainingUsage);


        } catch (e) {
            log.error('Error while saving workorder ' + workOrderId, e);

        }

        /*var revisionUpdated = revisionRec.getValue('custrecord_hf_rev_updated')
           if(revisionUpdated == true)
            revisionRec.setValue({
                fieldId: 'custrecord_hf_rev_updated',
                value: false
            });
            revID = revisionRec.save();
            log.debug(title + "revID", revID);*/

    }

    function getActiveRevision(billOfMaterials) {
        var bomrevisionSearchObj = search.create({
            type: "bomrevision",
            filters: [
                ["billofmaterials", "anyof", billOfMaterials],
                "AND",
                ["isinactive", "is", "F"]
            ],
            columns: [
                search.createColumn({
                    name: "internalid"
                }),
                search.createColumn({
                    name: "billofmaterials",
                    label: "BOM Name"
                }),
                search.createColumn({
                    name: "name",
                    label: "BOM Rev Name "
                }),
                search.createColumn({
                    name: "isinactive",
                    label: "Inactive"
                })
            ]
        });
        var searchResultCount = bomrevisionSearchObj.runPaged().count;
        log.debug("bomrevisionSearchObj result count", searchResultCount);
        var internalId;
        bomrevisionSearchObj.run().each(function(result) {
            internalId = result.getValue({
                name: "internalid"
            });
            return true;
        });
        log.debug('Acitve revisiion id ', internalId)
        return internalId;
    }

    function getWorkOrders(billOfMaterials) {
        var title = 'getWorkOrders()::';
        var revisionRec, objwok, workOrderId;
        var revID;
        try {
            var workorderSearchObj = search.create({
                type: "workorder",
                filters: [
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["status", "anyof", "WorkOrd:A"],
                    "AND",
                    ["bom.internalid", "anyof", billOfMaterials],
                    "AND",
                    ["mainline", "is", "T"],


                ],
                columns: [
                    search.createColumn({
                        name: "name",
                        join: "bomRevision"
                    }),

                ]
            });
            var myResultSet = workorderSearchObj.run();
            var resultRange = myResultSet.getRange({
                start: 0,
                end: 1000
            });
            return resultRange;
        } catch (error) {
            log.debug('Error in ' + title + error.message, error)
        }
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarise
    }
});