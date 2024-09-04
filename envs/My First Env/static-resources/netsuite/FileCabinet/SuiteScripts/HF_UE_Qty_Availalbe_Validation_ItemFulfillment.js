/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/query', 'N/error','N/runtime'], function (query, error,runtime) {

    function fetchQueryResults(itemId) {
        var qtyAvailable;

        var itemReport = query.create({
            type: query.Type.ITEM
        });

        var locationsJoin = itemReport.autoJoin({
            fieldId: 'locations'
        });

        var locationJoin = locationsJoin.autoJoin({
            fieldId: 'location'
        });

        var myFirstCondition = itemReport.createCondition({
            fieldId: 'itemid',
            operator: query.Operator.ANY_OF,
            values: [itemId.toString()]
        });

        var mySecondCondition = locationJoin.createCondition({
            fieldId: 'fullname',
            operator: query.Operator.ANY_OF,
            values: ['Main Whse']
        });

        itemReport.condition = itemReport.and(myFirstCondition, itemReport.and(mySecondCondition));

        // Create query columns
        itemReport.columns = [
            locationJoin.createColumn({
                fieldId: 'fullname'
            }),
            locationsJoin.createColumn({
                fieldId: 'quantityonhand'
            }),
            locationsJoin.createColumn({
                fieldId: 'quantitycommitted'
            })
        ];


        // Run the query
        var theResults = itemReport.run().results;

        for (var i = 0; i < theResults.length; i++) {
            var currentResult = theResults[0];
            //log.debug('currentResult', 'qty on hand = ' + currentResult.values[1] + ', qty committed = ' + currentResult.values[2]);
            qtyAvailable = currentResult.values[1] - currentResult.values[2]; // Quantity on Hand - Quantity Committed
        }

        return qtyAvailable;
    }

    function beforeSubmit(context) {
        try {
            log.debug('before submit')

            if (runtime.executionContext === runtime.ContextType.USER_INTERFACE && (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT)) {


                var recordObj = context.newRecord;
                var lineCount = recordObj.getLineCount({
                    sublistId: 'item'
                });

                log.debug('lineCount', lineCount);
                var itemIdArray = new Array();

                for (var i = 0; i < lineCount; i++) {

                    var fulfill = recordObj.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'itemreceive',
                        line: i
                    });

                    if (fulfill == true) {

                        log.debug('fulfill', fulfill);
                        var itemId = recordObj.getSublistValue({ sublistId: 'item', fieldId: 'itemname', line: i });

                        var qtyAvailable = fetchQueryResults(itemId);
                        log.debug('qtyAvailable', qtyAvailable);

                        if (qtyAvailable <= 0) {
                            itemIdArray.push(itemId);
                        }
                    }
                }

                if (itemIdArray.length > 0) {

                    var myCustomError = error.create({
                        name: 'QUANTITY_ONHAND_UNAVAILABLE',
                        message: 'Zero or Negative Quantity Available for the items(s) ' + itemIdArray.toString() + '. Please ensure there is quantity available for item(s) to be fulfilled to avoid decommitting on other orders!',
                        notifyOff: true
                    });

                    throw myCustomError;
                }


            }
        } catch (ex) {
            log.debug('ex', ex);
            log.debug('ex.name', ex.name + ',' + ex.message);

            if (ex.name == "QUANTITY_ONHAND_UNAVAILABLE")
                throw ex.message;

        }
    }

function beforeSubmit_throwError(context) {
        try {
            log.debug('before submit')

            if (runtime.executionContext === runtime.ContextType.USER_INTERFACE && (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT)) {


                var recordObj = context.newRecord;
                var lineCount = recordObj.getLineCount({
                    sublistId: 'item'
                });

                log.debug('lineCount', lineCount);
                var itemIdArray = new Array();
                for (var i = 0; i < lineCount; i++) {
                    var fulfill = recordObj.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'itemreceive',
                        line: i
                    });
                   var itemId = recordObj.getSublistValue({ sublistId: 'item', fieldId: 'itemname', line: i });

                    if (fulfill == true) {
                        log.debug('fulfill', fulfill);
                        var onHand = recordObj.getSublistValue({ sublistId: 'item', fieldId: 'onhand', line: i });
                      	log.debug('onHand' , onHand)
						var quantity = recordObj.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i });
                      	log.debug('quantity', quantity)
                        if (quantity > onHand) {
                            itemIdArray.push(itemId);
                        }
                    }
                }
              log.debug('itemIdArray ' , itemIdArray)
                if (itemIdArray.length > 0) {

                    var myCustomError = error.create({
                        name: 'QUANTITY_ONHAND_UNAVAILABLE',
                        message: 'The record could not be saved since inventory will go negative for items(s) '+ itemIdArray.toString() + '. Please go back and make sure the ship quantity is equal or lesser than the on-hand quantity. ' ,
                        notifyOff: true
                    });

                    throw myCustomError;
                }


            }
        } catch (ex) {
            log.debug('ex', ex);
            log.debug('ex.name', ex.name + ',' + ex.message);

            if (ex.name == "QUANTITY_ONHAND_UNAVAILABLE")
                throw ex.message;

        }
    }

    return {

        beforeSubmit: beforeSubmit_throwError
    }
});
