/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/log'],
    function (record, log) {
        function afterSubmit(context) {
            var title = " afterSubmit() ";
            try {
                log.debug('after submit',"runnnnnnnnnn")
                if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT || context.type == context.UserEventType.COPY) {

                    var currentRecord = context.newRecord;
                    var cid = currentRecord.id;
					log.debug('cid', cid)
                    if (cid) {
                        var recObj = record.load({
                            type: record.Type.SALES_ORDER,
                            id: cid
                        });
                        var shipDate = recObj.getValue({
                            fieldId: 'shipdate'
                        });
                        log.debug(title + "shipDate", shipDate);
                      	var subsidiary = currentRecord.getValue('subsidiary')
                        log.debug('subsidiary' , subsidiary)
                      	
                        if (shipDate && subsidiary==3) {
                            var lineCount = recObj.getLineCount({
                                sublistId: 'item'
                            });

                            log.debug(title + "lineCount", lineCount);
                            for (var i = 0; i < lineCount; i++) {
                                var promiseDate = recObj.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_promise_date',
                                    line: i
                                });
                                log.debug(title + "promiseDate : line ", promiseDate + " : " + i);
                                if (!promiseDate) {
                                    var soQty = recObj.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantity',
                                        line: i
                                    }) ? parseFloat(recObj.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantity',
                                        line: i
                                    })) : 0;
                                    var qtyAvailable = recObj.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantityavailable',
                                        line: i
                                    }) ? parseFloat(recObj.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantityavailable',
                                        line: i
                                    })) : 0;
                                    var qtyCommitted = recObj.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantitycommitted',
                                        line: i
                                    }) ? parseFloat(recObj.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantitycommitted',
                                        line: i
                                    })) : 0;

                                    var qtyPickPack = recObj.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantitypickpackship',
                                        line: i
                                    }) ? parseFloat(recObj.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantitypickpackship',
                                        line: i
                                    })) : 0;


                                    var qtyFulfilled = recObj.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantityfulfilled',
                                        line: i
                                    }) ? parseFloat(recObj.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantityfulfilled',
                                        line: i
                                    })) : 0;

                                    log.debug(title + "soQty : qtyAvailable : qtyCommitted : soQty :  line", soQty + " : " + qtyAvailable + " : " + qtyCommitted + " : " + i);
                                    log.debug(title + "qtyPickPack : qtyFulfilled", qtyPickPack + " : " + qtyFulfilled);
                                    if (soQty >= qtyAvailable || soQty >= qtyCommitted || soQty >= qtyPickPack || soQty >= qtyFulfilled) {			
										log.debug('shipDate', shipDate)
                                      	if(shipDate != null){
                                          recObj.setSublistValue({
                                              sublistId: 'item',
                                              fieldId: 'custcol_promise_date',
                                              line: i,
                                              value: shipDate
                                          });
                                        }
                                    }
                                }

                            }

                            try{
                                recObj.save();
                            } catch(e) {
                                log.debug('error while saving record', e.message);
                            }
                        }
                    }
                }
            } catch (e) {
                log.error("ERROR IN" + title, e)
            }
        }
        return {
            afterSubmit: afterSubmit
        }
    }
);