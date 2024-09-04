/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/query', 'N/record'],
    function (search, query, record) {
        // function returns the count - zero denotes that the item is not a sub-assembly/components in any of the BOM/ BOM Revisions
        function getAssemblyBomData(assemblyItemID) {

            var bomReport = query.create({
                type: query.Type.BOM,
            });

            var bomRevisionJoin = bomReport.autoJoin({
                fieldId: 'bomRevision'
            });

            var bomRevisionComponentJoin = bomRevisionJoin.autoJoin({
                fieldId: 'component'
            });

            var assemblyJoin = bomReport.autoJoin({
                fieldId: 'assembly'
            });

            // condition adds the assembly item to the BOM revision components column 
            //to check if the item is a sub-assemly to any other assembly item
            var myFirstCondition = bomRevisionComponentJoin.createCondition({
                fieldId: 'item',
                operator: query.Operator.EQUAL,
                values: assemblyItemID
            });

            bomReport.condition = bomReport.and(myFirstCondition);

            // Create query columns
            bomReport.columns = [
                assemblyJoin.createColumn({
                    fieldId: 'assembly'
                }),
                bomRevisionComponentJoin.createColumn({
                    fieldId: 'item'
                })
            ];


            // Run the query
            var resultQuery = bomReport.run();
            var resultCount = resultQuery.results.length;
            log.debug('count', resultCount)


            return resultCount;
        }

        function getItemRecordType(assemblyItemId) {
            var fieldLookUp = search.lookupFields({
                type: 'item',
                id: assemblyItemId,
                columns: ['recordtype']
            });
            return fieldLookUp.recordtype;
        }

        function getInputData() {
            return search.load({
                type: 'assemblyitem',
                id: 'customsearch_hf_all_assembly_items'
            });
        }

        function map(context) {

            try {

                var searchResult = JSON.parse(context.value);
                var assemblyItemId = searchResult.id;
                var resultcount = getAssemblyBomData(assemblyItemId);

                if (resultcount <= 0) {

                    record.submitFields({
                        type: getItemRecordType(assemblyItemId),
                        id: assemblyItemId,
                        values: {
                            'custitem_hf_has_no_parent': true
                        }
                    });

                } else {

                    record.submitFields({
                        type: getItemRecordType(assemblyItemId),
                        id: assemblyItemId,
                        values: {
                            'custitem_hf_has_no_parent': false
                        }
                    });
                }

            } catch (ex) {
                log.error('exception in map', ex);
            }

        }

        function summarize(summary) {
            // handleErrorIfAny(summary);
            // createSummaryRecord(summary);
        }

        return {
            getInputData: getInputData,
            map: map,
            // reduce: reduce,
            // summarize: summarize
        };
    });

